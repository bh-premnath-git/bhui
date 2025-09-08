import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  displayName: string;
  timezone: string;
  roles: string[];
  greeting: string;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const initialState: UserState = {
  displayName: 'User',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  roles: ['analyst'],
  greeting: getGreeting(),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setDisplayName: (state, action: PayloadAction<string>) => {
      state.displayName = action.payload;
    },
    setTimezone: (state, action: PayloadAction<string>) => {
      state.timezone = action.payload;
    },
    setRoles: (state, action: PayloadAction<string[]>) => {
      state.roles = action.payload;
    },
    updateGreeting: (state) => {
      state.greeting = getGreeting();
    },
  },
});

export const {
  setDisplayName,
  setTimezone,
  setRoles,
  updateGreeting,
} = userSlice.actions;
export default userSlice.reducer;