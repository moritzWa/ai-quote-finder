'use client'

import { trpc } from '@/app/_trpc/client'
// import { PLANS } from '@/config/stripe'
import { freePlan, proPlan } from '@/config/stripe'
import { UploadStatus } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { getHTTPStatusCodeFromError } from '@trpc/server/http'
import { ChevronLeft, Gem, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '../ui/button'
import { ChatContextProvider } from './ChatContext'
import ChatInput from './ChatInput'
import Messages from './Messages'

interface ChatWrapperProps {
  fileId: string
  isSubscribed: boolean
  error?: Error
}

const ChatWrapper = ({ fileId, isSubscribed }: ChatWrapperProps) => {
  const { data, isLoading, error } = trpc.getFileUploadStatus.useQuery(
    {
      fileId,
    },
    {
      refetchInterval: (data) =>
        data?.status === UploadStatus.SUCCESS ||
        data?.status === UploadStatus.FAILED
          ? false
          : 500,
    },
  )

  if (error instanceof TRPCError) {
    console.error('Error fetching file upload status:', error)
    const httpCode = getHTTPStatusCodeFromError(error)
    console.log(httpCode)
  }

  if (isLoading)
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <h3 className="font-semibold text-xl">Loading...</h3>
            <p className="text-zinc-500 text-sm">
              We&apos;re preparing your File.
            </p>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    )

  if (data?.status === UploadStatus.PROCESSING)
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <h3 className="font-semibold text-xl">Processing File...</h3>
            <p className="text-zinc-500 text-sm">This won&apos;t take long.</p>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    )

  if (data?.status === UploadStatus.FAILED)
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <XCircle className="h-8 w-8 text-red-500" />
            <h3 className="font-semibold text-xl">Too many pages in File</h3>
            <p className="text-zinc-500 text-sm">
              Your{' '}
              <span className="font-medium">
                {isSubscribed ? 'Pro' : 'Free'}
              </span>{' '}
              plan supports up to{' '}
              {isSubscribed ? proPlan.pagesPerPdf : freePlan.pagesPerPdf} pages
              per File.
            </p>
            <div className="flex gap-2 mt-4">
              <Link
                href="/dashboard"
                className={buttonVariants({
                  variant: 'secondary',
                  className: '',
                })}
              >
                <ChevronLeft className="h-3 w-3" />
                Back
              </Link>
              <Link
                href="/pricing"
                className={buttonVariants({
                  variant: 'default',
                  size: 'sm',
                })}
              >
                <Gem className="text-white h-4 w-4 mr-1.5" /> Upgrade
              </Link>
            </div>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    )

  return (
    <ChatContextProvider fileId={fileId}>
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 justify-between flex flex-col mb-28">
          <Messages fileId={fileId} />
        </div>
        <ChatInput />
      </div>
    </ChatContextProvider>
  )
}

export default ChatWrapper
