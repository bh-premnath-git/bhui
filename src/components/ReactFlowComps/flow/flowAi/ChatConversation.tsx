import React, { useRef, useEffect } from 'react'
import { ConversationEntry } from './types'
import { ResponseContent } from './ResponseContent'
import { CircleUserRound } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { useFlow } from '@/contexts/FlowContext'

interface ChatConversationProps {
  conversation: ConversationEntry[]
  isLoading: boolean
}

export const ChatConversation: React.FC<ChatConversationProps> = ({
  conversation,
  isLoading,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { aiMissingData } = useFlow()


  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight
    }
  }, [conversation])

  return (
    <div
      ref={scrollContainerRef}
      className="flex-grow overflow-auto px-4 py-6 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent bg-gray-50"
    >
      {conversation.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <p className="text-gray-500 text-center">
            Start a conversation by asking a question.
          </p>
          {isLoading && <Spinner className="w-8 h-8" />}
        </div>
      ) : (
        conversation.map((entry) => {
          console.log("entry>>", entry);
          return (
            <div key={entry.id} className="space-y-3">
              <div className="flex justify-end">
                <div className="flex items-end gap-2 max-w-[80%]">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl rounded-br-none shadow-sm">
                    {entry.question}
                  </div>
                  <CircleUserRound className="text-gray-600 w-6 h-6 flex-shrink-0 mb-1" />
                </div>
              </div>

              {entry.response === null ? (
                /* If the assistant has not responded yet, show a spinner */
                <div className="flex gap-2 items-end max-w-[80%]">
                  <img
                    src="/assets/buildPipeline/bighammer.png"
                    alt="Assistant"
                    className="w-6 h-6 flex-shrink-0 mb-1"
                  />
                  <div className="bg-white p-2 rounded-2xl rounded-bl-none shadow-sm">
                    <Spinner className="w-6 h-6" showLoadingTxt={false} />
                  </div>
                </div>
              ) : (
                /* If aiMissingData is null, render the normal response content */
                <div className="flex gap-2 items-start max-w-[80%]">
                  <img
                    src="/assets/buildPipeline/bighammer.png"
                    alt="Assistant"
                    className="w-6 h-6 flex-shrink-0 mt-1"
                  />
                  <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-none shadow-sm">
                    <ResponseContent response={entry.response} missing={entry.missing} aimissingData={aiMissingData} id={entry.id} />
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
