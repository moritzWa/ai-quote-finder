import EPub from 'epub'
import Epub, { EpubCFI } from 'epubjs'
import { htmlToText } from 'html-to-text'
import { Chapter } from './utils'

async function loadEpubUsingEpubJS(filePath: string): Promise<Chapter[]> {
  const book = ePub(filePath)
  await book.opened
  let chapters: Chapter[] = []

  book.spine.each(async (spineItem: Section) => {
    const contentDocument = await spineItem.load(book.load.bind(book))
    const textNodes = getTextNodes(contentDocument.body)

    let chunks = []
    let part = 1
    for (let node of textNodes) {
      const cfi = spineItem.cfiFromElement(node)
      const textContent = node.textContent
      if (textContent) {
        chunks.push({
          pageContent: textContent,
          metadata: {
            id: spineItem.idref,
            href: spineItem.href,
            title: spineItem.linear ? spineItem.index.toString() : undefined, // You might want to adjust this
            chapterPart: part++,
            epubCFI: cfi,
          },
        })
      }
    }

    chapters = chapters.concat(chunks)
    spineItem.unload()
  })

  return chapters
}

function getTextNodes(element: Element): Element[] {
  let textNodes: Element[] = []

  for (let i = 0; i < element.childNodes.length; i++) {
    const child = element.childNodes[i]
    if (child.nodeType === Node.ELEMENT_NODE) {
      textNodes.push(child as Element)
      textNodes = textNodes.concat(getTextNodes(child as Element))
    }
  }

  return textNodes
}

function getEpubCFI(epub: EPub, chapter: EPub.TocElement): string {
  const spineItemIndex = epub.flow.findIndex((item) => item.id === chapter.id)

  // Find the root element of the Content Document
  let rootElementIndex = 4 // Default to the 4th element (typically the <body>)

  // Find the first element within the Content Document
  let firstElementIndex = 1 // Default to the 1st element (typically the first <p>)

  epub.getChapter(chapter.id, (err, text) => {
    if (!err) {
      const doc = new DOMParser().parseFromString(text, 'application/xml')
      const bodyElement = doc.querySelector('body')
      if (bodyElement) {
        const parentElement = bodyElement.parentElement
        if (parentElement) {
          rootElementIndex =
            Array.from(parentElement.children).indexOf(bodyElement) + 1
        }
        const firstChildElement = bodyElement.children?.[0]
        if (firstChildElement) {
          firstElementIndex =
            Array.from(bodyElement.children).indexOf(firstChildElement) + 1
        }
      }
    }
  })

  return `/6/${spineItemIndex + 1}!/${rootElementIndex}/${firstElementIndex}:0`
}

function loadEpubUsingEpubCFI(filePath: string): Promise<Chapter[]> {
  return new Promise((resolve, reject) => {
    const epub = new Epub(filePath)

    // console.log('epub', epub)

    epub.on('end', async () => {
      try {
        console.log("in epub.on('end')")

        const chapters = await Promise.all(
          epub.flow.map(async (tocItem: any) => {
            return new Promise<Chapter[]>((resolve, reject) => {
              epub.getChapter(tocItem.id, (error, html) => {
                if (error) {
                  reject(error)
                  return
                }

                const chunks = chunkHtmlByClosestTag(html, 3000)
                const dom = new JSDOM(html)
                const firstElement = dom.window.document.body
                  .firstChild as HTMLElement

                if (firstElement) {
                  console.log(
                    'in if firstElement, firstElement.textContent',
                    firstElement.textContent,
                  )

                  const cfi = new EpubCFI().generate(firstElement)

                  resolve(
                    chunks.map((chunk: string, index: number) => ({
                      title: tocItem.title,
                      pageContent: chunk.replace(/<\/?[^>]+(>|$)/g, ''), // remove HTML tags
                      metadata: {
                        cfi: cfi,
                        chunkIndex: index,
                        ...tocItem,
                      },
                    })),
                  )
                } else {
                  console.log(
                    `No first element found for chapter ${tocItem.title}`,
                  )
                }
              })
            })
          }),
        )

        resolve(chapters.flat())
      } catch (error) {
        reject(error)
      }
    })

    epub.parse()
  })
}

function chunkHtmlByClosestTag(
  html: string,
  maxCharsPerChunk: number,
): string[] {
  let chunks = []
  let currentChunk = ''
  let charCount = 0

  const dom = new JSDOM(html)

  // console.log('dom', dom)

  const allNodes = Array.from(
    dom.window.document.body.getElementsByTagName('*'),
  )
  console.log('allNodes[0].outerHTML', allNodes[0].outerHTML)

  for (const node of allNodes) {
    const nodeText = (node as HTMLElement).textContent || ''
    charCount += nodeText.length

    if (charCount > maxCharsPerChunk && currentChunk.length > 0) {
      chunks.push(currentChunk)
      currentChunk = ''
      charCount = nodeText.length
    }

    currentChunk += (node as HTMLElement).outerHTML || ''
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk)
  }

  return chunks
}
