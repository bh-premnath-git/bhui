import React, { useEffect } from 'react';
import { Box, Button, Stack, Typography, Modal, Link } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Form, Formik, useFormik } from 'formik';
import * as Yup from 'yup';
import CustomField from '../../../../common/CustomField';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getGitProject } from '../../../../redux/ProjectSlice';
import { insertPipeline } from '../../../../redux/BuildPipeLineSlice';
import { toast, ToastContainer, ToastPosition } from 'react-toastify';
import { RootState } from '@/store/store';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    // border: '2px solid #000',
    boxShadow: 2,
    p: 4,
};


interface BuildPipeLineCreatePopupProps {
    handleClose: () => void;
    open: boolean;
}

const validationSchema = Yup.object().shape({
    bh_project_id: Yup.string().required('Project is required'),
    git_branch: Yup.string().required('Branch is required'),
    pipeline_name: Yup.string().required('Name is required'),
});

const BuildPipeLineCreatePopup: React.FC<BuildPipeLineCreatePopupProps> = ({ handleClose, open }) => {
    const {gitProjectList } = useSelector((state: RootState) => state.projectApi);
    const dispatch = useDispatch();
    

    const navigate = useNavigate();


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
                        bh_project_id: '',
                        git_branch: '',
                        pipeline_name: ''
                    }}
                    validationSchema={validationSchema}

                    onSubmit={async (values, { setSubmitting }) => {
                        let body: any = values;
                        body.tag = {};
                        var result = await dispatch(insertPipeline(body))
                        console.log(result);
                        if (result && result?.payload) {
                            navigate('/Designer/Build-Data-Pipe-Line');
                            handleClose();
                        } else {
                            toast.success("Success Notification !", {
                                position: 'top-center' as ToastPosition,
                                progress: undefined,
                                isLoading: false,
                                hideProgressBar: true,
                                style: {
                                    marginTop: '50px',
                                    fontWeight: 'bold',
                                    fontSize: '14px' // Adjust the margin-top value as needed
                                },
                            });
                        }
                        setSubmitting(false);
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <Stack direction={'row'} spacing={2}>

                                <Stack className='w-100'>
                                    <CustomField
                                        name="bh_project_id"
                                        label="Project"
                                        controlName="select"
                                        options={gitProjectList}
                                        valueKey="bh_project_id"
                                        labelKey="bh_project_name"
                                        size="small"
                                    />
                                </Stack>
                                <Stack className='w-100'>
                                    <CustomField
                                        name="git_branch"
                                        label="Branch"
                                        controlName="input"
                                        placeholder="Enter branch"
                                        size="small"
                                    />

                                </Stack>
                                <Stack className='w-100'>
                                    <CustomField
                                        name="pipeline_name"
                                        label="Name"
                                        controlName="input"
                                        placeholder="Enter name"
                                        size="small"
                                    />
                                </Stack>

                            </Stack>
                          
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
                            <ToastContainer />
                        </Form>
                    )}
                </Formik>
            </Box>
        </Modal>
    );
};

export default BuildPipeLineCreatePopup;
