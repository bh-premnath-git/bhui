import React, { useEffect, useState } from 'react';
import { Box, Button, Stack, Typography, Modal, Link } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Field, Form, Formik, useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer, ToastPosition } from 'react-toastify';
import { RootState } from '@/store/store';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { insertPipeline, setBuildPipeLineDtl } from '@/redux/BuildPipeLineSlice';
import CustomField from '@/common/CustomField';
import { ApiService } from '@/services/apiServices';
import useToast from '@/oldcomponents/teast-service';
import { COLORS } from '@/Utils/constants';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    bgcolor: 'background.paper',
    // border: '2px solid #000',
    boxShadow: 2,
    p: 4,
};


interface BuildPipeLineCreatePopupProps {
    handleClose: () => void;
    open: boolean;
    showToast: any
}

const validationSchema = Yup.object().shape({
    bh_project_id: Yup.string().required('Project is required'),
    git_branch: Yup.string().required('Branch is required'),
    pipeline_name: Yup.string().required('Name is required'),
    notes: Yup.string().notRequired(),
});

const BuildPipeLineCreatePopup: React.FC<BuildPipeLineCreatePopupProps> = ({ open, showToast }: any) => {
    const { gitProjectList } = useSelector((state: RootState) => state.projectApi);
    const [showNotes, setShowNotes] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <>
                loading ...
            </>
        )
    }
    return (
        <Modal
            open={open}
            // onClose={() => handleClose(null)}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >

            <Box sx={style}>
                <div className='text-center'>Please fill in the details below to build a new pipeline</div>
                <div className='text-start mt-2 font-bold'>Create Flow</div>
                <Formik
                    initialValues={{
                        bh_project_id: '',
                        git_branch: '',
                        pipeline_name: '',
                        notes: '',
                    }}
                    validationSchema={validationSchema}

                    onSubmit={async (values, { setSubmitting }) => {
                        let body: any = values;
                        body.tags = {};
                        // setIsLoading(true)
                        const response = await ApiService('8011', 'post', '/pipeline', body);
                        console.log(response);
                        if (response?.error) {
                            showToast(response?.error, { color: COLORS.red });
                        } else {
                            dispatch(setBuildPipeLineDtl(response));
                            showToast("Pipe Line created successfully", { color: COLORS.green });
                            navigate('/BuildPlayGround');
                        }

                        // setSubmitting(false);
                        // if (result && result?.payload) {
                        // await handleClose(result);

                        //     setIsLoading(false)
                        //     await navigate('/BuildPlayGround');
                        // } else {
                        //     toast.success("Success Notification !", {
                        //         position: 'top-center' as ToastPosition,
                        //         progress: undefined,
                        //         hideProgressBar: true,
                        //         style: {
                        //             marginTop: '50px',
                        //             fontWeight: 'bold',
                        //             fontSize: '14px' // Adjust the margin-top value as needed
                        //         },
                        //     });
                        // }
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
                            <div>
                                <button
                                    type="button"
                                    className="text-blue-600 flex items-center"
                                    onClick={() => setShowNotes(!showNotes)}
                                >
                                    Add Notes {showNotes ? <ChevronUp className="ml-1" size={16} /> : <ChevronDown className="ml-1" size={16} />}
                                </button>
                                <div
                                    className={`transition-all duration-300 ${showNotes ? 'opacity-100' : 'opacity-0'}`}
                                    style={{ display: showNotes ? 'block' : 'none' }}
                                >
                                    <Field name="notes">
                                        {({ field }: any) => (
                                            <textarea
                                                className="mt-2 w-full p-2 border rounded-md"
                                                placeholder="Enter notes here..."
                                                rows={3}
                                                {...field}
                                            />
                                        )}
                                    </Field>
                                </div>
                            </div>

                            <Stack direction="row" spacing={2} sx={{ mt: 2 }} justifyContent={'center'}>
                                <Button className='w-25'
                                    variant="outlined"
                                    sx={{ borderColor: 'black', color: 'black', textTransform: 'none' }}
                                // onClick={handleClose}
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
