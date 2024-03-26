'use client'

import { trpc } from '@/app/_trpc/client'
// import { getUserSubscriptionPlan } from '@/lib/stripe'
import { File } from '.prisma/client'
import { getUserSubscriptionPlan } from '@/lib/stripe'
import clsx from 'clsx'
import { format } from 'date-fns'
import {
  BookDashed,
  Edit,
  Loader2,
  MessageSquare,
  Plus,
  ShareIcon,
  Trash,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import PdfPreview from './PdfPreview'
import UploadButton from './UploadButton'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'
import { useToast } from './ui/use-toast'

interface PageProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
  userId: string
}

export type FileWithMessages = File & { messages: { id: string }[] }

const Dashboard = ({ subscriptionPlan, userId }: PageProps) => {
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<
    string | null
  >(null)

  const { toast } = useToast()
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

  const [currentlyRenamingFile, setCurrentlyRenamingFile] = useState<
    string | null
  >(null)

  const renameMutation = trpc.updateFileName.useMutation({
    onSuccess: () => {
      // invalidate query to refetch files
      utils.getUserFiles.invalidate()
    },
    onSettled: () => {
      setCurrentlyRenamingFile(null)
    },
  })

  // make public logic (makeFilePublic)
  const [currentlyMakingFilePublic, setCurrentlyMakingFilePublic] = useState<
    string | null
  >(null)

  const {
    mutate: makeFilePublicMutation,
    isLoading: isLoadingMakeFilePublicMutation,
  } = trpc.makeFilePublic.useMutation({
    onSuccess: () => {
      // invalidate query to refetch files
      utils.getUserFiles.invalidate()
    },
    onSettled: () => {
      setCurrentlyMakingFilePublic(null)
      // toast
      return toast({
        title: 'File made public',
        variant: 'default',
      })
    },
  })

  // renameFle function opens prompt() and calls updateFile mutation
  const renameFile = async ({ id, name }: { id: string; name: string }) => {
    const newName = prompt('Enter new name', name)
    if (!newName) return
    setCurrentlyRenamingFile(id)

    await renameMutation.mutate({ id, name: newName })
  }

  const File = ({
    file,
    showMakePublicButton,
  }: {
    file: FileWithMessages
    showMakePublicButton: boolean
  }) => {
    if (
      currentlyMakingFilePublic === file.id ||
      isLoadingMakeFilePublicMutation
    ) {
      return <Skeleton height={280} width={380} className="my-2" />
    } else {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <li
                key={file.id}
                className="col-span-1 flex flex-col justify-between divide-y divide-gray-200 h-full rounded-lg bg-white shadow transition hover:shadow-lg"
              >
                <Link
                  href={`/dashboard/${file.id}`}
                  className="flex flex-col gap-2"
                >
                  <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
                    <PdfPreview file={file} />
                    <div className="flex-1">
                      <div className="flex text-left space-x-3">
                        <h3 className="text-lg line-clamp-3 font-medium text-zinc-900">
                          {currentlyRenamingFile === file.id ? (
                            <Skeleton width={100} />
                          ) : (
                            file.name
                          )}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>

                <div
                  className={clsx(
                    'px-3 py-3 mt-4 grid place-items-center text-xs text-zinc-500',
                    showMakePublicButton
                      ? 'grid-cols-5 gap-4'
                      : 'gap-6 grid-cols-4',
                  )}
                >
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
                  {file.userId === userId ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="w-full">
                          <Button
                            onClick={() =>
                              renameFile({ id: file.id, name: file.name })
                            }
                            size="sm"
                            className="w-full"
                            variant="outline"
                          >
                            {currentlyRenamingFile === file.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Edit className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Rename book</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <div className="h-9"></div>
                  )}

                  {showMakePublicButton && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            onClick={async () => {
                              await makeFilePublicMutation({
                                id: file.id,
                              })
                            }}
                            size="sm"
                            className="w-full"
                            variant="outline"
                          >
                            {currentlyMakingFilePublic === file.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ShareIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Make book public</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <div className="flex justify-center items-center w-20">
                    <Plus className="h-4" />
                    {format(new Date(file.createdAt), 'MMM yyyy')}
                  </div>

                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    {file.messages.length}
                  </div>
                </div>
              </li>
            </TooltipTrigger>
            <TooltipContent>
              <p>{file.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  }

  return (
    <main className="mx-auto max-w-7xl md:p-10 pt-2">
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
              <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {files
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map((file) => (
                    <>
                      {/* @ts-ignore */}
                      <File file={file} key={file.id} />
                    </>
                  ))}
              </ul>
            </TabsContent>
            <TabsContent value="my-books">
              <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                      <File file={file} key={file.id} />
                    </>
                  ))}
              </ul>
            </TabsContent>
            <TabsContent value="my-private-books">
              <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                      <File file={file} key={file.id} showMakePublicButton />
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
