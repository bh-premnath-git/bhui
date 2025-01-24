import { CircleUserRound, Database, Code2, FileOutput, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect, useRef } from "react"
import { Spinner } from "@/components/ui/spinner"

const StreamingText = ({ text = "", isLoading, onComplete }) => {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    if (!text) return

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex(currentIndex + 1)
      }, 15)

      return () => clearTimeout(timer)
    } else if (!isCompleted) {
      setIsCompleted(true)
      onComplete?.()
    }
  }, [text, currentIndex, onComplete, isCompleted])

  useEffect(() => {
    setDisplayText("")
    setCurrentIndex(0)
    setIsCompleted(false)
  }, [text])

  return (
    <div className="min-h-[1.5em]">
      {displayText}
      {currentIndex < text.length && <span className="animate-pulse">|</span>}
    </div>
  )
}

const ResponseSection = ({
  icon: Icon,
  title,
  content,
  isLoading,
  onComplete,
  rawData,
  shouldShowRaw,
  colorScheme,
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (content) {
      setIsVisible(true)
    }
  }, [content])

  if (!content && !isLoading) return null

  const colorClasses = {
    tables: "text-blue-600",
    query: "text-green-600",
    result: "text-purple-600",
  }

  const iconColorClasses = {
    tables: "text-blue-500",
    query: "text-green-500",
    result: "text-purple-500",
  }

  return (
    <div className={`transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-base font-bold flex items-center gap-2 ${colorClasses[colorScheme]}`}>
          <Icon className={`w-4 h-4 ${iconColorClasses[colorScheme]}`} />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="rounded-lg border border-zinc-100 bg-white p-4">
          <StreamingText text={content} isLoading={isLoading} onComplete={onComplete} />
        </div>
      </CardContent>
    </div>
  )
}

const StreamingResponse = ({ streamData, isLoading }) => {
  const [sectionsCompleted, setSectionsCompleted] = useState({
    tables: false,
    query: false,
    result: false,
  })

  if (isLoading && (!streamData || streamData.length === 0)) {
    return (
      <Card className="w-full">
        <CardContent className="p-7">
          <Spinner className="w-7 h-7" showLoadingTxt={false} />
        </CardContent>
      </Card>
    )
  }

  const tablesData = streamData?.find((item) => item.type === "tables")
  const queryData = streamData?.find((item) => item.type === "query")
  const resultData = streamData?.find((item) => item.type === "result")

  const handleSectionComplete = (section) => {
    setSectionsCompleted((prev) => ({
      ...prev,
      [section]: true,
    }))
  }

  return (
    <Card className="w-full transition-all duration-500">
      <div className="divide-y">
        <ResponseSection
          icon={Database}
          title="Identified Tables"
          content={tablesData?.content}
          isLoading={isLoading}
          onComplete={() => handleSectionComplete("tables")}
          rawData={tablesData?.raw_data}
          shouldShowRaw={false}
          colorScheme="tables"
        />

        {sectionsCompleted.tables && (
          <ResponseSection
            icon={Code2}
            title="Generated SQL"
            content={queryData?.content}
            isLoading={isLoading}
            onComplete={() => handleSectionComplete("query")}
            rawData={queryData?.raw_data}
            shouldShowRaw={false}
            colorScheme="query"
          />
        )}

        {sectionsCompleted.query && (
          <ResponseSection
            icon={FileOutput}
            title="Result"
            content={resultData?.content}
            isLoading={isLoading}
            onComplete={() => handleSectionComplete("result")}
            rawData={resultData?.raw_data}
            shouldShowRaw={sectionsCompleted.result}
            colorScheme="result"
          />
        )}
      </div>
    </Card>
  )
}

export default function ConversationView({ conversation, isLoading, decoded }) {
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [conversation])

  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {conversation.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
            <h1 className="text-3xl font-bold text-zinc-800">
              Hello, <span className="text-primary">{decoded?.name || "User"}</span>
            </h1>
            <p className="text-zinc-600">How can I assist you today?</p>
          </div>
        ) : (
          <div className="space-y-8 pb-20">
            {conversation.map((entry) => (
              <div key={entry.id} className="space-y-6">
                <div className="flex items-start gap-4">
                  <CircleUserRound className="text-zinc-400 w-5 h-5 mt-2" />
                  <div className="flex-1 rounded-lg border border-zinc-800 bg-white p-4">
                    <p className="text-zinc-800">{entry.question}</p>
                  </div>
                </div>

                <StreamingResponse streamData={entry.streamData} isLoading={isLoading} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

