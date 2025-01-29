import React, { useRef, useEffect } from 'react'
import { ConversationEntry } from './types'
import { ResponseContent } from './ResponseContent'
import { CircleUserRound } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { useFlow } from '@/contexts/FlowContext'

interface ChatConversationProps {
  onSend: (message: string) => void
  conversation: ConversationEntry[]
  isLoading: boolean
}

export const ChatConversation: React.FC<ChatConversationProps> = ({
  conversation,
  isLoading,
  onSend
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { aiMissingData } = useFlow()

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight
    }
  }, [conversation])
console.log("conversation", conversation);
  return (
    <div
      ref={scrollContainerRef}
      className="
        flex-grow
        overflow-auto
        px-4
        py-6
        space-y-3
        bg-gray-20
        scrollbar-thin
        scrollbar-thumb-gray-300
        scrollbar-track-transparent
        scroll-container
      "
    >
      {conversation.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <p className="text-gray-500 text-center">
            Start a conversation by asking a question.
          </p>
          {isLoading && <Spinner className="w-8 h-8" />}
        </div>
      ) : (
        conversation.map((entry) => (
          <div key={entry.id} className="space-y-3">
            {/* User question (left-aligned) */}
            <div className="flex w-full justify-start">
              <div className="flex items-end gap-2 max-w-[80%]">
                <CircleUserRound className="text-gray-600 w-6 h-6 flex-shrink-0 mb-1" />
                <div className="bg-gray-200 text-black px-4 py-2 rounded-2xl rounded-br-none shadow-sm">
                  {entry.question}
                </div>
              </div>
            </div>

            {/* Assistant response (right-aligned) */}
            {entry.response === null ? (
              <div className="flex w-full justify-end">
                <div className="flex gap-2 items-end max-w-[80%]">
                  <img
                    src="/assets/ai/ai.png"
                    alt="Assistant"
                    className="w-6 h-6 flex-shrink-0 mb-1"
                  />
                  <div className="bg-white p-2 rounded-2xl rounded-bl-none shadow-sm">
                    <Spinner className="w-6 h-6" showLoadingTxt={false} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex w-full justify-end">
                <div className="flex gap-2 items-start max-w-[75%]">
                  <ResponseContent
                    onSend={onSend}
                    sender="assistant"
                    response={entry.response}
                    missing={entry.missing}
                    aimissingData={aiMissingData}
                    id={entry.id}
                  />
                  <img
                    src="/assets/ai/ai.png"
                    alt="Assistant"
                    className="w-6 h-6 flex-shrink-0 mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
