import { RegisterLink } from '@kinde-oss/kinde-auth-nextjs/server'
import clsx from 'clsx'
import { ArrowRight } from 'lucide-react'

function CTASection({ className }: { className?: string }) {
  return (
    <div className={clsx('mx-auto max-w-7xl py-4', className)}>
      <div className="relative isolate overflow-hidden bg-gray-900 rounded-2xl">
        <div className="px-6 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Upload and search your first book
              <br />
              in a few clicks.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
              We created a new way to search books to give you instant access to
              all your content. Chat with your books now!
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <RegisterLink
                className={clsx(
                  // buttonVariants({
                  //   size: 'lg',
                  // }),
                  'rounded-lg flex flex-row bg-white px-5 py-3 items-center text-base font-semibold text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                )}
              >
                Get started <ArrowRight className="ml-1.5 h-5 w-5" />
              </RegisterLink>
              {/* <a
            href="#"
            className="text-sm font-semibold leading-6 text-white"
          >
            Learn more <span aria-hidden="true">→</span>
          </a> */}
            </div>
          </div>
        </div>
        <svg
          viewBox="0 0 1024 1024"
          className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
          aria-hidden="true"
        >
          <circle
            cx={512}
            cy={512}
            r={512}
            fill="url(#8d958450-c69f-4251-94bc-4e091a323369)"
            fillOpacity="0.7"
          />
          <defs>
            <radialGradient id="8d958450-c69f-4251-94bc-4e091a323369">
              <stop stopColor="#7775D6" />
              <stop offset={1} stopColor="#E935C1" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}

export default CTASection
