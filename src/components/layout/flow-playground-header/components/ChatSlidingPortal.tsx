import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatMessages } from "@/hooks/useChatMessages";
import { AIChatInput } from "@/components/shared/AIChatInput";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { 
  createFlowAgentConversationEntry, 
  clearFlowAgentConversation,
  setFormDefinition,
  setFormValues,
  clearFormStates
} from "@/store/slices/designer/flowSlice";
import { RootState } from "@/store";
import { MissingFieldsForm } from "./missing-fields-form";

export const ChatSlidingPortal = ({ isOpen, onClose, imageSrc }: { isOpen: boolean; onClose: () => void; imageSrc: string }) => {
  const { messages, addUserMessage, addAssistantMessage, clearMessages, updateLastAssistantMessage } = useChatMessages();
  const dispatch = useAppDispatch();
  const [input, setInput] = useState("");
  const { 
    selectedFlow, 
    flowAgentConversation, 
    loading,
    formDefinition,
    formValues
  } = useAppSelector((state: RootState) => state.flow);

  useEffect(() => {
    if (!isOpen) {
      clearMessages();
      dispatch(clearFlowAgentConversation());
      dispatch(clearFormStates());
    }
  }, [isOpen, clearMessages, dispatch]);

  const extractFromJson = (jsonString: string) => {
    try {
      const parsedJson = JSON.parse(jsonString);

      if (parsedJson && parsedJson.tasks && Array.isArray(parsedJson.tasks)) {
        const formDef: Record<string, string[]> = {};
        const formValues: Record<string, Record<string, string>> = {};

        parsedJson.tasks.forEach((task: any) => {
          if (task.type && typeof task.type === 'string') {
            const fields: string[] = [];
            const values: Record<string, string> = {};
            Object.keys(task).forEach(key => {
              if (!['type', 'module_name', 'task_id', 'depends_on'].includes(key)) {
                fields.push(key);
                if (task[key] !== undefined) {
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
          const { formDef, formValues: extractedValues } = extractFromJson(flowAgentConversation.flow_definition);
          if (formDef) {
            dispatch(setFormDefinition(formDef));
            dispatch(setFormValues(extractedValues));
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
  }, [flowAgentConversation, updateLastAssistantMessage, dispatch]);

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
          <h2 className="text-sm font-semibold">Bighammer.AI</h2>
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
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === "assistant"
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

              {formDefinition && !loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-black rounded-lg px-4 py-2 max-w-[80%] w-full">
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
