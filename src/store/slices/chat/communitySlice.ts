import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CommunityProject {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  createdAt: Date;
}

interface CommunityState {
  projects: CommunityProject[];
  featuredProjects: CommunityProject[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CommunityState = {
  projects: [],
  featuredProjects: [],
  isLoading: false,
  error: null,
};

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<CommunityProject[]>) => {
      state.projects = action.payload;
    },
    setFeaturedProjects: (state, action: PayloadAction<CommunityProject[]>) => {
      state.featuredProjects = action.payload;
    },
    addProject: (state, action: PayloadAction<CommunityProject>) => {
      state.projects.unshift(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setProjects, setFeaturedProjects, addProject, setLoading, setError } =
  communitySlice.actions;

export default communitySlice.reducer;
