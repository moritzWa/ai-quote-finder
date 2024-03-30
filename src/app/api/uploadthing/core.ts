import { freePlan, proPlan } from '@/config/stripe'
import { db } from '@/db'
import { pinecone } from '@/lib/pinecone'
import { getUserSubscriptionPlan } from '@/lib/stripe'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { UploadStatus } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import fs from 'fs'
import https from 'https'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'
import { loadEpubFromUrl, parseFileSize } from './utils'

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

const middleware = async () => {
  const { getUser } = getKindeServerSession()
  const user = getUser()

  if (!user || !user.id) throw new Error('Unauthorized')

  const subscriptionPlan = await getUserSubscriptionPlan()

  // search user in db

  const dbUserSelection = await db.user.findFirst({
    where: {
      id: user.id,
    },
    select: {
      prefersPrivateUpload: true,
    },
  })

  if (!dbUserSelection) throw new Error('Unauthorized')

  // Whatever is returned here is accessible in onUploadComplete as `metadata`
  return {
    subscriptionPlan,
    userId: user.id,
    userPrefersPrivateUpload: dbUserSelection.prefersPrivateUpload,
  }
}

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

  // console.log(
  //   'now in onUploadComplet. isFileExist:',
  //   isFileExist,
  //   'file.url',
  //   file.url,
  // )

  if (isFileExist) return

  // https://uploadthing-prod.s3.us-west-2.amazonaws.com/
  // https://utfs.io/f/

  const createdFile = await db.file.create({
    data: {
      key: file.key,
      name: file.name,
      userId: metadata.userId,
      url: file.url,
      uploadStatus: UploadStatus.PROCESSING,
      private: metadata.userPrefersPrivateUpload,
    },
  })

  try {
    const response = await fetch(file.url)

    console.log('response', response)
    console.log('file.name', file.name)

    let pageLevelDocs
    if (file.name.endsWith('.epub')) {
      console.log("in if file.name.endsWith('.epub')")

      // langchain version
      // const filePath = await downloadFileToString(file.url, 'temp.epub');
      // const loader = new EPubLoader(filePath);
      // pageLevelDocs = await loader.load();

      pageLevelDocs = await loadEpubFromUrl(file.url)

      console.log('pageLevelDocs', pageLevelDocs)
    } else {
      const blob = await response.blob()
      const loader = new PDFLoader(blob)
      pageLevelDocs = await loader.load()
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
    if (file.size > parseFileSize(allowedFileSize)) {
      console.log('file.size', file.size, 'allowedFileSize', allowedFileSize)
      throw new TRPCError({
        code: 'PAYLOAD_TOO_LARGE',
        message: `File size exceeds the allowed limit of ${allowedFileSize}`,
      })
    }
    if (file.size > parseFileSize(allowedFileSize)) {
      console.log('file.size', file.size, 'allowedFileSize', allowedFileSize)
      throw new UploadThingError(
        `File size exceeds the allowed limit of ${allowedFileSize}`,
      )
    }

    if (
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

    // vectorize & index text
    const pineconeIndex = pinecone.Index('ai-quote-finder')

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    })

    await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
      pineconeIndex,
      namespace: createdFile.id,
    })

    // log out output of PineconeStore.fromDocuments
    console.log(
      'pineconeIndex.describeIndexStats()',
      await pineconeIndex.describeIndexStats(),
    )

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

