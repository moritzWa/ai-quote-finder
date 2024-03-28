Note: I mostly stopped working on this project after learning about Google's [NotebookLM](https://blog.google/technology/ai/notebooklm-google-ai/).

Quick demo
![showcase](https://github.com/moritzWa/ai-quote-finder/blob/main/public/demo-short.gif)

Full demo
![showcase](https://github.com/moritzWa/ai-quote-finder/blob/main/public/full-demo.gif)

## Main Features

- Upload PDFs as private or shared
- Semantic search over book content

## Other Features

- Free & Pro Plan Using Stripe
- Streaming API Responses in Real-Time
- Authentication Using Kinde
- UI Using 'shadcn-ui'
- Optimistic UI Updates
- Infinite Message Loading for Performance
- Drag n' Drop Uploads

## Technologies

- Pinecone as our Vector Storage
- LangChain
- 100% written in TypeScript
- Prisma as our ORM
- Data Fetching Using tRPC & Zod

## Next task

- enable search across all selected PDFs
- switch between normal chat msg and quote retraival

## Scripts

First, run the development server:

```bash
npm run dev
```

Run the Prisma Client:

```bash
npx prisma studio
```

Update prisma schema:

```bash
npx prisma db push
```

Generate prisma schema types:

```bash
npx prisma generate
```
