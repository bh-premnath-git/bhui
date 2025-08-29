import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LayoutField } from "@/types/data-catalog/dataCatalog";

interface LayoutFieldState {
    layoutFields: LayoutField[];
    selectedLayoutField: LayoutField | null;
    loading: boolean;
    error: string | null;
}

const initialState: LayoutFieldState = {
    layoutFields: [],
    selectedLayoutField: null,
    loading: false,
    error: null,
};

const layoutFieldSlice = createSlice({
    name: "layoutField",
    initialState,
    reducers: {
        setLayoutFields: (state, action: PayloadAction<LayoutField[]>) => {
            state.layoutFields = action.payload;
        },
        setSelectedLayoutField: (state, action: PayloadAction<LayoutField>) => {
            state.selectedLayoutField = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
    },
});

export const { setLayoutFields, setSelectedLayoutField, setLoading, setError } = layoutFieldSlice.actions;
export default layoutFieldSlice.reducer;
