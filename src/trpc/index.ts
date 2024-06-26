import { utapi } from '@/app/api/uploadthing/core'
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query'
import { proPlan } from '@/config/stripe'
import { db } from '@/db'
import { pinecone } from '@/lib/pinecone'
import { getUserSubscriptionPlan, stripe } from '@/lib/stripe'
import { absoluteUrl } from '@/lib/utils'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { UploadStatus } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { privateProcedure, publicProcedure, router } from './trpc'

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user?.id || !user.email) throw new TRPCError({ code: 'UNAUTHORIZED' })

    // check if the user is in the database
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    })

    if (!dbUser) {
      // create user in db
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      })
    }

    return { success: true }
  }),

  createStripeSession: privateProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx

    const billingUrl = absoluteUrl('/dashboard/billing')

    if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' })

    const dbUser = await db.user.findFirst({
      where: {
        id: userId,
      },
    })

    if (!dbUser) throw new TRPCError({ code: 'UNAUTHORIZED' })

    const subscriptionPlan = await getUserSubscriptionPlan()

    // already subscribed
    if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: billingUrl,
      })

      console.log('in already subscribed')

      console.log('billingUrl', billingUrl)
      console.log('stripeSession url', stripeSession.url)

      return { url: stripeSession.url }
    }

    // not subscribed
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'auto',
      line_items: [
        {
          price:
            process.env.NODE_ENV === 'production'
              ? proPlan.price.priceIds.production
              : proPlan.price.priceIds.test,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
      },
    })

    // console.log(
    //   'creating session for this priceId',
    //   process.env.NODE_ENV === 'production'
    //     ? proPlan.price.priceIds.production
    //     : proPlan.price.priceIds.test,
    // )

    return { url: stripeSession.url }
  }),

  // user settings
  getUserPrivateUploadPreference: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx
    const user = await db.user.findFirst({
      where: {
        id: userId,
      },
    })

    if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' })

    return user.prefersPrivateUpload
  }),
  updateUserPrivateUploadPreference: privateProcedure
    .input(
      z.object({
        prefersPrivateUpload: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' })

      const updatedUser = await db.user.update({
        where: {
          id: userId,
        },
        data: {
          prefersPrivateUpload: input.prefersPrivateUpload,
        },
      })

      return { success: true }
    }),

  // file management
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx

    return await db.file.findMany({
      where: {
        OR: [
          {
            userId: userId,
          },
          {
            AND: [
              {
                userId: {
                  not: userId,
                },
              },
              {
                private: false,
              },
            ],
          },
        ],
      },
      include: {
        messages: {
          where: {
            userId: userId,
          },
          select: {
            id: true,
          },
        },
      },
    })
  }),
  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx
      const { fileId, cursor } = input
      const limit = input.limit ?? INFINITE_QUERY_LIMIT

      const file = await db.file.findFirst({
        where: {
          id: fileId,
          AND: [
            {
              OR: [
                { userId }, // User is the owner of the file
                { private: false }, // File is not private
              ],
            },
          ],
        },
        select: {
          url: true,
        },
      })

      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

      const messages = await db.message.findMany({
        take: limit + 1,
        where: {
          fileId,
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          isUserMessage: true,
          createdAt: true,
          text: true,
          quoteMode: true,
          isFromEpubWithHref: file.url.endsWith('.epub'),
        },
      })

      // determine next cursor
      let nextCursor: typeof cursor | undefined = undefined
      if (messages.length > limit) {
        const nextItem = messages.pop()
        nextCursor = nextItem?.id
      }

      return {
        messages,
        nextCursor,
      }
    }),
  deleteMessage: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      const message = await db.message.findFirst({
        where: {
          id: input.id,
          userId,
        },
      })

      if (!message) throw new TRPCError({ code: 'NOT_FOUND' })

      await db.message.delete({
        where: {
          id: input.id,
        },
      })

      return message
    }),
  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      })

      if (!file) {
        return {
          status: UploadStatus.PENDING,
          fileUrl: null,
        }
      }

      return {
        status: file.uploadStatus,
        fileUrl: file.url,
      }
    }),
  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId,
        },
      })

      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

      return file
    }),
  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      })

      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

      // Delete from Pinecone
      const index = pinecone.Index('ai-quote-finder')
      // get all namespaces
      const indexStats = await index.describeIndexStats()

      if (
        indexStats.namespaces &&
        indexStats.namespaces.hasOwnProperty(file.id)
      ) {
        await index.namespace(file.id).deleteAll()
      }

      // Delete from UploadThing
      await utapi.deleteFiles(file.key)

      // Delete from sql db
      await db.file.delete({
        where: {
          id: input.id,
        },
      })
      // Delete associated messages
      await db.message.deleteMany({
        where: {
          fileId: input.id,
        },
      })

      return file
    }),
  updateFileName: privateProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      })

      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

      const updatedFile = await db.file.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
      })

      return updatedFile
    }),
  makeFilePublic: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      })

      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

      const updatedFile = await db.file.update({
        where: {
          id: input.id,
        },
        data: {
          private: false,
        },
      })

      return updatedFile
    }),
})

export type AppRouter = typeof appRouter
