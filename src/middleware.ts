import { NextRequest, NextResponse } from "next/server"
import { shouldUseMockAuth } from "@/lib/dev-config"

export async function middleware(request: NextRequest) {
  // If using mock auth, bypass all middleware checks
  if (shouldUseMockAuth()) {
    console.log('[MIDDLEWARE MOCK] Bypassing auth check for:', request.nextUrl.pathname)
    return NextResponse.next()
  }

  // Otherwise, use real NextAuth middleware
  console.log('[MIDDLEWARE REAL] Using NextAuth middleware for:', request.nextUrl.pathname)
  const { auth } = await import("@/auth")
  // @ts-expect-error - NextAuth middleware typing issue
  return auth(request)
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
