import React, { useState, useEffect, useMemo } from 'react'
import { Copy, Check } from 'lucide-react'
import { useFlow } from '@/contexts/FlowContext'

interface ResponseContentProps {
  onSend: (message: string) => void
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
  onSend
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const { setAiflowStrructre, setAiMissingData } = useFlow()

  const containerClass = 'bg-gray-100 text-black p-2 rounded-lg relative space-y-4'

  const chatMissingData: MissingData | null = missing ? JSON.parse(missing) : null
  const currentMissingData: MissingData | null = aimissingData || null

  let formattedResponse = response
  try {
    const parsedResponse = JSON.parse(response)
    formattedResponse = JSON.stringify(parsedResponse, null, 2)
  } catch {
    // if not valid JSON, just use the raw response
  }

  const MAX_PREVIEW_LENGTH = 500
  const truncatedContent = formattedResponse.slice(0, MAX_PREVIEW_LENGTH)
  const displayContent =
    formattedResponse.length > MAX_PREVIEW_LENGTH && !isExpanded
      ? truncatedContent + '...'
      : formattedResponse

  const allMissingData: MissingData = useMemo(() => {
    return {
      ...(chatMissingData || {}),
      ...(currentMissingData || {}),
    }
  }, [chatMissingData, currentMissingData])

  const [operatorFields, setOperatorFields] = useState<{
    [operator: string]: { [field: string]: string }
  }>({})

  useEffect(() => {
    setOperatorFields((prev) => {
      const newState = { ...prev }
      let changed = false

      for (const operator in allMissingData) {
        if (!newState[operator]) {
          newState[operator] = {}
          changed = true
        }

        allMissingData[operator].forEach((field) => {
          if (!newState[operator][field]) {
            newState[operator][field] = ''
            changed = true
          }
        })
      }

      return changed ? newState : prev
    })
  }, [allMissingData])

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedResponse)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSubmitAll = () => {
    onSend(JSON.stringify(operatorFields))
  }

  useEffect(() => {
    try {
      const parsed = JSON.parse(formattedResponse)

      if (parsed) {
        setAiflowStrructre(formattedResponse)
        setAiMissingData(null)
      }
    } catch {
      // no-op
    }
  }, [])

  const hasMissingData = Object.keys(allMissingData).length > 0

  return (
    <div className={containerClass}>
      {hasMissingData ? (
        <>
          <h3 className="mb-2 font-semibold text-black text-lg">
            Missing Fields
          </h3>
          {Object.entries(allMissingData).map(([operator, fields]) => (
            <div key={operator} className="mb-4">
              <h4 className="mb-2 font-semibold text-black">
                <span className="font-bold">{operator}</span>
              </h4>
              <div className="flex flex-wrap gap-3">
                {fields.map((field) => (
                  <div
                    key={field}
                    className="flex items-center rounded-full bg-gray-700 border border-gray-600 px-1 py-2"
                  >
                    <label className="mr-2 font-medium text-sm text-gray-200">
                      {field}:
                    </label>
                    <input
                      type="text"
                      placeholder="Enter value"
                      className="bg-transparent border-none focus:outline-none text-sm text-white placeholder-gray-400"
                      style={{
                        width: `calc(${Math.max((operatorFields[operator]?.[field] || '').length, 10)}ch + 1rem)`,
                        maxWidth: '30ch',
                      }}
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
            className="px-2 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 text-sm"
          >
            Submit
          </button>
        </>
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
