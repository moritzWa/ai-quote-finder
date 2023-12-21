type PlanMaxFileSizes = '4MB' | '8GB'

export const freePlan = {
  name: 'Free',
  slug: 'free',
  quota: 10,
  pagesPerPdf: 5,
  mostPopular: false,
  description: 'Try it out!',
  maxFileSize: '4MB' as PlanMaxFileSizes,
  href: 'tbd',
  price: {
    amount: 0,
    priceIds: {
      test: '',
      production: '',
    },
  },
  features: ['limited to 2 files', 'limited to 5 pages per file'],
}

export const proPlan = {
  name: 'Pro',
  slug: 'pro',
  quota: 10,
  pagesPerPdf: 500,
  maxFileSize: '8GB' as PlanMaxFileSizes,
  mostPopular: true,
  description: 'Unlimited power of retrieving info from your books and files',
  href: 'tbd',
  price: {
    amount: 19,
    priceIds: {
      test:
        process.env.NODE_ENV === 'production'
          ? 'price_1OPInQBhihWWQNODiTNAiZW3'
          : 'price_1OPYlOBhihWWQNODCIQyefvR',
      production: '',
    },
  },
  features: ['up to 40 files', 'up to 500 pages per file'],
}

export const PLANS = [freePlan, proPlan]
