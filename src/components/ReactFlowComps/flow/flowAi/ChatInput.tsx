import React, { useState, useRef, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Send } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { debounce } from 'lodash'

interface ChatInputProps {
  onSend: (message: string) => void
  deleteCon: () => Promise<void>
  isLoading: boolean
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, deleteCon, isLoading }) => {
  const [inputValue, setInputValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustTextareaHeight = debounce(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px` // Reduced maxHeight
    }
  }, 100)

  useEffect(() => {
    adjustTextareaHeight()
    return () => {
      adjustTextareaHeight.cancel()
    }
  }, [inputValue])

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSend(inputValue)
      setInputValue('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const deleteConversation = async () => {
    await deleteCon()
  }

  return (
    <div className="flex-shrink-0 py-4 px-4 bg-white border-t">
      <div className="flex items-center gap-2">
        <Textarea
          ref={textareaRef}
          placeholder="Ask BigHammer AI..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
          className="flex-1 bg-white border border-gray-300 rounded-md p-2 text-base text-black resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
          style={{
            minHeight: '40px',
            maxHeight: '150px'
          }}
        />
        <Button
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
          className={`flex items-center justify-center p-2 rounded-md transition-colors ${!inputValue.trim() || isLoading
            ? 'bg-black hover:bg-gray-800 cursor-not-allowed opacity-50'
            : 'bg-black hover:bg-gray-800'
            }`}
          aria-label="Send Message"
        >
          <Send className="h-5 w-5 text-white" />
        </Button>
        <Button
          onClick={deleteConversation}
          disabled={isLoading}
          className={`flex items-center justify-center p-2 rounded-md transition-colors ${isLoading
            ? 'cursor-not-allowed opacity-50'
            : 'bg-transparent hover:bg-gray-100'
            }`}
          aria-label="Delete Conversation"
        >
          <Trash2 className="h-5 w-5 text-black" />
        </Button>
      </div>
    </div>
  )
}
