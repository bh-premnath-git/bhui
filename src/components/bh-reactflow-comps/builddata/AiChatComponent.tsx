import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Send } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { apiService } from '@/lib/api/api-service'
import { toast } from 'sonner'
import { AGENT_REMOTE_URL } from '@/config/platformenv'
import { usePipelineContext } from '@/context/designers/DataPipelineContext'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { getColumnSuggestions } from '@/lib/pipelineAutoSuggestion'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  role?: 'user' | 'assistant'
  content?: string
}

interface NodeSuggestion {
  id: string
  title: string
  label: string
}

export default function AiChatComponent({ isAiChatOpen, setIsAiChatOpen, data, current_node_id }: {
  isAiChatOpen: boolean
  setIsAiChatOpen: (open: boolean) => void
  data: any
  current_node_id: string
}) {
  const { id } = useParams<{ id: string }>()
  const { makePipeline, setUnsavedChanges, nodes, edges, pipelineDtl } = usePipelineContext()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isApiLoading, setIsApiLoading] = useState(false)
  const [showNodeSuggestions, setShowNodeSuggestions] = useState(false)
  const [nodeSuggestions, setNodeSuggestions] = useState<NodeSuggestion[]>([])
  const [filteredSuggestions, setFilteredSuggestions] = useState<NodeSuggestion[]>([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0)
  const [mentionStartPos, setMentionStartPos] = useState(0)
  const [mentionQuery, setMentionQuery] = useState('')
  
  // Chat history state
  const [isSavingChatHistory, setIsSavingChatHistory] = useState(false)
  const [savedMessageIds, setSavedMessageIds] = useState<Set<string>>(new Set())

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Helper function to generate unique message IDs
  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Function to save individual AI agent chat messages (user requests and AI responses)
  const saveAIAgentChatMessage = useCallback(async (message: Message) => {
    if (!id) {
      console.warn('No pipeline id available, skipping chat message save')
      return
    }

    if (isSavingChatHistory) {
      console.warn('Already saving chat history, skipping individual message save')
      return
    }

    // Check if message is already saved
    if (message.id && savedMessageIds.has(message.id)) {
      return
    }

    setIsSavingChatHistory(true)
    try {
      // Format message for API - convert to the expected format
      const formattedMessage = {
        role: message.role || (message.sender === 'user' ? 'user' : 'assistant'),
        content: message.content || message.text,
        timestamp: new Date().toISOString(),
        suggestions: [], // Don't save suggestions as they contain functions
      }

      const chatHistoryData = {
        pipeline_id: id,
        messages: [formattedMessage],
        append: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Saving AI agent chat message:', { 
        messageId: message.id, 
        role: formattedMessage.role, 
        content: formattedMessage.content,
        pipelineId: id,
        chatHistoryData
      })
      
      const result = await apiService.savePipelineChatHistory(id, chatHistoryData)
      
      // Update saved message tracking
      if (message.id) {
        setSavedMessageIds(prev => new Set([...prev, message.id!]))
      }
      
      console.log('AI agent chat message saved successfully:', { 
        messageId: message.id, 
        result,
        savedMessageIds: savedMessageIds.size + 1
      })
    } catch (error) {
      console.error('Failed to save AI agent chat message:', error)
      console.error('Error details:', {
        id,
        messageId: message.id,
        messageRole: message.role || message.sender,
        error: error instanceof Error ? error.message : error
      })
    } finally {
      setIsSavingChatHistory(false)
    }
  }, [id, isSavingChatHistory, savedMessageIds])

  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition()

  // Extract node suggestions from the pipeline context
  useEffect(() => {
    if (nodes && Array.isArray(nodes)) {
      const suggestions: NodeSuggestion[] = nodes.map(node => ({
        id: node.id,
        title: node.data?.title || node.data?.label || `Node ${node.id}`,
        label: node.data?.label || 'Unknown'
      }))
      setNodeSuggestions(suggestions)
    }
  }, [nodes])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-save AI agent chat messages when messages change (backup mechanism)
  useEffect(() => {
    if (messages.length === 0 || !id) return
    
    // Get the last message that was added
    const lastMessage = messages[messages.length - 1]
    
    console.log('Auto-save effect triggered:', {
      messagesLength: messages.length,
      lastMessageId: lastMessage?.id,
      lastMessageRole: lastMessage?.role || lastMessage?.sender,
      alreadySaved: lastMessage?.id ? savedMessageIds.has(lastMessage.id) : false,
      savedMessageIdsSize: savedMessageIds.size
    })
    
    // Only save if it's a new message (not already saved) and is a user or assistant message
    if (lastMessage && lastMessage.id && !savedMessageIds.has(lastMessage.id)) {
      // Only save user and assistant messages from AI agent interactions
      const messageRole = lastMessage.role || (lastMessage.sender === 'user' ? 'user' : 'assistant')
      if (messageRole === 'user' || messageRole === 'assistant') {
        console.log('Auto-save backup triggered for message:', { 
          messageId: lastMessage.id, 
          role: messageRole, 
          content: (lastMessage.content || lastMessage.text)?.substring(0, 100) + '...' 
        })
        
        // Use a slight delay to allow for immediate consecutive messages
        const timeoutId = setTimeout(() => {
          saveAIAgentChatMessage(lastMessage)
        }, 1000) // Increased delay to avoid conflicts with immediate saves
        
        return () => clearTimeout(timeoutId)
      }
    }
  }, [messages, id, savedMessageIds, saveAIAgentChatMessage])

  // Update input text with speech transcript
  useEffect(() => {
    if (transcript) {
      setInputText(prev => prev + transcript)
      resetTranscript()
    }
  }, [transcript, resetTranscript])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }, [inputText, interimTranscript])

  // Handle @ mention detection and filtering
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart

    setInputText(value)

    // Check for @ mention
    const textBeforeCursor = value.substring(0, cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)

      // Check if there's no space after @ (valid mention context)
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        const query = textAfterAt.toLowerCase()
        const filtered = nodeSuggestions.filter(node =>
          node.title.toLowerCase().includes(query) ||
          node.label.toLowerCase().includes(query)
        )
        setMentionStartPos(lastAtIndex)
        setMentionQuery(textAfterAt)
        setFilteredSuggestions(filtered)
        setSelectedSuggestionIndex(0)
        setShowNodeSuggestions(filtered.length > 0)
      } else {
        setShowNodeSuggestions(false)
      }
    } else {
      setShowNodeSuggestions(false)
    }
  }

  // Handle suggestion selection
  const selectSuggestion = (suggestion: NodeSuggestion) => {
    const beforeMention = inputText.substring(0, mentionStartPos)
    const afterMention = inputText.substring(mentionStartPos + mentionQuery.length + 1)
    const newText = `${beforeMention}@${suggestion.title}${afterMention}`

    setInputText(newText)
    setShowNodeSuggestions(false)

    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionStartPos + suggestion.title.length + 1
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showNodeSuggestions && filteredSuggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedSuggestionIndex(prev =>
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0
          )
          // Scroll the selected item into view
          setTimeout(() => {
            const selectedItem = suggestionsRef.current?.querySelector(`[data-index="${selectedSuggestionIndex}"]`)
            selectedItem?.scrollIntoView({ block: 'nearest' })
          }, 0)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedSuggestionIndex(prev =>
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1
          )
          // Scroll the selected item into view
          setTimeout(() => {
            const selectedItem = suggestionsRef.current?.querySelector(`[data-index="${selectedSuggestionIndex}"]`)
            selectedItem?.scrollIntoView({ block: 'nearest' })
          }, 0)
          break
        case 'Enter':
          if (!e.shiftKey) {
            e.preventDefault()
            selectSuggestion(filteredSuggestions[selectedSuggestionIndex])
            return
          }
          break
        case 'Escape':
          e.preventDefault()
          setShowNodeSuggestions(false)
          break
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() || isApiLoading) return

    const userMessage: Message = {
      id: generateMessageId(),
      text: inputText.trim(),
      content: inputText.trim(),
      sender: 'user',
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    
    // Save user message to chat history immediately
    try {
      await saveAIAgentChatMessage(userMessage)
    } catch (error) {
      console.error('Failed to save user message to chat history:', error)
    }
    
    setInputText('')
    setIsApiLoading(true)
    setShowNodeSuggestions(false)

    try {
      // Get available columns for the current node
      let availableColumns: Record<string, any> = {}
      if (current_node_id && nodes && edges) {
        try {
          const columnSuggestions = await getColumnSuggestions(current_node_id, nodes, edges, pipelineDtl)
          console.log(columnSuggestions)
          // Convert array to object format if needed
          if (Array.isArray(columnSuggestions)) {
            availableColumns = { columns: columnSuggestions }
          } else {
            availableColumns = columnSuggestions || {}
          }
        } catch (columnError) {
          console.warn('Failed to get column suggestions:', columnError)
        }
      }

      // Call the pipeline schema edit API
      const response: any = await apiService.post({
        url: 'pipeline_schema/pipeline',
        baseUrl: AGENT_REMOTE_URL,
        method: 'POST',
        usePrefix: true,
        data: {
          pipeline_id: id, // Use the ID from params, fallback to "7" if not available
          user_request: userMessage.text,
          available_columns: availableColumns
        },
        metadata: {
          errorMessage: 'Failed to process your request'
        }
      })

      // Process the pipeline_json if it exists in the response
      if (response?.pipeline_json) {
        try {
          await makePipeline({ pipeline_definition: response.pipeline_json })
          setUnsavedChanges()
          console.log('Pipeline updated successfully with new schema')

          // Add success response message
          const assistantMessage: Message = { 
            id: generateMessageId(),
            text: 'Pipeline updated successfully! Your changes have been applied.',
            content: 'Pipeline updated successfully! Your changes have been applied.',
            sender: 'ai',
            role: 'assistant',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, assistantMessage])

          // Save assistant message to chat history immediately
          try {
            await saveAIAgentChatMessage(assistantMessage)
          } catch (error) {
            console.error('Failed to save assistant success message to chat history:', error)
          }

          // Show success toast
          toast.success('Pipeline updated successfully')

          // Close the dialog after successful pipeline update
          setTimeout(() => {
            setIsAiChatOpen(false)
          }, 2000) // Increased delay to allow for saving

        } catch (pipelineError) {
          console.error('Error updating pipeline:', pipelineError)
          const errorMessage: Message = { 
            id: generateMessageId(),
            text: 'Failed to update the pipeline. Please try again.',
            content: 'Failed to update the pipeline. Please try again.',
            sender: 'ai',
            role: 'assistant',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, errorMessage])
          
          // Save error message to chat history immediately
          try {
            await saveAIAgentChatMessage(errorMessage)
          } catch (error) {
            console.error('Failed to save assistant error message to chat history:', error)
          }
          
          toast.error('Failed to update pipeline')
        }
      } else {
        // Add a generic response if no pipeline_json is returned
        const assistantMessage: Message = { 
          id: generateMessageId(),
          text: response?.message || 'Request processed successfully.',
          content: response?.message || 'Request processed successfully.',
          sender: 'ai',
          role: 'assistant',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
        
        // Save assistant message to chat history immediately
        try {
          await saveAIAgentChatMessage(assistantMessage)
        } catch (error) {
          console.error('Failed to save assistant generic message to chat history:', error)
        }
      }

      console.log('Request processed successfully:', response?.messages)

    } catch (error: any) {
      console.error('API Error:', error)
      
      // Add error response message
      const errorMessage: Message = { 
        id: generateMessageId(),
        text: `Error: ${error?.response?.data?.message || 'Failed to process your request. Please try again.'}`,
        content: `Error: ${error?.response?.data?.message || 'Failed to process your request. Please try again.'}`,
        sender: 'ai',
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      
      // Save error message to chat history immediately
      try {
        await saveAIAgentChatMessage(errorMessage)
      } catch (error) {
        console.error('Failed to save assistant API error message to chat history:', error)
      }

      // Show error toast
      toast.error(error?.response?.data?.message || 'Failed to process your request')

    } finally {
      setIsApiLoading(false)
    }
  }

  const toggleVoiceRecognition = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
        textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
        setShowNodeSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <Dialog open={isAiChatOpen} onOpenChange={setIsAiChatOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 [&>button]:hidden">
     
        
        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="border-t p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm">
              Voice recognition error: {error}
            </div>
          )}

          {/* Voice Status Indicator */}
          {isListening && (
            <div className="mb-4 flex items-left justify-left gap-1 p-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm font-medium text-gray-700">Listening... Speak now</span>
            </div>
          )}

          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputText + interimTranscript}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message or use @ to mention nodes..."
                  className="w-full px-4 py-3 pr-4 bg-white border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  rows={1}
                  style={{ minHeight: '50px', maxHeight: '150px' }}
                />

                {showNodeSuggestions && filteredSuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-300 rounded-md shadow max-h-40 overflow-y-auto text-sm max-w-xs w-full"
                  >
                    <div className="px-3 py-1 text-gray-600 border-b border-gray-200 bg-gray-50 font-semibold">
                      Available Nodes ({filteredSuggestions.length})
                    </div>
                    {filteredSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.id}
                        data-index={index}
                        className={`px-3 py-1 cursor-pointer ${index === selectedSuggestionIndex
                            ? 'bg-gray-100 text-gray-900 border-l-2 border-gray-700'
                            : 'hover:bg-gray-50 text-gray-800'
                          }`}
                        onClick={() => {
                          setSelectedSuggestionIndex(index)
                          selectSuggestion(suggestion)
                        }}
                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                      >
                        <div className="truncate">{suggestion.title || `Node ${suggestion.id}`}</div>
                      </div>
                    ))}
                  </div>
                )}

                {interimTranscript && (
                  <div className="absolute bottom-2 right-2 text-xs text-gray-500 italic">
                    Recognizing...
                  </div>
                )}
              </div>

              {/* Voice Recognition Button */}
               {isSupported && (
                  <button
                    onClick={toggleVoiceRecognition}
                    className={`p-3 rounded-lg ${isListening
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    {isListening ? (
                      <MicOff className="w-5 h-5" strokeWidth={2.5} />
                    ) : (
                      <Mic className="w-5 h-5" strokeWidth={2.5} />
                    )}
                  </button>
                )}

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isApiLoading}
                className="p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                title={isApiLoading ? "Processing..." : "Send message"}
              >
                {isApiLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}