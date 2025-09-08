import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ViewType = 'welcome' | 'chat';

interface HomeState {
  view: ViewType;
  selectedWidgetId?: string;
}

const initialState: HomeState = {
  view: 'welcome',
  selectedWidgetId: undefined,
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setView: (state, action: PayloadAction<ViewType>) => {
      state.view = action.payload;
    },
    setSelectedWidget: (state, action: PayloadAction<string | undefined>) => {
      state.selectedWidgetId = action.payload;
    },
    switchToChat: (state) => {
      state.view = 'chat';
    },
    clearState: () => initialState,
  },
});

export const { setView, setSelectedWidget, switchToChat, clearState } = homeSlice.actions;
export default homeSlice.reducer;