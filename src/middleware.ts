import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { shouldUseMockAuth } from "@/lib/dev-config"

export async function middleware(request: NextRequest) {
  // If using mock auth, bypass all middleware checks
  if (shouldUseMockAuth()) {
    console.log('[MIDDLEWARE MOCK] Bypassing auth check for:', request.nextUrl.pathname)
    return NextResponse.next()
  }

  // Otherwise, use real NextAuth middleware
  console.log('[MIDDLEWARE REAL] Using NextAuth middleware for:', request.nextUrl.pathname)
  
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  const isLoggedIn = !!token
  const isOnChat = request.nextUrl.pathname.startsWith('/chat')
  const isOnSettings = request.nextUrl.pathname.startsWith('/settings')
  const isOnResourceManagement = request.nextUrl.pathname.startsWith('/resource-management')
  const isOnAuth = request.nextUrl.pathname.startsWith('/auth')
  const isOnRoot = request.nextUrl.pathname === '/'
  
  // Protected paths that require authentication
  const protectedPaths = isOnChat || isOnSettings || isOnResourceManagement
  
  if (protectedPaths) {
    if (isLoggedIn) return NextResponse.next()
    // Redirect unauthenticated users to login page
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  } else if (isLoggedIn && (isOnAuth || isOnRoot)) {
    return NextResponse.redirect(new URL('/chat', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
