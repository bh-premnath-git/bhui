import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatMessages } from "@/hooks/useChatMessages";
import { AIChatInput } from "@/components/shared/AIChatInput";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { useFlow } from "@/context/designers/FlowContext";
import {
  createFlowAgentConversationEntry,
  clearFlowAgentConversation,
  setFormDefinition,
  setFormValues,
  clearFormStates,
  setTaskDependencies
} from "@/store/slices/designer/flowSlice";
import { RootState } from "@/store";
import { MissingFieldsForm } from "./missing-fields-form";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

export const ChatSlidingPortal = ({ isOpen, onClose, imageSrc }: { isOpen: boolean; onClose: () => void; imageSrc: string }) => {
  const { messages, addUserMessage, addAssistantMessage, clearMessages, updateLastAssistantMessage } = useChatMessages();
  const { setAiflowStrructre } = useFlow();
  const dispatch = useAppDispatch();
  const [input, setInput] = useState("");
  const {
    selectedFlow,
    flowAgentConversation,
    loading,
    formDefinition,
    formValues,
    error
  } = useAppSelector((state: RootState) => state.flow);

  useEffect(() => {
    if (!isOpen) {
      clearMessages();
      dispatch(clearFlowAgentConversation());
      dispatch(clearFormStates());
    }
  }, [isOpen, clearMessages, dispatch]);

  useEffect(() => {
    if (error) {
      console.log('Flow error detected:', error);
      // Update the last assistant message to show the error
      updateLastAssistantMessage(`Error: ${error}. Please try again or modify your request.`);
    }
  }, [error, updateLastAssistantMessage]);

  const extractFromJson = (jsonString: string) => {
    try {
      const cleanJsonString = jsonString.replace(/```json\n|\n```/g, '');
      const parsedJson = JSON.parse(cleanJsonString);

      if (parsedJson && parsedJson.tasks && Array.isArray(parsedJson.tasks)) {
        const formDef: Record<string, string[]> = {};
        const formValues: Record<string, Record<string, string>> = {};
        const dependencies: Record<string, string[]> = {};

        parsedJson.tasks.forEach((task: any) => {
          if (task.type && typeof task.type === 'string') {
            const fields: string[] = [];
            const values: Record<string, string> = {};
            
            if (task.depends_on && Array.isArray(task.depends_on)) {
              dependencies[task.task_id] = task.depends_on;
            }
            
            Object.keys(task).forEach(key => {
              if (!['type', 'module_name', 'task_id', 'depends_on'].includes(key)) {
                fields.push(key);
                if (task[key] !== undefined) {
                  if (Array.isArray(task[key])) {
                    values[key] = JSON.stringify(task[key]);
                  } else if (typeof task[key] === 'object') {
                    values[key] = JSON.stringify(task[key]);
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
          formValues: Object.keys(formValues).length > 0 ? formValues : {},
          dependencies
        };
      }
    } catch (error) {
      console.error('Error parsing JSON response:', error);
    }

    return { formDef: null, formValues: {}, dependencies: {} };
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

        if (flowAgentConversation.flow_definition && typeof flowAgentConversation.flow_definition === 'object') {
          dispatch(setFormDefinition(flowAgentConversation.flow_definition as Record<string, string[]>));
        }

        if (flowAgentConversation.operators && Array.isArray(flowAgentConversation.operators) && flowAgentConversation.operators.length > 0) {
          formattedMessage += `\n\nOperators: ${flowAgentConversation.operators.join(', ')}`;
        }
        if (flowAgentConversation.pipelines && Array.isArray(flowAgentConversation.pipelines) && flowAgentConversation.pipelines.length > 0) {
          formattedMessage += `\nPipelines: ${flowAgentConversation.pipelines.join(', ')}`;
        }
      }
      else if (flowAgentConversation.status === 'success') {
        shouldUpdateMessage = false;
        if (typeof flowAgentConversation.flow_definition === 'string') {
          const { formDef, formValues: extractedValues, dependencies } = extractFromJson(flowAgentConversation.flow_definition);
          if (formDef) {
            dispatch(setFormDefinition(formDef));
            dispatch(setFormValues(extractedValues));
            
            // Store dependencies in Redux store if needed
            if (dependencies && Object.keys(dependencies).length > 0) {
              dispatch(setTaskDependencies(dependencies));
              console.log('Task dependencies:', dependencies);
            }
            
            setAiflowStrructre(flowAgentConversation.flow_definition);
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
  }, [flowAgentConversation]);

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

    dispatch(setFormValues(values));

    // Format form values for display, with special handling for JSON values
    const formattedValues = Object.entries(values)
      .map(([operator, fields]) => {
        const fieldEntries = Object.entries(fields)
          .map(([field, value]) => {
            // Try to parse any JSON string values
            let displayValue = value;
            if (value && typeof value === 'string' && 
                (value.startsWith('[') || value.startsWith('{'))) {
              try {
                const parsed = JSON.parse(value);
                displayValue = Array.isArray(parsed) 
                  ? `[${parsed.map(item => typeof item === 'object' ? '...' : item).join(', ')}]`
                  : '{...}';
              } catch (e) {
                // If parsing fails, use the original string
              }
            }
            return `${field}: ${displayValue}`;
          })
          .join(', ');
        return `${operator}: { ${fieldEntries} }`;
      })
      .join('\n');

    addUserMessage(`Submitted form values:\n${formattedValues}`);
    addAssistantMessage("Processing your input...");

    await dispatch(createFlowAgentConversationEntry({
      flow_id: selectedFlow.flow_id.toString(),
      request: `Form submission:\n${JSON.stringify(values)}`,
      thread_id: selectedFlow.flow_id.toString()
    }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[600px] p-4 flex flex-col h-full">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-sm font-semibold">BigHammer.ai</h2>
        </div>
        {messages.length === 0 ? (
          <div className="mt-4 flex flex-col items-center flex-grow justify-center">
            <img 
              src={imageSrc} 
              alt="AI" 
              className="w-4 h-6 transform -rotate-[40deg]"
            />
            <p className="text-sm text-gray-600 mt-2">How can I assist you with flow?</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-4 mt-4">
            <div className="space-y-6">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-3",
                    message.role === "assistant" ? "flex-row" : "flex-row-reverse"
                  )}
                >
                  {message.role === "assistant" ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={imageSrc} 
                        className="w-4 h-6 transform -rotate-[40deg]"
                      />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-8 w-8 bg-primary">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2 max-w-[80%] relative",
                      message.role === "assistant"
                        ? "bg-gray-100 text-black"
                        : "bg-primary text-primary-foreground",
                      // Add a tail to the message bubble
                      message.role === "assistant"
                        ? "before:absolute before:left-[-6px] before:top-3 before:border-4 before:border-transparent before:border-r-gray-100"
                        : "before:absolute before:right-[-6px] before:top-3 before:border-4 before:border-transparent before:border-l-primary"
                    )}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}
              {loading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={imageSrc} 
                      className="w-4 h-6 transform -rotate-[40deg]"
                    />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 text-black rounded-lg px-4 py-2 max-w-[80%] relative before:absolute before:left-[-6px] before:top-3 before:border-4 before:border-transparent before:border-r-gray-100">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
                    </div>
                  </div>
                </div>
              )}
              {formDefinition && !loading && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={imageSrc} 
                      className="w-4 h-6 transform -rotate-[40deg]"
                    />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 text-black rounded-lg px-4 py-2 max-w-[80%] relative before:absolute before:left-[-6px] before:top-3 before:border-4 before:border-transparent before:border-r-gray-100">
                    <h3 className="font-medium mb-2">Flow Form</h3>
                    <MissingFieldsForm
                      flowDefinition={formDefinition}
                      onSubmit={handleFormSubmit}
                      initialValues={formValues}
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
