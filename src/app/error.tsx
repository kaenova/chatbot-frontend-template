'use client'

import Logo from "@/components/Logo"
import { getSiteConfig } from "@/lib/site-config"

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  const siteConfig = getSiteConfig()

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto">
            <Logo className="justify-center" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold" style={{ color: 'var(--primary)' }}>
            Something went wrong
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We encountered an error. Please try again.
          </p>
        </div>

        <div>
          <button
            onClick={() => reset()}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}