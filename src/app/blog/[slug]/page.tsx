import { Metadata } from 'next'
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
    <div className="bg-white px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
        <p className="text-base font-semibold leading-7 text-purple-600">
          {post.description}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-6 text-xl leading-8">{post.content}</div>
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

export const posts: PostType[] = [
  {
    id: 1,
    title: 'The best apps to chat with your Books',
    slug: 'the-best-apps-to-chat-with-your-books',
    description: 'Comparing xyz',
    date: 'April 4, 2024',
    datetime: '2024-04-08',
    content: (
      <>
        Aliquet nec orci mattis amet quisque ullamcorper neque, nibh sem. At
        arcu, sit dui mi, nibh dui, diam eget aliquam. Quisque id at vitae
        feugiat egestas ac. Diam nulla orci at in viverra scelerisque eget.
        Eleifend egestas fringilla sapien.
        <br></br>
        <br></br>
        feugiat egestas ac. Diam nulla orci at in viverra scelerisque eget.
      </>
    ),
  },
  // More posts...
]
