import React from 'react';
import { Modal, Box, Button, TextField, IconButton, InputAdornment, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { Formik, Form, Field } from 'formik';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function FilterPopUp({ isOpen, onClose }: any) {
    const { selectedOption }: any = useSelector((state: RootState) => state.buildPipeLineApi)
    const initialValues = {
        description1: '',
        logic1: '',
        description2: '',
        logic2: ''
    };

    const handleSchemaClick = () => {
        console.log("Schema button clicked");
    };

    const handleSubmit = (values: any) => {
        console.log("Form Submitted with values: ", values);
        onClose();
    };

    return (
        <Modal open={isOpen} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '50%',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 1,
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box component="h5">{selectedOption?.display}</Box>
                    <Box display="flex" alignItems="center">
                        <IconButton onClick={onClose} sx={{ ml: 2 }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Box>
                <TextField
                    id="outlined-multiline-static"
                    fullWidth
                    size='small'
                    // label="Multiline Text Area"
                    multiline
                    // autoRows
                    minRows={1}
                    maxRows={20}
                    // defaultValue="Default value"
                    placeholder="Enter your condition here"
                />
                <div className="text-center mt-3">
                    <Button onClick={onClose}
                        sx={{ textTransform: 'none' }}
                        className="ml-8 px-4 bg-dark text-white myFont"
                        variant="contained"
                    >
                        Save
                    </Button>
                </div>
               
            </Box>
        </Modal>
    );
}
