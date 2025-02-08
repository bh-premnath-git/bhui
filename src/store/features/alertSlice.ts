import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Alert} from "@/types/alert.types";

interface AlertState {
    data: Alert[]
    loading: boolean
    error: string | null
}

const initialState: AlertState = {
    data: [],
    loading: false,
    error: null,
}

export const alertSlice = createSlice({
    name: 'alerts',
    initialState,
    reducers: {
        setDataAlerts(state, action: PayloadAction<any[]>) {
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
        clearDataAlerts(state) {
            state.data = [];
            state.loading = false;
            state.error = null;
        } 
    }
})

export const {setDataAlerts, setLoading, setError, clearDataAlerts} = alertSlice.actions;
export default alertSlice.reducer;