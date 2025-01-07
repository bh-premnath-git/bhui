import React, { useState, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'
import { useFlow } from '@/contexts/FlowContext'

interface ResponseContentProps {
  response: string
  id: number
}

export const ResponseContent: React.FC<ResponseContentProps> = ({ response, id }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const { setAiflowStrructre } = useFlow()
  const MAX_PREVIEW_LENGTH = 500

  let formattedResponse = response
  try {
    const parsedResponse = JSON.parse(response)
    formattedResponse = JSON.stringify(parsedResponse, null, 2)
  } catch (e) {
    formattedResponse = response
  }

  const displayContent = isExpanded
    ? formattedResponse
    : `${formattedResponse.slice(0, MAX_PREVIEW_LENGTH)}...`

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedResponse)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  useEffect(() => {
    setAiflowStrructre(formattedResponse)
  }, [formattedResponse])

  return (
    <div className="relative">
      <pre className="text-gray-700 whitespace-pre-wrap overflow-x-auto">
        {displayContent}
      </pre>
      {formattedResponse.length > MAX_PREVIEW_LENGTH && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-purple-600 hover:text-purple-800 text-sm font-medium"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
      <button
        onClick={handleCopy}
        className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700"
      >
        {copiedId === id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
      </button>
    </div>
  )
}

