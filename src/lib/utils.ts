import { clsx, type ClassValue } from 'clsx'
import { Metadata } from 'next'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  let url
  path = path.startsWith('/') ? path.slice(1) : path
  if (typeof window !== 'undefined') url = path
  else if (process.env.VERCEL_URL)
    url = `https://${process.env.VERCEL_URL}/${path}`
  else url = `http://localhost:${process.env.PORT ?? 3000}/${path}`

  console.log('absoluteUrl url', url)
  return url
}

export function constructMetadata({
  title = 'AI Quote Finder - Semantic search for all your books',
  description = 'Search any text part across many of the best books in the world.',
  image = '/thumbnail.png',
  icons = '/favicon.ico',
  noIndex = false,
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@moritzw42',
    },
    icons,
    metadataBase: new URL('https://ai-quote-finder.vercel.app/'),
    // themeColor: '#FFF',
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  }
}
