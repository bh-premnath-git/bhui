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

  useEffect(() => {
    if (!isOpen) {
      clearMessages();
      dispatch(clearFlowAgentConversation());
    }
  }, [isOpen, clearMessages, dispatch]);

  useEffect(() => {
    if (flowAgentConversation) {
      const lastMessage = messages[messages.length - 1];
      
      // Format the message based on response type
      let formattedMessage = '';
      
      if (flowAgentConversation.status === 'error') {
        formattedMessage = `Error: Could not process your request. Please refine your workflow description.`;
      } 
      else if (flowAgentConversation.status === 'missing') {
        // Format missing fields message
        formattedMessage = `Please provide more information for your workflow:\n\n`;
        
        // Add missing operator fields if present
        if (flowAgentConversation.flow_definition && typeof flowAgentConversation.flow_definition === 'object') {
          formattedMessage += `Missing fields:\n`;
          
          Object.entries(flowAgentConversation.flow_definition).forEach(([operator, fields]) => {
            formattedMessage += `- ${operator}: ${fields.join(', ')}\n`;
          });
        }
        
        // Add missing operators if present
        if (flowAgentConversation.operators && flowAgentConversation.operators.length > 0) {
          formattedMessage += `\nOperators: ${flowAgentConversation.operators.join(', ')}\n`;
        }
        
        // Add pipelines if present
        if (flowAgentConversation.pipelines && flowAgentConversation.pipelines.length > 0) {
          formattedMessage += `\nPipelines: ${flowAgentConversation.pipelines.join(', ')}`;
        }
      }
      else if (flowAgentConversation.status === 'success') {
        // For success response with flow_definition
        formattedMessage = `Workflow created successfully!\n\n`;
        
        if (typeof flowAgentConversation.flow_definition === 'string') {
          formattedMessage += flowAgentConversation.flow_definition;
        }
      }
      else if (flowAgentConversation.response) {
        // Handle the traditional response format
        formattedMessage = flowAgentConversation.response;
      }
      
      // Update the message if it's different from the current one
      if (!lastMessage || lastMessage.role !== 'assistant' || lastMessage.content !== formattedMessage) {
        addAssistantMessage(formattedMessage);
      }
    }
  }, [flowAgentConversation, messages, addAssistantMessage]);

  const handleSend = async () => {
    if (!input.trim() || !selectedFlow?.flow_id) return;

    addUserMessage(input);
    
    addAssistantMessage("Thinking...");
    
    await dispatch(createFlowAgentConversationEntry({
      flow_id: selectedFlow.flow_id.toString(),
      request: input,
      thread_id: selectedFlow.flow_id.toString()
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
