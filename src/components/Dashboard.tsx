'use client'

import { trpc } from '@/app/_trpc/client'
// import { getUserSubscriptionPlan } from '@/lib/stripe'
import { File } from '.prisma/client'
import { getUserSubscriptionPlan } from '@/lib/stripe'
import { format } from 'date-fns'
import { BookDashed, Loader2, MessageSquare, Plus, Trash } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import UploadButton from './UploadButton'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
interface PageProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
  userId: string
}

export type FileWithMessages = File & { messages: { id: string }[] }

const Dashboard = ({ subscriptionPlan, userId }: PageProps) => {
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<
    string | null
  >(null)

  const utils = trpc.useContext()

  const { data: files, isLoading } = trpc.getUserFiles.useQuery()

  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess: () => {
      // invalidate query to refetch files
      utils.getUserFiles.invalidate()
    },
    onMutate({ id }) {
      setCurrentlyDeletingFile(id)
    },
    onSettled() {
      setCurrentlyDeletingFile(null)
    },
  })

  const File = ({ file }: { file: FileWithMessages }) => {
    return (
      <li
        key={file.id}
        className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
      >
        <Link href={`/dashboard/${file.id}`} className="flex flex-col gap-2">
          <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-300 to-purple-600" />
            <div className="flex-1 truncate">
              <div className="flex items-center space-x-3">
                <h3 className="truncate text-lg font-medium text-zinc-900">
                  {file.name}
                </h3>
              </div>
            </div>
          </div>
        </Link>

        <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500">
          {file.userId === userId ? (
            <Button
              onClick={() => deleteFile({ id: file.id })}
              size="sm"
              className="w-full"
              variant="destructive"
            >
              {currentlyDeletingFile === file.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="h-9"></div>
          )}

          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {format(new Date(file.createdAt), 'MMM yyyy')}
          </div>

          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {file.messages.length}
          </div>
        </div>
      </li>
    )
  }

  return (
    <main className="mx-auto max-w-7xl md:p-10">
      <Tabs defaultValue="all-books" className="w-full">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
          <TabsList>
            <TabsTrigger value="all-books">All Books</TabsTrigger>
            <TabsTrigger value="my-books">My Books</TabsTrigger>
            <TabsTrigger value="my-private-books">My Private Books</TabsTrigger>
          </TabsList>
          <UploadButton isSubscribed={subscriptionPlan.isSubscribed} />
        </div>
        {files && files?.length !== 0 ? (
          <>
            <TabsContent value="all-books">
              <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
                {files
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map((file) => (
                    <>
                      {/* @ts-ignore */}
                      <File file={file} />
                    </>
                  ))}
              </ul>
            </TabsContent>
            <TabsContent value="my-books">
              <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
                {files
                  .filter((file) => file.userId === userId)
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map((file) => (
                    <>
                      {/* @ts-ignore */}
                      <File file={file} />
                    </>
                  ))}
              </ul>
            </TabsContent>
            <TabsContent value="my-private-books">
              <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
                {files
                  .filter((file) => file.private && file.userId === userId)
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map((file) => (
                    <>
                      {/* @ts-ignore */}
                      <File file={file} />
                    </>
                  ))}
              </ul>
            </TabsContent>
          </>
        ) : isLoading ? (
          <Skeleton height={100} className="my-2" count={3} />
        ) : (
          <div className="mt-16 flex flex-col items-center gap-2">
            <BookDashed className="h-8 w-8 text-zinc-800" />
            <h3 className="font-semibold text-xl">Empty</h3>
            <p>Let&apos;s upload your first File.</p>
          </div>
        )}
      </Tabs>
    </main>
  )
}

export default Dashboard
