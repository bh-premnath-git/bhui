import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LAYOUT_DEFINITIONS, type LayoutType, type LayoutNode } from '@/layouts/layout-model';

interface LayoutState {
  type: LayoutType;
  isTransitioning: boolean;
  node: LayoutNode;
  isRightAsideComponent: boolean;
}

const initialState: LayoutState = {
  type: '1C',
  isTransitioning: false,
  node: LAYOUT_DEFINITIONS['1C'],
  isRightAsideComponent: false,
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    setLayout: (state, action: PayloadAction<LayoutType>) => {
      state.type = action.payload;
      state.node = LAYOUT_DEFINITIONS[action.payload];
    },
    setTransitioning: (state, action: PayloadAction<boolean>) => {
      state.isTransitioning = action.payload;
    },
    setOneColumn: (state) => {
      state.type = '1C';
      state.node = LAYOUT_DEFINITIONS['1C'];
    },
    setTwoColumn: (state) => {
      state.type = '2C';
      state.node = LAYOUT_DEFINITIONS['2C'];
    },
    setThreeColumn: (state) => {
      state.type = '3C';
      state.node = LAYOUT_DEFINITIONS['3C'];
    },
    setTwoRow: (state) => {
      state.type = '2R';
      state.node = LAYOUT_DEFINITIONS['2R'];
    },
    setIsRightAsideComponent: (state, action: PayloadAction<boolean>) => {
      state.isRightAsideComponent = action.payload;
    },
    closePanel: (state) => {
      if (state.type === '3C') {
        state.type = '2C';
        state.node = LAYOUT_DEFINITIONS['2C'];
      }
    },
    clearState: () => initialState,
  },
});

export const {
  setLayout,
  setTransitioning,
  setOneColumn,
  setTwoColumn,
  setThreeColumn,
  setTwoRow,
  setIsRightAsideComponent,
  closePanel,
  clearState,
} = layoutSlice.actions;
export default layoutSlice.reducer;