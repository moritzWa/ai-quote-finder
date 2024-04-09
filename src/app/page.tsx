import { PricingPlansUI } from '@/components/PricingPlansUI'
import { buttonVariants } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

import { RegisterLink } from '@kinde-oss/kinde-auth-nextjs/server'
import clsx from 'clsx'
import dynamic from 'next/dynamic'

const DynamicVideoPlayer = dynamic(() => import('@/components/VideoPlayer'), {
  ssr: false,
})

const features = [
  {
    name: 'Your library, searchable with AI',
    description:
      'Upload PDF (EPUB-support comming soon!) and start searching in seconds.',
    emoji: '🏛',
  },
  {
    name: 'Forget annoying keyword search',
    description: 'Stop wasting hours searching for keywords in your documents.',
    emoji: '🔍',
  },
  {
    name: 'Bulk upload books from Apple Books - Coming soon!',
    description: 'Sign up to get notified when we release this feature.',
    emoji: '📚',
  },
]

export default function Home() {
  return (
    <>
      <div className="bg-white">
        <div className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20">
          <div className="mx-auto max-w-7xl pb-24 sm:pb-28 min-h-[682px] lg:grid lg:grid-cols-[40%,60%] lg:gap-x-12 lg:px-8 lg:py-20">
            <div className="px-6 lg:px-0 lg:pt-4">
              <div className="mx-auto max-w-2xl">
                <div className="max-w-lg">
                  {/* <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-semibold leading-6 text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                    New: EPUB Support
                  </span> */}
                  <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                    Semantic Search for your books
                  </h1>
                  <p className="mt-6 text-lg leading-8 text-gray-600">
                    Find the best parts of your favorite books in seconds. Or
                    understand books with AI chat. Supports EPUBs and PDFs.
                  </p>
                  <div className="mt-5 flex items-center just gap-x-6">
                    <RegisterLink
                      className={buttonVariants({
                        size: 'lg',
                      })}
                    >
                      Get started <ArrowRight className="ml-1.5 h-5 w-5" />
                    </RegisterLink>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-20 flex justify-end sm:mt-24 md:mx-auto md:max-w-2xl lg:mx-0 lg:mt-0 lg:w-screen">
              <div
                className="absolute inset-y-0 right-1/2 -z-10 -mr-10 w-[200%] skew-x-[-30deg] bg-white shadow-xl shadow-purple-600/10 ring-1 ring-purple-50 md:-mr-20 lg:-mr-36"
                aria-hidden="true"
              />
              <DynamicVideoPlayer
                src="/quote-finder.webm"
                width={743}
                height={600}
              />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-white sm:h-32" />
        </div>
      </div>

      {/* chatmode */}

      <div className="overflow-hidden bg-white py-16">
        <div className="mx-auto max-w-7xl md:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:grid-cols-2 lg:items-start">
            <div className="px-6 lg:px-0 lg:pr-4 lg:pt-4">
              <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-lg">
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Chat Mode + Quote Mode
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Switch between Chat Mode and Quote Mode. Quote mode retrieves
                  relevant passages. Chat mode uses your chat history to answer
                  questions and generate relevant passages.
                </p>

                <figure className="mt-10 border-l-2 border-purple-300 pl-8 text-gray-700">
                  <blockquote className="text-base leading-7">
                    <p>
                      “I often need to find a passage that is relevant to the
                      texts I&apos;m writing, so this is perfect! Every
                      &quot;chat with PDF&quot;-application I tried before was
                      limited to small files or didn&apos;t support EPUBs.”
                    </p>
                  </blockquote>
                  <figcaption className="mt-6 flex gap-x-4 text-sm leading-6">
                    <Image
                      src="https://images.unsplash.com/photo-1625241152315-4a698f74ceb7?q=80&w=2980&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      alt="user avatar"
                      className="h-6 w-6 flex-none rounded-full"
                      width={24}
                      height={24}
                    />
                    <div>
                      <span className="font-semibold text-gray-900">
                        Maria Hill
                      </span>{' '}
                      – Substack Writer
                    </div>
                  </figcaption>
                </figure>
              </div>
            </div>
            <div className="sm:px-6 lg:px-0 mt-auto">
              <div className="mx-auto max-w-2xl sm:mx-0 sm:max-w-none">
                <DynamicVideoPlayer
                  src="/chatmode.webm"
                  width={1124}
                  height={720}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* feature */}

      <div className="overflow-hidden bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            <div className="lg:ml-auto lg:pl-4 lg:pt-4">
              <div className="lg:max-w-lg">
                <h2 className="text-base font-semibold leading-7 text-purple-600">
                  Find any <span className=" text-purple-600">quote</span> or{' '}
                  <span className=" text-purple-600">book section</span> in
                  seconds.
                </h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  A better search for book content
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Search through thousands of pages to find exactly what you
                  need.
                </p>
                <dl className="mt-8 max-w-xl space-y-8 text-lg leading-7 text-gray-600 lg:max-w-none">
                  {features.map((feature) => (
                    <div key={feature.name} className="relative pl-9">
                      <dt className="inline font-semibold text-gray-900">
                        <div
                          className="absolute left-1 top-1 h-5 w-5 text-purple-600"
                          aria-hidden="true"
                        >
                          {feature.emoji}
                        </div>
                        {feature.name}
                      </dt>{' '}
                      <dd className="inline">{feature.description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            <div className="flex items-center items-start justify-end lg:order-first">
              <Image
                src="/dashboard.png"
                alt="dashboard"
                width={2432}
                height={1342}
                quality={80}
                className="rounded-md bg-white p-2 shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl py-4 px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-900 rounded-2xl">
          <div className="px-6 py-14 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Upload and search your first book
                <br />
                in a few clicks.
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
                We created a new way to search books to give you instant access
                to all your content. Chat with your books now!
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

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <PricingPlansUI />
      </div>
    </>
  )
}
