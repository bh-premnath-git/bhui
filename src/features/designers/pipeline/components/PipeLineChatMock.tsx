import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIChatInput } from "@/components/shared/AIChatInput";
import { motion } from 'framer-motion';

export const PipeLineChatMock = ({
  className = "",
  color = '#009459' 
}: {
  className?: string;
  color?: string;
}) => {
  // Use a static mock conversation instead of dynamic implementation
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  
  // Define static mock messages for the conversation
  const staticMessages = [
    {
      role: "assistant",
      content: "Provide the data source details"
    },
    {
      role: "user",
      content: "Orders, Order Details"
    },
    {
      role: "assistant",
      content: "Added Orders and Order Details. Do you want apply any transformations rules?"
    },
    {
      role: "user",
      content: "Join based on order_id, sort based on order_date, derive count of orders for each order and drop order_date column"
    },
    {
      role: "assistant",
      content: "Added trasforamtion based on the requirement. Can you provide target details?"
    },
    {
      role: "user",
      content: "Load data to target and create pipeline"
    },
    {
      role: "assistant",
      content: "Pipeline created!"
    }
  ];
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Handle send message (just clears input in this mock)
  const handleSend = () => {
    if (!input.trim()) return;
    setInput("");
  };
    
  return (
    <>
      <div
        className={`h-full flex flex-col bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50 backdrop-blur-md opacity-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-lg ${className}`}
      >
        <ScrollArea className="flex-1 px-4 py-6">
          <div className="space-y-8 py-2">
            {staticMessages.map((message, i) => (
              <div
                key={i}
                className={`flex items-start gap-4 px-1 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {message.role === "assistant" && (
                  <motion.div
                    className="relative inline-flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.button
                      className="relative w-8 h-8 rounded-full group flex items-center justify-center"
                      style={{ backgroundColor: color }}
                      whileHover={{ scale: 1.05, opacity: 0.9 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {/* Plain green circle with no icon */}
                    </motion.button>
                  </motion.div>
                )}
                {message.role === "user" && (
                  <motion.div
                    className="relative inline-flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.button
                      className="relative w-8 h-8 rounded-full group flex items-center justify-center"
                      style={{ backgroundColor: "#000000" }}
                      whileHover={{ scale: 1.05, opacity: 0.9 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {/* Plain black circle with no icon */}
                    </motion.button>
                  </motion.div>
                )}
                <div className="flex flex-col max-w-[85%]">
                  <div className="rounded-2xl px-4 py-3 bg-gradient-to-r from-white to-slate-50 border border-border/40 shadow-md transition-all duration-300 hover:shadow-lg">
                    <div className="whitespace-pre-wrap leading-relaxed" style={{ color: message.role === "assistant" ? "#009459" : "#000000" }}>
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-b-lg">
          <AIChatInput
            input={input}
            onChange={setInput}
            onSend={handleSend}
            placeholder="Type a message..."
            disabled={false}
          />
        </div>
      </div>
    </>
  );
};