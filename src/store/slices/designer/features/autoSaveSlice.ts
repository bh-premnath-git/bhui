import { createSlice } from '@reduxjs/toolkit';

interface AutoSaveState {
    isSaving: boolean;
    lastSaved: string | null;
    hasUnsavedChanges: boolean;
    pipeLineNameData: any;
    pipelineJsonData: any;

}

const initialState: AutoSaveState = {
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    pipeLineNameData: {},
    pipelineJsonData: {},

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
        setPipelineJson: (state, action) => {
            state.pipelineJsonData = action.payload;
        },
    },
});

export const { setSaving, setSaved, setSaveError, setUnsavedChanges, setPipeLineName,setPipelineJson } = autoSaveSlice.actions;
export default autoSaveSlice.reducer; 