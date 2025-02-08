import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatMessages } from "@/hooks/useChatMessages";
import { PanelLayout } from "./shared/PanelLayout";
import { AIChatInput } from "./AIChatInput" 

export default function AIChat() {
  const { messages, addUserMessage, addAssistantMessage } = useChatMessages();
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    addUserMessage(input);
    addAssistantMessage("I'm analyzing your request about: " + input);
    setInput("");
  };

  return (
    <PanelLayout>
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"
                }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === "assistant"
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
      <AIChatInput
        input={input}
        onChange={setInput}
        onSend={handleSend}
        placeholder="Ask about your data..."
        // Optional: onVoiceInput={() => { ... }} 
        // Optional: onCopy={() => { ... }} 
      />
    </PanelLayout>
  );
}