import React, { useState, useRef, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import { debounce } from 'lodash'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [inputValue, setInputValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustTextareaHeight = debounce(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
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

  return (
    <div className="flex-shrink-0 py-6 px-6 bg-white border-t">
      <div className="flex items-end space-x-3">
        <Textarea
          ref={textareaRef}
          placeholder="Ask BigHammer AI"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className="flex-grow px-3 text-base rounded-2xl bg-gray-50 border resize-none placeholder:text-gray-400"
          style={{
            minHeight: '52px',
            maxHeight: '200px'
          }}
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
          className={`p-2 rounded-full transition-colors flex-shrink-0 ${
            !inputValue.trim() || isLoading
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-purple-800 cursor-pointer'
          }`}
        >
          <SendRoundedIcon className="h-7 w-7 text-gold-300 hover:text-gold-400 transition-colors" />
        </button>
      </div>
    </div>
  )
}

