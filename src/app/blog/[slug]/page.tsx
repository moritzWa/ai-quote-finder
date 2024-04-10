import { ArrowLeft } from 'lucide-react'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import React from 'react'

export const metadata: Metadata = {
  title: 'I Quote Finder Blog',
  description:
    'The AI Quote Finder Blog discusses the latest news and trends in AI and books.',
}

export async function generateStaticParams() {
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default function Page({ params }: { params: { slug: string } }) {
  const post = posts.find((post) => post.slug === params.slug)

  if (!post) {
    return (
      <div className="h-full w-full flex justify-center py-10">
        Post not found. Go back to{' '}
        <a className="text-blue-500" href="/blog">
          blog
        </a>
      </div>
    )
  }

  return (
    <div className="bg-white px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
        <a
          href={'/blog'}
          className="text-lg hover:text-gray-200 mb-10 flex flex-row gap-2 font-semibold leading-6 text-gray-700"
        >
          <ArrowLeft /> Blog home
        </a>
        <p className="text-base font-semibold leading-7 text-purple-600">
          {post.description}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {post.title}
        </h1>
        <div className="blog mt-6 text-sm leading-normal">{post.content}</div>
      </div>
    </div>
  )
}

type PostType = {
  id: number
  title: string
  slug: string
  description: string
  date: string
  datetime: string
  content: React.ReactNode
}

const DynamicVideoPlayer = dynamic(() => import('@/components/VideoPlayer'), {
  ssr: false,
})

export const posts: PostType[] = [
  {
    id: 1,
    title: 'The best apps to chat with your Books',
    slug: 'the-best-apps-to-chat-with-your-books',
    description:
      'Comparing 7 apps lat let you chat with your books and search for content in them semantically.',
    date: 'April 4, 2024',
    datetime: '2024-04-08',
    content: (
      <>
        <p>
          There are several apps that use AI to help you interact with your
          books. Two major use-cases are asking questions to your book to
          understand it&apos;s content better and finding quotes or sections
          within a book. In this blog post we compare 7 of them. Other criteria
          we will examine are the number of file types the applications supports
          and it&apos;s subsciption price.
        </p>

        <h2>AI Quote Finder</h2>
        <p>
          <a href="/" className="text-blue-500">
            AI Quote Finder
          </a>{' '}
          is a web app that uses AI to help you to find specific parts of your
          favorite books in seconds. You can also use it to understand books
          with the AI chat feature. It supports EPUB and PDF files.
        </p>
        <p>
          With a generoun free plan and only $10 for unlimited access it the
          cheapest option while solving for all major use cases.
        </p>

        <DynamicVideoPlayer
          src="/quote-finder.webm"
          className="pt-4 w-[600px]"
          width={600}
          height={600}
        />

        <h2>Book GPT</h2>
        <p>
          <a
            href="https://book-gpt.fraserxu.dev/"
            className="text-blue-500"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book GPT
          </a>{' '}
          allows you to chat with your books. It&apos;s completely open source
          but requires you to sign up to several other services to get an API
          key to use it. It also doesn&apos;t support EPUB files.
        </p>
        <Image src="/bookGPT.png" alt="Book GPT" width={700} height={1000} />
        <h2>Colab Notebook</h2>
        <p>
          Google Colab is a product by Google that let&apos;s you run python
          scripts and gives you access to a certain amount of free computing
          power and storage. People have created{' '}
          <a
            href="https://colab.research.google.com/drive/1PDT-jho3Y8TBrktkFVWFAPlc7PaYvlUG?usp=sharing"
            className="text-blue-500"
            target="_blank"
            rel="noopener noreferrer"
          >
            scripts
          </a>{' '}
          to embedd books and make them searchable. The problems with this
          solution are that 1. the file is not stored. After you close the tab
          the file is deleted. 2. Each time you want to run the script you have
          to manually trigger the execution of each sub-process (run each cell
          of the notebook) which takes a lot of time. Besides these points it
          also seems to be broken right now.
        </p>
        <Image
          src="/ColabNotebook.png"
          alt="Colab Notebook"
          width={500}
          height={1000}
        />
        {/* some sentences about https://lightpdf.com/  */}
        <h2>LightPDF</h2>
        <p>
          <a>LightPDF</a> analyzes PDFs and allows you to search for keywords.
          It&apos;s downside is that on the free plan you can only
          &quot;analyze&quot; PDFs and only documents up to 100 pages. The paid
          plan is $29.99 per month.
        </p>
        <Image src="/lightpdf.png" alt="open ai" width={500} height={1000} />
        <h2>Colab Notebook</h2>
        <p>
          If you pay $20 per month you can get access to ChatGPTs file upload
          feature. Open AI states that ChatGPT&apos; supports &quot;All common
          file extensions for text files, spreadsheets, presentations, and
          documents&quot;. When uploading EPUBs it seems to try to use the code
          interpreter to write a script to extrac the text from the EPUB but
          fails miserably.
        </p>
        <Image src="/open-ai.png" alt="open ai" width={700} height={1000} />
        <h2>ChatGPT</h2>
        <p>
          We also tried uploading the PDF of the book &quot;Zero to One&quot; by
          Peter Thiel but ChatGPT failed to find any information about our
          search query (how human intelligence compares to machine intelligence)
          even though Thiel wrote an entire chapter on that topic (Chapter 12
          &quot;Man and Machine&quot;). Once we told it about this chapter it
          still failed to link to the section.
        </p>
        <Image
          src="/open-ai-extracting-chapter-id.png"
          alt="open ai"
          width={700}
          height={1000}
        />
        <p>
          Trying this again it seems to have found a source but clicking on the
          source link just downloas the original PDF instead of linking to a
          specific section.
        </p>
        <Image
          src="/link-to-quote-openai.gif"
          alt="open ai"
          width={700}
          height={1000}
        />
      </>
    ),
  },
  // More posts...
]
