import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatMessages } from "@/hooks/useChatMessages";
import { AIChatInput } from "@/components/shared/AIChatInput";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { createFlowAgentConversationEntry, clearFlowAgentConversation } from "@/store/slices/designer/flowSlice";
import { RootState } from "@/store";
import { MissingFieldsForm } from "./MissingFieldsForm";

export const ChatSlidingPortal = ({ isOpen, onClose, imageSrc }: { isOpen: boolean; onClose: () => void; imageSrc: string }) => {
  const { messages, addUserMessage, addAssistantMessage, clearMessages, updateLastAssistantMessage } = useChatMessages();
  const [input, setInput] = useState("");
  const dispatch = useAppDispatch();
  const { selectedFlow, flowAgentConversation, loading } = useAppSelector((state: RootState) => state.flow);
  const [showMissingFieldsForm, setShowMissingFieldsForm] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      clearMessages();
      dispatch(clearFlowAgentConversation());
      setShowMissingFieldsForm(false);
    }
  }, [isOpen, clearMessages, dispatch]);

  useEffect(() => {
    if (flowAgentConversation) {
      let formattedMessage = '';
      
      if (flowAgentConversation.status === 'error') {
        formattedMessage = `Error: Could not process your request. Please refine your workflow description.`;
        setShowMissingFieldsForm(false);
      } 
      else if (flowAgentConversation.status === 'missing') {
        formattedMessage = `Please provide the following information for your workflow:`;
        
        // Show the form for missing fields instead of text representation
        if (flowAgentConversation.flow_definition && typeof flowAgentConversation.flow_definition === 'object') {
          setShowMissingFieldsForm(true);
        }
        
        if (flowAgentConversation.operators && Array.isArray(flowAgentConversation.operators) && flowAgentConversation.operators.length > 0) {
          formattedMessage += `\n\nOperators: ${flowAgentConversation.operators.join(', ')}`;
        }
        if (flowAgentConversation.pipelines && Array.isArray(flowAgentConversation.pipelines) && flowAgentConversation.pipelines.length > 0) {
          formattedMessage += `\nPipelines: ${flowAgentConversation.pipelines.join(', ')}`;
        }
      }
      else if (flowAgentConversation.status === 'success') {
        formattedMessage = `Workflow created successfully!\n\n`;
        setShowMissingFieldsForm(false);
        
        if (typeof flowAgentConversation.flow_definition === 'string') {
          formattedMessage += flowAgentConversation.flow_definition;
        }
      }
      else if (flowAgentConversation.response) {
        formattedMessage = flowAgentConversation.response;
        setShowMissingFieldsForm(false);
      }      
      updateLastAssistantMessage(formattedMessage);
    }
  }, [flowAgentConversation, updateLastAssistantMessage]);

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

  const handleFormSubmit = async (values: Record<string, Record<string, string>>) => {
    if (!selectedFlow?.flow_id) return;
    
    // Format the form values into a message
    const formattedValues = Object.entries(values)
      .map(([operator, fields]) => {
        const fieldEntries = Object.entries(fields)
          .map(([field, value]) => `${field}: ${value}`)
          .join(', ');
        return `${operator}: { ${fieldEntries} }`;
      })
      .join('\n');
    
    addUserMessage(`Submitted form values:\n${formattedValues}`);
    addAssistantMessage("Processing your input...");
    
    // Send the form values to the backend using the existing createFlowAgentConversationEntry action
    await dispatch(createFlowAgentConversationEntry({
      flow_id: selectedFlow.flow_id.toString(),
      request: `Form submission:\n${formattedValues}`,
      thread_id: selectedFlow.flow_id.toString()
    }));
    
    setShowMissingFieldsForm(false);
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
                    
                    {/* Display the form after the assistant message if needed */}
                    {message.role === "assistant" && 
                     i === messages.length - 1 && 
                     showMissingFieldsForm && 
                     flowAgentConversation?.flow_definition && 
                     typeof flowAgentConversation.flow_definition === 'object' && (
                      <div className="mt-4">
                        <MissingFieldsForm 
                          flowDefinition={flowAgentConversation.flow_definition as Record<string, string[]>} 
                          onSubmit={handleFormSubmit} 
                        />
                      </div>
                    )}
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
            disabled={loading || !selectedFlow || showMissingFieldsForm}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
