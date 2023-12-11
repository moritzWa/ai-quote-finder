'use client'

import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '../_trpc/client'

const Page = () => {
  const route = useRouter()

  const searchParams = useSearchParams()

  const origin = searchParams.get('origin')

  console.log('auth callback page')

  trpc.authCallback.useQuery(undefined, {
    onSuccess: ({ success }) => {
      console.log(success, 'success in auth callback page')

      if (success) {
        route.push(origin ? `/${origin}` : '/dashboard')
      }
    },
    onError: (err) => {
      console.log(err, 'error in auth callback page')

      if (err.data?.code == 'UNAUTHORIZED') {
        route.push('/sign-in')
      }
    },
    retry: false,
    retryDelay: 500,
  })

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        <h3 className="font-semibold text-xl">Setting up your account...</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  )
}

export default Page
