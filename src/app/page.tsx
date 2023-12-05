import MaxWidthWrapper from './components/MaxWidthWrapper'

export default function Home() {
  return (
    <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
      <div className="mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50">
        <p className="text-sm font-semibold text-gray-700">
          Quote Finder is now public!
        </p>
      </div>
      <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
        find any <span className=" text-blue-600">Quote or Book Section</span>{' '}
        in seconds.
      </h1>
      <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
        Quote Finder allows you to find the best parts of your favorite books.
        Upload your books or find sections in a pre-selected collection of
        excellect non-fiction books.
      </p>
    </MaxWidthWrapper>
  )
}
