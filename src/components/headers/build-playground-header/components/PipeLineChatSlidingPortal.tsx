import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatMessages } from "@/hooks/useChatMessages";
import { AIChatInput } from "@/components/shared/AIChatInput";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { useFlow } from "@/context/designers/FlowContext";
import {
  clearFlowAgentConversation,
  clearFormStates
} from "@/store/slices/designer/flowSlice";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { createStaticPipelineSchema, recommendDataSources } from "@/store/slices/designer/buildPipeLine/BuildPipeLineSlice";
import { usePipelineContext } from "@/context/designers/DataPipelineContext";
import { convertPipelineToUIJson } from "@/lib/pipelineJsonConverter";
import { getInitialFormState } from "@/lib/transformationUtils";
import { BarChart3, Globe2, LayoutGrid, MapPin } from "lucide-react";

const suggestionQuestions = [
  {
    title: "Monthly Sales Report",
    description: "Build a pipeline for generating monthly sales performance report",
    icon: BarChart3
  },
  {
    title: "Regional Sales Trends",
    description: "Create a pipeline to track region-wise sales trends",
    icon: Globe2
  },
  {
    title: "Product Category Analysis",
    description: "Generate a sales report pipeline for different product categories",
    icon: LayoutGrid
  },
  {
    title: "Top Sales Regions",
    description: "Setup a pipeline for identifying the top-performing sales regions",
    icon: MapPin
  }
];

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
  const {setPipelineJson,setPipeLineName,setNodes,setEdges,setFormStates,handleSourceUpdate,handleCenter,handleAlignHorizontal}=usePipelineContext();

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
      addUserMessage(input);
      addAssistantMessage("Let me analyze your pipeline request...");

      const pipelineId = `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const result:any = await dispatch(createStaticPipelineSchema({
        pipelineId,
        request: input
      })).unwrap();

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

      if(result.pipeline_definition==null){
        setPipelineJson(null)
        setNodes([])
        setEdges([])
      } else {
        await setNodes(nodesWithTitles);
        await setEdges(uiJson.edges || []);
        await handleCenter();
        await handleAlignHorizontal();
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
                await setNodes(nodesWithTitles);
                await setEdges(uiJson.edges || []);
                await handleCenter();
                await handleAlignHorizontal()
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
 

  const handleSuggestionClick = (question: string) => {
    setInput(question);
    handleSend();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[600px] p-0 flex flex-col h-full border-none bg-background/95 backdrop-blur-md" style={{zIndex: 10000000}}>
        <div className="px-6 py-4 border-b bg-background/70 backdrop-blur-md">
          <h2 className="text-base font-medium">BigHammer.ai</h2>
        </div>
        
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 space-y-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <img 
                src={imageSrc} 
                alt="AI" 
                className="w-5 h-7 transform -rotate-[40deg]"
              />
            </div>
            <div className="text-center space-y-1.5 max-w-sm">
              <p className="text-lg font-medium">How can I assist with your pipeline?</p>
              <p className="text-sm text-muted-foreground">
                Select a template or describe your pipeline needs
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-md px-4">
              {suggestionQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(question.description)}
                  className="group relative flex flex-col text-left p-4 rounded-xl border border-border/40 
                    hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 
                    transition-all duration-300 bg-gradient-to-br from-background/50 to-background/80
                    backdrop-blur-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center
                      group-hover:bg-primary/15 transition-colors">
                      {<question.icon className="w-4 h-4 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-foreground mb-0.5 flex items-center justify-between">
                        {question.title}
                        <svg 
                          width="14" 
                          height="14" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 text-primary"
                        >
                          <path d="M5 12h14m-7-7l7 7-7 7"/>
                        </svg>
                      </h3>
                      <p className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors line-clamp-2">
                        {question.description}
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 
                    transition-opacity duration-300 pointer-events-none" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-6 py-4">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex ${
                    message.role === "assistant" ? "flex-row" : "flex-row-reverse"
                  } gap-4 px-1`}
                >
                  {message.role === "assistant" ? (
                    <Avatar className="w-8 h-8 mr-0 flex-shrink-0 mt-1">
                      <div className="w-full h-full flex items-center justify-center">
                        <img 
                          src={imageSrc} 
                          alt="AI" 
                          className="w-4 h-6 transform -rotate-[40deg]"
                        />
                      </div>
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="w-8 h-8 mr-0 flex-shrink-0 bg-blue-500 mt-1">
                      <AvatarFallback className="bg-blue-500 text-white">
                        {"John Doe".charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`flex flex-col max-w-[85%] ${
                      message.role === "assistant" ? "" : "items-end"
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                        message.role === "assistant" 
                          ? "bg-card border border-border/40" 
                          : "bg-blue-100 text-blue-900"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    </div>
                  </div>
                </div>
              ))}
              {isProcessing && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex items-start gap-4 px-1">
                  <Avatar className="w-8 h-8 mr-0 flex-shrink-0 mt-1">
                    <AvatarImage src={imageSrc} className="w-4 h-6 transform -rotate-[40deg]" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col max-w-[85%]">
                    <div className="rounded-2xl px-4 py-3 bg-card border border-border/40 shadow-sm">
                    <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-primary/30 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary/30 rounded-full animate-bounce delay-150"></div>
                        <div className="w-2 h-2 bg-primary/30 rounded-full animate-bounce delay-300"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
        
        <div className="p-4 bg-background/70 backdrop-blur-md border-t">
          <AIChatInput
            input={input}
            onChange={setInput}
            onSend={handleSend}
            placeholder="Ask about your pipeline..."
            disabled={isProcessing}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
