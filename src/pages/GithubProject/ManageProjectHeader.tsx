import React from 'react';
import { Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CustomAutoComplete from '../../common/CustomAutoComplete';
import { useAppDispatch, useAppSelector } from '../../Redux/hooks';
import { RootState } from '../../Redux/store';
import { getGitProject } from '../../Redux/ProjectSlice';

interface Project {
    bh_project_name: string;
}

interface Pipeline {
    status: string;
}

interface FormValues {
    bh_project_name: string;
    status: string | null;
}

export default function ManageProjectHeader() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { searchProjectList } = useAppSelector((state: RootState) => state.projectApi);

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
    const initialValues: FormValues = {
        bh_project_name: '',
        status: null,
    };

    const handleSubmit = (values: FormValues) => {
        dispatch(getGitProject(values));
    };

    const handleNewProject = () => navigate('/All Projects/New');

    return (
        <Formik<FormValues>
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {() => (
                <Form>
                    <Stack direction="row" spacing={4} justifyContent="space-between">
                        <Stack direction="row" spacing={4}>
                            <CustomAutoComplete
                                name="bh_project_name"
                                options={searchProjectList}
                                placeholder="Filter by project name"
                                getOptionLabel={(option: Project) => option.bh_project_name}
                            />
                            <CustomAutoComplete
                                name="status"
                                options={pipeLineList}
                                placeholder="Status"
                                getOptionLabel={(option: Pipeline) => option.status}
                            />
                        </Stack>

                        <Stack direction="row" spacing={2}>
                            <Button
                                onClick={handleNewProject}
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
            )}
        </Formik>
    );
}
