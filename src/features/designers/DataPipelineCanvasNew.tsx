// src/features/designers/DataPipelineCanvasNew.tsx
import React, { useMemo, useEffect, useState } from 'react';
import { useSidebar } from '@/context/SidebarContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CustomNode } from '@/components/bh-reactflow-comps/builddata/CustomNode';
import { CustomEdge } from '@/components/bh-reactflow-comps/builddata/customEdge';
import { Terminal } from '@/components/bh-reactflow-comps/builddata/LogsPage';
import { FlowControls } from '@/features/designers/pipeline/components/FlowControls';
import KeyboardShortcutsPanel from '@/features/designers/pipeline/components/ShortcutsInfoPanel';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { ComposableCanvas } from '@/components/ComposableCanvas';
import { PipelineForm } from '@/features/designers/pipeline/components/PipelineForm';
import LookupForm from '@/features/designers/pipeline/components/form-sections/LookupForm';
import '@/features/designers/pipeline/styles/PipelineCanvas.css';
import { useParams } from 'react-router-dom';
import RequirementForm from '@/pages/designers/requirements/RequirementForm';
import { useAppSelector } from '@/hooks/useRedux';
import { RootState } from '@/store';
import { ErrorBanner } from '@/components/ui/error-banner';
import OrderPopUp from '@/components/bh-reactflow-comps/builddata/OrderPopUp';
import TargetPopUp from '@/components/bh-reactflow-comps/TargetPopUp';

