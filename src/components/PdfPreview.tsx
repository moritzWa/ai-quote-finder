'use client'

import { Document, Thumbnail, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

// TODO: prevent this from re-rerendering
const PdfPreview = ({ file }: { file: { url: string } }) => {
  return (
    <div className="h-[150px]">
      <Document file={file.url}>
        <Thumbnail pageNumber={1} height={200} width={100} />
      </Document>
    </div>
  )
}

export default PdfPreview
