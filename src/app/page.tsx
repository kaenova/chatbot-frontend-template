import { getAuthSession } from "@/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await getAuthSession()
  
  if (session?.user) {
    redirect('/chat')
  } else {
    redirect('/auth/signin')
  }
}
