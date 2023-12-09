import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '../_trpc/client'

const Page = () => {
  const route = useRouter()

  const searchParams = useSearchParams()

  const origin = searchParams.get('origin')

  const { data, isLoading } = trpc.authCallback.useQuery(undefined, {
    onSuccess: ({ success }) => {
      if (success) {
        route.push(origin ? `/{origin}` : '/dashboard')
      }
    },
  })
}
