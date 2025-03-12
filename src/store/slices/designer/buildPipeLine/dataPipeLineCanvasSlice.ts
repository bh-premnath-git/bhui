import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Node, Edge } from 'reactflow';

// Types
interface TransformationCount {
  transformationName: string;
  rowCount: string;
}

interface SearchResult {
  id: string;
  label: string;
  title: string;
}

interface Log {
  timestamp: string;
  message: string;
  level: 'info' | 'error' | 'warning';
}

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  formStates: { [key: string]: any };
  debuggedNodes: Set<string>;
  debuggedNodesList: Array<{ id: string; title: string }>;
  isPipelineRunning: boolean;
  transformationCounts: TransformationCount[];
  isCanvasLoading: boolean;
  searchTerm: string;
  searchResults: SearchResult[];
  highlightedNodeId: string | null;
  conversionLogs: Log[];
  terminalLogs: Log[];
  showLogs: boolean;
  history: { nodes: Node[]; edges: Edge[] }[];
  redoStack: { nodes: Node[]; edges: Edge[] }[];
  copiedNodes: Node[];
  copiedEdges: Edge[];
  copiedFormStates: { [key: string]: any };
  validationErrors: string[];
  selectedNodeId: string | null;
  isFormOpen: boolean;
  sourceColumns: any[];
}

const initialState: CanvasState = {
  nodes: [],
  edges: [],
  formStates: {},
  debuggedNodes: new Set(),
  debuggedNodesList: [],
  isPipelineRunning: false,
  transformationCounts: [],
  isCanvasLoading: false,
  searchTerm: '',
  searchResults: [],
  highlightedNodeId: null,
  conversionLogs: [],
  terminalLogs: [],
  showLogs: false,
  history: [],
  redoStack: [],
  copiedNodes: [],
  copiedEdges: [],
  copiedFormStates: {},
  validationErrors: [],
  selectedNodeId: null,
  isFormOpen: false,
  sourceColumns: [],
};

