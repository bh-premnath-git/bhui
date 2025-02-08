import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/user.types';

interface UsersState {
  data: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  data: [],
  loading: false,
  error: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<any[]>) {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearUsers(state) {
      state.data = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setUsers, setLoading, setError, clearUsers } = usersSlice.actions;
export default usersSlice.reducer;
