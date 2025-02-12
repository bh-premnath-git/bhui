import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/features/user/types';
interface UsersState {
  data: User[];
  singleUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  data: [],
  singleUser: null,
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
    setSingleUser(state, action: PayloadAction<User | null>) {
      state.singleUser = action.payload
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
      state.singleUser = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setUsers, setSingleUser, setLoading, setError, clearUsers } = usersSlice.actions;
export default usersSlice.reducer;
