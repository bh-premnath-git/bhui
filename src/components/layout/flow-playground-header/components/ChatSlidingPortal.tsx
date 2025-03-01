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
  // Store the form definition separately so we can keep it even after success
  const [savedFormDefinition, setSavedFormDefinition] = useState<Record<string, string[]> | null>(null);
  // Store the form values to preserve them between submissions
  const [savedFormValues, setSavedFormValues] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    if (!isOpen) {
      clearMessages();
      dispatch(clearFlowAgentConversation());
      setSavedFormDefinition(null);
      setSavedFormValues({});
    }
  }, [isOpen, clearMessages, dispatch]);

  // Extract form definition and values from a successful JSON response
  const extractFromJson = (jsonString: string) => {
    try {
      // Try to parse the JSON
      const parsedJson = JSON.parse(jsonString);
      
      if (parsedJson && parsedJson.tasks && Array.isArray(parsedJson.tasks)) {
        // Create a form definition from the tasks
        const formDef: Record<string, string[]> = {};
        const formValues: Record<string, Record<string, string>> = {};
        
        parsedJson.tasks.forEach((task: any) => {
          if (task.type && typeof task.type === 'string') {
            const fields: string[] = [];
            const values: Record<string, string> = {};
            
            // Extract all fields except type, module_name, task_id, and depends_on
            Object.keys(task).forEach(key => {
              if (!['type', 'module_name', 'task_id', 'depends_on'].includes(key)) {
                fields.push(key);
                
                // Store the value
                if (task[key] !== undefined) {
                  // Handle arrays by joining with commas
                  if (Array.isArray(task[key])) {
                    values[key] = task[key].join(', ');
                  } else {
                    values[key] = String(task[key]);
                  }
                }
              }
            });
            
            if (fields.length > 0) {
              formDef[task.type] = fields;
              formValues[task.type] = values;
            }
          }
        });
        
        return {
          formDef: Object.keys(formDef).length > 0 ? formDef : null,
          formValues: Object.keys(formValues).length > 0 ? formValues : {}
        };
      }
    } catch (error) {
      console.error('Error parsing JSON response:', error);
    }
    
    return { formDef: null, formValues: {} };
  };

  useEffect(() => {
    if (flowAgentConversation) {
      let formattedMessage = '';
      let shouldUpdateMessage = true;
      
      if (flowAgentConversation.status === 'error') {
        formattedMessage = `Error: Could not process your request. Please refine your workflow description.`;
      } 
      else if (flowAgentConversation.status === 'missing') {
        formattedMessage = `Please provide the following information for your workflow:`;
        
        // Save the form definition for later use
        if (flowAgentConversation.flow_definition && typeof flowAgentConversation.flow_definition === 'object') {
          setSavedFormDefinition(flowAgentConversation.flow_definition as Record<string, string[]>);
        }
        
        if (flowAgentConversation.operators && Array.isArray(flowAgentConversation.operators) && flowAgentConversation.operators.length > 0) {
          formattedMessage += `\n\nOperators: ${flowAgentConversation.operators.join(', ')}`;
        }
        if (flowAgentConversation.pipelines && Array.isArray(flowAgentConversation.pipelines) && flowAgentConversation.pipelines.length > 0) {
          formattedMessage += `\nPipelines: ${flowAgentConversation.pipelines.join(', ')}`;
        }
      }
      else if (flowAgentConversation.status === 'success') {
        // Don't show the success message in chat, but process the form definition
        shouldUpdateMessage = false;
        
        if (typeof flowAgentConversation.flow_definition === 'string') {
          // Try to extract form definition and values from successful JSON response
          const { formDef, formValues } = extractFromJson(flowAgentConversation.flow_definition);
          if (formDef) {
            setSavedFormDefinition(formDef);
            setSavedFormValues(formValues);
          }
        }
      }
      else if (flowAgentConversation.response) {
        formattedMessage = flowAgentConversation.response;
      }
      
      if (shouldUpdateMessage) {
        updateLastAssistantMessage(formattedMessage);
      }
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
    
    // Save the form values for future use
    setSavedFormValues(values);
    
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
    try {
      await dispatch(createFlowAgentConversationEntry({
        flow_id: selectedFlow.flow_id.toString(),
        request: `Form submission:\n${formattedValues}`,
        thread_id: selectedFlow.flow_id.toString()
      }));
    } catch (error) {
      console.error('Error submitting form:', error);
    }
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
              
              {/* Always show the form at the bottom if we have a form definition */}
              {savedFormDefinition && !loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-black rounded-lg px-4 py-2 max-w-[80%] w-full">
                    <h3 className="font-medium mb-2">Workflow Form</h3>
                    <MissingFieldsForm 
                      flowDefinition={savedFormDefinition} 
                      onSubmit={handleFormSubmit}
                      initialValues={savedFormValues}
                    />
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
