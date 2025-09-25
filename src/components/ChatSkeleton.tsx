interface ChatSkeletonProps {
  isCollapsed?: boolean
  isMobile?: boolean
  count?: number
}

export default function ChatSkeleton({ isCollapsed = false, isMobile = false, count = 3 }: ChatSkeletonProps) {
  if (isCollapsed) {
    // For collapsed desktop view, show icon-only skeletons
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="w-full p-2 rounded-lg flex justify-center animate-pulse"
          >
            <div className="w-5 h-5 bg-gray-300 rounded"></div>
          </div>
        ))}
      </>
    )
  }

  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className={`flex items-center justify-between p-3 rounded-lg ${isMobile ? "" : ""}`}>
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {isMobile && (
                <div className="w-4 h-4 bg-gray-300 rounded flex-shrink-0"></div>
              )}
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div className="flex-1 min-w-0 w-full">


                  <div className="h-4 bg-gray-300 rounded mb-1 w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}