import React, { useState, useEffect, useMemo } from 'react'
import { Copy, Check } from 'lucide-react'
import { useFlow } from '@/contexts/FlowContext'
import { useSelectedType } from '@/hooks/useOtherTypes'
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
interface ResponseContentProps {
  onSend: (message: string) => void
  response: string
  missing: string
  id: number
  aimissingData: any
  sender: 'user' | 'assistant'
}

type MissingData = Record<string, string[]>

const MissingFieldInput: React.FC<{
  selectedEnvironment: any
  operator: string
  field: string
  value: string
  onChange: (value: string) => void
}> = ({ selectedEnvironment, operator, field, value, onChange }) => {
  const operatorSchema = useSelectedType(operator, field);
  const missingFieldUIType = operatorSchema.ui_properties.ui_type;

  const endpoint = operatorSchema.ui_properties.endpoint || "";
  const shouldFetchOptions = missingFieldUIType === "dropdown" && endpoint !== "";

  const { options: fetchedOptions, isLoading } = useDropdownOptions(
    endpoint,
    shouldFetchOptions && endpoint !== "{catalog_base_url}/api/v1/pipeline/list"
      ? selectedEnvironment
      : null
  );

  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    if (missingFieldUIType === "enum") {
      const enumOptions = operatorSchema.enum;
      setOptions(enumOptions || []);
    } else if (missingFieldUIType === "dropdown") {
      setOptions(fetchedOptions || []);
    }
  }, [missingFieldUIType, operatorSchema, fetchedOptions]);

  const renderInput = () => {
    switch (missingFieldUIType) {
      case "dropdown":
      case "enum":
        return (
          <select
            className="bg-gray-800 border-none focus:outline-none text-sm text-white px-2 py-1"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Select option</option>
            {options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case "textbox":
        return (
          <textarea
            placeholder="Enter text"
            className="bg-transparent border-none focus:outline-none text-sm text-white placeholder-gray-400 resize-y min-h-[60px]"
            style={{
              width: `calc(${Math.max(value.length, 20)}ch + 1rem)`,
              maxWidth: "40ch",
            }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      default:
        return (
          <input
            type="text"
            placeholder="Enter value"
            className="bg-transparent border-none focus:outline-none text-sm text-white placeholder-gray-400"
            style={{
              width: `calc(${Math.max(value.length, 10)}ch + 1rem)`,
              maxWidth: "30ch",
            }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  return (
    <div className="flex items-center rounded-full bg-gray-700 border border-gray-600 px-1 py-2">
      <label className="mr-2 font-medium text-sm text-gray-200">{field}:</label>
      {renderInput()}
    </div>
  );
};

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
  const { selectedEnvironment } = useSelector(
    (state: RootState) => state.flowApi
  );
  const { setAiflowStrructre, setAiMissingData, } = useFlow()

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
      const newState = { ...prev };

      for (const operator in allMissingData) {
        if (!newState[operator]) {
          newState[operator] = {};
        }

        allMissingData[operator].forEach((field) => {
          if (!newState[operator][field]) {
            newState[operator][field] = '';
          }
        });
      }

      return JSON.stringify(newState) !== JSON.stringify(prev) ? newState : prev;
    });
  }, [allMissingData]);

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
                  <MissingFieldInput
                    selectedEnvironment={selectedEnvironment}
                    key={field}
                    operator={operator}
                    field={field}
                    value={operatorFields[operator]?.[field] || ''}
                    onChange={(value) => {
                      setOperatorFields((prev) => ({
                        ...prev,
                        [operator]: {
                          ...prev[operator],
                          [field]: value,
                        },
                      }));
                    }}
                  />
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
