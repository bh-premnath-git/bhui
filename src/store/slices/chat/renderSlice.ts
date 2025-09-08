import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type RendererId = 'pipeline-renderer' | 'data-explorer-renderer' | 'wip-placeholder';
export type RenderStatus = 'idle' | 'loading' | 'ready' | 'error';

interface RenderState {
  rendererId: RendererId;
  status: RenderStatus;
  data: Record<string, unknown>;
  error?: string;
  messageStates: Record<string, { rendererId: RendererId; data: Record<string, unknown> }>; // Store state per message
  activeMessageId?: string; // Currently active message
}

const initialState: RenderState = {
  rendererId: 'wip-placeholder',
  status: 'idle',
  data: {},
  error: undefined,
  messageStates: {},
  activeMessageId: undefined,
};

const renderSlice = createSlice({
  name: 'render',
  initialState,
  reducers: {
    setRenderer: (state, action: PayloadAction<RendererId>) => {
      state.rendererId = action.payload;
      // Don't automatically set to idle - let the calling code control the status
      state.error = undefined;
    },
    setStatus: (state, action: PayloadAction<RenderStatus>) => {
      state.status = action.payload;
    },
    setData: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.data = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
    },
    updateData: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.data = { ...state.data, ...action.payload };
      // Store current state for active message if we have one
      if (state.activeMessageId) {
        state.messageStates[state.activeMessageId] = {
          rendererId: state.rendererId,
          data: { ...state.data }
        };
        console.log('Stored state for message:', state.activeMessageId, {
          rendererId: state.rendererId,
          data: state.data
        });
      }
    },
    setActiveMessage: (state, action: PayloadAction<string>) => {
      const messageId = action.payload;
      state.activeMessageId = messageId;
      
      // Restore state for this message if it exists
      const messageState = state.messageStates[messageId];
      console.log('Attempting to restore message:', messageId, 'found state:', messageState);
      
      if (messageState) {
        state.rendererId = messageState.rendererId;
        state.data = { ...messageState.data };
        console.log('Restored state for message:', messageId, {
          rendererId: state.rendererId,
          data: state.data
        });
      } else {
        console.log('No stored state found for message:', messageId);
      }
    },
    clearError: (state) => {
      state.error = undefined;
      if (state.status === 'error') {
        state.status = 'idle';
      }
    },
    clearState: () => initialState,
  },
});

export const {
  setRenderer,
  setStatus,
  setData,
  setError,
  updateData,
  setActiveMessage,
  clearError,
  clearState,
} = renderSlice.actions;
export default renderSlice.reducer;