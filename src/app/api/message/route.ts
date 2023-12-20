import { db } from '@/db'
import { openai } from '@/lib/openai'
import { pinecone } from '@/lib/pinecone'
import { SendMessageValidator } from '@/lib/validators/sendMessageValidator'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { NextRequest } from 'next/server'

import { OpenAIStream, StreamingTextResponse } from 'ai'

export const POST = async (req: NextRequest) => {
  const body = await req.json()

  const { getUser } = getKindeServerSession()
  const user = getUser()

  const { id: userId } = user

  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { fileId, message } = SendMessageValidator.parse(body)

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  })

  if (!file) return new Response('Not found', { status: 404 })

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  })

  // vectorize message
  // TODO: this is a bit duplicated in api/uploading/core.ts
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  })
  const pineconeIndex = pinecone.Index('ai-quote-finder')
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: file.id, // to search for most relevant page in file
  })

  // search for similar messages
  const results = await vectorStore.similaritySearch(message, 4) // TODO: could add pricing limitation here
  const previousMessage = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 6,
  })

  const formattedPreviousMassege = previousMessage?.map((message) => ({
    role: message.isUserMessage ? 'user' : 'assistant',
    content: message.text,
  }))

  console.log('ai route formattedPreviousMassege', formattedPreviousMassege)
  console.log('ai route results', results)

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    temperature: 0,
    stream: true,
    messages: [
      {
        role: 'system',
        content:
          'Use the following text snippets (and, if relevant, the previous conversaton) to return relevant quotes from the text snippets. If the user asks a question, answer their question and reference the text snippets/source material.',
      },
      {
        role: 'user',
        content: `Use the following text snippets (or previous conversaton if needed) to return a relevant quote given the text snippets. If the user asks a question answer their question and referenc the text snippets/source material. \nIf you don't know the answer or didn't find anything relevant, just say "No relevant content found", don't try to make up an answer.
        
        \n----------------\n
        
        PREVIOUS CONVERSATION:
        ${formattedPreviousMassege.map((message) => {
          if (message.role === 'user') return `User: ${message.content}\n`
          return `Assistant: ${message.content}\n`
        })}
        
        \n----------------\n
        
        SOURCE MATERIAL TEXT SNIPPETS:
        ${results.map((r) => r.pageContent).join('\n\n')}
        
        USER QUERY: ${message}`,
      },
    ],
  })

  const stream = OpenAIStream(response, {
    async onCompletion(completion) {
      await db.message.create({
        data: {
          text: completion,
          isUserMessage: false,
          userId,
          fileId,
        },
      })
    },
  })

  return new StreamingTextResponse(stream)
}
