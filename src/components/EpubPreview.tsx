// EPUBPreview.tsx
import ePub from 'epubjs'
import { useEffect, useRef } from 'react'

const EpubPreview = ({ file }: { file: { url: string } }) => {
  const viewerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (viewerRef.current) {
      const book = ePub(file.url)
      const rendition = book.renderTo(viewerRef.current, {
        width: '100%',
        height: '100%',
      })
      rendition.display()

      return () => {
        rendition.destroy()
      }
    }
  }, [file])

  return <div className="h-[150px] w-[100px]" ref={viewerRef} />
}

export default EpubPreview
