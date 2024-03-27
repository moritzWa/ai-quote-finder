import { buttonVariants } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

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
                    pre-selected collection of excellect non-fiction books.
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
                className="absolute inset-y-0 right-1/2 -z-10 -mr-10 w-[200%] skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 md:-mr-20 lg:-mr-36"
                aria-hidden="true"
              />
              <div className="shadow-lg md:rounded-3xl inline-block mx-auto p-0">
                <Image
                  src="/demo-short.gif"
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
    </>
  )
}
