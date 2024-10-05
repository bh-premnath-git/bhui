import React from 'react';
import { Modal, Box, Button, TextField, IconButton, InputAdornment, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { Formik, Form, Field } from 'formik';

export default function FilterPopUp({ isOpen, onClose, nodeData }) {
    console.log(nodeData)
    const initialValues = {
        description1: '',
        logic1: '',
        description2: '',
        logic2: ''
    };

    const handleSchemaClick = () => {
        console.log("Schema button clicked");
    };

    const handleSubmit = (values) => {
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
                    <Box component="h5">{nodeData.display}</Box>
                    <Box display="flex" alignItems="center">
                        {/* <Button
                            variant="contained"
                            className='bg-dark'
                            onClick={handleSchemaClick}
                            sx={{
                                alignItems: 'center', textTransform: 'none', '&:hover': {
                                    background: 'linear-gradient(45deg, violet, blue, purple, lightcoral)',
                                    boxShadow: 'none',
                                },
                            }}
                        >
                            <img
                                src="/assets/buildPipeline/hammer.png"
                                alt="Icon"
                                style={{ width: '30px', height: '30px' }}
                            />
                            Generate Description
                        </Button> */}
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
                    maxRows={20 }
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
                {/* <Formik
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                >
                    {({ values, handleChange }) => (
                        <Form>
                            <Box display="flex" justifyContent="space-between" mb={3}>
                                <Box width="48%">
                                    <Box component="p" color="text.secondary">Description</Box>
                                    <Field
                                        as={TextField}
                                        fullWidth
                                        name="description1"
                                        value={values.description1}
                                        onChange={handleChange}
                                        placeholder="Lorem Ipsum is Simply Dummy"
                                        variant="outlined"
                                    />
                                </Box>
                                <Box width="48%" position="relative">
                                    <Box component="p" color="text.secondary">Logic</Box>
                                    <Field
                                        as={TextField}
                                        fullWidth
                                        name="logic1"
                                        value={values.logic1}
                                        onChange={handleChange}
                                        placeholder=""
                                        variant="outlined"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton>
                                                        <EditIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton>
                                                        <AddIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>
                            </Box>

                            <Box display="flex" justifyContent="space-between" mb={3}>
                                <Box width="48%">
                                    <Box component="p" color="text.secondary">Description</Box>
                                    <Field
                                        as={TextField}
                                        fullWidth
                                        name="description2"
                                        value={values.description2}
                                        onChange={handleChange}
                                        placeholder="Lorem Ipsum is Simply Dummy"
                                        variant="outlined"
                                    />
                                </Box>
                                <Box width="48%" position="relative">
                                    <Box component="p" color="text.secondary">Logic</Box>
                                    <Field
                                        as={TextField}
                                        fullWidth
                                        name="logic2"
                                        value={values.logic2}
                                        onChange={handleChange}
                                        placeholder=""
                                        variant="outlined"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton>
                                                        <EditIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton>
                                                        <AddIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>
                            </Box>

                            <Box display="flex" justifyContent="center">
                                <Button sx={{ border: '1px solid black', textTransform: 'none' }} className='mx-2 text-dark' variant="outlined" onClick={onClose}>
                                    Close
                                </Button>
                                <Button sx={{
                                    textTransform: 'none'
                                }} className='mx-2 bg-dark' variant="contained" type="submit">
                                    Save
                                </Button>
                            </Box>
                        </Form>
                    )}
                </Formik> */}
            </Box>
        </Modal>
    );
}
