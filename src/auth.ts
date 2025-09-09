import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { NextAuthConfig } from "next-auth"

const config: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        // Mock user credentials
        if (credentials.username === "user" && credentials.password === "pass") {
          return {
            id: "mock-user-1",
            email: "user@example.com",
            name: "User",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
          }
        }

        // For demo purposes, also accept any email with password "password"
        // In a real app, you would validate against your database
        if (credentials.password === "password") {
          return {
            id: "1",
            email: credentials.username as string,
            name: (credentials.username as string).split("@")[0],
          }
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnChat = nextUrl.pathname.startsWith('/chat')
      
      if (isOnChat) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/chat', nextUrl))
      }
      return true
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)
