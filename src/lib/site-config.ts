// Site configuration settings
export interface SiteConfig {
  name: string
  title: string
  description: string
  logo: {
    src: string // Image path or URL
    alt: string
    width?: number
    height?: number
  }
}

// Default configuration - Customize these values to change your site branding
export const siteConfig: SiteConfig = {
  name: "ChatGPT Clone",
  title: "ChatGPT Clone",
  description: "A ChatGPT-like interface built with Next.js and NextAuth",
  logo: {
    src: "https://logodix.com/logo/2013589.png", // Change this to your logo path
    alt: "ChatGPT Clone Logo",
    width: 118,
    height: 24
  }
}

// Function to get the site configuration
export function getSiteConfig(): SiteConfig {
  return siteConfig
}