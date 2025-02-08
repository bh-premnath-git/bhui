import { createSlice } from '@reduxjs/toolkit';

interface AutoSaveState {
    isSaving: boolean;
    lastSaved: string | null;
    hasUnsavedChanges: boolean;
}

const initialState: AutoSaveState = {
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
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
            // Keep hasUnsavedChanges true when there's an error
        },
    },
});

export const { setSaving, setSaved, setSaveError, setUnsavedChanges } = autoSaveSlice.actions;
export default autoSaveSlice.reducer; 