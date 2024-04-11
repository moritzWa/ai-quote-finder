import FileRenderer from '@/components/FileRenderer'
import ChatWrapper from '@/components/chat/ChatWrapper'
import { db } from '@/db'
import { getUserSubscriptionPlan } from '@/lib/stripe'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { notFound, redirect } from 'next/navigation'

interface PageProps {
  params: {
    fileId: string // matches [fileId] param
  }
}

const Page = async ({ params }: PageProps) => {
  const { fileId } = params

  console.log('got these params:', params)

  const { getUser } = getKindeServerSession()
  const user = getUser()

  if (!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileId}`)

  const file = await db.file.findFirstOrThrow({
    where: {
      id: fileId,
    },
  })

  if (!file) notFound()

  const plan = await getUserSubscriptionPlan()

  console.log('will render this file key', file.key)
  console.log('wich results in this url', `https://utfs.io/f/${file.key}`)

  return (
    <>
      <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
        <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
          {/* Left sidebar & main wrapper */}
          <div className="flex-1 xl:flex">
            <div className="h-full w-full xl:flex-1">
              {/* Main area */}
              <FileRenderer url={file.url} />
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
