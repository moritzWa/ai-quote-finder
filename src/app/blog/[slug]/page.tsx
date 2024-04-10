import CTASection from '@/components/CTASection'
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
        {/* <p className="text-base font-semibold leading-7 text-purple-600">
          {post.category}
        </p> */}
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-2 text-lg leading-8 text-gray-600">
          {post.description}
        </p>

        <div className="blog mt-6 text-md text-gray-950 leading-normal">
          {post.content}
        </div>
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
    title: 'The 7 Best Apps to Chat With Your Books',
    slug: 'the-best-apps-to-chat-with-your-books',
    description:
      'Comparing the best apps to chat with your books and search for content in them semantically.',
    date: 'April 4, 2024',
    datetime: '2024-04-08',
    content: (
      <>
        <p>
          Imagine engaging in a conversation with the author of your favorite
          non-fiction book, or effortlessly returning to the most intriguing
          sections without having made any highlights or bookmarks. With the
          advent of AI, this is not as far-fetched as it sounds.
        </p>
        <p>
          There are several apps that use AI to help you interact with your
          books. The primary uses include querying your book for a deeper
          understanding of its content and effortlessly locating specific quotes
          or sections.
        </p>
        <p>
          In this blog post we compare 6 of them. We&apos;ll also evaluate them
          based on the diversity of file types supported and the affordability
          of their subscription models.
        </p>

        <h2>AI Quote Finder</h2>
        <p>
          <a href="/" className="text-blue-500">
            AI Quote Finder
          </a>{' '}
          is a web app that uses AI to help you to find specific parts of your
          favorite books in seconds. You can also use it to understand books
          with the AI chat feature. It supports EPUB and PDF files. This
          flexibility ensures that whether you&apos;re a fan of EPUB or PDF
          formats, your entire library remains accessible.
        </p>
        <p>
          With a generous free plan and only $10 for unlimited access, it is the
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
          Google Colab is a product by Google that lets you run Python scripts
          and gives you access to a certain amount of free computing power and
          storage. People have created{' '}
          <a
            href="https://colab.research.google.com/drive/1PDT-jho3Y8TBrktkFVWFAPlc7PaYvlUG?usp=sharing"
            className="text-blue-500"
            target="_blank"
            rel="noopener noreferrer"
          >
            scripts
          </a>{' '}
          to embed books and make them searchable. The problems with this
          solution are that: 1. the file is not stored. After you close the tab
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
          Its downside is that on the free plan you can only &quot;analyze&quot;
          PDFs and only documents up to 100 pages. The paid plan is $29.99 per
          month.
        </p>
        <Image src="/lightpdf.png" alt="open ai" width={500} height={1000} />
        <h2>ChatGPT</h2>
        <p>
          If you pay $20 per month you can get access to ChatGPT&apos;s file
          upload feature. Open AI states that ChatGPT&apos;s supports &quot;All
          common file extensions for text files, spreadsheets, presentations,
          and documents&quot;. When uploading EPUBs it seems to try to use the
          code interpreter to write a script to extract the text from the EPUB
          but fails miserably.
        </p>
        <Image src="/open-ai.png" alt="open ai" width={700} height={1000} />
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
          source link just downloads the original PDF instead of linking to a
          specific section.
        </p>
        <Image
          src="/link-to-quote-openai.gif"
          alt="open ai"
          width={700}
          height={1000}
        />
        <h2>Conclusion</h2>
        <p>
          In concluding our journey through innovative apps that enhance our
          interaction with books, it&apos;s evident that AI has transformed how
          we engage with literature. Among the impressive options, AI Quote
          Finder shines as the superior choice. Its affordability and broad file
          format support make it accessible and practical for a wide audience.
          Notably, its advanced semantic search capability allows users to dive
          deep into their favorite texts, uncovering insights and finding
          passages with ease.
        </p>
        <p>
          AI Quote Finder stands out by not only making literature more
          accessible but also by enriching our reading experience through
          intelligent, nuanced conversations with our books. In this new era of
          literary exploration, AI Quote Finder is a beacon for avid readers
          seeking a deeper connection with their reading material.
        </p>
        <CTASection className="mt-10" />
      </>
    ),
  },
  // More posts...
]
