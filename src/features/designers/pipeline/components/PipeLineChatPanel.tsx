import { useState, useEffect, useRef, ReactNode, useMemo, useCallback, useTransition } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatMessages } from "@/hooks/useChatMessages";
import { AIChatInput } from "@/components/shared/AIChatInput";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { useLocation, useNavigate } from "react-router-dom";
import { usePipelineContext } from "@/context/designers/DataPipelineContext";
import { usePipeLineChat } from "@/context/designers/PipeLineChatContext";
import { useReactFlow, Node, Edge } from "reactflow";
import { apiService } from '@/lib/api/api-service';
import { Plus, MessageSquare, ChevronDown, Check, X, Filter, Database, FileText, Layers } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { CATALOG_API_PORT } from "@/config/platformenv";
import { ReaderOptionsForm } from "@/components/bh-reactflow-comps/builddata/ReaderOptionsForm";
import TargetPopUp from "@/components/bh-reactflow-comps/TargetPopUp";
import { DataSource } from "@/types/data-catalog/dataCatalog";
import CreateFormFormik from "./form-sections/CreateForm";
import { buildPipelineTemplate } from "@/utils/pipelineTemplateUtils";
import { getConnectionConfigList } from "@/store/slices/dataCatalog/datasourceSlice";
import mdataJson from "@/pages/designers/data-pipeline/data/mdata.json";
import { motion } from 'framer-motion';
import SuggestionButton from "./SuggestionButton";
import { cn } from "@/lib/utils";

