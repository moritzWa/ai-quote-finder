// import { encoding_for_model } from '@dqbd/tiktoken'
import { Document } from '@langchain/core/documents'
import { Index as PineconeIndex } from '@pinecone-database/pinecone'
import EPub from 'epub'
import fs from 'fs'
import { htmlToText } from 'html-to-text'
import https from 'https'
import { PineconeStore } from 'langchain/vectorstores/pinecone'

// import { Embeddings } from 'openai/resources'
import { Embeddings } from '@langchain/core/embeddings'
import os from 'os'
import path from 'path'

// export const countTokens = (text: string) => {
//   const encoder = encoding_for_model('gpt-3.5-turbo')
//   const tokens = encoder.encode(text)
//   encoder.free()
//   return tokens.length
// }

const BATCH_SIZE = 100 // Adjust based on optimal batch size for Pinecone

// Batch processing of documents to handle large volumes efficiently
export async function batchProcessDocuments(
  documents: Document[],
  embeddings: Embeddings,
  pineconeIndex: PineconeIndex,
  namespace: string,
): Promise<void> {
  const pineconeStore = new PineconeStore(embeddings, {
    pineconeIndex,
    namespace,
  })

  // console.log(
  //   'in batchProcessDocuments processing documents.length',
  //   documents.length,
  //   'using namespace: ',
  //   namespace,
  // )

  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    console.log(`Batch ${i} `)

    const batch = documents.slice(i, i + BATCH_SIZE)
    await pineconeStore.addDocuments(batch) // Now we don't need to cast to any
  }
}

export const sanitize = (text: string) => {
  // Replace ambiguous Unicode characters with a space
  return text.replace(/[\u{0080}-\u{FFFF}]/gu, ' ')
}

export function parseFileSize(fileSizeString: string): number {
  const [value, unit] = fileSizeString.match(/^(\d+)(\w+)$/)!.slice(1, 3)
  const valueNum = parseInt(value, 10)
  switch (unit.toUpperCase()) {
    case 'B':
      return valueNum
    case 'KB':
      return valueNum * 1024
    case 'MB':
      return valueNum * 1024 * 1024
    case 'GB':
      return valueNum * 1024 * 1024 * 1024
    default:
      throw new Error(`Invalid file size unit: ${unit}`)
  }
}

export async function downloadFileToString(
  url: string,
  destination: string,
): Promise<string> {
  const file = fs.createWriteStream(destination)
  const request = https.get(url, function (response) {
    response.pipe(file)
  })

  return new Promise((resolve, reject) => {
    file.on('finish', () => resolve(destination))
    file.on('error', reject)
  })
}

export async function downloadFile(url: string, destination: string) {
  const file = fs.createWriteStream(destination)
  const request = https.get(url, function (response) {
    response.pipe(file)
  })

  return new Promise((resolve, reject) => {
    file.on('finish', resolve)
    file.on('error', reject)
  })
}

export async function loadEpubFromUrl(url: string) {
  const filePath = path.join(os.tmpdir(), 'temp.epub')
  await downloadFile(url, filePath)
  return loadEpubViaGetChapter(filePath)
}

export interface Chapter extends Document {
  metadata: {
    id: string
    href: string
    level?: number
    order?: number
    title?: string
    chapterPart?: number
    epubCFI?: string
    [key: string]: any // Allow for additional metadata not initially defined
  }
}

// TODO: try this https://stackoverflow.com/questions/69607740/extract-paragraphs-and-cfi-from-epub?rq=2

export async function loadEpubViaGetChapter(
  filePath: string,
): Promise<Chapter[]> {
  const epub = new EPub(filePath)

  return new Promise((resolve, reject) => {
    epub.on('end', async function () {
      let chapters = await Promise.all<Chapter>(
        epub.flow.map((chapter) => {
          return new Promise<Chapter>((resolve, reject) => {
            epub.getChapter(chapter.id, (err, text) => {
              if (err) {
                reject(err)
              } else {
                // const epubCFI = getEpubCFI(epub, chapter) // todo add this
                resolve({
                  pageContent: htmlToText(text),
                  metadata: {
                    level: chapter.level,
                    order: chapter.order,
                    title: chapter.title,
                    id: chapter.id,
                    href: chapter.href,
                    // epubCFI,
                  },
                })
              }
            })
          })
        }),
      )

      // Split chapters into smaller chunks
      chapters = chapters.flatMap((chapter) => {
        const chunks = []
        let start = 0
        let part = 1

        while (start < chapter.pageContent.length) {
          let end = start + 3000
          if (end < chapter.pageContent.length) {
            end = chapter.pageContent.lastIndexOf(' ', end) + 1
          }
          // const chunkContent = chapter.pageContent.slice(start, end + 23)
          // const chunkCFI = getEpubCFI(epub, chapter, start) // todo: add this
          chunks.push({
            pageContent: chapter.pageContent.slice(start, end + 23),
            metadata: {
              ...chapter.metadata,
              chapterPart: part,
              // epubCFI: chunkCFI,
              // tokenCount: countTokens(chapter.pageContent.slice(start, end + 23)), // only for debug purposes
            },
          })
          start = end
          part++
        }

        return chunks
      })

      resolve(chapters)
    })
    epub.parse()
  })
}
