import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { GitStatus, Commit, ChangedEntity, IGitService } from '@/types/git';

// Git Service Implementation
export class GitService implements IGitService {
  async getStatus(): Promise<GitStatus> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { branch: "dev", uncommittedFiles: 20 };
  }
  
  async getCommitHistory(): Promise<Commit[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { user: "EP", message: "First commit to dev branch", time: "8 months ago" },
      { user: "V", message: "Updates prophecy project metadata", time: "10 months ago" },
      { user: "F6", message: "Merge branch refs/remotes/local/main into dev", time: "10 months ago" },
      { user: "V", message: "Updates selectedInstance format...", time: "10 months ago" },
      { user: "V", message: "[Prophecy] Release version 10", time: "10 months ago" },
    ];
  }
  
  async getChangedEntities(): Promise<ChangedEntity[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [
      { name: "premflow1", type: "Pipeline", status: "New" },
      { name: "demo", type: "Pipeline", status: "Modified", hasWarning: true },
      { name: "farmers_market_tax_report", type: "Report", status: "Unmodified" },
      { name: "user_analytics", type: "Pipeline", status: "Modified" },
      { name: "config.yaml", type: "File", status: "New" },
    ];
  }
  
  async commit(message: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Committed: ${message}`);
  }
  
  async pull(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log("Pulled from origin");
  }
  
  async checkout(branch: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600));
    console.log(`Checked out to: ${branch}`);
  }
}

// Create singleton instance of service
const gitService = new GitService();

interface GitState {
  status: GitStatus | null;
  commitHistory: Commit[];
  changedEntities: ChangedEntity[];
  enabled: boolean;
  statusLoading: boolean;
  commitHistoryLoading: boolean;
  changedEntitiesLoading: boolean;
  operationLoading: boolean;
  error: string | null;
  isCommitModalOpen: boolean;
  commitMessage: string;
}

const initialState: GitState = {
  status: null,
  commitHistory: [],
  changedEntities: [],
  enabled: false,
  statusLoading: false,
  commitHistoryLoading: false,
  changedEntitiesLoading: false,
  operationLoading: false,
  error: null,
  isCommitModalOpen: false,
  commitMessage: '',
};

// Async thunks
export const fetchGitStatus = createAsyncThunk(
  'git/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const status = await gitService.getStatus();
      return status;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch git status');
    }
  }
);

export const fetchCommitHistory = createAsyncThunk(
  'git/fetchCommitHistory',
  async (_, { rejectWithValue }) => {
    try {
      const history = await gitService.getCommitHistory();
      return history;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch commit history');
    }
  }
);

export const fetchChangedEntities = createAsyncThunk(
  'git/fetchChangedEntities',
  async (_, { rejectWithValue }) => {
    try {
      const entities = await gitService.getChangedEntities();
      return entities;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch changed entities');
    }
  }
);

export const commitChanges = createAsyncThunk(
  'git/commit',
  async (message: string, { rejectWithValue, dispatch }) => {
    try {
      await gitService.commit(message);
      // Refresh data after successful commit
      dispatch(fetchGitStatus());
      dispatch(fetchChangedEntities());
      dispatch(fetchCommitHistory());
      return message;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to commit changes');
    }
  }
);

export const pullChanges = createAsyncThunk(
  'git/pull',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await gitService.pull();
      // Refresh data after successful pull
      dispatch(fetchGitStatus());
      dispatch(fetchChangedEntities());
      dispatch(fetchCommitHistory());
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to pull changes');
    }
  }
);

export const checkoutBranch = createAsyncThunk(
  'git/checkout',
  async (branch: string, { rejectWithValue, dispatch }) => {
    try {
      await gitService.checkout(branch);
      // Refresh data after successful checkout
      dispatch(fetchGitStatus());
      dispatch(fetchChangedEntities());
      dispatch(fetchCommitHistory());
      return branch;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to checkout branch');
    }
  }
);

const gitSlice = createSlice({
  name: 'git',
  initialState,
  reducers: {
    setEnabled: (state, action: PayloadAction<boolean>) => {
      state.enabled = action.payload;
    },
    setCommitMessage: (state, action: PayloadAction<string>) => {
      state.commitMessage = action.payload;
    },
    openCommitModal: (state) => {
      state.isCommitModalOpen = true;
    },
    closeCommitModal: (state) => {
      state.isCommitModalOpen = false;
      state.commitMessage = '';
    },
    clearError: (state) => {
      state.error = null;
    },
    refetchAll: (state) => {
      // This will be handled by dispatching multiple thunks from components
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Git Status
      .addCase(fetchGitStatus.pending, (state) => {
        state.statusLoading = true;
        state.error = null;
      })
      .addCase(fetchGitStatus.fulfilled, (state, action) => {
        state.statusLoading = false;
        state.status = action.payload;
      })
      .addCase(fetchGitStatus.rejected, (state, action) => {
        state.statusLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Commit History
      .addCase(fetchCommitHistory.pending, (state) => {
        state.commitHistoryLoading = true;
        state.error = null;
      })
      .addCase(fetchCommitHistory.fulfilled, (state, action) => {
        state.commitHistoryLoading = false;
        state.commitHistory = action.payload;
      })
      .addCase(fetchCommitHistory.rejected, (state, action) => {
        state.commitHistoryLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Changed Entities
      .addCase(fetchChangedEntities.pending, (state) => {
        state.changedEntitiesLoading = true;
        state.error = null;
      })
      .addCase(fetchChangedEntities.fulfilled, (state, action) => {
        state.changedEntitiesLoading = false;
        state.changedEntities = action.payload;
      })
      .addCase(fetchChangedEntities.rejected, (state, action) => {
        state.changedEntitiesLoading = false;
        state.error = action.payload as string;
      })
      
      // Commit Changes
      .addCase(commitChanges.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(commitChanges.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.isCommitModalOpen = false;
        state.commitMessage = '';
        // Add the new commit to history (optimistic update)
        const newCommit: Commit = {
          user: "You",
          message: action.payload,
          time: "just now"
        };
        state.commitHistory = [newCommit, ...state.commitHistory];
      })
      .addCase(commitChanges.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      })
      
      // Pull Changes
      .addCase(pullChanges.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(pullChanges.fulfilled, (state) => {
        state.operationLoading = false;
      })
      .addCase(pullChanges.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      })
      
      // Checkout Branch
      .addCase(checkoutBranch.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(checkoutBranch.fulfilled, (state, action) => {
        state.operationLoading = false;
        // Update current branch in status
        if (state.status) {
          state.status.branch = action.payload;
        }
      })
      .addCase(checkoutBranch.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setEnabled,
  setCommitMessage,
  openCommitModal,
  closeCommitModal,
  clearError,
  refetchAll,
} = gitSlice.actions;

export default gitSlice.reducer;