import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatMessages } from "@/hooks/useChatMessages";
import { AIChatInput } from "@/components/shared/AIChatInput";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { createFlowAgentConversationEntry, clearFlowAgentConversation } from "@/store/slices/designer/flowSlice";
import { RootState } from "@/store";

export const ChatSlidingPortal = ({ isOpen, onClose, imageSrc }: { isOpen: boolean; onClose: () => void; imageSrc: string }) => {
  const { messages, addUserMessage, addAssistantMessage, clearMessages } = useChatMessages();
  const [input, setInput] = useState("");
  const dispatch = useAppDispatch();
  const { selectedFlow, flowAgentConversation, loading } = useAppSelector((state: RootState) => state.flow);

  // Clear messages when the portal is closed
  useEffect(() => {
    if (!isOpen) {
      clearMessages();
      dispatch(clearFlowAgentConversation());
    }
  }, [isOpen, clearMessages, dispatch]);

  // Update messages when flow agent conversation changes
  useEffect(() => {
    if (flowAgentConversation && flowAgentConversation.response) {
      // Check if this is a new response by comparing with the last message
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.role !== 'assistant' || lastMessage.content !== flowAgentConversation.response) {
        addAssistantMessage(flowAgentConversation.response);
      }
    }
  }, [flowAgentConversation, messages, addAssistantMessage]);

  const handleSend = async () => {
    if (!input.trim() || !selectedFlow?.flow_id) return;

    // Add user message to chat
    addUserMessage(input);
    
    // Add temporary loading message
    addAssistantMessage("Thinking...");
    
    // Send request to flow agent
    await dispatch(createFlowAgentConversationEntry({
      flow_id: selectedFlow.flow_id.toString(),
      request: input,
      thread_id: selectedFlow.flow_id.toString() // Using flow_id as thread_id
    }));
    
    setInput("");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[600px] p-4 flex flex-col h-full">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold">Bighammer.AI</h2>
          
        </div>
        
        {messages.length === 0 ? (
          <div className="mt-4 flex flex-col items-center flex-grow justify-center">
            <img src={imageSrc} alt="AI" className="w-16 h-16" />
            <p className="text-sm text-gray-600 mt-2">How can I assist you with this flow today?</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-4 mt-4">
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
                        : "bg-black text-white"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {loading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-black rounded-lg px-4 py-2 max-w-[80%]">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
        
        <div className="flex gap-2 mt-4">
          <AIChatInput
            input={input}
            onChange={setInput}
            onSend={handleSend}
            placeholder="Ask about your flow..."
            disabled={loading || !selectedFlow}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
