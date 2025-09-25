import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {

  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  const isLoggedIn = !!token
  const isOnChat = request.nextUrl.pathname.startsWith('/chat')
  const isOnSettings = request.nextUrl.pathname.startsWith('/settings')
  const isOnResourceManagement = request.nextUrl.pathname.startsWith('/resource-management')
  const isOnAuth = request.nextUrl.pathname.startsWith('/auth')
  const isOnSignout = request.nextUrl.pathname === '/auth/signout'
  const isOnRoot = request.nextUrl.pathname === '/'
  
  // Protected paths that require authentication
  const protectedPaths = isOnChat || isOnSettings || isOnResourceManagement
  
  if (protectedPaths) {
    if (isLoggedIn) return NextResponse.next()
    // Redirect unauthenticated users to login page with callback URL
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
    return NextResponse.redirect(signInUrl)
  } else if (isLoggedIn && (isOnAuth || isOnRoot)) {
    // Allow access to signout page even when logged in
    if (isOnSignout) return NextResponse.next()
    // Redirect other auth pages and root when logged in
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
