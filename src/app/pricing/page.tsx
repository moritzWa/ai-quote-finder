import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { PricingPlansUI } from '@/components/PricingPlansUI'
import UpgradeButton from '@/components/UpgradeButton'
import { buttonVariants } from '@/components/ui/button'
import { PLANS } from '@/config/stripe'
import { cn } from '@/lib/utils'
import {
  KindeUser,
  getKindeServerSession,
} from '@kinde-oss/kinde-auth-nextjs/server'
import { ArrowRight, CheckIcon } from 'lucide-react'
import Link from 'next/link'

const Page = () => {
  const { getUser } = getKindeServerSession()
  const user = getUser()

  return (
    <>
      <MaxWidthWrapper>
        {/* Pricing section */}
        <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-32 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-base font-semibold leading-7 text-purple-600">
              Pricing
            </h1>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Buy unlimited semantic retreival for your books and files.
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
            Try our product for free in a limited capacity. Upgrade to Pro for
            unlimited access.
          </p>
          <PricingPlansUI user={user} />
        </div>
      </MaxWidthWrapper>
    </>
  )
}

export default Page
