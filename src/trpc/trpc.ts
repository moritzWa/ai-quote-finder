import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { TRPCError, initTRPC } from '@trpc/server'
/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create()

const middleware = t.middleware

// custom middleware
const isAuth = middleware(async (opts) => {
  const { getUser } = getKindeServerSession()
  const user = getUser()

  if (!user || !user.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  // the following `ctx` object will be
  // available in of all `privateProcedure`s
  return opts.next({
    ctx: {
      userId: user.id,
      user,
    },
  })
})

export const router = t.router
export const publicProcedure = t.procedure
export const privateProcedure = t.procedure.use(isAuth)
