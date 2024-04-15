import { db } from '@/db'
import { openai } from '@/lib/openai'
import { pinecone } from '@/lib/pinecone'
import { SendMessageValidator } from '@/lib/validators/sendMessageValidator'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { NextRequest } from 'next/server'

import { freePlan } from '@/config/stripe'
import { getUserSubscriptionPlan } from '@/lib/stripe'
import { OpenAIStream, StreamingTextResponse } from 'ai'

import cron from 'node-cron'

cron.schedule('0 * * * *', async () => {
  const users = await db.user.findMany()

  for (const user of users) {
    const hoursSinceCreation = Math.floor(
      Math.abs(new Date().getTime() - new Date(user.createdAt).getTime()) /
        36e5,
    )

    if (Number.isInteger(hoursSinceCreation / 24)) {
      await db.user.update({
        where: { id: user.id },
        data: { totalMessagesUsedToday: 0 },
      })
    }
  }
})

export const POST = async (req: NextRequest) => {
  const body = await req.json()

  const { getUser } = getKindeServerSession()
  const user = getUser()

  const { id: userId } = user

  if (!userId) return new Response('Unauthorized', { status: 401 })

  // get user from db
  const dbUser = await db.user.findFirst({
    where: {
      id: userId,
    },
  })

  if (!dbUser) return new Response('Unauthorized', { status: 401 })

  const subscriptionPlan = await getUserSubscriptionPlan()

  if (
    !subscriptionPlan.isSubscribed &&
    (dbUser.totalMessagesUsed >= freePlan.maxMesages ||
      dbUser.totalMessagesUsedToday >= freePlan.maxMessagesPerDay)
  ) {
    console.log('subscriptionPlan.isSubscribed', subscriptionPlan.isSubscribed)
    console.log('dbUser.totalMessagesUsed', dbUser.totalMessagesUsed)
    console.log('freePlan.maxMesages', freePlan.maxMesages)
    console.log('dbUser.totalMessagesUsedToday', dbUser.totalMessagesUsedToday)

    const now = new Date()
    const createdAt = new Date(dbUser.createdAt)
    let nextReset = new Date(createdAt.getTime())

    while (nextReset <= now) {
      nextReset.setDate(nextReset.getDate() + 1)
    }

    const hoursUntilReset = Math.ceil(
      (nextReset.getTime() - now.getTime()) / (1000 * 60 * 60),
    )

    return new Response(
      `Free plan message limit reached. Your limit will reset in ${hoursUntilReset} hours.`,
      { status: 403 },
    )
  }

  // Increment the message count for both totalMessagesUsed and totalMessagesUsedToday
  await db.user.update({
    where: { id: userId },
    data: {
      totalMessagesUsed: dbUser.totalMessagesUsed + 1,
      totalMessagesUsedToday: dbUser.totalMessagesUsedToday + 1,
    },
  })

  const { fileId, message, quoteMode } = SendMessageValidator.parse(body)

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
      isFromEpubWithHref: file.url.endsWith('.epub'),
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

  // console.log(
  //   '4 vector search result mapped',
  //   await results.map((r) => r.metadata),
  //   'using namespace',
  //   file.id,
  // )

  const previousMessage = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 4,
  })
  const formattedPreviousMassege = previousMessage?.map((message) => ({
    role: message.isUserMessage ? 'user' : 'assistant',
    content: message.text,
  }))

  let response

  const fileIsEpub = file.url.endsWith('.epub')

  if (quoteMode) {
    // If quoteMode is true, use this completion
    response = await openai.chat.completions.create({
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
        3. list the ${
          fileIsEpub
            ? 'href as (Href: {href})'
            : 'pageNumber as (Page: {pageNumber})'
        } after each quote,
        
        USER QUERY: ${message}

        \n----------------\n       
        
        RAW UNFORMATTED SOURCE MATERIAL TEXT SNIPPETS:
        ${results
          .map((r) => {
            console.log('r.metadata in map', r.metadata)
            return `${r.pageContent} ${fileIsEpub ? '(Href: ' : '(Page:'} ${
              // meta data is saved as 'loc.pageNumber': 106,
              fileIsEpub ? r.metadata.href : r.metadata['loc.pageNumber']
            })`
          })
          .join('\n\n\n')}
        `,
        },
      ],
    })
  } else {
    // If quoteMode is false, use this completion
    response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0,
      stream: true,
      messages: [
        {
          role: 'system',
          content:
            'Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.',
        },
        {
          role: 'user',
          content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
        \n----------------\n
        
        PREVIOUS CONVERSATION:
        ${formattedPreviousMassege.map((message) => {
          if (message.role === 'user') return `User: ${message.content}\n`
          return `Assistant: ${message.content}\n`
        })}
        
        \n----------------\n
        
        CONTEXT:
        ${results.map((r) => r.pageContent).join('\n\n')}
        
        USER INPUT: ${message}`,
        },
      ],
    })
  }

  const stream = OpenAIStream(response, {
    async onCompletion(completion) {
      await db.message.create({
        data: {
          text: completion,
          isUserMessage: false,
          quoteMode,
          userId,
          fileId,
          isFromEpubWithHref: fileIsEpub,
        },
      })
    },
  })

  return new StreamingTextResponse(stream)
}
