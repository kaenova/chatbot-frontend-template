import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeBlockProps {
  children: string
  className?: string
  language?: string
}

export default function CodeBlock({ children, className, language }: CodeBlockProps) {
  // Extract language from className (e.g., "language-javascript" -> "javascript")
  const detectedLanguage = language || (className?.startsWith('language-') ? className.replace('language-', '') : 'text')

  return (
    <div className="relative group">
      <SyntaxHighlighter
        language={detectedLanguage}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          lineHeight: '1.5',
        }}
        showLineNumbers={true}
        wrapLines={true}
        wrapLongLines={true}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  )
}

// Inline code component
export function InlineCode({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <code className={`px-1.5 py-0.5 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded text-sm font-mono ${className || ''}`}>
      {children}
    </code>
  )
}