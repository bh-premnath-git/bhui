import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ToggleState {
  isToggled: boolean;
}

const initialState: ToggleState = {
  isToggled: false,
};

export const ToggleSlice = createSlice({
  name: 'toggle',
  initialState,
  reducers: {
    toggle: (state) => {
      state.isToggled = !state.isToggled;
    },
  },
});

export const { toggle } = ToggleSlice.actions;

export default ToggleSlice.reducer;
