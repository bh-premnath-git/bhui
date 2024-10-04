import React from 'react';
import { Box, Button, Stack, Typography, Modal, Link } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Form, Formik, useFormik } from 'formik';
import * as Yup from 'yup';
import CustomField from '../../../../common/CustomField';
import { useNavigate } from 'react-router-dom';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};


interface BuildPipeLineCreatePopupProps {
    handleClose: () => void;
    open: boolean;
}

const BuildPipeLineCreatePopup: React.FC<BuildPipeLineCreatePopupProps> = ({ handleClose, open }) => {
    const navigate = useNavigate();
    const projectList = [
        { value: '', label: 'None' },
        { value: '10', label: 'Ten' },
        { value: '20', label: 'Twenty' },
        { value: '30', label: 'Thirty' },
    ];

    const branchList = [
        { value: '', label: 'None' },
        { value: 'A', label: 'Branch A' },
        { value: 'B', label: 'Branch B' },
        { value: 'C', label: 'Branch C' },
    ];


    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-title" variant="h6" component="h2">
                    Please fill in the details below to build a new pipeline.
                </Typography>
                <Typography id="modal-description" sx={{ mt: 2, fontWeight: 'bold' }}>
                    Create Flow
                </Typography>
                <Formik
                    initialValues={{
                        project: '',
                        branch: '',
                        name: ''
                    }}

                    onSubmit={(values, { setSubmitting }) => {
                        // setTimeout(() => {
                            navigate('/Designer/Build-Data-Pipe-Line')
                            // alert(JSON.stringify(values, null, 2));
                            setSubmitting(false);
                        // }, 400);
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <Stack direction={'row'} spacing={2}>

                                <Stack className='w-100'>
                                    <Stack sx={{ fontWeight: 500, fontSize: 14, mt: 1 }}>Project</Stack>
                                    <CustomField
                                        name="project"
                                        label="Project"
                                        controlName="select"
                                        options={projectList}
                                        valueKey="value"
                                        labelKey="label"
                                        size="small"
                                    />
                                </Stack>
                                <Stack className='w-100'>
                                    <Stack sx={{ fontWeight: 500, fontSize: 14, mt: 1 }}>Branch</Stack>
                                    <CustomField
                                        name="branch"
                                        label="Branch"
                                        controlName="select"
                                        options={branchList}
                                        valueKey="value"
                                        labelKey="label"
                                        size="small"
                                    />
                                </Stack>
                                <Stack className='w-100'>
                                    <Stack sx={{ fontWeight: 500, fontSize: 14, mt: 1 }}>Name</Stack>
                                    <CustomField
                                        name="name"
                                        label="Name"
                                        controlName="input"
                                        placeholder="Enter name"
                                        size="small"
                                    />
                                </Stack>

                            </Stack>
                            <Link
                                component="button"
                                variant="body2"
                                onClick={() => {
                                    console.info("I'm a button.");
                                }}
                                sx={{ mt: 2, display: 'inline-flex', alignItems: 'center' }}
                            >
                                Add Notes
                                <ExpandMoreIcon sx={{ ml: 1, color: '#71cce1' }} />
                            </Link>
                            <Stack direction="row" spacing={2} sx={{ mt: 2 }} justifyContent={'center'}>
                                <Button className='w-25'
                                    variant="outlined"
                                    sx={{ borderColor: 'black', color: 'black', textTransform: 'none' }}
                                    onClick={handleClose}
                                >
                                    Close
                                </Button>
                                <Button className='bg-dark'
                                    variant="contained"
                                    sx={{ backgroundColor: 'black', color: 'white', textTransform: 'none' }}
                                    type="submit"
                                >
                                    Create Pipeline
                                </Button>
                            </Stack>
                        </Form>
                    )}
                </Formik>
            </Box>
        </Modal>
    );
};

export default BuildPipeLineCreatePopup;
