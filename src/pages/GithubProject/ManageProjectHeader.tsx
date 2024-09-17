import React from 'react';
import { Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CustomAutoComplete from '../../common/CustomAutoComplete';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Redux/store';
import SearchIcon from '@mui/icons-material/Search';
import { getGitProject } from '../../Redux/ProjectSlice';

interface Project {
    bh_project_name: string;
}

interface Pipeline {
    status: string;
}

export default function ManageProjectHeader() {
    const navigate = useNavigate();
    const dispatch=useDispatch();
    const { param, gitProjectList,searchProjectList } = useSelector((state: RootState) => state.projectApi);
    console.log(gitProjectList)

    const pipeLineList: Pipeline[] = [
        { status: 'Active' },
        { status: 'Inactive' },
    ];

    // Validation Schema
    const validationSchema = Yup.object({
        bh_project_name: Yup.string(),
        status: Yup.string().notRequired(),
    });

    // Initial Values
    const initialValues = {
        bh_project_name: '',
        status: null,
    };

    const handleSubmit = (values: any) => {
        console.log('Form values:', values);
        dispatch(getGitProject(values))
        // Handle form submission logic here
    };
    

    const handleNewProject = () => navigate('/All Projects/New');

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting, values }) => (
                <Form>
                    <Stack direction="row" spacing={4} justifyContent="space-between">
                        <Stack direction="row" spacing={4}>
                            <CustomAutoComplete
                                name="bh_project_name"
                                options={searchProjectList}
                                placeholder="Filter by project name"
                                getOptionLabel={(option: any) => option?.bh_project_name}
                            />
                            <CustomAutoComplete
                                name="status"
                                options={pipeLineList}
                                placeholder="Status"
                                getOptionLabel={(option) => option.status}
                            />
                        </Stack>

                        <Stack direction={'row'} spacing={2}>
                            <Button 
                                variant="contained"
                                 type="submit"
                                sx={{
                                    bgcolor: 'black',
                                    color: 'white',
                                    textTransform: 'none',
                                    '&:hover': {
                                        bgcolor: 'black',
                                    },
                                }}
                            >
                                <SearchIcon sx={{ mr: 1, fontSize: 16 }} />
                                Search
                            </Button>
                            <Button onClick={handleNewProject}
                               
                                variant="contained"
                                sx={{
                                    bgcolor: 'black',
                                    color: 'white',
                                    textTransform: 'none',
                                    '&:hover': {
                                        bgcolor: 'black',
                                    },
                                }}
                            >
                                Create New Project
                            </Button>
                        </Stack>
                    </Stack>
                </Form>
            )
            }
        </Formik>
    );
}
