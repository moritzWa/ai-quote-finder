import PdfRenderer from '@/components/PdfRenderer'
import ChatWrapper from '@/components/chat/ChatWrapper'
import { db } from '@/db'
import { getUserSubscriptionPlan } from '@/lib/stripe'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { notFound, redirect } from 'next/navigation'

interface PageProps {
  params: {
    fileid: string // matches [fileId] param
  }
}

const Page = async ({ params }: PageProps) => {
  const { fileid } = params

  const { getUser } = getKindeServerSession()
  const user = getUser()

  if (!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileid}`)

  const file = await db.file.findFirst({
    where: {
      id: fileid,
    },
  })

  if (!file) notFound()

  const plan = await getUserSubscriptionPlan()

  // TODO figure out why this is necessary
  // const fileUrl = file.url.replace(
  //   'https://uploadthing-prod.s3.us-west-2.amazonaws.com/',
  //   'https://utfs.io/f/',
  // )

  return (
    <>
      <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
        <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
          {/* Left sidebar & main wrapper */}
          <div className="flex-1 xl:flex">
            <div className="h-full xl:flex-1">
              {/* Main area */}
              <PdfRenderer url={file.url} />
            </div>
          </div>

          <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
            <ChatWrapper isSubscribed={plan.isSubscribed} fileId={file.id} />
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
