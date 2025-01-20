import React, { useState, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'
import { useFlow } from '@/contexts/FlowContext'

interface ResponseContentProps {
  response: string
  missing: string
  id: number
  aimissingData: any
}

type MissingData = Record<string, string[]>

export const ResponseContent: React.FC<ResponseContentProps> = ({
  response,
  missing,
  aimissingData,
  id,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const { setAiflowStrructre, setAiMissingData } = useFlow()
  const missingData = missing ? JSON.parse(missing) : null
  const MAX_PREVIEW_LENGTH = 500

  let formattedResponse = response
  try {
    const parsedResponse = JSON.parse(response)
    formattedResponse = JSON.stringify(parsedResponse, null, 2)
  } catch {
    formattedResponse = response
  }

  const truncatedContent = formattedResponse.slice(0, MAX_PREVIEW_LENGTH)
  const displayContent = isExpanded
    ? formattedResponse
    : truncatedContent + (formattedResponse.length > MAX_PREVIEW_LENGTH ? '...' : '')

  function* generateMissingPrompts(
    data: MissingData
  ): Generator<string, void, unknown> {
    for (const [operator, fields] of Object.entries(data)) {
      const fieldsList = fields.join(', ')
      yield `For "${operator}", please provide the following fields: ${fieldsList}`
    }
  }

  const missingDataPrompts: string[] = []
  if (aimissingData) {
    const gen = generateMissingPrompts(aimissingData)
    for (const prompt of gen) {
      missingDataPrompts.push(prompt)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedResponse)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  useEffect(() => {
    try {
      const parsed = JSON.parse(formattedResponse)
      if (parsed.flowDefinition) {
        setAiflowStrructre(formattedResponse)
        setAiMissingData(null)
      }
      if (parsed.missingOperators) {
        setAiMissingData(parsed.missingOperators)
      }
    } catch { }
  }, [formattedResponse, setAiflowStrructre, setAiMissingData])

  return (
    <div className="relative">
      {missingDataPrompts.length > 0 ? (
        <ul className="text-gray-700 whitespace-pre-wrap overflow-x-auto list-disc pl-4">
          {missingDataPrompts.map((prompt, idx) => (
            <li key={idx}>{prompt}</li>
          ))}
        </ul>
      ) : (
        <>
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
        </>
      )}
      {aimissingData === null && <button
        onClick={handleCopy}
        className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700"
      >
        {copiedId === id ? (
          <Check className="w-5 h-5" />
        ) : (
          <Copy className="w-5 h-5" />
        )}
      </button>}
    </div>
  )
}
