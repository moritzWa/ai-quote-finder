import { buttonVariants } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { PricingPlansUI } from './pricing/page'

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
]

export default function Home() {
  return (
    <>
      <div className="bg-white">
        <div className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20">
          <div className="mx-auto max-w-7xl pb-24 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-32">
            <div className="px-6 lg:px-0 lg:pt-4">
              <div className="mx-auto max-w-2xl">
                <div className="max-w-lg">
                  <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                    Find any <span className=" text-purple-600">quote</span> or{' '}
                    <span className=" text-purple-600">book section</span> in
                    seconds.
                  </h1>
                  <p className="mt-6 text-lg leading-8 text-gray-600">
                    Quote Finder allows you to find the best parts of your
                    favorite books. Upload your books or find sections in a
                    pre-selected collection of excellent non-fiction books.
                  </p>
                  <div className="mt-5 flex items-center just gap-x-6">
                    <Link
                      className={buttonVariants({
                        size: 'lg',
                        className: 'mt-5',
                      })}
                      href="/dashboard"
                    >
                      Get started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-20 sm:mt-24 md:mx-auto md:max-w-2xl lg:mx-0 lg:mt-0 lg:w-screen">
              <div
                className="absolute inset-y-0 right-1/2 -z-10 -mr-10 w-[200%] skew-x-[-30deg] bg-white shadow-xl shadow-purple-600/10 ring-1 ring-purple-50 md:-mr-20 lg:-mr-36"
                aria-hidden="true"
              />
              <div className="shadow-lg md:rounded-3xl inline-block mx-auto p-0">
                <Image
                  src="/quote-finder.gif"
                  alt="demo gif"
                  height={500}
                  width={643}
                  className="h-full w-full rounded-lg object-cover md:h-[500px] md:w-[643px] lg:h-[500px] lg:w-[643px]"
                />
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-white sm:h-32" />
        </div>
      </div>

      {/* feature */}

      <div className="overflow-hidden bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            <div className="lg:ml-auto lg:pl-4 lg:pt-4">
              <div className="lg:max-w-lg">
                <h2 className="text-base font-semibold leading-7 text-purple-600">
                  Semantic search for all your books
                </h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  A better search for book content
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Search through thousands of pages to find exactly what you
                  need.
                </p>
                <dl className="mt-10 max-w-xl space-y-8 text-lg leading-7 text-gray-600 lg:max-w-none">
                  {features.map((feature) => (
                    <div key={feature.name} className="relative">
                      <dt className="inline font-semibold text-gray-900">
                        <div className="flex items-center gap-3">
                          <div>{feature.emoji}</div>
                          {feature.name}
                        </div>
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
                className="rounded-md bg-white p-2 shadow-2xl ring-1 ring-gray-900/10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-900 rounded-2xl">
          <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Semantic Search for all your books.
                <br />
                Start uploading your books now.
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
                We created a new way to search books to give you instant access
                to all your content.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a
                  href="#"
                  className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Get started
                </a>
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
