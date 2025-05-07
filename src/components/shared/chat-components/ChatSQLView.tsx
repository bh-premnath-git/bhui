import React from 'react'

interface ChatSQLViewProps {
  sql: string
}

export function ChatSQLView({ sql }: ChatSQLViewProps) {
  return (
    <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
      {sql}
    </pre>
  )
} 