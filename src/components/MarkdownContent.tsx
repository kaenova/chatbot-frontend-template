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
    pre: ({ children }) => <>{children}</>,
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-t-lg overflow-hidden">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gray-50 dark:bg-gray-800 rounded-t-lg">
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700 rounded-b-lg">
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
        {children}
      </td>
    )
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