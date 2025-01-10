import { useState } from 'react'
import { ConversationEntry } from './types'
import { useAppSelector } from '@/redux/hooks'
import { RootState } from '@/store/store'
import { ApiService } from '@/services/apiServices'

export const useConversation = () => {
  const [conversation, setConversation] = useState<ConversationEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const selectedFlow = useAppSelector((state: RootState) => state.flowApi.selectedFlowFromList)

  const extractResponseMessage = (data: any): string => {
    try {
      const responseString = typeof data === 'string' ? data : JSON.stringify(data)
      const sanitizedResponse = responseString
        .replace(/'([a-zA-Z0-9_]+)':/g, '"$1":')
        .replace(/: True/g, ': true')
        .replace(/: False/g, ': false')
        .replace(/: None/g, ': null')
      
      const responseObj = JSON.parse(sanitizedResponse)
      
      if (responseObj.flow_definition) {
        const cleanFlowDef = responseObj.flow_definition
          .replace(/```json\n?/g, '')
          .replace(/```/g, '')
        
        const flowDefinition = JSON.parse(cleanFlowDef)
        return JSON.stringify(flowDefinition, null, 2)
      }
      
      return 'No flow definition found in the response'
    } catch (error) {
      console.error('Error parsing response:', error)
      return `Error parsing response: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }

  const handleSend = async (message: string) => {
    if (!message.trim() || isLoading) return

    try {
      const flowId = String(selectedFlow?.flow_id || selectedFlow?.id)
      const newEntry: ConversationEntry = {
        question: message,
        response: null,
        id: Date.now(),
      }

      setConversation(prev => [...prev, newEntry])
      setIsLoading(true)

      const body = {
        flow_id: flowId,
        request: newEntry.question,
        thread_id: `flow_${newEntry.id}`,
      }

      const responseData = await ApiService('8090', 'post', '/flow_agent/create_flow', body)
      const responseMessage = extractResponseMessage(responseData)
      
      setConversation(prev =>
        prev.map(entry =>
          entry.id === newEntry.id
            ? { ...entry, response: responseMessage }
            : entry
        )
      )

    } catch (error) {
      console.error('Error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'

      setConversation(prev =>
        prev.map(entry =>
          entry.id === prev[prev.length - 1].id
            ? { ...entry, response: `Error: ${errorMessage}` }
            : entry
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  return { conversation, isLoading, handleSend }
}