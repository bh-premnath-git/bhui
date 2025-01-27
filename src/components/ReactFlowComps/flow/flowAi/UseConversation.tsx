import { useState } from 'react'
import { ConversationEntry } from './types'
import { ApiService } from '@/services/apiServices'
import { useFlow } from '@/contexts/FlowContext'
import { AGENT_PORT } from '@/configration/environment'

export const useConversation = () => {
  const [conversation, setConversation] = useState<ConversationEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { selectedFlowId } = useFlow()
  const extractResponseMessage = (data: any): string => {
    const result: {
      flowDefinition?: any;
      missingOperators?: any;
      message?: string;
    } = {};
    try {
      if (!data || (typeof data === 'string' && !data.trim())) {
        result.message = 'No data received from the server.';
        return JSON.stringify(result, null, 2);
      }
      const responseString =
        typeof data === 'string' ? data : JSON.stringify(data);

      const sanitizedResponse = responseString
        .replace(/'([a-zA-Z0-9_]+)':/g, '"$1":')
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false')
        .replace(/\bNone\b/g, 'null');

      const responseObj = JSON.parse(sanitizedResponse);
      if (responseObj.status === 'success' && responseObj.flow_definition) {
        const flowDefRaw = responseObj.flow_definition
          .replace(/```json\n?/g, '')
          .replace(/```/g, '');
        try {
          result.flowDefinition = flowDefRaw
          result.missingOperators = null
        } catch (parseError) {
          result.flowDefinition = null;
          result.message = 'Error parsing flow definition.';
        }
      } else if (responseObj.status === 'missing' && responseObj.flow_definition) {
        result.missingOperators = responseObj.flow_definition
        result.flowDefinition = null
      } else {
        const flowDefRaw = responseObj.flow_definition
          .replace(/```json\n?/g, '')
          .replace(/```/g, '');
        try {
          result.flowDefinition = flowDefRaw
          result.missingOperators = null

        } catch (flowerr) {

          result.message = 'No flow definition found in the response.';
        }

      }
      return JSON.stringify(result, null, 2);
    } catch (error) {
      console.error('Error parsing response:', error);
      return `Error parsing response: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };

  const handleSend = async (message: string) => {
    if (!message.trim() || isLoading) return

    try {
      const flowId = String(selectedFlowId)
      const newEntry: ConversationEntry = {
        question: message,
        response: null,
        missing: null,
        id: Date.now(),
      }

      setConversation(prev => [...prev, newEntry])
      setIsLoading(true)

      const body = {
        flow_id: flowId,
        request: newEntry.question,
        thread_id: `flow_${selectedFlowId}`,
      }

      const responseData = await ApiService(AGENT_PORT, 'post', '/flow_agent/create_flow', body)
      const extractedData = JSON.parse(extractResponseMessage(responseData))

      setConversation(prev =>
        prev.map(entry =>
          entry.id === newEntry.id
            ? { ...entry, response: JSON.stringify(extractedData.flowDefinition) || null, missing: JSON.stringify(extractedData.missingOperators) || null }
            : entry
        )
      )

    } catch (error) {
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

  const deleteConversation = async () => {
    setIsLoading(true)
    try {
      await ApiService(AGENT_PORT, 'delete', `/flow_agent/delete_conversation/flow_${selectedFlowId}`)
      setConversation([])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      console.error('Error deleting conversation:', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return { conversation, isLoading, handleSend, deleteConversation }
}