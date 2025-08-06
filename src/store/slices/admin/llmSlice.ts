import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LLM } from "@/types/admin/llm";

interface LlmState {
  llms: LLM[];
  selectedLlm: LLM | null;
  modelNames: string[];
  loading: boolean;
  error: string | null;
}

const initialState: LlmState = {
  llms: [],
  selectedLlm: null,
  modelNames: [],
  loading: false,
  error: null,
};

const llmSlice = createSlice({
  name: "llms",
  initialState,
  reducers: {
    setLlms: (state, action: PayloadAction<LLM[]>) => {
      state.llms = action.payload;
    },
    setSelectedLlm: (state, action: PayloadAction<LLM | null>) => {
      state.selectedLlm = action.payload;
    },
    // Add this reducer to clear models when provider changes
    clearModelNames: (state) => {
      state.modelNames = [];
    },
    setModelNames: (state, action: PayloadAction<string[]>) => {
      state.modelNames = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { 
  setLlms, 
  setSelectedLlm, 
  clearModelNames, 
  setModelNames, 
  setLoading, 
  setError 
} = llmSlice.actions;

export default llmSlice.reducer;