export const PipeLineChatPanel = ({
  onClose,
  imageSrc = "/assets/ai/ai.svg",
  onPipelineCreated,
  className = "",
  color = '#009459'
}: any) => {



  const dispatch = useAppDispatch();
  const {
    // State variables
    input,
    setInput,
    messages,
    isProcessing,
    pipelineJson,
    isNewChat,
    currentSourceData,
    foundSources,
    awaitingSourceSelection,
    sourceSuggestions,
    sourceColumns,
    mode,
    step,
    pipelineName,
    pipelineDescription,
    selectedSources,
    transformations,
    targetConfig,
    transformationSubStep,
    showDependencySelection,
    dependencyOptions,
    selectedDependency,
    selectedDependencies,
    isMultiSelect,
    minDependencies,
    useSourceConnection,
    filterCondition,
    targetName,
    activeForm,
    formInitialValues,
    filterFormInitialValues,
    schemaFormInitialValues,
    readerFormInitialValues,
    writerFormInitialValues,
    sorterFormInitialValues,
    aggregatorFormInitialValues,
    joinFormInitialValues,
    unionFormInitialValues,
    filterSchema,
    schemaTransformationSchema,
    sorterSchema,
    aggregatorSchema,
    joinSchema,
    unionSchema,
    dropSchema,
    selectSchema,
    sequenceSchema,
    filterName,
    schemaName,
    sorterName,
    aggregatorName,
    joinName,
    unionName,
    dropName,
    selectName,
    sequenceName,
    showFilterForm,
    showSchemaForm,
    showReaderForm,
    showWriterForm,
    showSorterForm,
    showAggregatorForm,
    showJoinForm,
    showUnionForm,
    showDropForm,
    showSelectForm,
    showSequenceForm,
    isPending,
    messagesEndRef,
    dropFormInitialValues,
    selectFormInitialValues,
    sequenceFormInitialValues,


    // Functions
    addUserMessage,
    addAssistantMessage,
    clearMessages,
    updateLastAssistantMessage,
    setPipelineJson,
    setIsNewChat,
    setCurrentSourceData,
    setFoundSources,
    setAwaitingSourceSelection,
    setSourceSuggestions,
    setMode,
    setStep,
    setPipelineName,
    setPipelineDescription,
    setSelectedSources,
    setTransformations,
    setTargetConfig,
    setTransformationSubStep,
    setShowDependencySelection,
    setDependencyOptions,
    setSelectedDependency,
    setSelectedDependencies,
    setIsMultiSelect,
    setMinDependencies,
    setUseSourceConnection,
    setFilterCondition,
    setTargetName,
    setActiveForm,
    setFormInitialValues,
    setFilterFormInitialValues,
    setSchemaFormInitialValues,
    setReaderFormInitialValues,
    setWriterFormInitialValues,
    setSorterFormInitialValues,
    setAggregatorFormInitialValues,
    setJoinFormInitialValues,
    setUnionFormInitialValues,
    setFilterSchema,
    setSchemaTransformationSchema,
    setSorterSchema,
    setAggregatorSchema,
    setJoinSchema,
    setUnionSchema,
    setFilterName,
    setSchemaName,
    setSorterName,
    setAggregatorName,
    setJoinName,
    setUnionName,
    setShowFilterForm,
    setShowSchemaForm,
    setShowReaderForm,
    setShowWriterForm,
    setShowSorterForm,
    setShowAggregatorForm,
    setShowJoinForm,
    setShowUnionForm,
    startTransition,
    handleSend,
    resetPipelineCreationState,
    startPipelineCreation,
    generatePipelineTemplate,
    handleSourceStep,
    processSelectedSource,
    handleTransformationsStep,
    handleConfirmStep,
    handleDependencySelection,
    updatePipelineWithDependency,
    handleReaderOptionsUpdate,
    handleTargetUpdate,
    handleReaderFormSubmit,
    handleFilterFormSubmit,
    handleSchemaFormSubmit,
    handleSorterFormSubmit,
    handleAggregatorFormSubmit,
    handleJoinFormSubmit,
    handleUnionFormSubmit,
    handleMultiDependencySelection,
    handleDropFormSubmit,
    setShowDropForm,
    handleSelectFormSubmit,
    setShowSelectForm,
    handleSequenceFormSubmit,
    setShowSequenceForm
  } = usePipeLineChat();
  const { nodes, edges } = usePipelineContext()

  // Debug log to see available nodes
  useEffect(() => {
    if (nodes && nodes.length > 0) {
      console.log("Available nodes in PipeLineChatPanel:", nodes);
    }
  }, [nodes]);

  // Function to find the appropriate node ID based on transformation type
  const findNodeIdByType = useCallback((transformationType: string) => {
    if (!nodes || nodes.length === 0) {
      console.log(`No nodes available, using fallback ID for ${transformationType}`);
      return `${transformationType}_1`; // Fallback if no nodes available
    }

    // Find the node with the matching transformation type
    const matchingNodes = nodes.filter(node =>
      node.data?.transformationType === transformationType
    );

    if (matchingNodes.length > 0) {
      // If we have matching nodes, return the ID of the first one
      console.log(`Found ${matchingNodes.length} nodes of type ${transformationType}, using ID: ${matchingNodes[0].id}`);
      return matchingNodes[0].id;
    }

    // Special case for Reader which might be named differently
    if (transformationType === "Reader" && nodes.some(node => node.data?.label === "Reader")) {
      const readerNode = nodes.find(node => node.data?.label === "Reader");
      console.log(`Found Reader node with ID: ${readerNode?.id}`);
      return readerNode?.id || "Reader_1";
    }

    // Special case for Drop transformation
    if (transformationType === "Drop" && nodes.some(node => node.data?.label === "Drop")) {
      const dropNode = nodes.find(node => node.data?.label === "Drop");
      console.log(`Found Drop node with ID: ${dropNode?.id}`);
      return dropNode?.id || "drop_transformation";
    }

    // Special case for Select transformation
    if (transformationType === "Select" && nodes.some(node => node.data?.label === "Select")) {
      const selectNode = nodes.find(node => node.data?.label === "Select");
      console.log(`Found Select node with ID: ${selectNode?.id}`);
      return selectNode?.id || "select_transformation";
    }

    // Special case for Sequence transformation
    if (transformationType === "Sequence" && nodes.some(node => node.data?.label === "Sequence")) {
      const sequenceNode = nodes.find(node => node.data?.label === "Sequence");
      console.log(`Found Sequence node with ID: ${sequenceNode?.id}`);
      return sequenceNode?.id || "sequence_transformation";
    }

    // If no matching node found, create a fallback ID with the next available number
    const existingNodesOfType = nodes
      .filter(node => node.id.startsWith(transformationType))
      .map(node => {
        const match = node.id.match(new RegExp(`${transformationType}_(\\d+)`));
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => !isNaN(num));

    const nextNumber = existingNodesOfType.length > 0
      ? Math.max(...existingNodesOfType) + 1
      : 1;

    const fallbackId = `${transformationType}_${nextNumber}`;
    console.log(`No matching node found for ${transformationType}, using generated ID: ${fallbackId}`);
    return fallbackId;
  }, [nodes]);

  // Fetch connection config list only once when component mounts
  useEffect(() => {
    dispatch(getConnectionConfigList({}));
  }, [dispatch]);

  // Update pipeline template whenever selectedDependency changes
  useEffect(() => {
    if (selectedDependency) {
      console.log("selectedDependency changed, updating pipeline template");
      // Use a timeout to ensure all state updates have been processed
      setTimeout(() => {
        const updatedTemplate = generatePipelineTemplate();
        setPipelineJson(updatedTemplate);
        console.log("Pipeline template updated after dependency change:", updatedTemplate);
      }, 0);
    }
  }, [selectedDependency, selectedSources, transformations, pipelineName, pipelineDescription, targetConfig, useSourceConnection, filterCondition]);

  // Update pipeline template whenever transformationSubStep changes to a dependency selection step
  useEffect(() => {
    const isDependencyStep = transformationSubStep.includes('dependency');
    if (isDependencyStep) {
      console.log("Dependency selection step detected:", transformationSubStep);
      // Use a timeout to ensure all state updates have been processed
      setTimeout(() => {
        const updatedTemplate = generatePipelineTemplate();
        setPipelineJson(updatedTemplate);
        console.log("Pipeline template updated for dependency selection step:", updatedTemplate);
      }, 0);
    }
  }, [transformationSubStep, selectedSources, transformations, pipelineName, pipelineDescription, targetConfig, useSourceConnection, filterCondition]);

  // Update pipeline template whenever showDependencySelection changes to true
  useEffect(() => {
    if (showDependencySelection) {
      console.log("Dependency selection UI shown, preparing pipeline template");
      // Use a timeout to ensure all state updates have been processed
      setTimeout(() => {
        const updatedTemplate = generatePipelineTemplate();
        setPipelineJson(updatedTemplate);
        console.log("Pipeline template updated for dependency selection UI:", updatedTemplate);
      }, 0);
    }
  }, [showDependencySelection, selectedSources, transformations, pipelineName, pipelineDescription, targetConfig, useSourceConnection, filterCondition]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show writer form when the message contains "Please configure your output target below"
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (
        lastMessage.role === 'assistant' &&
        lastMessage.content.includes('Please configure your output target below') &&
        transformationSubStep === 'target_form'
      ) {
        setShowWriterForm(true);
      }
    }
  }, [messages, transformationSubStep]);

  // Initialize writer form when transformationSubStep changes to 'target_form'
  useEffect(() => {
    if (transformationSubStep === 'target_form') {
      // Create default initial values if none exist
      if (!writerFormInitialValues) {
        const defaultValues = {
          name: targetName || 'write_output',
          target: {
            target_name: targetName || 'output_data',
            target_type: targetConfig.type || 'File',
            load_mode: 'append',
            connection: {
              connection_type: targetConfig.connectionType || 'Local',
              file_path_prefix: targetConfig.filePath || 'examples/'
            },
            file_name: `${(targetName || 'output').toLowerCase().replace(/\s+/g, '_')}.csv`
          },
          file_type: targetConfig.fileFormat || 'CSV',
          write_options: {
            header: true,
            sep: ',',
            createDisposition: 'CREATE_IF_NEEDED',
            writeMethod: 'APPEND'
          }
        };

        console.log("Initializing writer form values for target_form:", defaultValues);
        setWriterFormInitialValues(defaultValues);
      }

      // Ensure the form is shown
      setShowWriterForm(true);
    }
  }, [transformationSubStep, targetName, targetConfig, writerFormInitialValues]);

  // No need for a separate updatePipelineJson function since we've overridden setPipelineJson

  // Escape key handler removed as chat panel is always visible
  // No need to close the panel with Escape key

  // Panel is always open, so we don't need to clear state when closed
  // This effect has been removed




  // State for additional pipeline configuration

  // Load schemas from mdata.json
  useEffect(() => {
    if (mdataJson && mdataJson.schema) {
      // Find the filter schema
      const filterSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "Filter");
      if (filterSchemaFromMdata) {
        // Add nodeId to the schema to match the format expected by CreateFormFormik
        setFilterSchema({
          ...filterSchemaFromMdata,
          nodeId: 'filter_transformation'
        });
      }

      // Find the schema transformation schema
      const schemaTransformationSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "SchemaTransformation");
      if (schemaTransformationSchemaFromMdata) {
        // Add nodeId to the schema to match the format expected by CreateFormFormik
        setSchemaTransformationSchema({
          ...schemaTransformationSchemaFromMdata,
          nodeId: 'schema_transformation'
        });
      }

      console.log("Loaded schemas from mdata.json:", {
        filter: filterSchemaFromMdata,
        schemaTransformation: schemaTransformationSchemaFromMdata
      });
    }
  }, []);


  return (
    <>
      
        <div className="flex-1 mt-0 overflow-y-auto p-4">
          {isNewChat || messages.length === 0 ? (
            <div className="flex flex-col items-center flex-grow justify-center h-full">
              <img 
                src={imageSrc} 
                alt="AI" 
                className="w-4 h-6 transform -rotate-[40deg]"
              />
              <p className="text-sm text-gray-600 mt-2">How can I assist you with your pipeline?</p>
              <Button
                onClick={startPipelineCreation}
                className="mt-4 bg-gradient-to-r from-primary to-primary/90 text-white hover:from-primary/90 hover:to-primary/80 flex justify-center items-center gap-2 px-6 py-2.5 text-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Plus className="h-4 w-4" />
                Create a data pipeline
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-full pr-4">
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
                      <Avatar className="h-8 w-8 flex items-center justify-center">
                        <AvatarImage 
                          src={imageSrc} 
                          className="w-3.5 h-5 transform -rotate-[40deg]"
                          style={{ objectFit: "contain" }}
                        />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-8 w-8 bg-blue-500">
                        <AvatarFallback className="bg-blue-500 text-white">
                          U
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "rounded-lg px-4 py-2 max-w-[80%] relative",
                        message.role === "assistant"
                          ? "bg-gray-100 text-black"
                          : "bg-blue-100 text-blue-900",
                        message.role === "assistant"
                          ? "before:absolute before:left-[-6px] before:top-3 before:border-4 before:border-transparent before:border-r-gray-100"
                          : "before:absolute before:right-[-6px] before:top-3 before:border-4 before:border-transparent before:border-l-blue-100"
                      )}
                    >
                      <div className="whitespace-pre-wrap break-words">{message.content}</div>

                      {/* Show inline forms after specific assistant messages */}
                      {message.role === "assistant" && i === messages.length - 1 && (
                        <>
                          {/* Source selection suggestion buttons */}
                          {awaitingSourceSelection && sourceSuggestions.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {sourceSuggestions}
                            </div>
                          )}

                          {showReaderForm && message.content.includes("Review and edit reader config.") && (
                            <div className="mt-4 rounded-lg bg-gray-100">
                              <ReaderOptionsForm
                                initialData={readerFormInitialValues}
                                onSubmit={handleReaderFormSubmit}
                                onClose={() => setShowReaderForm(false)}
                                onSourceUpdate={handleReaderOptionsUpdate}
                                nodeId={`source_${currentSourceData?.data_src_id}`}
                              />
                            </div>
                          )}

                          {showFilterForm && (
                            <div className="mt-4 rounded-lg bg-gray-100">
                              <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 bg-white">
                                <div className="flex items-center gap-3">
                                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-black to-black flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">F</span>
                                  </div>
                                  <h2 className="text-lg font-medium text-gray-800">
                                    Filter Configuration
                                  </h2>
                                </div>
                              </div>
                              <div className="py-4">
                                {/* Use CreateFormFormik directly for filter */}
                                {filterSchema ? (
                                  <CreateFormFormik
                                    schema={{
                                      ...filterSchema,
                                      initialValues: {
                                        name: 'filter_transformation',
                                        condition: '',
                                        dependent_on: filterFormInitialValues.dependent_on || []
                                      }
                                    }}
                                    initialValues={{
                                      name: 'filter_transformation',
                                      condition: '',
                                      dependent_on: filterFormInitialValues.dependent_on || []
                                    }}
                                    onSubmit={handleFilterFormSubmit}
                                    nodes={nodes}
                                    sourceColumns={sourceColumns}
                                    onClose={() => setShowFilterForm(false)}
                                    pipelineDtl={pipelineJson}
                                    currentNodeId={findNodeIdByType("Filter")}
                                    edges={edges}
                                    isDialog={false}
                                  />
                                ) : (
                                  <div className="flex justify-center items-center p-4">
                                    <div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full"></div>
                                    <span className="ml-2">Loading filter form...</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {showSchemaForm && (
                            <div className="mt-4 rounded-lg bg-gray-100">
                              <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 bg-white">
                                <div className="flex items-center gap-3">
                                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-black to-black flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">S</span>
                                  </div>
                                  <h2 className="text-lg font-medium text-gray-800">
                                    Schema Transformation
                                  </h2>
                                </div>
                              </div>
                              <div className="py-4">
                                {/* Use CreateFormFormik directly for schema transformation */}
                                {schemaTransformationSchema ? (
                                  <CreateFormFormik
                                    schema={{
                                      ...schemaTransformationSchema,
                                      initialValues: {
                                        name: 'schema_transformation',
                                        derived_fields: [{ name: '', expression: '' }],
                                        dependent_on: schemaFormInitialValues.dependent_on || []
                                      }
                                    }}
                                    initialValues={{
                                      name: 'schema_transformation',
                                      derived_fields: [{ name: '', expression: '' }],
                                      dependent_on: schemaFormInitialValues.dependent_on || []
                                    }}
                                    onSubmit={handleSchemaFormSubmit}
                                    nodes={nodes}
                                    sourceColumns={sourceColumns}
                                    onClose={() => setShowSchemaForm(false)}
                                    pipelineDtl={pipelineJson}
                                    currentNodeId={findNodeIdByType("SchemaTransformation")}
                                    edges={edges}
                                    isDialog={false}
                                  />
                                ) : (
                                  <div className="flex justify-center items-center p-4">
                                    <div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full"></div>
                                    <span className="ml-2">Loading schema transformation form...</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {showSorterForm && (
                            <div className="mt-4 rounded-lg bg-gray-100">
                              <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 bg-white">
                                <div className="flex items-center gap-3">
                                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-black to-black flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">SO</span>
                                  </div>
                                  <h2 className="text-lg font-medium text-gray-800">
                                    Sorter Transformation
                                  </h2>
                                </div>
                              </div>
                              <div className="py-4">
                                {/* Use CreateFormFormik directly for sorter transformation */}
                                {sorterSchema ? (
                                  <CreateFormFormik
                                    schema={{
                                      ...sorterSchema,
                                      initialValues: {
                                        name: 'sorter_transformation',
                                        sort_columns: [{ column_name: 'id', sort_order: 'asc' }],
                                        dependent_on: sorterFormInitialValues.dependent_on || []
                                      }
                                    }}
                                    initialValues={{
                                      name: 'sorter_transformation',
                                      sort_columns: [{ column_name: 'id', sort_order: 'asc' }],
                                      dependent_on: sorterFormInitialValues.dependent_on || []
                                    }}
                                    onSubmit={handleSorterFormSubmit}
                                    nodes={nodes}
                                    sourceColumns={sourceColumns}
                                    onClose={() => setShowSorterForm(false)}
                                    pipelineDtl={pipelineJson}
                                    currentNodeId={findNodeIdByType("Sorter")}
                                    edges={edges}
                                    isDialog={false}
                                  />
                                ) : (
                                  <div className="flex justify-center items-center p-4">
                                    <div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full"></div>
                                    <span className="ml-2">Loading sorter transformation form...</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {showAggregatorForm && (
                            <div className="mt-4 rounded-lg bg-gray-100">
                              <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 bg-white">
                                <div className="flex items-center gap-3">
                                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-black to-black flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">AG</span>
                                  </div>
                                  <h2 className="text-lg font-medium text-gray-800">
                                    Aggregation Transformation
                                  </h2>
                                </div>
                              </div>
                              <div className="py-4">
                                {/* Use CreateFormFormik directly for aggregator transformation */}
                                {aggregatorSchema ? (
                                  <CreateFormFormik
                                    schema={{
                                      ...aggregatorSchema,
                                      initialValues: {
                                        name: 'aggregator_transformation',
                                        aggregations: [{ target_column: 'total_count', expression: 'count(*)' }],
                                        group_by: [{ group_by: 'category' }],
                                        dependent_on: aggregatorFormInitialValues.dependent_on || []
                                      }
                                    }}
                                    initialValues={{
                                      name: 'aggregator_transformation',
                                      aggregations: [{ target_column: 'total_count', expression: 'count(*)' }],
                                      group_by: [{ group_by: 'category' }],
                                      dependent_on: aggregatorFormInitialValues.dependent_on || []
                                    }}
                                    onSubmit={handleAggregatorFormSubmit}
                                    nodes={nodes}
                                    sourceColumns={sourceColumns}
                                    onClose={() => setShowAggregatorForm(false)}
                                    pipelineDtl={pipelineJson}
                                    currentNodeId={findNodeIdByType("Aggregator")}
                                    edges={edges}
                                    isDialog={false}
                                  />
                                ) : (
                                  <div className="flex justify-center items-center p-4">
                                    <div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full"></div>
                                    <span className="ml-2">Loading aggregator transformation form...</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {showJoinForm && (
                            <div className="mt-4 rounded-lg bg-gray-100">
                              <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 bg-white">
                                <div className="flex items-center gap-3">
                                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-black to-black flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">JN</span>
                                  </div>
                                  <h2 className="text-lg font-medium text-gray-800">
                                    Join Transformation
                                  </h2>
                                </div>
                              </div>
                              <div className="py-4">
                                {/* Use CreateFormFormik directly for join transformation */}
                                {joinSchema ? (
                                  <CreateFormFormik
                                    schema={{
                                      ...joinSchema,
                                      initialValues: {
                                        name: 'join_transformation',
                                        conditions: [{ join_type: 'inner', join_condition: '' }],
                                        dependent_on: joinFormInitialValues.dependent_on || []
                                      }
                                    }}
                                    initialValues={{
                                      name: 'join_transformation',
                                      conditions: [{ join_type: 'inner', join_condition: '' }],
                                      dependent_on: joinFormInitialValues.dependent_on || []
                                    }}
                                    key={`join-form-${JSON.stringify(joinFormInitialValues.dependent_on)}`}
                                    onSubmit={handleJoinFormSubmit}
                                    nodes={nodes}
                                    sourceColumns={sourceColumns}
                                    onClose={() => setShowJoinForm(false)}
                                    pipelineDtl={pipelineJson}
                                    currentNodeId={findNodeIdByType("Join")}
                                    edges={edges}
                                    isDialog={false}
                                  />
                                ) : (
                                  <div className="flex justify-center items-center p-4">
                                    <div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full"></div>
                                    <span className="ml-2">Loading join transformation form...</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {showUnionForm && (
                            <div className="mt-4 rounded-lg bg-gray-100">
                              <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 bg-white">
                                <div className="flex items-center gap-3">
                                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-black to-black flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">UN</span>
                                  </div>
                                  <h2 className="text-lg font-medium text-gray-800">
                                    Union Transformation
                                  </h2>
                                </div>
                              </div>
                              <div className="py-4">
                                {/* Use CreateFormFormik directly for union transformation */}
                                {unionSchema ? (
                                  <CreateFormFormik
                                    schema={{
                                      ...unionSchema,
                                      initialValues: {
                                        name: 'union_transformation',
                                        union_type: 'distinct',
                                        dependent_on: unionFormInitialValues.dependent_on || []
                                      }
                                    }}
                                    initialValues={{
                                      name: 'union_transformation',
                                      union_type: 'distinct',
                                      dependent_on: unionFormInitialValues.dependent_on || []
                                    }}
                                    key={`union-form-${JSON.stringify(unionFormInitialValues.dependent_on)}`}
                                    onSubmit={handleUnionFormSubmit}
                                    nodes={nodes}
                                    sourceColumns={sourceColumns}
                                    onClose={() => setShowUnionForm(false)}
                                    pipelineDtl={pipelineJson}
                                    currentNodeId={findNodeIdByType("Union")}
                                    edges={edges}
                                    isDialog={false}
                                  />
                                ) : (
                                  <div className="flex justify-center items-center p-4">
                                    <div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full"></div>
                                    <span className="ml-2">Loading union transformation form...</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {showDropForm && (
                            <div className="mt-4 rounded-lg bg-gray-100">
                              <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 bg-white">
                                <div className="flex items-center gap-3">
                                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-black to-black flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">DR</span>
                                  </div>
                                  <h2 className="text-lg font-medium text-gray-800">
                                    Drop Transformation
                                  </h2>
                                </div>
                              </div>
                              <div className="py-4">
                                {/* Use CreateFormFormik directly for drop transformation */}
                                {dropSchema ? (
                                  <CreateFormFormik
                                    schema={{
                                      ...dropSchema,
                                      initialValues: {
                                        name: 'drop_transformation',
                                        column: [{ column_list: 'column_to_drop_1' }, { column_list: 'column_to_drop_2' }],
                                        dependent_on: dropFormInitialValues.dependent_on || []
                                      }
                                    }}
                                    initialValues={{
                                      name: 'drop_transformation',
                                      column: [{ column_list: 'column_to_drop_1' }, { column_list: 'column_to_drop_2' }],
                                      dependent_on: dropFormInitialValues.dependent_on || []
                                    }}
                                    key={`drop-form-${JSON.stringify(dropFormInitialValues.dependent_on)}`}
                                    onSubmit={handleDropFormSubmit}
                                    nodes={nodes}
                                    sourceColumns={sourceColumns}
                                    onClose={() => setShowDropForm(false)}
                                    pipelineDtl={pipelineJson}
                                    currentNodeId={findNodeIdByType("Drop")}
                                    edges={edges}
                                    isDialog={false}
                                  />
                                ) : (
                                  <div className="flex justify-center items-center p-4">
                                    <div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full"></div>
                                    <span className="ml-2">Loading drop transformation form...</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {showSelectForm && (
                            <div className="mt-4 rounded-lg bg-gray-100">
                              <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 bg-white">
                                <div className="flex items-center gap-3">
                                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-black to-black flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">SL</span>
                                  </div>
                                  <h2 className="text-lg font-medium text-gray-800">
                                    Select Transformation
                                  </h2>
                                </div>
                              </div>
                              <div className="py-4">
                                {/* Use CreateFormFormik directly for select transformation */}
                                {selectSchema ? (
                                  <CreateFormFormik
                                    schema={{
                                      ...selectSchema,
                                      initialValues: {
                                        name: 'select_transformation',
                                        column_list: [{ name: 'column_to_select_1' }, { name: 'column_to_select_2' }],
                                        dependent_on: selectFormInitialValues.dependent_on || []
                                      }
                                    }}
                                    initialValues={{
                                      name: 'select_transformation',
                                      column_list: [{ name: 'column_to_select_1' }, { name: 'column_to_select_2' }],
                                      dependent_on: selectFormInitialValues.dependent_on || []
                                    }}
                                    key={`select-form-${JSON.stringify(selectFormInitialValues.dependent_on)}`}
                                    onSubmit={handleSelectFormSubmit}
                                    nodes={nodes}
                                    sourceColumns={sourceColumns}
                                    onClose={() => setShowSelectForm(false)}
                                    pipelineDtl={pipelineJson}
                                    currentNodeId={findNodeIdByType("Select")}
                                    edges={edges}
                                    isDialog={false}
                                  />
                                ) : (
                                  <div className="flex justify-center items-center p-4">
                                    <div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full"></div>
                                    <span className="ml-2">Loading select transformation form...</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {showSequenceForm && (
                            <div className="mt-4 rounded-lg bg-gray-100">
                              <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 bg-white">
                                <div className="flex items-center gap-3">
                                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-black to-black flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">SQ</span>
                                  </div>
                                  <h2 className="text-lg font-medium text-gray-800"> Sequence Transformation </h2>
                                </div>
                                <button 
                                  onClick={() => setShowSequenceForm(false)}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>
                              <div className="py-4">
                                {sequenceSchema ? (
                                  <CreateFormFormik
                                    schema={{ 
                                      ...sequenceSchema, 
                                      initialValues: sequenceFormInitialValues || { 
                                        name: 'sequence_transformation', 
                                        for_column_name: 'id', 
                                        order_by: [{ column: 'id', order: 'asc' }], 
                                        increment_by: 1,
                                        dependent_on: [] 
                                      } 
                                    }}
                                    initialValues={sequenceFormInitialValues || { 
                                      name: 'sequence_transformation', 
                                      for_column_name: 'id', 
                                      order_by: [{ column: 'id', order: 'asc' }], 
                                      increment_by: 1,
                                      dependent_on: [] 
                                    }}
                                    key={`sequence-form-${JSON.stringify(sequenceFormInitialValues?.dependent_on || [])}-${Date.now()}`}
                                    onSubmit={handleSequenceFormSubmit}
                                    nodes={nodes}
                                    sourceColumns={sourceColumns}
                                    onClose={() => setShowSequenceForm(false)}
                                    pipelineDtl={pipelineJson}
                                    currentNodeId={findNodeIdByType("Sequence")}
                                    edges={edges}
                                    isDialog={false}
                                  />
                                ) : (
                                  <div className="flex justify-center items-center p-4">
                                    <div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full"></div>
                                    <span className="ml-2">Loading sequence transformation form...</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}



                          {showDependencySelection && (
                            <div className="mt-4 rounded-lg bg-gray-100 p-4">
                              <h3 className="text-lg font-medium mb-2">
                                {isMultiSelect && (transformationSubStep.startsWith('join') || transformationSubStep.startsWith('union'))
                                  ? `Select Dependencies (minimum ${minDependencies}, selected: ${selectedDependencies.length})`
                                  : "Select Dependency"}
                              </h3>
                              {isMultiSelect && (transformationSubStep.startsWith('join') || transformationSubStep.startsWith('union')) && (
                                <p className="text-sm text-gray-600 mb-2">
                                  Note: Only Join and Union transformations require multiple dependencies.
                                  Please select at least {minDependencies} dependencies.
                                </p>
                              )}
                              <div className="flex flex-col space-y-2">
                                {dependencyOptions.map((option, index) => (
                                  <button
                                    key={index}
                                    className={`px-4 py-2 ${isMultiSelect && selectedDependencies.includes(option.value)
                                      ? "bg-blue-300 hover:bg-blue-400"
                                      : "bg-blue-100 hover:bg-blue-200"
                                      } rounded-md text-left flex justify-between items-center`}
                                    onClick={() => {
                                      // Only use multi-select for join and union transformations
                                      if (isMultiSelect && (transformationSubStep.startsWith('join') || transformationSubStep.startsWith('union'))) {
                                        // Toggle selection for multi-select
                                        if (selectedDependencies.includes(option.value)) {
                                          // Create a new array without the selected option
                                          const updatedDependencies = selectedDependencies.filter(dep => dep !== option.value);
                                          setSelectedDependencies(updatedDependencies);
                                        } else {
                                          // Create a new array with the selected option added
                                          const updatedDependencies = [...selectedDependencies, option.value];
                                          setSelectedDependencies(updatedDependencies);
                                        }
                                      } else {
                                        // Single selection for all other transformations
                                        handleDependencySelection(option.value);
                                      }
                                    }}
                                  >
                                    <span>{option.label}</span>
                                    {isMultiSelect && selectedDependencies.includes(option.value) && (
                                      <Check className="h-4 w-4" />
                                    )}
                                  </button>
                                ))}
                              </div>

                              {isMultiSelect && (transformationSubStep.startsWith('join') || transformationSubStep.startsWith('union')) && (
                                <div className="mt-4 flex justify-end">
                                  <button
                                    className={`px-4 py-2 rounded-md ${selectedDependencies.length >= minDependencies
                                      ? "bg-green-500 hover:bg-green-600 text-white"
                                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                      }`}
                                    onClick={() => {
                                      if (selectedDependencies.length >= minDependencies) {
                                        handleMultiDependencySelection(selectedDependencies);
                                      }
                                    }}
                                    disabled={selectedDependencies.length < minDependencies}
                                  >
                                    Confirm Selection
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {(showWriterForm || transformationSubStep === 'target_form') && (
                            <div className="mt-4 rounded-lg bg-gray-100">
                              <TargetPopUp
                                isOpen={false} // Use inline mode with Card component
                                onClose={() => {
                                  setShowWriterForm(false);
                                  if (transformationSubStep === 'target_form') {
                                    setTransformationSubStep('select');
                                  }
                                }}
                                initialData={writerFormInitialValues || formInitialValues.writer}
                                onSourceUpdate={handleTargetUpdate}
                                nodeId={`target_${targetName || 'output'}`}
                                source={{
                                  title: targetName || 'output_data',
                                  source: {
                                    name: targetName || 'output_data',
                                    target_type: targetConfig.type || 'File',
                                    file_type: targetConfig.fileFormat || 'CSV',
                                    load_mode: targetConfig.customConfig?.loadMode || 'append',
                                    file_name: `${(targetName || 'output').toLowerCase().replace(/\s+/g, '_')}.csv`,
                                    connection: {
                                      connection_type: targetConfig.connectionType || 'Local',
                                      file_path_prefix: targetConfig.filePath || 'examples/'
                                    }
                                  }
                                }}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Suggestion buttons for guided flow */}
                    {message.role === "assistant" && i === messages.length - 1 && (
                      <div className="mt-3 flex flex-wrap">
                        {mode === 'create' && (
                          <>
                            {/* Description question buttons removed as we're skipping this step */}

                            {/* Description input suggestions removed as we're skipping this step */}

                            {/* Add data source buttons - appears immediately after starting pipeline creation */}
                            {step === 'source' && messages.length === 1 && message.content.includes("start. Add a data source") && (
                              <div className="flex flex-col gap-2 w-full mt-2">
                                <div className="text-sm font-medium text-muted-foreground mb-1">Common Data Sources:</div>
                                <div className="grid grid-cols-2 gap-2">
                                  <SuggestionButton
                                    text="top_sales_regions"
                                    icon={<Database className="h-4 w-4 mr-2" />}
                                    onClick={() => {
                                      const dataSource = "top_sales_regions";
                                      addUserMessage(dataSource);
                                      // Build and update the pipeline template before handling the step
                                      const pipelineTemplate = generatePipelineTemplate();
                                      setPipelineJson(pipelineTemplate);
                                      console.log("Current pipeline template:", pipelineTemplate);
                                      handleSourceStep(dataSource);
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                  <SuggestionButton
                                    text="customer_records"
                                    icon={<Database className="h-4 w-4 mr-2" />}
                                    onClick={() => {
                                      const dataSource = "customer_records";
                                      addUserMessage(dataSource);
                                      // Build and update the pipeline template before handling the step
                                      const pipelineTemplate = generatePipelineTemplate();
                                      setPipelineJson(pipelineTemplate);
                                      console.log("Current pipeline template:", pipelineTemplate);
                                      handleSourceStep(dataSource);
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                </div>
                              </div>
                            )}

                            {step === 'source' && messages.length > 3 && selectedSources.length > 0 && (
                              <>
                                <SuggestionButton
                                  text="Add another source"
                                  icon={<Plus className="h-3 w-3 mr-1" />}
                                  onClick={() => {
                                    addUserMessage("Add another source");
                                    // Build and update the pipeline template before handling the step
                                    const pipelineTemplate = generatePipelineTemplate();
                                    setPipelineJson(pipelineTemplate);
                                    console.log("Current pipeline template:", pipelineTemplate);
                                    handleTransformationsStep("Add another source");
                                  }}
                                  className="justify-start py-2 px-3"
                                />
                                <SuggestionButton
                                  text="Continue to transformations"
                                  icon={<ChevronDown className="h-3 w-3" />}
                                  //tooltip="Proceed to the next step"
                                  onClick={() => {
                                    addUserMessage("Continue to transformations");
                                    // Explicitly set the step to 'transformations' and sub-step to 'select'
                                    setStep('transformations');
                                    setTransformationSubStep('select');
                                    // Build and update the pipeline template before handling the step
                                    const pipelineTemplate = generatePipelineTemplate();
                                    setPipelineJson(pipelineTemplate);
                                    console.log("Current pipeline template:", pipelineTemplate);
                                    handleTransformationsStep("Continue to transformations");
                                  }}
                                  className="justify-start py-2 px-3"
                                />
                              </>
                            )}

                            {step === 'transformations' && (
                              transformationSubStep === 'select' ||
                              messages[messages.length - 1]?.content?.includes("Please select an option from the buttons below") ||
                              messages[messages.length - 1]?.content?.includes("What type of transformation would you like to add") ||
                              messages[messages.length - 1]?.content?.includes("Which transformations would you like to add") ||
                              messages[messages.length - 1]?.content?.includes("Would you like to add another transformation")
                            ) && (
                                <div className="flex flex-col gap-2 w-full mt-2">
                                  <div className="text-sm font-medium text-muted-foreground mb-1">Select Transformation(s):</div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <SuggestionButton
                                      text="Filter Transformation"
                                      icon={<Filter className="h-4 w-4 mr-2" />}
                                      onClick={() => {
                                        addUserMessage("Filter Transformation");
                                        // Build and update the pipeline template before handling the step
                                        const pipelineTemplate = generatePipelineTemplate();
                                        setPipelineJson(pipelineTemplate);
                                        console.log("Current pipeline template:", pipelineTemplate);
                                        handleTransformationsStep("1. Filter Transformation");
                                      }}
                                      className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                    />
                                    <SuggestionButton
                                      text="Schema Transformation"
                                      icon={<Database className="h-4 w-4 mr-2" />}
                                      onClick={() => {
                                        addUserMessage("Schema Transformation");
                                        // Build and update the pipeline template before handling the step
                                        const pipelineTemplate = generatePipelineTemplate();
                                        setPipelineJson(pipelineTemplate);
                                        console.log("Current pipeline template:", pipelineTemplate);
                                        handleTransformationsStep("2. Schema Transformation");
                                      }}
                                      className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                    />
                                    <SuggestionButton
                                      text="Sorter Transformation"
                                      icon={<Layers className="h-4 w-4 mr-2" />}
                                      onClick={() => {
                                        addUserMessage("Sorter Transformation");
                                        // Build and update the pipeline template before handling the step
                                        const pipelineTemplate = generatePipelineTemplate();
                                        setPipelineJson(pipelineTemplate);
                                        console.log("Current pipeline template:", pipelineTemplate);
                                        handleTransformationsStep("Sorter Transformation");
                                      }}
                                      className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                    />
                                    <SuggestionButton
                                      text="Aggregation Transformation"
                                      icon={<Layers className="h-4 w-4 mr-2" />}
                                      onClick={() => {
                                        addUserMessage("Aggregation Transformation");
                                        // Build and update the pipeline template before handling the step
                                        const pipelineTemplate = generatePipelineTemplate();
                                        setPipelineJson(pipelineTemplate);
                                        console.log("Current pipeline template:", pipelineTemplate);
                                        handleTransformationsStep("Aggregation Transformation");
                                      }}
                                      className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                    />
                                    <SuggestionButton
                                      text="Join Transformation"
                                      icon={<Layers className="h-4 w-4 mr-2" />}
                                      onClick={() => {
                                        addUserMessage("Join Transformation");
                                        // Build and update the pipeline template before handling the step
                                        const pipelineTemplate = generatePipelineTemplate();
                                        setPipelineJson(pipelineTemplate);
                                        console.log("Current pipeline template:", pipelineTemplate);
                                        handleTransformationsStep("Join Transformation");
                                      }}
                                      className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                    />
                                    <SuggestionButton
                                      text="Union Transformation"
                                      icon={<Layers className="h-4 w-4 mr-2" />}
                                      onClick={() => {
                                        addUserMessage("Union Transformation");
                                        // Build and update the pipeline template before handling the step
                                        const pipelineTemplate = generatePipelineTemplate();
                                        setPipelineJson(pipelineTemplate);
                                        console.log("Current pipeline template:", pipelineTemplate);
                                        handleTransformationsStep("Union Transformation");
                                      }}
                                      className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                    />
                                    <SuggestionButton
                                      text="Drop Transformation"
                                      icon={<Layers className="h-4 w-4 mr-2" />}
                                      onClick={() => {
                                        addUserMessage("Drop Transformation");
                                        // Build and update the pipeline template before handling the step
                                        const pipelineTemplate = generatePipelineTemplate();
                                        setPipelineJson(pipelineTemplate);
                                        console.log("Current pipeline template:", pipelineTemplate);
                                        handleTransformationsStep("Drop Transformation");
                                      }}
                                      className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                    />
                                    <SuggestionButton
                                      text="Select Transformation"
                                      icon={<Layers className="h-4 w-4 mr-2" />}
                                      onClick={() => {
                                        addUserMessage("Select Transformation");
                                        // Build and update the pipeline template before handling the step
                                        const pipelineTemplate = generatePipelineTemplate();
                                        setPipelineJson(pipelineTemplate);
                                        console.log("Current pipeline template:", pipelineTemplate);
                                        handleTransformationsStep("Select Transformation");
                                      }}
                                      className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                    />
                                    <SuggestionButton
                                      text="Sequence Transformation"
                                      icon={<Layers className="h-4 w-4 mr-2" />}
                                      onClick={() => {
                                        addUserMessage("Sequence Transformation");
                                        // Build and update the pipeline template before handling the step
                                        const pipelineTemplate = generatePipelineTemplate();
                                        setPipelineJson(pipelineTemplate);
                                        console.log("Current pipeline template:", pipelineTemplate);
                                        handleTransformationsStep("Sequence Transformation");
                                      }}
                                      className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                    />
                                    <SuggestionButton
                                      text="Target (Skip Transformations)"
                                      icon={<FileText className="h-4 w-4 mr-2" />}
                                      onClick={() => {
                                        addUserMessage("Target - Skip transformations not needed");
                                        // Build and update the pipeline template before handling the step
                                        const pipelineTemplate = generatePipelineTemplate();
                                        setPipelineJson(pipelineTemplate);
                                        console.log("Current pipeline template:", pipelineTemplate);
                                        handleTransformationsStep("3. Target");
                                      }}
                                      className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                    />
                                  </div>
                                </div>
                              )}


                            {step === 'transformations' && transformationSubStep === 'target_name' && (
                              <div className="flex flex-col gap-2 w-full mt-2">
                                <div className="text-sm font-medium text-muted-foreground mb-1">Suggested Output Names:</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <SuggestionButton
                                    text="processed_data"
                                    icon={<FileText className="h-4 w-4 mr-2" />}
                                    onClick={() => {
                                      // Set target name directly
                                      setTargetName("processed_data");
                                      addUserMessage("processed_data");

                                      // If we have a source with connection config, ask if they want to use the same connection
                                      if (selectedSources.length > 0 && selectedSources[0].connection_config?.custom_metadata?.connection_type) {
                                        setTransformationSubStep('connection_choice');
                                        addAssistantMessage(
                                          `Would you like to use the same connection (${selectedSources[0].connection_config.custom_metadata.connection_type}) ` +
                                          `for your output? This will write the results to a table named "processed_data" in the same database.`
                                        );
                                      } else {
                                        // Skip to summary
                                        setTransformationSubStep('summary');

                                        // Build the final pipeline template
                                        const finalTemplate = generatePipelineTemplate();
                                        setPipelineJson(finalTemplate);

                                        // Show summary and ask for confirmation
                                        addAssistantMessage(
                                          `Great! I've configured your pipeline with the following details:\n\n` +
                                          `- Name: ${pipelineName}\n` +
                                          `- Description: ${pipelineDescription || "(none)"}\n` +
                                          `- Sources: ${selectedSources.map(s => s.data_src_name).join(", ")}\n` +
                                          `- Transformations: ${transformations.filter(t => t !== 'target').join(", ") || "(none)"}\n` +
                                          `- Output: processed_data\n\n` +
                                          `Would you like to create this pipeline now?`
                                        );

                                        setStep('confirm');
                                      }
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                  <SuggestionButton
                                    text="analysis_results"
                                    icon={<FileText className="h-4 w-4 mr-2" />}
                                    onClick={() => {
                                      // Set target name directly
                                      setTargetName("analysis_results");
                                      addUserMessage("analysis_results");

                                      // If we have a source with connection config, ask if they want to use the same connection
                                      if (selectedSources.length > 0 && selectedSources[0].connection_config?.custom_metadata?.connection_type) {
                                        setTransformationSubStep('connection_choice');
                                        addAssistantMessage(
                                          `Would you like to use the same connection (${selectedSources[0].connection_config.custom_metadata.connection_type}) ` +
                                          `for your output? This will write the results to a table named "analysis_results" in the same database.`
                                        );
                                      } else {
                                        // Skip to summary
                                        setTransformationSubStep('summary');

                                        // Build the final pipeline template
                                        const finalTemplate = generatePipelineTemplate();
                                        setPipelineJson(finalTemplate);

                                        // Show summary and ask for confirmation
                                        addAssistantMessage(
                                          `Great! I've configured your pipeline with the following details:\n\n` +
                                          `- Name: ${pipelineName}\n` +
                                          `- Description: ${pipelineDescription || "(none)"}\n` +
                                          `- Sources: ${selectedSources.map(s => s.data_src_name).join(", ")}\n` +
                                          `- Transformations: ${transformations.filter(t => t !== 'target').join(", ") || "(none)"}\n` +
                                          `- Output: analysis_results\n\n` +
                                          `Would you like to create this pipeline now?`
                                        );

                                        setStep('confirm');
                                      }
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                </div>
                              </div>
                            )}

                            {step === 'transformations' && transformationSubStep === 'connection_choice' && (
                              <div className="flex flex-col gap-2 w-full mt-2">
                                <div className="text-sm font-medium text-muted-foreground mb-1">Use Same Database Connection?</div>
                                <div className="grid grid-cols-2 gap-2">
                                  <SuggestionButton
                                    text="Yes, use same database"
                                    icon={<Check className="h-4 w-4 mr-2" />}
                                    onClick={() => {
                                      // Set connection choice directly
                                      setUseSourceConnection(true);
                                      addUserMessage("Yes");

                                      // Move to summary
                                      setTransformationSubStep('summary');

                                      // Build the final pipeline template
                                      const finalTemplate = generatePipelineTemplate();
                                      setPipelineJson(finalTemplate);

                                      // Show summary and ask for confirmation
                                      addAssistantMessage(
                                        `Great! I've configured your pipeline with the following details:\n\n` +
                                        `- Name: ${pipelineName}\n` +
                                        `- Description: ${pipelineDescription || "(none)"}\n` +
                                        `- Sources: ${selectedSources.map(s => s.data_src_name).join(", ")}\n` +
                                        `- Transformations: ${transformations.filter(t => t !== 'target').join(", ") || "(none)"}\n` +
                                        `- Output: ${targetName || "output_data"} (Database)\n\n` +
                                        `Would you like to create this pipeline now?`
                                      );

                                      setStep('confirm');
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                  <SuggestionButton
                                    text="No, use file output"
                                    icon={<X className="h-4 w-4 mr-2" />}
                                    onClick={() => {
                                      // Set connection choice directly
                                      setUseSourceConnection(false);
                                      addUserMessage("No");

                                      // Move to summary
                                      setTransformationSubStep('summary');

                                      // Build the final pipeline template
                                      const finalTemplate = generatePipelineTemplate();
                                      setPipelineJson(finalTemplate);

                                      // Show summary and ask for confirmation
                                      addAssistantMessage(
                                        `Great! I've configured your pipeline with the following details:\n\n` +
                                        `- Name: ${pipelineName}\n` +
                                        `- Description: ${pipelineDescription || "(none)"}\n` +
                                        `- Sources: ${selectedSources.map(s => s.data_src_name).join(", ")}\n` +
                                        `- Transformations: ${transformations.filter(t => t !== 'target').join(", ") || "(none)"}\n` +
                                        `- Output: ${targetName || "output_data"} (File)\n\n` +
                                        `Would you like to create this pipeline now?`
                                      );

                                      setStep('confirm');
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                </div>
                              </div>
                            )}

                            {(step === 'transformations' && transformationSubStep === 'summary') || step === 'confirm' ? (
                              <div className="flex flex-col gap-2 w-full mt-2">
                                <div className="text-sm font-medium text-muted-foreground mb-1">Ready to Create?</div>
                                <div className="grid grid-cols-2 gap-2">
                                  <SuggestionButton
                                    text="Create Pipeline"
                                    icon={<Check className="h-4 w-4 mr-2" />}
                                    variant="default"
                                    onClick={() => {
                                      addUserMessage("Yes, create the pipeline");
                                      handleConfirmStep("Yes");
                                    }}
                                    className="justify-start py-3 px-4"
                                  />
                                  <SuggestionButton
                                    text="Start Over"
                                    icon={<X className="h-4 w-4 mr-2" />}
                                    onClick={() => {
                                      addUserMessage("No, I want to edit it");
                                      handleConfirmStep("No");
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                </div>
                              </div>
                            ) : null}
                          </>
                        )}
                      </div>
                    )}
                  </div>
              ))}
              {/* Loading Indicator */}
              {isProcessing && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 flex items-center justify-center">
                    <AvatarImage 
                      src={imageSrc} 
                      className="w-3.5 h-5 transform -rotate-[40deg]"
                      style={{ objectFit: "contain" }}
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
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}

        {/* Input Area */}
        <div className="flex gap-2 mt-4 flex-shrink-0"> 
          <AIChatInput
            input={input}
            onChange={setInput}
            onSend={handleSend}
            placeholder={mode === 'create' ? "Reply to create your pipeline..." : "Ask about your pipeline..."}
            disabled={isProcessing}
          />
        </div>
      </div>
    </>
  );
};   