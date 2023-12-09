import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation'

const Page = async () => {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user) return redirect('/auth-callback?origin=dashboard')

  return <div>{user.email}</div>
}
export default Page
