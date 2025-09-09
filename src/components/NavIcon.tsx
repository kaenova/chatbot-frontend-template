'use client'

interface NavIconProps {
  iconSvg: string
  className?: string
}

export default function NavIcon({ iconSvg, className = "w-4 h-4" }: NavIconProps) {
  return (
    <svg 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        d={iconSvg} 
      />
    </svg>
  )
}
