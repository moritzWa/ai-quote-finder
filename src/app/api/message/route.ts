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
      OR: [
        { userId }, // User is the owner of the file
        { private: false }, // File is not private
      ],
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
  const results = await vectorStore.similaritySearch(message, 4)

  // console.log('vector search result', results)

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

  // console.log('ai route formattedPreviousMassege', formattedPreviousMassege)

  //  PREVIOUS CONVERSATION:
  // ${formattedPreviousMassege.map((message) => {
  //   if (message.role === 'user') return `User: ${message.content}\n`
  //   return `Assistant: ${message.content}\n`
  // })}

  // \n----------------\n

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    temperature: 0,
    stream: true,
    messages: [
      {
        role: 'system',
        content:
          'Help the user find the relevant quotes from the source material. Write markdown-formatted replies.',
      },
      {
        role: 'user',
        content: `Return the most relevant quotes from the source material below given the users prompt. 
        Format the returned quotes using markdown: 
        1. return the quotes as bullet points (add "- "),
        2. adding paragraph/space between each quote (add "\n\n"),
        3. list the pageNumber as (Page: {pageNumber}) after each quote,
        
        USER QUERY: ${message}

        \n----------------\n       
        
        RAW UNFORMATTED SOURCE MATERIAL TEXT SNIPPETS:
        ${results
          .map(
            (r) => `${r.pageContent} (Page: ${r.metadata['loc.pageNumber']})`,
          )
          .join('\n\n\n')}

        `,
      },
    ],
  })

  // console.log('response', response)

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
