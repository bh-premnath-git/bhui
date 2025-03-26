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
// import { MissingFieldsForm } from "./missing-fields-form";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { useLocation } from "react-router-dom";
import { createPipelineSchema, createStaticPipelineSchema, recommendDataSources } from "@/store/slices/designer/buildPipeLine/BuildPipeLineSlice";
import { usePipelineContext } from "@/context/designers/DataPipelineContext";
import { convertPipelineToUIJson } from "@/lib/pipelineJsonConverter";
import { getInitialFormState } from "@/lib/transformationUtils";

export const PipeLineChatSlidingPortal = ({ isOpen, onClose, imageSrc }: { isOpen: boolean; onClose: () => void; imageSrc: string }) => {
  const { messages, addUserMessage, addAssistantMessage, clearMessages, updateLastAssistantMessage } = useChatMessages();
  const { setAiflowStrructre } = useFlow();
  const dispatch = useAppDispatch();
  const [input, setInput] = useState("");
  const { selectedPipeline } = useAppSelector((state) => state.pipeline);
console.log(selectedPipeline);
const location = useLocation();
console.log(location.pathname);
  const [isProcessing, setIsProcessing] = useState(false);
  const {setPipelineJson,setPipeLineName,setNodes,setEdges,setFormStates,handleSourceUpdate}=usePipelineContext();

  useEffect(() => {
    if (!isOpen) {
      clearMessages();
      dispatch(clearFlowAgentConversation());
      dispatch(clearFormStates());
    }
  }, [isOpen, clearMessages, dispatch]);

//   useEffect(() => {
//     if (error) {
//       console.log('Flow error detected:', error);
//       // Update the last assistant message to show the error
//       updateLastAssistantMessage(`Error: ${error}. Please try again or modify your request.`);
//     }
//   }, [error, updateLastAssistantMessage]);

  

//   useEffect(() => {
//     if (flowAgentConversation) {
//       let formattedMessage = '';
//       let shouldUpdateMessage = true;

//       if (flowAgentConversation.status === 'error') {
//         formattedMessage = `Error: Could not process your request. Please refine your workflow description.`;
//       }
//       else if (flowAgentConversation.status === 'missing') {
//         formattedMessage = `Please provide the following information for your workflow:`;

//         if (flowAgentConversation.flow_definition && typeof flowAgentConversation.flow_definition === 'object') {
//           dispatch(setFormDefinition(flowAgentConversation.flow_definition as Record<string, string[]>));
//         }

//         if (flowAgentConversation.operators && Array.isArray(flowAgentConversation.operators) && flowAgentConversation.operators.length > 0) {
//           formattedMessage += `\n\nOperators: ${flowAgentConversation.operators.join(', ')}`;
//         }
//         if (flowAgentConversation.pipelines && Array.isArray(flowAgentConversation.pipelines) && flowAgentConversation.pipelines.length > 0) {
//           formattedMessage += `\nPipelines: ${flowAgentConversation.pipelines.join(', ')}`;
//         }
//       }
//       else if (flowAgentConversation.status === 'success') {
//         shouldUpdateMessage = false;
//         if (typeof flowAgentConversation.flow_definition === 'string') {
//           const { formDef, formValues: extractedValues, dependencies } = extractFromJson(flowAgentConversation.flow_definition);
//           if (formDef) {
//             dispatch(setFormDefinition(formDef));
//             dispatch(setFormValues(extractedValues));
            
//             // Store dependencies in Redux store if needed
//             if (dependencies && Object.keys(dependencies).length > 0) {
//               dispatch(setTaskDependencies(dependencies));
//               console.log('Task dependencies:', dependencies);
//             }
            
//             setAiflowStrructre(flowAgentConversation.flow_definition);
//           }
//         }
//       }
//       else if (flowAgentConversation.response) {
//         formattedMessage = flowAgentConversation.response;
//       }

//       if (shouldUpdateMessage) {
//         updateLastAssistantMessage(formattedMessage);
//       }
//     }
//   }, [flowAgentConversation]);

  const handleSend = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    try {
      // Add user message to chat
      addUserMessage(input);
      
      // Show thinking state
      addAssistantMessage("Let me analyze your pipeline request...");

      // Generate a unique pipeline ID using timestamp and random string
      const pipelineId = `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Dispatch the create pipeline schema action
      const result:any = await dispatch(createStaticPipelineSchema({
        pipelineId,
        request: input
      })).unwrap(); // Using unwrap() to handle the promise result

      // const result:any = await dispatch(recommendDataSources(input)).unwrap();

console.log(result);
const uiJson = await convertPipelineToUIJson(result.pipeline_definition, handleSourceUpdate);
console.log(uiJson);
if (!uiJson || !uiJson.nodes) {
  setNodes([])
  setEdges([])
  throw new Error('Failed to convert pipeline to UI format');
}

const nodesWithTitles = uiJson.nodes.map(node => {
  const matchingTransformation = result.pipeline_definition.transformations?.find(
      (t: any) => t?.title === node?.data?.title && t?.name
  );

  if (matchingTransformation) {
      return {
          ...node,
          data: {
              ...node.data,
              title: matchingTransformation.name,
              transformationData: {
                  ...node.data.transformationData,
                  name: matchingTransformation.name
              }
          }
      };
  }
  return node;
});
console.log(result.pipeline_definition,"result.pipeline_definition")
if(result.pipeline_definition==null){
  setPipelineJson(null)
  setNodes([])
  setEdges([])

}else{
  setNodes(nodesWithTitles);
  setEdges(uiJson.edges || []);
}
const initialFormStates = {};
result.pipeline_definition.transformations?.forEach((transformation: any) => {
                    const matchingNode = nodesWithTitles.find(
                        (node: any) => 
                            node?.data?.label === transformation?.transformation && 
                            node?.data?.title === transformation?.name
                    );

                    if (matchingNode?.id) {
                        initialFormStates[matchingNode.id] = getInitialFormState(transformation, matchingNode.id);
                    }
                });

                setFormStates(initialFormStates);
      // Clear the input field
      setInput("");

      // Update the last assistant message with the success response
      if (result) {
        console.log(result);
        let Response=result.pipeline_definition;
        makePipeline(Response);
        updateLastAssistantMessage(
          `I've analyzed your request and created a pipeline schema. Here's what I understood:\n\n` +
          // `${JSON.stringify(result, null, 2)}\n\n` +
          `Would you like me to explain any part of this pipeline in more detail?`
        );
      }

    } catch (error: any) {
      // Handle different types of errors with user-friendly messages
      let errorMessage = "I apologize, but I encountered an issue while processing your request. ";

      if (error.message?.includes("timeout")) {
        errorMessage += "The request took too long to process. Perhaps we could try breaking it down into smaller steps?";
      } else if (error.message?.includes("validation")) {
        errorMessage += "I couldn't quite understand some parts of your request. Could you please provide more details or rephrase it?";
      } else if (error.message?.includes("connection")) {
        errorMessage += "I'm having trouble connecting to the pipeline service. Please try again in a moment.";
      } else {
        errorMessage += "Could you please rephrase your request or provide more specific details about what you'd like to achieve?";
      }

      // Update the last assistant message with the error
      updateLastAssistantMessage(errorMessage);

      // Log the error for debugging
      console.error("Pipeline creation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const makePipeline=async(response:any)=>{
    // setPipeLineName({ pipeLineName: response.pipeline_json.name || '' });
                setPipelineJson(response.pipeline_json);

                // Convert pipeline to UI JSON
                const uiJson = await convertPipelineToUIJson(response.pipeline_json, handleSourceUpdate);
                console.log(uiJson,"uiJson")
                if (!uiJson || !uiJson.nodes) {
                    throw new Error('Failed to convert pipeline to UI format');
                }

                // Map nodes with titles safely
                const nodesWithTitles = uiJson.nodes.map(node => {
                    const matchingTransformation = response.pipeline_json.transformations?.find(
                        (t: any) => t?.title === node?.data?.title && t?.name
                    );

                    if (matchingTransformation) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                title: matchingTransformation.name,
                                transformationData: {
                                    ...node.data.transformationData,
                                    name: matchingTransformation.name
                                }
                            }
                        };
                    }
                    return node;
                });

                // Update nodes and edges
                setNodes(nodesWithTitles);
                setEdges(uiJson.edges || []);

                // Initialize form states
                const initialFormStates = {};
                response.pipeline_json.transformations?.forEach((transformation: any) => {
                    const matchingNode = nodesWithTitles.find(
                        (node: any) => 
                            node?.data?.label === transformation?.transformation && 
                            node?.data?.title === transformation?.name
                    );

                    if (matchingNode?.id) {
                        initialFormStates[matchingNode.id] = getInitialFormState(transformation, matchingNode.id);
                    }
                });

                setFormStates(initialFormStates);

  }
 

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[600px] p-4 flex flex-col h-full" style={{zIndex: 10000000}}>
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
                      <AvatarImage src={imageSrc} />
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
              {/* {loading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={imageSrc} />
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
              )} */}
              {/* {formDefinition && !loading && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={imageSrc} />
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
              )} */}
            </div>
          </ScrollArea>
        )}
        <div className="flex gap-2 mt-4">
          <AIChatInput
            input={input}
            onChange={setInput}
            onSend={handleSend}
            placeholder="Ask about your flow..."
            disabled={isProcessing}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
