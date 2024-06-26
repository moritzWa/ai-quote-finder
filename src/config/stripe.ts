type PlanMaxFileSizes = '4MB' | '16MB'

export const freePlan = {
  name: 'Free',
  slug: 'free',
  description: 'Try it out!',
  mostPopular: false,
  price: {
    amount: 0,
    priceIds: {
      test: '',
      production: '',
    },
  },

  quota: 0,
  pagesPerPdf: 420,
  maxFileSize: '4MB' as PlanMaxFileSizes,
  maxMesages: 25,
  maxMessagesPerDay: 5,
  features: [
    'unlimited file uploads',
    '4MB upload limit',
    'limited to 420 pages per file',
  ],
}

export const proPlan = {
  name: 'Pro',
  slug: 'pro',
  description: 'Unlimited knowledge retriaval from books and files',
  mostPopular: true,
  price: {
    amount: 19,
    priceIds: {
      test: 'price_1P4VTmBhihWWQNODB3Eiz9vz',
      production: 'price_1P4VR3BhihWWQNODfzzCbQ42',
    },
  },

  quota: 9.95,
  pagesPerPdf: 1200,
  maxFileSize: '16MB' as PlanMaxFileSizes,
  features: [
    'unlimited messages and files',
    'up to 16MB file size',
    'up to 1200 pages per file',
  ],
}

export const PLANS = [freePlan, proPlan]
