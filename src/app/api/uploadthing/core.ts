import { db } from '@/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { FileRouter, createUploadthing } from 'uploadthing/next'

// import PDFLoader from langchain
// import { getPineconeClient } from '@/lib/pinecone'
import { Pinecone } from '@pinecone-database/pinecone'
import { UploadStatus } from '@prisma/client'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'

const f = createUploadthing()

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
  // environment: 'us-east1-gcp',
  environment: 'gcp-starter',
})

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({ pdf: { maxFileSize: '4MB' } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const { getUser } = getKindeServerSession()
      const user = getUser()

      // If you throw, the user will not be able to upload
      if (!user || !user.id) throw new Error('Unauthorized')

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const createFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
          uploadStatus: 'PROCESSING',
        },
      })

      try {
        // load pdf into memory
        const pdfRes = await fetch(
          `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
        )
        const blob = await pdfRes.blob()
        const loader = new PDFLoader(blob)

        // extract text
        const pageLevelDocs = await loader.load()
        const amountOfPages = pageLevelDocs.length
        // TODO: err if too many pages / free plan

        // vectorize text
        // const pinecone = await getPineconeClient()
        const pineconeIndex = pinecone.Index('ai-quote-finder')

        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        })

        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
          namespace: createFile.id,
        })

        // update file

        await db.file.update({
          where: {
            id: createFile.id,
          },
          data: {
            uploadStatus: UploadStatus.SUCCESS,
          },
        })
      } catch (err) {
        console.error('err in onUploadComplete', err)
        await db.file.update({
          where: {
            id: createFile.id,
          },
          data: {
            uploadStatus: UploadStatus.FAILED,
          },
        })
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
