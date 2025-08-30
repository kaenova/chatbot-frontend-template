'use client'

import React from 'react'
import ReactMarkdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CodeBlock, { InlineCode } from './CodeBlock'

interface MarkdownContentProps {
  content: string
  className?: string
}

export default function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  const components: Components = {
    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '')
      // Check if this is a code block (has language class and contains newlines)
      const isCodeBlock = match && String(children).includes('\n')

      return isCodeBlock ? (
        <CodeBlock
          language={match[1]}
          className={className}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </CodeBlock>
      ) : (
        <InlineCode className={className} {...props}>
          {children}
        </InlineCode>
      )
    },
    pre: ({ children }) => <>{children}</>
  }

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}