import { redirect } from "next/navigation"
import { getSessionOrMock } from "@/lib/mock-session"

export default async function Home() {
  const session = await getSessionOrMock()
  
  if (session?.user) {
    redirect('/chat')
  } else {
    redirect('/auth/signin')
  }
}
