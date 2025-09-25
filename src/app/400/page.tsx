'use client'

import { useRouter } from "next/navigation"
import Logo from "@/components/Logo"
import { getSiteConfig } from "@/lib/site-config"

export default function BadRequest() {
  const router = useRouter()
  const siteConfig = getSiteConfig()

  const handleGoHome = () => {
    router.push('/')
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto">
            <Logo className="justify-center" />
          </div>
          <div className="mt-6 text-center">
            <h1 className="text-9xl font-bold" style={{ color: 'var(--primary)' }}>
              400
            </h1>
            <h2 className="mt-4 text-3xl font-extrabold" style={{ color: 'var(--primary)' }}>
              Bad Request
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              The request you made was invalid or malformed.
              <br />
              <span className="text-xs text-gray-500 mt-1 block">
                Please check your request and try again.
              </span>
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={handleGoHome}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Home
          </button>

          <button
            onClick={handleGoBack}
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)'
            }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Go Back
          </button>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-500" style={{ backgroundColor: 'var(--background)' }}>
                Error Code: 400
              </span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-400">
            {siteConfig.title} • Bad Request Error
          </p>
        </div>
      </div>
    </div>
  )
}