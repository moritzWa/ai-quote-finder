import { freePlan, proPlan } from '@/config/stripe'
import { db } from '@/db'
import { pinecone } from '@/lib/pinecone'
import { UploadStatus } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import fs from 'fs'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UTApi, UploadThingError } from 'uploadthing/server'
import { middleware } from './middleware'
import {
  Chapter,
  batchProcessDocuments,
  loadEpubFromUrl,
  parseFileSize,
  sanitize,
} from './utils'

export const utapi = new UTApi()
export const maxDuration = 300

const f = createUploadthing({
  /**
   * Log out more information about the error, but don't return it to the client
   * @see https://docs.uploadthing.com/errors#error-formatting
   */

  // @ts-ignore
  errorFormatter: (err) => {
    console.log('Error uploading file', err.message)
    console.log('  - Above error caused by:', err.cause)

    return {
      message: err.message,
      cause: err.cause,
    }
  },
})

const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<typeof middleware>>
  file: {
    key: string
    name: string
    url: string
    size: number
  }
}) => {
  const isFileExist = await db.file.findFirst({
    where: {
      key: file.key,
    },
  })

  if (isFileExist) return
  const fileURL = `https://utfs.io/f/${file.key}`

  console.log('creating file now using fileURL:', fileURL)

  const createdFile = await db.file.create({
    data: {
      key: file.key,
      name: file.name,
      userId: metadata.userId,
      url: fileURL,
      uploadStatus: UploadStatus.PROCESSING,
      private: metadata.userPrefersPrivateUpload,
    },
  })

  try {
    const response = await fetch(fileURL)

    let pageLevelDocs
    if (file.name.endsWith('.epub')) {
      console.log("in if file.name.endsWith('.epub')")

      pageLevelDocs = (await loadEpubFromUrl(fileURL)) as Chapter[]

      // sanitize epub page content
      pageLevelDocs = await Promise.all(
        pageLevelDocs.map(async (doc) => {
          return {
            ...doc,
            pageContent: sanitize(doc.pageContent) || 'Empty chapter/page',
          }
        }),
      )

      console.log('epub loaded pageLevelDocs.length', pageLevelDocs.length)
    } else {
      console.log("in else file.name.endsWith('.pdf')")
      const blob = await response.blob()
      const loader = new PDFLoader(blob)
      pageLevelDocs = await loader.load()
      console.log('pdf loaded pageLevelDocs.length', pageLevelDocs.length)
    }

    const pagesAmt = pageLevelDocs.length

    const { subscriptionPlan } = metadata
    const { isSubscribed } = subscriptionPlan

    const isFreePageLimitExceeded = pagesAmt > freePlan!.pagesPerPdf
    const isProPageLimitExceeded = pagesAmt > proPlan!.pagesPerPdf

    const { maxFileSize: freePlanMaxFileSize } = freePlan
    const { maxFileSize: proPlanMaxFileSize } = proPlan!
    const allowedFileSize = isSubscribed
      ? proPlanMaxFileSize
      : freePlanMaxFileSize

    console.log('allowedFileSize', allowedFileSize, 'file.size', file.size)

    // throw erros if the file is too big
    if (
      file.size > parseFileSize(allowedFileSize)
      // && process.env.NODE_ENV === 'production'
    ) {
      console.log('file.size', file.size, 'allowedFileSize', allowedFileSize)
      throw new TRPCError({
        code: 'PAYLOAD_TOO_LARGE',
        message: `File size exceeds the allowed limit of ${allowedFileSize}`,
      })
    }
    if (
      file.size > parseFileSize(allowedFileSize) // &&
      // process.env.NODE_ENV === 'production'
    ) {
      console.log('file.size', file.size, 'allowedFileSize', allowedFileSize)
      throw new UploadThingError(
        `File size exceeds the allowed limit of ${allowedFileSize}`,
      )
    }

    if (
      // process.env.NODE_ENV === 'production' &&
      (isSubscribed && isProPageLimitExceeded) ||
      (!isSubscribed && isFreePageLimitExceeded)
    ) {
      console.log(
        'in if pages too many',
        isProPageLimitExceeded,
        isFreePageLimitExceeded,
        pagesAmt,
      )

      await db.file.update({
        data: {
          uploadStatus: UploadStatus.FAILED,
        },
        where: {
          id: createdFile.id,
        },
      })
      return
    }

    // add token count to metadata
    // pageLevelDocs = pageLevelDocs.map((doc) => ({
    //   ...doc,
    //   metadata: {
    //     ...doc.metadata,
    //     // tokenCount: countTokens(doc.pageContent),
    //   },
    // }))

    // const totalTokens = pageLevelDocs.reduce(
    //   (sum, doc) => sum + doc.metadata.tokenCount,
    //   0,
    // )
    // const maxTokens = Math.max(
    //   ...pageLevelDocs.map((doc) => doc.metadata.tokenCount),
    // )

    console.log(`Number of documents: ${pageLevelDocs.length}`)
    // console.log(`Total tokens: ${totalTokens}`)
    // console.log(`Max tokens in a single document: ${maxTokens}`)

    // Get current timestamp and replace / with -
    const timestamp = new Date().toLocaleString().replace(/\//g, '-')

    // Construct file name with timestamp
    const fileName = `pageLevelDocs_${createdFile.name.replace(
      /([^a-z0-9]+)/gi,
      '-',
    )}_${timestamp}.json`

    // Write file with timestamped name
    fs.writeFile(fileName, JSON.stringify(pageLevelDocs, null, 2), (err) => {
      if (err) {
        console.error('Error writing file:', err)
      } else {
        console.log('File written successfully:', fileName)
      }
    })

    // vectorize & index text
    const pineconeIndex = pinecone.Index('ai-quote-finder')

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    })

    await batchProcessDocuments(
      pageLevelDocs,
      embeddings,
      pineconeIndex,
      createdFile.id, // Use the file key as the namespace for unique identification
    )

    // await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
    //   pineconeIndex,
    //   namespace: createdFile.id,
    // })

    await db.file.update({
      data: {
        uploadStatus: UploadStatus.SUCCESS,
      },
      where: {
        id: createdFile.id,
      },
    })
  } catch (err) {
    console.log('err in onUploadComplete catch. err:', err)

    await db.file.update({
      data: {
        uploadStatus: UploadStatus.FAILED,
      },
      where: {
        id: createdFile.id,
      },
    })
  }
}

export const ourFileRouter = {
  freePlanUploader: f({
    pdf: {
      maxFileSize: freePlan.maxFileSize,
    },
    'application/epub+zip': {
      maxFileSize: freePlan.maxFileSize,
    },
  })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPlanUploader: f({
    pdf: {
      maxFileSize: proPlan!.maxFileSize,
    },
    'application/epub+zip': {
      maxFileSize: proPlan!.maxFileSize,
    },
  })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
