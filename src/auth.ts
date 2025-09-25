import NextAuth, { NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
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
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account && user) {
        token.accessToken = account.access_token
        token.userId = user.id
        token.provider = account.provider
      }
      
      // Add custom fields to JWT
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
      }
      
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.userId as string || token.id as string
        if (token.email) session.user.email = token.email as string
        if (token.name) session.user.name = token.name as string
        if (token.image) session.user.image = token.image as string
        // Custom session properties handled by our extended types
        session.accessToken = token.accessToken as string
        session.provider = token.provider as string
      }
      
      return session
    },
    async redirect({ url, baseUrl }) {
      // Handle callback URL after successful authentication
      const parsedUrl = new URL(url, baseUrl)
      const next = parsedUrl.searchParams.get('next')
      
      // If there's a next parameter and it's a relative path on the same domain
      if (next && next.startsWith('/') && !next.startsWith('//')) {
        return `${baseUrl}${next}`
      }
      
      // If the URL is on the same domain, allow it
      if (parsedUrl.origin === baseUrl) {
        return url
      }
      
      // Default redirect to chat page
      return `${baseUrl}/chat`
    },
  },
}

export default NextAuth(authOptions)

// Helper function to get session server-side
export const getAuthSession = () => getServerSession(authOptions)
