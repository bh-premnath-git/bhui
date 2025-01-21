import { useState, useCallback, useEffect } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchEventSource } from '@microsoft/fetch-event-source'
import InputField from "./InputField"
import ChatHistory from "./ChatHistory"
import ConversationView from "@/components/BighammerSearch/ConversationView"
import "./BigHammerSearch.css"
import { jwtDecode } from "jwt-decode"

export default function BigHammerSearch() {
  const [question, setQuestion] = useState("")
  const [conversation, setConversation] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [threadId, setThreadId] = useState("")
  const [chatHistory, setChatHistory] = useState([])
  const token = sessionStorage?.getItem("token")
  const decoded = token ? jwtDecode(token) : null

  const generateThreadId = useCallback(() => {
    return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  const createNewChat = useCallback(() => {
    const newChatId = Date.now()
    const newThreadId = generateThreadId()
    const newChat = {
      id: newChatId,
      title: "New Chat",
      timestamp: new Date().toISOString(),
      threadId: newThreadId,
    }

    setChatHistory((prevHistory) => [newChat, ...prevHistory])
    setConversation([])
    setQuestion("")
    setThreadId(newThreadId)
    return newChat
  }, [generateThreadId])

  useEffect(() => {
    if (chatHistory.length === 0) {
      const initialThreadId = generateThreadId()
      const initialChat = {
        id: Date.now(),
        title: "New Chat",
        timestamp: new Date().toISOString(),
        threadId: initialThreadId,
      }
      setChatHistory([initialChat])
      setThreadId(initialThreadId)
    }
  }, [chatHistory.length, generateThreadId])

  const handleNewChat = () => {
    createNewChat()
  }

  const handleDeleteChat = (id) => {
    setChatHistory((prevHistory) => {
      const updatedHistory = prevHistory.filter((chat) => chat.id !== id)
      // If deleting the last chat, create a new one
      if (updatedHistory.length === 0) {
        const newChat = createNewChat()
        return [newChat]
      }
      return updatedHistory
    })
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleSearch = async () => {
    if (!question.trim()) return;

    const newEntry = {
      question,
      id: Date.now(),
      streamData: []
    };

    setConversation(prev => [...prev, newEntry]);
    setQuestion("");
    setIsLoading(true);

    try {
      await fetchEventSource('http://localhost:8090/api/v1/platform_search/platform_search_stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          thread_id: threadId,
        }),
        onmessage(event) {
          try {
            const jsonData = JSON.parse(event.data);
            setConversation(prev =>
              prev.map(entry => {
                if (entry.id === newEntry.id) {
                  return {
                    ...entry,
                    streamData: [...(entry.streamData || []), jsonData]
                  };
                }
                return entry;
              })
            );
          } catch (error) {
            console.error("Error parsing SSE message:", error);
          }
        },
        onclose() {
          console.log("Connection closed by the server");
          setIsLoading(false);
        },
        onerror(err) {
          console.error("EventSource failed:", err);
          setConversation(prev =>
            prev.map(entry =>
              entry.id === newEntry.id
                ? {
                    ...entry,
                    streamData: [{
                      type: "error",
                      content: "An error occurred while processing your request. Please try again."
                    }]
                  }
                : entry
            )
          );
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error("Error setting up EventSource:", error);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex h-full relative bg-gradient-to-b from-gray-100 to-gray-300">
      <div className="flex-1 flex flex-col">
        <ConversationView conversation={conversation} isLoading={isLoading} decoded={decoded} />
        <InputField question={question} setQuestion={setQuestion} handleSearch={handleSearch} />
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="absolute top-4 right-4 z-50 text-gray-700 hover:text-gray-900"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {isMenuOpen && (
        <ChatHistory chatHistory={chatHistory} handleNewChat={handleNewChat} handleDeleteChat={handleDeleteChat} />
      )}
    </div>
  )
}
