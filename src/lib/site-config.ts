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
  chat: {
    greeting: {
      morning: string
      afternoon: string
      evening: string
    }
    welcomeMessage: string
    recommendationQuestions: string[]
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
  },
  chat: {
    greeting: {
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening"
    },
    welcomeMessage: "I'm your AI assistant. Start a conversation by typing a message below or try one of these suggestions:",
    recommendationQuestions: [
      "What are the latest trends in web development?",
      "Help me write a professional email",
      "Explain quantum computing in simple terms",
      "Give me a recipe for chocolate chip cookies",
      "How do I improve my productivity?",
      "What's the difference between React and Vue?",
      "Help me plan a weekend trip",
      "Explain machine learning basics"
    ]
  }
}

// Function to get the site configuration
export function getSiteConfig(): SiteConfig {
  return siteConfig
}