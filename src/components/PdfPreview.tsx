'use client'

import { Document, Thumbnail, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

// TODO: prevent this from re-rerendering
const PdfPreview = ({ file }: { file: { url: string } }) => {
  const fileUrl = file.url.replace(
    'https://uploadthing-prod.s3.us-west-2.amazonaws.com/',
    'https://utfs.io/f/',
  )

  return (
    <div className="h-[150px]">
      <Document file={fileUrl}>
        <Thumbnail
          pageNumber={1}
          height={200}
          width={100}
          // figure out why this is just saying loading instead of showing the skeleton
          // loading={<Skeleton className="h-16" />}
        />
      </Document>
    </div>
  )
}

export default PdfPreview
