import { db } from '@/db'
import { getUserSubscriptionPlan } from '@/lib/stripe'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

export const middleware = async () => {
  const { getUser } = getKindeServerSession()
  const user = getUser()

  if (!user || !user.id) throw new Error('Unauthorized')

  const subscriptionPlan = await getUserSubscriptionPlan()

  // search user in db

  const dbUserSelection = await db.user.findFirst({
    where: {
      id: user.id,
    },
    select: {
      prefersPrivateUpload: true,
    },
  })

  if (!dbUserSelection) throw new Error('Unauthorized')

  // Whatever is returned here is accessible in onUploadComplete as `metadata`
  return {
    subscriptionPlan,
    userId: user.id,
    userPrefersPrivateUpload: dbUserSelection.prefersPrivateUpload,
  }
}
