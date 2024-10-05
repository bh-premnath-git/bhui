// toast.ts
import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface ToastState {
    open: boolean;
    vertical: string;
    horizontal: string;
    message: string;
    color: string; // Add color property
}

const useToast = () => {
    const [state, setState] = React.useState<ToastState>({
        open: false,
        vertical: 'top',
        horizontal: 'center',
        message: '',
        color: '#00b060', // Default color
    });

    const { horizontal, vertical, open, color }:any = state;

    const showToast = (message: string, options = { color: '#00b060' }) => {
        setState({
            ...state,
            ...options,
            open: true,
            message: message,
        });
    };

    const handleClose = () => {
        setState({ ...state, open: false });
    };

    const ToastComponent = () => (
        <Snackbar style={{ marginTop: '5%' }}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical, horizontal }}
            key={vertical + horizontal}
            autoHideDuration={2500}
        >
            <Alert
                onClose={handleClose}
                severity="success"
                variant="filled"
                sx={{ width: '100%', borderRadius: 3, bgcolor: color }}
            >
                {state.message}
            </Alert>
        </Snackbar>
    );

    return [ToastComponent, showToast] as const;
};

export default useToast;
