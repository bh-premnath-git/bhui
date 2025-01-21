import React, { useState, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'
import { useFlow } from '@/contexts/FlowContext'

interface ResponseContentProps {
  response: string
  missing: string
  id: number
  aimissingData: any
  sender: 'user' | 'assistant'
}

type MissingData = Record<string, string[]>

export const ResponseContent: React.FC<ResponseContentProps> = ({
  response,
  missing,
  aimissingData,
  id,
  sender,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const { setAiflowStrructre, setAiMissingData } = useFlow()

  const containerClass =
    sender === 'assistant'
      ? 'bg-gray-900 text-white p-4 rounded-lg relative space-y-4'
      : 'bg-gray-700 text-white p-4 rounded-lg relative space-y-4'

  const chatMissingData: MissingData | null = missing ? JSON.parse(missing) : null
  const currentMissingData: MissingData | null = aimissingData || null

  let formattedResponse = response
  try {
    const parsedResponse = JSON.parse(response)
    formattedResponse = JSON.stringify(parsedResponse, null, 2)
  } catch {
    formattedResponse = response
  }

  const MAX_PREVIEW_LENGTH = 500
  const truncatedContent = formattedResponse.slice(0, MAX_PREVIEW_LENGTH)
  const displayContent =
    formattedResponse.length > MAX_PREVIEW_LENGTH && !isExpanded
      ? truncatedContent + '...'
      : formattedResponse

  const allMissingData: MissingData = {
    ...(chatMissingData || {}),
    ...(currentMissingData || {}),
  }

  const [operatorFields, setOperatorFields] = useState<{
    [operator: string]: { [field: string]: string }
  }>({})

  useEffect(() => {
    const newState: {
      [operator: string]: { [field: string]: string }
    } = { ...operatorFields } 
    for (const operator in allMissingData) {
      if (!newState[operator]) newState[operator] = {}

      allMissingData[operator].forEach((field) => {
        if (!newState[operator][field]) {
          newState[operator][field] = ''
        }
      })
    }

    setOperatorFields(newState)
  }, [allMissingData])

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedResponse)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSubmitAll = () => {
    console.log('User has provided missing fields:', operatorFields)
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
    } catch {
      // no-op
    }
  }, [formattedResponse, setAiflowStrructre, setAiMissingData])

  const hasMissingData = Object.keys(allMissingData).length > 0

  return (
    <div className={containerClass}>
      {hasMissingData ? (
        <div className="p-4 border border-gray-700 bg-gray-800 rounded shadow-sm space-y-6">
          <h3 className="mb-2 font-semibold text-gray-100 text-lg">
            Missing Fields
          </h3>
          {Object.entries(allMissingData).map(([operator, fields]) => (
            <div key={operator} className="mb-4">
              <h4 className="mb-2 font-semibold text-gray-100">
                Operator: <span className="font-bold">{operator}</span>
              </h4>
              <div className="flex flex-wrap gap-3">
                {fields.map((field) => (
                  <div
                    key={field}
                    className="flex items-center rounded-full bg-gray-700 border border-gray-600 px-3 py-1"
                  >
                    <label className="mr-2 font-medium text-sm text-gray-200">
                      {field}:
                    </label>
                    <input
                      type="text"
                      placeholder="Enter value"
                      className="w-36 bg-transparent border-none focus:outline-none text-sm text-white placeholder-gray-400"
                      value={operatorFields[operator]?.[field] || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setOperatorFields((prev) => ({
                          ...prev,
                          [operator]: {
                            ...prev[operator],
                            [field]: value,
                          },
                        }))
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={handleSubmitAll}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 text-sm"
          >
            Submit All
          </button>
        </div>
      ) : (
        <>
          <pre className="text-gray-100 whitespace-pre-wrap overflow-x-auto bg-gray-800 p rounded border border-gray-700">
            {displayContent}
          </pre>
          {formattedResponse.length > MAX_PREVIEW_LENGTH && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-gray-300 hover:text-gray-100 text-sm font-medium"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}

          {aimissingData === null && (
            <button
              onClick={handleCopy}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-200"
            >
              {copiedId === id ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          )}
        </>
      )}
    </div>
  )
}