import React, { useRef, useEffect } from 'react'
import { ConversationEntry } from './types'
import { ResponseContent } from './ResponseContent'
import { CircleUserRound } from 'lucide-react'

interface ChatConversationProps {
  conversation: ConversationEntry[]
  isLoading: boolean
}

export const ChatConversation: React.FC<ChatConversationProps> = ({ conversation, isLoading }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [conversation])

  return (
    <div
      ref={scrollContainerRef}
      className="flex-grow overflow-auto px-6 pt-8 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
    >
      {conversation.length === 0 ? (
        <p className="text-gray-500 text-center mt-4">
          Start a conversation by asking a question.
        </p>
      ) : (
        conversation.map((entry) => (
          <div key={entry.id} className="space-y-2">
            <div className="flex items-start gap-4">
              <CircleUserRound className="text-gray-700 flex-shrink-0" />
              <div className="flex-1 bg-gray-50 p-4 rounded-lg shadow-sm">
                {entry.question}
              </div>
            </div>
            {entry.response === null ? (
              <div className="flex items-center gap-2 pl-3 text-gray-400">
                <div className="animate-pulse">Loading...</div>
              </div>
            ) : (
              <div className="ml-10 bg-purple-50 p-4 rounded-lg shadow-sm">
                <ResponseContent response={entry.response} id={entry.id} />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

