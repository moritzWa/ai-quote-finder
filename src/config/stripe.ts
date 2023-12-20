export const PLANS = [
  {
    name: 'Free',
    slug: 'free',
    quota: 10,
    pagesPerPdf: 5,
    mostPopular: false,
    description: 'Try it out!',
    href: 'tbd',
    price: {
      amount: 0,
      priceIds: {
        test: '',
        production: '',
      },
    },
    features: ['limited to 2 files', 'limited to 5 pages per file'],
  },
  {
    name: 'Pro',
    slug: 'pro',
    quota: 10,
    pagesPerPdf: 500,
    mostPopular: true,
    descripiton: 'Unlimited power of retrieving info from your books and files',
    href: 'tbd',
    price: {
      amount: 19,
      priceIds: {
        test: 'price_1OPInQBhihWWQNODiTNAiZW3',
        production: '',
      },
    },
    features: ['up to 40 files', 'up to 500 pages per file'],
  },
]
