import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatMessages } from "@/hooks/useChatMessages";
import { PanelLayout } from "./shared/PanelLayout";
import { AIChatInput } from "@/components/shared/AIChatInput";
import { Card } from "@/components/ui/card";
import { useAnalytics } from "@/context/AnalyticsContext";

interface AIChatProps {
  compact?: boolean;
  showHistory?: boolean;
}

export default function AIChat({ compact = false, showHistory = false }: AIChatProps) {
  const { messages, addUserMessage, addAssistantMessage } = useChatMessages();
  const [input, setInput] = useState("");
  const { fetchData } = useAnalytics();

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    addUserMessage(input);
    
    // Fetch data based on the question
    await fetchData(input);
    
    // Add assistant response
    addAssistantMessage("I've analyzed your request about: " + input);
    
    // Clear input
    setInput("");
  };

  if (compact) {
    return (
      <div className="w-full">
        <AIChatInput
          input={input}
          onChange={setInput}
          onSend={handleSend}
          placeholder="Ask a question about your data..."
        />
      </div>
    );
  }

  if (!showHistory) {
    return (
      <PanelLayout>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "assistant"
                      ? "bg-gray-100 text-black"
                      : "bg-white text-black"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2 mt-auto">
          <AIChatInput
            input={input}
            onChange={setInput}
            onSend={handleSend}
            placeholder="Ask about your data..."
          />
        </div>
      </PanelLayout>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message, i) => (
        <Card key={i} className="p-3">
          <div className="text-sm font-medium text-muted-foreground mb-1">
            {message.role === "assistant" ? "BigHammer AI" : "You"}
          </div>
          <div className="text-sm">{message.content}</div>
        </Card>
      ))}
      {messages.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No messages yet. Start by asking a question below.
        </div>
      )}
    </div>
  );
}