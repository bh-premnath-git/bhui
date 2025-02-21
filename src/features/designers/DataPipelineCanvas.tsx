import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Connection,
  addEdge,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';

import { useNavigate, useLocation } from 'react-router-dom';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { CustomNode } from '@/components/bh-reactflow-comps/builddata/CustomNode';
import { CustomEdge } from '@/components/bh-reactflow-comps/builddata/customEdge';
import { Terminal } from '@/components/bh-reactflow-comps/builddata/LogsPage';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useForm } from '@/hooks/useForm';
import { FlowControls } from '@/features/designers/pipeline/components/FlowControls';
import NodesPanel from '@/features/designers/pipeline/components/NodesPanel';
import DebugPanel from '@/features/designers/pipeline/components/DebugPanel';
import SearchPanel from '@/features/designers/pipeline/components/SearchPanel';
import ShortcutsInfoPanel from '@/features/designers/pipeline/components/ShortcutsInfoPanel';
import {
  checkConnectionExists,
  checkForCircularDependency,
} from '@/lib/graphUtils';
import { useDispatch, useSelector } from 'react-redux';
import { setUnsavedChanges } from '@/store/slices/designer/features/autoSaveSlice';

const BuildPlayGround: React.FC = () => {
  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    reactFlowInstance,
    debuggedNodes,
    isPipelineRunning,
    transformationCounts,
    pipelineDtl,
    formStates,
    highlightedNodeId,
    conversionLogs,
    terminalLogs,
    showLogs,
    setShowLogs,
    handleSearchResultClick,
    handleNodeUpdate,
    handleSourceUpdate,
    handleNodesChange,
    handleEdgesChange,
    handleRunClick,
    handleNodeForm,
    handleDebugToggle,
    handleRun,
    handleStop,
    handleNext,
    handleLeavePage,
    handleCopy,
    handlePaste,
    handleCut,
    handleUndo,
    handleRedo,
    handleLogsClick,
  } = usePipelineContext();

  const dispatch = useDispatch();
  useAutoSave();
  const { openForm } = useForm();
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const navigate = useNavigate();
  const location = useLocation();
  const saveStatus = useSelector((state: any) => state.autoSave);
  const ctrlDTimeout = useRef<NodeJS.Timeout | null>(null);
  const [showLeavePrompt, setShowLeavePrompt] = useState(false);

  const handleNodeClick = useCallback(
    (node: any, source: any) => {
      if (!node?.ui_properties?.module_name) {
        console.error('Invalid node data');
        return;
      }

      const baseModuleName = node.ui_properties.module_name;

      const existingNodes = nodes.filter((n) =>
        n.data.label.toLowerCase().startsWith(baseModuleName.toLowerCase())
      );

      const nodeNumber = existingNodes.length + 1;
      const nodeLabel =
        existingNodes.length > 0
          ? `${baseModuleName} ${nodeNumber}`
          : baseModuleName;

      const lastNode = nodes[nodes.length - 1];
      const basePosition = lastNode
        ? {
            x: lastNode.position.x + 150,
            y: lastNode.position.y,
          }
        : {
            x: 50,
            y: 100,
          };

      const uniqueId = `${node.ui_properties.module_name}_${Date.now()}`;

      const newNode = {
        id: uniqueId,
        type: 'custom',
        position: basePosition,
        data: {
          label: source?.data_src_name || baseModuleName,
          icon: node.ui_properties.icon,
          ports: node.ui_properties.ports,
          source: source,
          title: source?.data_src_name || nodeLabel,
          onUpdate: (updatedData: any) => handleNodeUpdate(uniqueId, updatedData),
        },
      };

      setNodes((prevNodes) => [...prevNodes, newNode]);
      dispatch(setUnsavedChanges());

      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
      }, 50);
    },
    [nodes, setNodes, reactFlowInstance, dispatch, handleNodeUpdate]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (checkConnectionExists(edges, connection)) {
        return;
      }

      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) return;

      const targetInputs = edges.filter((e) => e.target === connection.target)
        .length;
      const maxInputs = targetNode.data.ports?.maxInputs;

      if (maxInputs !== 'unlimited' && targetInputs >= maxInputs) {
        console.warn('Maximum inputs reached for this node');
        return;
      }

      const isCircular = checkForCircularDependency(
        edges,
        connection.source!,
        connection.target!
      );
      if (isCircular) {
        console.error('Circular dependency detected, connection not added.');
        return;
      }

      setEdges((eds: any) => addEdge(connection, eds));
      handleNodeForm(connection.target!);
    },
    [edges, nodes, setEdges, handleNodeForm]
  );

  const memoizedNodeTypes = useMemo(
    () => ({
      custom: (props: any) => (
        <CustomNode
          {...props}
          pipelineDtl={pipelineDtl}
          setNodes={setNodes}
          openForm={openForm}
          formStates={formStates}
          onDebugToggle={handleDebugToggle}
          debuggedNodes={debuggedNodes}
          handleRunClick={handleRunClick}
          onSourceUpdate={handleSourceUpdate}
          handleSearchResultClick={handleSearchResultClick}
        />
      ),
    }),
    [
      setNodes,
      openForm,
      formStates,
      handleDebugToggle,
      debuggedNodes,
      handleSourceUpdate,
      pipelineDtl,
    ]
  );

  const edgeTypes = useMemo(
    () => ({
      default: (props: any) => (
        <CustomEdge
          {...props}
          transformationCounts={transformationCounts}
          pipelineDtl={pipelineDtl}
        />
      ),
    }),
    [transformationCounts, pipelineDtl]
  );

  const defaultViewport = { x: 0, y: 0, zoom: 0.7 };

  const keyboardShortcuts = [
    { key: 'Ctrl + C', action: 'Copy' },
    { key: 'Ctrl + V', action: 'Paste' },
    { key: 'Ctrl + X', action: 'Cut' },
    { key: 'Ctrl + Z', action: 'Undo' },
    { key: 'Ctrl + Y', action: 'Redo' },
    { key: 'Ctrl + F', action: 'Search' },
    { key: 'Ctrl + D', action: 'Add to Debug List' },
    { key: 'Ctrl + R', action: 'Run Pipeline' },
    { key: 'Ctrl + L', action: 'Open Logs' },
    { key: 'Ctrl + K', action: 'Stop Pipeline' },
    { key: 'Ctrl + N', action: 'Next Step' },
    { key: 'Ctrl + +', action: 'Zoom In' },
    { key: 'Ctrl + -', action: 'Zoom Out' },
  ];

  const handleCenter = useCallback(() => {
    try {
      fitView({ duration: 800, padding: 0.1 });
    } catch (error) {
      console.error('FitView error:', error);
    }
  }, [fitView]);

  const handleZoomIn = useCallback(() => {
    zoomIn({ duration: 800 });
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut({ duration: 800 });
  }, [zoomOut]);

  const handleKeyDown = (event: KeyboardEvent) => {
    const isFormElement =
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLTextAreaElement ||
      document.activeElement instanceof HTMLSelectElement;

    if (!isFormElement) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        handleCopy();
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
        event.preventDefault();
        handlePaste();
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'x') {
        event.preventDefault();
        handleCut();
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        !event.shiftKey &&
        event.key.toLowerCase() === 'z'
      ) {
        event.preventDefault();
        handleUndo();
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key.toLowerCase() === 'y' ||
          (event.shiftKey && event.key.toLowerCase() === 'z'))
      ) {
        event.preventDefault();
        handleRedo();
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        const selectedNodes = nodes.filter((node) => node.selected);
        if (selectedNodes.length > 0) {
          selectedNodes.forEach((node) => {
            handleDebugToggle(node.id, node.data.title);
          });
        } else {
          console.log('Please select nodes to debug');
        }
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        const searchInput =
          document.querySelector<HTMLInputElement>('[data-search-input]');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'r') {
        event.preventDefault();
        handleRun();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        handleLogsClick();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        handleStop();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        handleNext();
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === '+' || event.key === '=')
      ) {
        event.preventDefault();
        handleZoomIn();
      }

      if ((event.ctrlKey || event.metaKey) && event.key === '-') {
        event.preventDefault();
        handleZoomOut();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    nodes,
    handleDebugToggle,
    handleCopy,
    handlePaste,
    handleCut,
    handleUndo,
    handleRedo,
    handleRun,
    handleStop,
    handleNext,
    handleZoomIn,
    handleZoomOut,
    handleLogsClick,
  ]);

  useEffect(() => {
    return () => {
      if (ctrlDTimeout.current) {
        clearTimeout(ctrlDTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus.hasUnsavedChanges]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (saveStatus.hasUnsavedChanges) {
        event.preventDefault();
        setShowLeavePrompt(true);
        window.history.pushState(null, '', location.pathname);
      }
    };
    window.history.pushState(null, '', location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [saveStatus.hasUnsavedChanges, location.pathname]);

  return (
    <div>
      <div className="p-1 ml-8">
        <SearchPanel />
        <div className="absolute bottom-5 left-100 mt-2 z-50">
          <div className="rounded-lg p-2 text-sm">
            <ShortcutsInfoPanel keyboardShortcuts={keyboardShortcuts} />
          </div>
        </div>
        <DebugPanel />
        <NodesPanel />
        <div className="flex justify-center gap-4 mb-4"></div>
        <div style={{ height: '69vh', width: '100%' }}>
          <ReactFlow
            nodes={nodes.map((node) => ({
              ...node,
              selected: node.selected || false,
              style: {
                ...node.style,
                ...(highlightedNodeId === node.id && {
                  background:
                    'linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.1))',
                  boxShadow:
                    '0 0 0 2px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(59, 130, 246, 0.1)',
                  borderRadius: '12px',
                  padding: '4px',
                  zIndex: 1000,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }),
              },
            }))}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            nodeTypes={memoizedNodeTypes}
            edgeTypes={edgeTypes}
            defaultViewport={defaultViewport}
            minZoom={0.2}
            maxZoom={1.5}
            fitView
            fitViewOptions={{ padding: 0.2, maxZoom: 0.8 }}
            proOptions={{ hideAttribution: true }}
          />
        </div>
        <div className="flex items-center justify-end gap-4 mt-4">
          <FlowControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onCenter={handleCenter}
            handleRunClick={handleRun}
            onStop={handleStop}
            onNext={handleNext}
            isPipelineRunning={isPipelineRunning}
            isLoading={false}
            pipelineConfig={handleRunClick}
            terminalLogs={terminalLogs}
            proplesLogs={conversionLogs}
            onAlignHorizontal={() => {}}
            onAlignVertical={() => {}}
          />
        </div>

        {/*
          Replace MUI Dialog with shadcn/ui Dialog
          Manage open state via "open" + "onOpenChange"
        */}
        <Dialog open={showLeavePrompt} onOpenChange={setShowLeavePrompt}>
          <DialogContent className="rounded-lg p-6 max-w-[450px] shadow-md">
            <DialogHeader>
              <DialogTitle>Unsaved Changes</DialogTitle>
              <DialogDescription>
                You have unsaved changes in your pipeline. Are you sure you want
                to leave? All changes will be lost.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center text-center mt-4">
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
            </div>

            <DialogFooter className="space-x-2">
              <Button
                onClick={() => setShowLeavePrompt(false)}
                className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                Stay
              </Button>
              <Button
                variant="destructive"
                onClick={handleLeavePage}
                className="w-full"
              >
                Leave Page
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Terminal
          isOpen={showLogs}
          onClose={() => setShowLogs(false)}
          title="Pipeline Validation Logs"
          terminalLogs={terminalLogs}
          proplesLogs={conversionLogs}
        />
      </div>
    </div>
  );
};

export default React.memo(BuildPlayGround);
