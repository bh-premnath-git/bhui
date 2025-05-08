
import { Prompt } from '@/types/admin/prompt';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
 

interface PromptsState {
  prompts: Prompt[];
  selectedPrompt: Prompt | null;
  loading: boolean;
  error: string | null;
}
const initialState: PromptsState = {
  prompts: [],
  selectedPrompt: null,
  loading: false,
  error: null,
};
const promptsSlice = createSlice({
  name: 'prompts',
  initialState,
  reducers: {
    setPrompts: (state, action: PayloadAction<Prompt[]>) => {
        state.prompts = action.payload;
    },
    setSelectedPrompt: (state, action: PayloadAction<Prompt | null>) => {
      state.selectedPrompt = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
        state.error = action.payload;
    }
  },
});
export const { setPrompts, setSelectedPrompt, setLoading, setError } = promptsSlice.actions;
export default promptsSlice.reducer;