export const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    // Node management
    setNodes: (state, action: PayloadAction<Node[]>) => {
      state.nodes = action.payload;
    },
    updateNode: (state, action: PayloadAction<{ id: string; data: any }>) => {
      const index = state.nodes.findIndex(node => node.id === action.payload.id);
      if (index !== -1) {
        state.nodes[index] = { ...state.nodes[index], ...action.payload.data };
      }
    },
    deleteNode: (state, action: PayloadAction<string>) => {
      state.nodes = state.nodes.filter(node => node.id !== action.payload);
      delete state.formStates[action.payload];
    },

    // Edge management
    setEdges: (state, action: PayloadAction<Edge[]>) => {
      state.edges = action.payload;
    },
    addEdge: (state, action: PayloadAction<Edge>) => {
      state.edges.push(action.payload);
    },
    deleteEdge: (state, action: PayloadAction<string>) => {
      state.edges = state.edges.filter(edge => edge.id !== action.payload);
    },

    // Form state management
    setFormState: (state, action: PayloadAction<{ nodeId: string; formData: any }>) => {
      state.formStates[action.payload.nodeId] = action.payload.formData;
    },
    clearFormState: (state, action: PayloadAction<string>) => {
      delete state.formStates[action.payload];
    },

    // Debug management
    toggleDebugNode: (state, action: PayloadAction<{ id: string; title: string }>) => {
      const { id, title } = action.payload;
      if (state.debuggedNodes.has(id)) {
        state.debuggedNodes.delete(id);
        state.debuggedNodesList = state.debuggedNodesList.filter(node => node.id !== id);
      } else {
        state.debuggedNodes.add(id);
        state.debuggedNodesList.push({ id, title });
      }
    },
    clearDebugNodes: (state) => {
      state.debuggedNodes = new Set();
      state.debuggedNodesList = [];
    },

    // Pipeline execution state
    setPipelineRunning: (state, action: PayloadAction<boolean>) => {
      state.isPipelineRunning = action.payload;
    },
    setTransformationCounts: (state, action: PayloadAction<TransformationCount[]>) => {
      state.transformationCounts = action.payload;
    },

    // Loading state
    setCanvasLoading: (state, action: PayloadAction<boolean>) => {
      state.isCanvasLoading = action.payload;
    },

    // Search functionality
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      if (!action.payload.trim()) {
        state.searchResults = [];
        state.highlightedNodeId = null;
      }
    },
    setSearchResults: (state, action: PayloadAction<SearchResult[]>) => {
      state.searchResults = action.payload;
    },
    setHighlightedNodeId: (state, action: PayloadAction<string | null>) => {
      state.highlightedNodeId = action.payload;
    },

    // Logs management
    addConversionLog: (state, action: PayloadAction<Log>) => {
      state.conversionLogs.push(action.payload);
    },
    addTerminalLog: (state, action: PayloadAction<Log>) => {
      state.terminalLogs.push(action.payload);
    },
    clearLogs: (state) => {
      state.conversionLogs = [];
      state.terminalLogs = [];
    },
    setShowLogs: (state, action: PayloadAction<boolean>) => {
      state.showLogs = action.payload;
    },

    // History management
    addToHistory: (state, action: PayloadAction<{ nodes: Node[]; edges: Edge[] }>) => {
      state.history.push(action.payload);
      state.redoStack = []; // Clear redo stack when new action is performed
    },
    undo: (state) => {
      if (state.history.length > 0) {
        const lastState = state.history[state.history.length - 1];
        state.redoStack.push({ nodes: state.nodes, edges: state.edges });
        state.nodes = lastState.nodes;
        state.edges = lastState.edges;
        state.history = state.history.slice(0, -1);
      }
    },
    redo: (state) => {
      if (state.redoStack.length > 0) {
        const nextState = state.redoStack[state.redoStack.length - 1];
        state.history.push({ nodes: state.nodes, edges: state.edges });
        state.nodes = nextState.nodes;
        state.edges = nextState.edges;
        state.redoStack = state.redoStack.slice(0, -1);
      }
    },

    // Clipboard operations
    setCopiedItems: (state, action: PayloadAction<{
      nodes: Node[];
      edges: Edge[];
      formStates: { [key: string]: any };
    }>) => {
      state.copiedNodes = action.payload.nodes;
      state.copiedEdges = action.payload.edges;
      state.copiedFormStates = action.payload.formStates;
    },

    // Form dialog management
    setSelectedNodeId: (state, action: PayloadAction<string | null>) => {
      state.selectedNodeId = action.payload;
    },
    setIsFormOpen: (state, action: PayloadAction<boolean>) => {
      state.isFormOpen = action.payload;
    },

    // Source columns management
    setSourceColumns: (state, action: PayloadAction<any[]>) => {
      state.sourceColumns = action.payload;
    },

    // Validation errors
    setValidationErrors: (state, action: PayloadAction<string[]>) => {
      state.validationErrors = action.payload;
    },
    clearValidationErrors: (state) => {
      state.validationErrors = [];
    },

    // Reset state
    resetCanvas: (state) => {
      return { ...initialState };
    },
  },
});

// Export actions
export const {
  setNodes,
  updateNode,
  deleteNode,
  setEdges,
  addEdge,
  deleteEdge,
  setFormState,
  clearFormState,
  toggleDebugNode,
  clearDebugNodes,
  setPipelineRunning,
  setTransformationCounts,
  setCanvasLoading,
  setSearchTerm,
  setSearchResults,
  setHighlightedNodeId,
  addConversionLog,
  addTerminalLog,
  clearLogs,
  setShowLogs,
  addToHistory,
  undo,
  redo,
  setCopiedItems,
  setSelectedNodeId,
  setIsFormOpen,
  setSourceColumns,
  setValidationErrors,
  clearValidationErrors,
  resetCanvas,
} = canvasSlice.actions;

// Export reducer
export default canvasSlice.reducer;