const DataPipelineCanvasNew: React.FC = ({ isInitializing }: any) => {
  const { isRightAsideOpen, isBottomDrawerOpen, rightAsideWidth } = useSidebar();
  const { id } = useParams();
  const [isLoadingPipeline, setIsLoadingPipeline] = useState(false);
  const [currentPipelineId, setCurrentPipelineId] = useState<string | null>(null);

  // No sidebar width needed since we removed the sidebar
  const { pipelineType } = useAppSelector((state: RootState) => state.buildPipeline);

  const {
    pipelineDtl,
    nodes, 
    edges,
    formStates,
    setNodes,
    setSelectedSchema,
    setFormStates,
    setIsFormOpen,
    setRunDialogOpen,
    setSelectedFormState,
    handleDebugToggle,
    handleRunClick,
    handleSourceUpdate,
    handleSearchResultClick,
    debuggedNodes,
    transformationCounts,
    debuggedNodesList,
    handleZoomIn,
    handleZoomOut,
    handleCenter,
    handleAlignHorizontal,
    handleAlignVertical,
    handleAlignTopLeft,
    handleRun,
    handleStop,
    handleNext,
    isPipelineRunning,
    isCanvasLoading,
    terminalLogs,
    conversionLogs,
    isFormOpen,
    selectedSchema,
    sourceColumns,
    handleDialogClose,
    handleFormSubmit,
    showLogs,
    setShowLogs,
    handleLeavePage,
    showLeavePrompt,
    setShowLeavePrompt,
    fetchPipelineDetails,
    errorBanner,
    setErrorBanner
  } = usePipelineContext();

  // Add resize event handler to force canvas resizing when right aside or bottom drawer opens/closes
  useEffect(() => {
    const handleResize = () => {
      // Force a resize event to make ReactFlow recalculate dimensions
      window.dispatchEvent(new Event('resize'));
    };

    // Trigger resize after a short delay when the layout state changes
    const timer = setTimeout(handleResize, 100);
    // Trigger another resize after a longer delay for smoother transition
    const secondTimer = setTimeout(handleResize, 300);
    const thirdTimer = setTimeout(handleResize, 600);

    // Try to trigger fitView if possible through the context
    if (handleCenter) {
      const fitViewTimer = setTimeout(() => {
        try {
          handleCenter();
          // Make sure nodes are visible when layout changes
          if (nodes.length > 0 && (isRightAsideOpen || isBottomDrawerOpen)) {
            handleCenter();
          }
        } catch (error) {
          console.error('Error calling handleCenter:', error);
        }
      }, 350);

      // Add a second fitView attempt after a longer delay
      const secondFitViewTimer = setTimeout(() => {
        try {
          handleCenter();
        } catch (error) {
          console.error('Error in second fitView attempt:', error);
        }
      }, 800);

      return () => {
        clearTimeout(timer);
        clearTimeout(secondTimer);
        clearTimeout(thirdTimer);
        clearTimeout(fitViewTimer);
        clearTimeout(secondFitViewTimer);
      };
    }

    return () => {
      clearTimeout(timer);
      clearTimeout(secondTimer);
      clearTimeout(thirdTimer);
    };
  }, [isRightAsideOpen, isBottomDrawerOpen, handleCenter, nodes.length]);

  // Listen for RightAside panel resize events
  useEffect(() => {
    const handleRightAsideResize = (e: CustomEvent) => {
      // Force a resize event to make ReactFlow recalculate dimensions
      window.dispatchEvent(new Event('resize'));

      // Try to center the view after a short delay
      if (handleCenter) {
        const timer = setTimeout(() => {
          try {
            handleCenter();
          } catch (error) {
            console.error('Error centering after RightAside resize:', error);
          }
        }, 200);

        return () => clearTimeout(timer);
      }
    };

    // Add event listener for the custom rightAsideResize event
    document.addEventListener('rightAsideResize', handleRightAsideResize as EventListener);

    return () => {
      document.removeEventListener('rightAsideResize', handleRightAsideResize as EventListener);
    };
  }, [handleCenter]);
  useEffect(() => {
    if (id && id !== currentPipelineId) {
      setIsLoadingPipeline(true);
      setCurrentPipelineId(id);

      // Fetch pipeline details
      fetchPipelineDetails().then(() => {
        setIsLoadingPipeline(false);
      })
        .catch((error) => {
          console.error('Error loading pipeline:', error);
          setIsLoadingPipeline(false);
        });
    }
  }, [id]);
  const debuggedNodesSet = useMemo(() => new Set(debuggedNodes), [debuggedNodes]);

  const memoizedNodeTypes = useMemo(() => ({
    custom: (props: any) => (
      <CustomNode
        {...props}
        pipelineDtl={pipelineDtl}
        setNodes={setNodes}
        setSelectedSchema={setSelectedSchema}
        setFormStates={setFormStates}
        setIsFormOpen={setIsFormOpen}
        formStates={formStates}
        setRunDialogOpen={setRunDialogOpen}
        setSelectedFormState={setSelectedFormState}
        onDebugToggle={handleDebugToggle}
        debuggedNodes={debuggedNodesSet}
        handleRunClick={handleRunClick}
        onSourceUpdate={handleSourceUpdate}
        handleSearchResultClick={handleSearchResultClick}
        transformationCounts={transformationCounts}
      />
    )
  }), [
    setNodes,
    setSelectedSchema,
    setFormStates,
    setIsFormOpen,
    formStates,
    setRunDialogOpen,
    setSelectedFormState,
    handleDebugToggle,
    debuggedNodesSet,
    handleSourceUpdate,
    pipelineDtl,
    transformationCounts
  ]);

  const edgeTypes = useMemo(() => ({
    default: (props: any) => (
      <CustomEdge
        {...props}
        transformationCounts={transformationCounts}
        pipelineDtl={pipelineDtl}
        debuggedNodesList={debuggedNodesList}
      />
    )
  }), [transformationCounts, pipelineDtl, debuggedNodesList]);


  const getMainContentStyle = () => {
    let availableWidth = '100%';
    if (isRightAsideOpen) {
      const rightAsidePercentage = rightAsideWidth.match(/\[(\d+)%\]/)?.[1] || '25';
      availableWidth = `calc(100% - ${rightAsidePercentage}%)`;
    }

    return {
      height: '110%',
      width: availableWidth,
      transition: 'all 0.3s ease-in-out'
    };
  };
  return (
    <>
      {pipelineType?.toLowerCase() == "design" ? (<div className={`flex h-full w-full pipeline-container ${isRightAsideOpen ? 'with-right-aside' : ''} ${isBottomDrawerOpen ? 'with-bottom-drawer' : ''}`}>
        
        {errorBanner && (
          <div className="fixed top-20 left-20 right-10 z-50 p-4">
            <ErrorBanner
              title={errorBanner.title}
              description={errorBanner.description}
              onClose={() => setErrorBanner(null)}
            />
          </div>
        )}
        
        <div
          className={`flex-1 relative p-1 transition-all duration-300 ${errorBanner ? 'mt-24' : ''}`}
          style={getMainContentStyle()}>

          <div
            className={`flex-1 relative transition-all duration-300 ${isRightAsideOpen ? 'with-right-panel' : ''} ${isBottomDrawerOpen ? 'with-bottom-drawer-panel' : ''}`}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 auto',
              height: '100%'
            }}>

            <ComposableCanvas
              className={`w-full h-full bg-background transition-all duration-300 reactflow-wrapper ${isRightAsideOpen ? 'with-right-panel-canvas' : ''} ${isBottomDrawerOpen ? 'with-bottom-drawer-canvas' : ''}`}
              type="pipeline"
              nodeTypes={memoizedNodeTypes}
              edgeTypes={edgeTypes}
              renderControls={true}
              controls={
                <div className={`fixed ${isBottomDrawerOpen ? 'bottom-[300px]' : 'bottom-4'} ${isRightAsideOpen ? 'right-[41%]' : 'right-4'} z-[1000] transition-all duration-300`}>
                  <FlowControls
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onCenter={handleCenter}
                    onAlignHorizontal={handleAlignHorizontal}
                    onAlignVertical={handleAlignVertical}
                    onAlignTopLeft={handleAlignTopLeft}
                    handleRunClick={handleRun}
                    onStop={handleStop}
                    onNext={handleNext}
                    isPipelineRunning={isPipelineRunning}
                    isLoading={isCanvasLoading}
                    pipelineConfig={handleRunClick}
                    terminalLogs={terminalLogs}
                    proplesLogs={conversionLogs}
                  />
                </div>}
              loading={isCanvasLoading}
              defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
              minZoom={0.2}
              maxZoom={1.5}
            />
          </div>

          {selectedSchema && selectedSchema.title === 'Lookup' && (
            <Dialog
              open={isFormOpen}
              onOpenChange={handleDialogClose}
              aria-modal="true"
            >
              <DialogContent className="max-w-[60%]">
                <LookupForm
                  onSubmit={handleFormSubmit}
                  initialValues={{
                    ...formStates[selectedSchema?.nodeId],
                    nodeId: selectedSchema?.nodeId
                  }}
                  nodes={nodes}
                  sourceColumns={sourceColumns}
                  formId={selectedSchema?.nodeId}
                  onClose={handleDialogClose}
                  currentNodeId={selectedSchema?.nodeId || ''}
                  edges={edges}
                  isDialog={true}
                />
              </DialogContent>
            </Dialog>
          )}

          {selectedSchema && selectedSchema.title === 'Target' && (() => {
            // Get the actual node data to extract transformationData
            const targetNode = nodes.find(node => node.id === selectedSchema?.nodeId);
            const nodeTransformationData = targetNode?.data?.transformationData || {};
            
            // Combine form states with node transformation data, prioritizing form states
            const formStateData = formStates[selectedSchema?.nodeId] || {};
            const rawInitialValues = {
              ...nodeTransformationData,
              ...formStateData,
              ...selectedSchema.initialValues
            };
            
            console.log('🔧 DataPipelineCanvasNew - Raw Target form data:', {
              selectedSchema,
              targetNode: targetNode?.data,
              nodeTransformationData,
              formStateData,
              rawInitialValues,
              nodeId: selectedSchema?.nodeId
            });
            
            // Properly structure the initial values to ensure connection and file_type are correctly mapped
            const initialValues = {
              ...rawInitialValues,
              // Ensure target structure is properly formed
              target: {
                target_type: rawInitialValues?.target?.target_type || rawInitialValues?.target_type || 'File',
                target_name: rawInitialValues?.target?.target_name || rawInitialValues?.target_name || '',
                table_name: rawInitialValues?.target?.table_name || rawInitialValues?.table_name || '',
                file_name: rawInitialValues?.target?.file_name || rawInitialValues?.file_name || '',
                load_mode: rawInitialValues?.target?.load_mode || rawInitialValues?.load_mode || 'append',
                // Ensure connection is properly structured
                connection: {
                  ...(rawInitialValues?.target?.connection || {}),
                  ...(rawInitialValues?.connection || {}),
                  // Ensure connection_config_id is available
                  connection_config_id: rawInitialValues?.target?.connection?.connection_config_id || 
                                       rawInitialValues?.target?.connection?.id ||
                                       rawInitialValues?.connection?.connection_config_id ||
                                       rawInitialValues?.connection?.id ||
                                       rawInitialValues?.connection_config_id ||
                                       // Handle $ref format by extracting the connection name
                                       (rawInitialValues?.target?.connection?.$ref ? 
                                         rawInitialValues.target.connection.$ref.split('/').pop() : null) ||
                                       (rawInitialValues?.connection?.$ref ? 
                                         rawInitialValues.connection.$ref.split('/').pop() : null)
                }
              },
              // Ensure file_type is at root level for schema resolution and normalize to uppercase
              file_type: (() => {
                const rawFileType = rawInitialValues?.file_type || rawInitialValues?.target?.file_type || 'CSV';
                return typeof rawFileType === 'string' ? rawFileType.toUpperCase() : 'CSV';
              })(),
              // Ensure write_options are properly structured
              write_options: rawInitialValues?.write_options || {
                header: true,
                sep: ",",
                createDisposition: 'CREATE_IF_NEEDED',
                writeMethod: (rawInitialValues?.target?.target_type || rawInitialValues?.target_type) === 'Relational' ? 'direct' : 'APPEND'
              },
              // Add transformation and task_id to ensure proper form structure
              transformation: rawInitialValues?.transformation || 'writer',
              task_id: rawInitialValues?.task_id || selectedSchema?.nodeId || ''
            };
            
            // Structure the source data the way TargetPopUp expects it
            const sourceData = {
              source: {
                // Map the resolved target data to the format TargetPopUp expects
                name: initialValues?.name || '',
                target_type: initialValues?.target?.target_type || 'File',
                target_name: initialValues?.target?.target_name || '',
                table_name: initialValues?.target?.table_name || '',
                file_name: initialValues?.target?.file_name || '',
                load_mode: initialValues?.target?.load_mode || 'append',
                connection: initialValues?.target?.connection || {},
                file_type: initialValues?.file_type || 'CSV'
              },
              transformationData: {
                write_options: initialValues?.write_options
              },
              nodeId: selectedSchema?.nodeId
            };
            
            console.log('🔧 DataPipelineCanvasNew - Processed initial values:', {
              rawInitialValues,
              processedInitialValues: initialValues,
              sourceData,
              connectionDetails: {
                hasTargetConnection: !!initialValues?.target?.connection,
                connectionConfigId: initialValues?.target?.connection?.connection_config_id,
                connectionKeys: initialValues?.target?.connection ? Object.keys(initialValues.target.connection) : [],
                rawConnectionData: initialValues?.target?.connection
              },
              targetTypeCheck: {
                targetType: initialValues?.target?.target_type,
                fileType: initialValues?.file_type,
                transformation: initialValues?.transformation,
                taskId: initialValues?.task_id
              }
            });
            
            return (
              <TargetPopUp
                isOpen={isFormOpen}
                onClose={handleDialogClose}
                source={sourceData}
                initialData={initialValues}
                sourceColumns={sourceColumns}
                onSubmit={handleFormSubmit}
                nodeId={selectedSchema?.nodeId}
              />
            );
          })()}
          
          {selectedSchema && selectedSchema.title === 'Reader' && (() => {
            const sourceData = {
              // Use initialValues from selectedSchema if available, otherwise fallback to formStates
              ...(selectedSchema.initialValues || formStates[selectedSchema?.nodeId] || {}),
              nodeId: selectedSchema?.nodeId
            };
            
            return (
              <OrderPopUp
                isOpen={isFormOpen}
                onClose={handleDialogClose}
                source={sourceData}
                nodeId={selectedSchema.nodeId}  
                initialData={sourceData}
                onSourceUpdate={handleSourceUpdate}
              />
            );
          })()}


          {selectedSchema && selectedSchema.title !== 'Lookup' && selectedSchema.title !== 'Target'&& selectedSchema.title !== 'Reader' && (
            <PipelineForm
              isOpen={isFormOpen}
              onClose={handleDialogClose}
              selectedSchema={selectedSchema}
              initialValues={{
                ...formStates[selectedSchema?.nodeId],
                nodeId: selectedSchema?.nodeId
              }}
              onSubmit={handleFormSubmit}
              currentNodeId={selectedSchema?.nodeId || ''}
            />
          )}

          {/* Leave Prompt Dialog */}
          <Dialog
            open={showLeavePrompt}
            onOpenChange={setShowLeavePrompt}
          >
            <DialogContent>
              <div className="flex flex-col items-center text-center">
                {/* Warning Icon */}
                <div className="mb-4 p-3 rounded-full bg-amber-50">
                  <svg
                    className="w-8 h-8 text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>

                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Unsaved Changes
                </h2>
                <p className="text-gray-600 mb-6">
                  You have unsaved changes in your pipeline. Are you sure you want to leave? All changes will be lost.
                </p>

                <div className="flex gap-3 w-full">
                  <Button onClick={() => setShowLeavePrompt(false)}>
                    Stay
                  </Button>
                  <Button onClick={handleLeavePage}>
                    Leave Page
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Terminal/Logs Component */}
          <Terminal
            isOpen={showLogs}
            onClose={() => setShowLogs(false)}
            title="Pipeline Validation Logs"
            terminalLogs={terminalLogs}
            proplesLogs={conversionLogs}
          />
        </div>
      </div>) : (<>
        <RequirementForm  />
         </>)}
    </>
  );
};

export default React.memo(DataPipelineCanvasNew);