import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AssetKind = 'table' | 'chart' | 'code' | 'query' | 'result';

interface Asset {
  id: string;
  kind: AssetKind;
  size: number;
  payload: unknown;
  ttl: number;
  lastAccessed: number;
}

interface AssetsState {
  assets: Record<string, Asset>;
  lruOrder: string[];
  maxMemory: number; // in bytes
  currentMemory: number;
}

const initialState: AssetsState = {
  assets: {},
  lruOrder: [],
  maxMemory: 100 * 1024 * 1024, // 100MB
  currentMemory: 0,
};

const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    addAsset: (state, action: PayloadAction<Omit<Asset, 'lastAccessed'>>) => {
      const asset = { ...action.payload, lastAccessed: Date.now() };
      
      // Remove from LRU if exists
      const existingIndex = state.lruOrder.indexOf(asset.id);
      if (existingIndex !== -1) {
        state.lruOrder.splice(existingIndex, 1);
        state.currentMemory -= state.assets[asset.id]?.size || 0;
      }
      
      // Add to front of LRU
      state.lruOrder.unshift(asset.id);
      state.assets[asset.id] = asset;
      state.currentMemory += asset.size;
      
      // Evict if over budget
      while (state.currentMemory > state.maxMemory && state.lruOrder.length > 1) {
        const evictId = state.lruOrder.pop();
        if (evictId && state.assets[evictId]) {
          state.currentMemory -= state.assets[evictId].size;
          delete state.assets[evictId];
        }
      }
    },
    accessAsset: (state, action: PayloadAction<string>) => {
      const assetId = action.payload;
      if (state.assets[assetId]) {
        // Move to front of LRU
        const index = state.lruOrder.indexOf(assetId);
        if (index !== -1) {
          state.lruOrder.splice(index, 1);
          state.lruOrder.unshift(assetId);
        }
        state.assets[assetId].lastAccessed = Date.now();
      }
    },
    removeAsset: (state, action: PayloadAction<string>) => {
      const assetId = action.payload;
      if (state.assets[assetId]) {
        state.currentMemory -= state.assets[assetId].size;
        delete state.assets[assetId];
        const index = state.lruOrder.indexOf(assetId);
        if (index !== -1) {
          state.lruOrder.splice(index, 1);
        }
      }
    },
    evictExpired: (state) => {
      const now = Date.now();
      const expiredIds = Object.entries(state.assets)
        .filter(([_, asset]) => now > asset.ttl)
        .map(([id]) => id);
      
      expiredIds.forEach(id => {
        state.currentMemory -= state.assets[id].size;
        delete state.assets[id];
        const index = state.lruOrder.indexOf(id);
        if (index !== -1) {
          state.lruOrder.splice(index, 1);
        }
      });
    },
    clearAssets: (state) => {
      state.assets = {};
      state.lruOrder = [];
      state.currentMemory = 0;
    },
    clearState: () => initialState,
  },
});

export const {
  addAsset,
  accessAsset,
  removeAsset,
  evictExpired,
  clearAssets,
  clearState,
} = assetsSlice.actions;
export default assetsSlice.reducer;