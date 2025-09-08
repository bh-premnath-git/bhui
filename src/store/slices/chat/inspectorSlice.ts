import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PanelId = 
  | 'filters' 
  | 'fields' 
  | 'chart-options' 
  | 'drilldown' 
  | 'explain' 
  | 'history' 
  | 'selection' 
  | 'annotations' 
  | 'wip-info';

export type PanelStatus = 'hidden' | 'loading' | 'ready' | 'error';

interface InspectorState {
  panelId: PanelId | null;
  status: PanelStatus;
  data: Record<string, unknown>;
  error?: string;
}

const initialState: InspectorState = {
  panelId: null,
  status: 'hidden',
  data: {},
  error: undefined,
};

const inspectorSlice = createSlice({
  name: 'inspector',
  initialState,
  reducers: {
    openPanel: (state, action: PayloadAction<PanelId>) => {
      state.panelId = action.payload;
      state.status = 'loading';
      state.error = undefined;
    },
    closePanel: (state) => {
      state.panelId = null;
      state.status = 'hidden';
      state.data = {};
      state.error = undefined;
    },
    setStatus: (state, action: PayloadAction<PanelStatus>) => {
      state.status = action.payload;
    },
    setData: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.data = action.payload;
      if (state.status === 'loading') {
        state.status = 'ready';
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
    },
    updateData: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.data = { ...state.data, ...action.payload };
    },
    clearError: (state) => {
      state.error = undefined;
      if (state.status === 'error') {
        state.status = 'ready';
      }
    },
    clearState: () => initialState,
  },
});

export const {
  openPanel,
  closePanel,
  setStatus,
  setData,
  setError,
  updateData,
  clearError,
  clearState,
} = inspectorSlice.actions;
export default inspectorSlice.reducer;