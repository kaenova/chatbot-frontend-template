interface ChatMessageSkeletonProps {
  count?: number
}

export function ChatMessageSkeleton({ count = 2 }: ChatMessageSkeletonProps) {
  return (
    <div className="mx-auto w-full max-w-[var(--thread-max-width)] space-y-6 px-2 py-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          {/* User Message Skeleton */}
          <div className="flex w-full justify-end gap-y-2 px-2 py-4">
            <div className="rounded-3xl bg-primary/10 px-5 py-2.5 w-1/3">
            </div>
          </div>

          {/* Assistant Message Skeleton */}
          <div className="mb-6">
            <div className="mx-2 space-y-3">
              <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded-md w-full"></div>
              <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded-md w-2/3"></div>
            </div>
            <div className="mt-2 ml-2 flex gap-2">
              <div className="h-6 w-6 bg-gray-200 rounded"></div>
              <div className="h-6 w-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}