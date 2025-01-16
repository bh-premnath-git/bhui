import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I can help you analyze your sales data. What would you like to know?",
    },
    {
      role: "user",
      content: "I want to see daily sales for each brand in the last week",
    },
    {
      role: "assistant",
      content: "I'll help you create a query to analyze daily sales by brand for the past week. This will show you the total sales amount for each brand, grouped by date.",
    },
    {
      role: "user",
      content: "Yes, that's exactly what I need",
    },
    {
      role: "assistant",
      content: "I've generated the SQL query for you. You can find it in the SQL Editor tab. The query will:\n\n1. Group sales by date and brand\n2. Calculate total sales for each group\n3. Show data for the last 7 days\n4. Sort results by date and brand name",
    }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: input },
      { role: "assistant", content: "I'm analyzing your request about: " + input },
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
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
                    ? "bg-gray-200 text-black"
                    : "bg-black text-gray-100"
                  }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="flex gap-2 pt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your data..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button className="bg-black text-white" onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
}