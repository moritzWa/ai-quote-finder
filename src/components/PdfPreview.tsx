'use client'

import { useState } from 'react'
import { Document, Thumbnail, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

const PdfPreview = ({ file }: { file: { url: string } }) => {
  const [loading, setLoading] = useState(true)

  return (
    <div>
      <Document file={file.url}>
        <Thumbnail
          pageNumber={1}
          height={200}
          width={100}
          // figure out why this is just saying loading instead of showing the skeleton
          // oading={<Skeleton className="h-16" />}
        />
      </Document>
    </div>
  )
}

export default PdfPreview
