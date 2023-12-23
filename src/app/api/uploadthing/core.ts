import { freePlan, proPlan } from '@/config/stripe'
import { db } from '@/db'
import { pinecone } from '@/lib/pinecone'
import { getUserSubscriptionPlan } from '@/lib/stripe'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { UploadStatus } from '@prisma/client'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { createUploadthing, type FileRouter } from 'uploadthing/next'

const f = createUploadthing()

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
  }
}) => {
  const isFileExist = await db.file.findFirst({
    where: {
      key: file.key,
    },
  })

  if (isFileExist) return

  const createdFile = await db.file.create({
    data: {
      key: file.key,
      name: file.name,
      userId: metadata.userId,
      url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
      uploadStatus: UploadStatus.PROCESSING,
      private: metadata.userPrefersPrivateUpload,
    },
  })

  try {
    const response = await fetch(
      `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
    )

    const blob = await response.blob()

    const loader = new PDFLoader(blob)

    const pageLevelDocs = await loader.load()

    const pagesAmt = pageLevelDocs.length

    const { subscriptionPlan } = metadata
    const { isSubscribed } = subscriptionPlan

    const isProExceeded = pagesAmt > proPlan!.pagesPerPdf
    const isFreeExceeded = pagesAmt > freePlan!.pagesPerPdf

    if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
      await db.file.update({
        data: {
          uploadStatus: UploadStatus.FAILED,
        },
        where: {
          id: createdFile.id,
        },
      })
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

    await db.file.update({
      data: {
        uploadStatus: UploadStatus.SUCCESS,
      },
      where: {
        id: createdFile.id,
      },
    })
  } catch (err) {
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
  })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPlanUploader: f({
    pdf: {
      maxFileSize: proPlan!.maxFileSize,
    },
  })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
