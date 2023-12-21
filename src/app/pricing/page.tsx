import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import UpgradeButton from '@/components/UpgradeButton'
import { buttonVariants } from '@/components/ui/button'
import { PLANS } from '@/config/stripe'
import { cn } from '@/lib/utils'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { ArrowRight, CheckIcon } from 'lucide-react'
import Link from 'next/link'
// import { CheckIcon } from '@heroicons/react/20/solid'

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
          {/* <div className="mt-16 flex justify-center">
            <RadioGroup
              value={frequency}
              onChange={setFrequency}
              className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200"
            >
              <RadioGroup.Label className="sr-only">
                Payment frequency
              </RadioGroup.Label>
              {pricing.frequencies.map((option) => (
                <RadioGroup.Option
                  key={option.value}
                  value={option}
                  className={({ checked }) =>
                    cn(
                      checked ? 'bg-purple-600 text-white' : 'text-gray-500',
                      'cursor-pointer rounded-full px-2.5 py-1',
                    )
                  }
                >
                  <span>{option.label}</span>
                </RadioGroup.Option>
              ))}
            </RadioGroup>
          </div> */}
          <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-2 lg:max-w-4xl xl:mx-0 xl:max-w-none xl:grid-cols-2">
            {PLANS.map((tier) => (
              <div
                key={tier.slug}
                className={cn(
                  tier.mostPopular
                    ? 'ring-2 ring-purple-600'
                    : 'ring-1 ring-gray-200',
                  'rounded-3xl p-8',
                  'bg-white shadow-sm hover:shadow-md',
                )}
              >
                <h2
                  id={tier.slug}
                  className={cn(
                    tier.mostPopular ? 'text-purple-600' : 'text-gray-900',
                    'text-2xl font-semibold',
                  )}
                >
                  {tier.name}
                </h2>
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    ${tier.quota}
                  </span>
                  <span className="text-sm font-semibold leading-6 text-gray-600">
                    /month
                  </span>
                </p>

                <div className="pt-5">
                  {tier.slug === 'free' ? (
                    <Link
                      href={user ? '/dashboard' : '/sign-in'}
                      className={buttonVariants({
                        className: 'w-full',
                        variant: 'secondary',
                      })}
                    >
                      {user ? 'Your current Plan' : 'Sign up'}
                      {/* <ArrowRight className="h-5 w-5 ml-1.5" /> */}
                    </Link>
                  ) : user ? (
                    <UpgradeButton />
                  ) : (
                    <Link
                      href="/sign-in"
                      className={buttonVariants({
                        className: 'w-full',
                        // variant: 'secondary',
                      })}
                    >
                      {user ? 'Your current plan' : 'Sign up'}
                      <ArrowRight className="h-5 w-5 ml-1.5" />
                    </Link>
                  )}
                </div>

                <ul
                  role="list"
                  className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon
                        className="h-6 w-5 flex-none text-purple-600"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </MaxWidthWrapper>
    </>
  )
}

export default Page
