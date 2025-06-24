import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import React, { useState, useRef, useEffect } from 'react'
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
}

export default function AiChatComponent({isAiChatOpen, setIsAiChatOpen, data,current_node_id}: {
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [inputText, interimTranscript])

  const handleSendMessage = async () => {
    if (!inputText.trim() || isApiLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsApiLoading(true)

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
      const response:any = await apiService.post({
        url: 'pipeline_schema/edit_pipeline',
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
          
          // Show success toast
          toast.success('Pipeline updated successfully')
          
          // Close the dialog after successful pipeline update
          setTimeout(() => {
            setIsAiChatOpen(false)
          }, 1000) // Small delay to show the success message
          
        } catch (pipelineError) {
          console.error('Error updating pipeline:', pipelineError)
        }
      }

      // Don't create AI text response - just show success
      console.log('Request processed successfully:', response?.messages)
      
    } catch (error: any) {
      console.error('API Error:', error)
      
      // Show error toast only - no AI text response
      toast.error(error?.response?.data?.message || 'Failed to process your request')
      
    } finally {
      setIsApiLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleVoiceRecognition = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <Dialog open={isAiChatOpen} onOpenChange={setIsAiChatOpen}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0 bg-gradient-to-br from-slate-50 to-white">
        <DialogHeader className="px-6 py-4 border-b bg-white/80 backdrop-blur-sm">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-gray-800">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center p-1">
              {/* <Volume2 className="w-5 h-5 text-white" /> */}
              <img src="/assets/ai/ai.svg" alt="AI Assistant" className="w-6 h-6 object-contain rotate-45" />
            </div>
            AI Assistant - {data.title || data.label}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                    <img src="/assets/ai/ai.svg" alt="AI Assistant" className="w-8 h-8 object-contain rotate-45" />
                  </div>
                  <p className="text-lg font-medium mb-2">Pipeline Assistant</p>
                  <p className="text-sm">Type your pipeline modification requests below. Your messages will be processed to update the pipeline.</p>
                </div>
              </div>
            )}

            {messages.filter(message => message.sender === 'user').map((message) => (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 shadow-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <div className="whitespace-pre-wrap break-words">{message.text}</div>
                  <div className="text-xs mt-2 text-blue-100">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}


            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t bg-white/80 backdrop-blur-sm p-4">
            {error && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <div className="relative">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={inputText + interimTranscript}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message or use voice input..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                    rows={2}
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                  
                  {interimTranscript && (
                    <div className="absolute bottom-2 right-12 text-xs text-gray-400 italic">
                      Listening...
                    </div>
                  )}
                </div>

                {/* Voice Recognition Button */}
                {isSupported && (
                  <button
                    onClick={toggleVoiceRecognition}
                    className={`relative p-3 rounded-full transition-all duration-200 ${
                      isListening
                        ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    
                    {/* Animated listening indicator */}
                    {isListening && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75"></div>
                        <div className="absolute inset-0 rounded-full bg-blue-300 animate-pulse opacity-50"></div>
                      </>
                    )}
                  </button>
                )}

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isApiLoading}
                  className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                  title={isApiLoading ? "Processing..." : "Send message"}
                >
                  {isApiLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Voice Recognition Status */}
              {isListening && (
                <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="font-medium">🎤 Listening... Speak now</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
