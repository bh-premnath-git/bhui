import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatMessages } from "@/hooks/useChatMessages";
import { PanelLayout } from "./shared/PanelLayout";

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
      <div className="flex gap-2 mt-auto">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your data..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button
          className="bg-black text-white border hover:bg-gray-200"
          onClick={handleSend}>Send</Button>
      </div>
    </PanelLayout>
  );
}