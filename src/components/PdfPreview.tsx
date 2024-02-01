'use client'

import { useState } from 'react'
import { Document, Thumbnail, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

const PdfPreview = ({ file }: { file: { url: string } }) => {
  const [numPages, setNumPages] = useState<number>()

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages)
  }

  return (
    <div>
      <Document file={file.url} onLoadSuccess={onDocumentLoadSuccess}>
        <Thumbnail pageNumber={1} height={200} width={100} />
      </Document>
    </div>
  )
}

export default PdfPreview
