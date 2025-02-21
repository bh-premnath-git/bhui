import { createSlice } from '@reduxjs/toolkit';

interface AutoSaveState {
    isSaving: boolean;
    lastSaved: string | null;
    hasUnsavedChanges: boolean;
    pipeLineNameData: any;
}

const initialState: AutoSaveState = {
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    pipeLineNameData: {},
};

const autoSaveSlice = createSlice({
    name: 'autoSave',
    initialState,
    reducers: {
        setSaving: (state) => {
            state.isSaving = true;
        },
        setSaved: (state) => {
            state.isSaving = false;
            state.hasUnsavedChanges = false;
            state.lastSaved = new Date().toISOString();
        },
        setUnsavedChanges: (state) => {
            state.hasUnsavedChanges = true;
            state.isSaving = false;
            state.lastSaved = null;

        },
        setSaveError: (state) => {
            state.isSaving = false;
        },
        setPipeLineName: (state, action) => {
            state.pipeLineNameData = action.payload;
        },
    },
});

export const { setSaving, setSaved, setSaveError, setUnsavedChanges, setPipeLineName } = autoSaveSlice.actions;
export default autoSaveSlice.reducer; 