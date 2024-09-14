import { Box, Button, Stack } from '@mui/material';
import { Form, Formik } from 'formik';
import React from 'react';
import CustomField from '../../common/CustomField';

function ManageFlowHeader() {
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
        <Box>
            <Formik
                initialValues={{
                    project: '',
                    branch: '',
                    name: ''
                }}
                onSubmit={(values, { setSubmitting }) => {
                    setSubmitting(false);
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <Stack direction={'row'} spacing={5}>
                            <Stack direction={'row'} spacing={2} sx={{ width: '100%' }}>
                                <Stack sx={{ maxWidth: '180px', width: '100%' }}>
                                    <Stack sx={{ fontWeight: 500, fontSize: 14, mt: 1 }}>Name</Stack>
                                    <CustomField
                                        name="Name"
                                        label="Name"
                                        controlName="select"
                                        options={projectList}
                                        valueKey="value"
                                        labelKey="label"
                                        size="small"
                                    />
                                </Stack>
                                <Stack sx={{ maxWidth: '180px', width: '100%' }}>
                                    <Stack sx={{ fontWeight: 500, fontSize: 14, mt: 1 }}>Schedule</Stack>
                                    <CustomField
                                        name="Schedule"
                                        label="Schedule"
                                        controlName="select"
                                        options={projectList}
                                        valueKey="value"
                                        labelKey="label"
                                        size="small"
                                    />
                                </Stack>
                                <Stack sx={{ maxWidth: '180px', width: '100%' }}>
                                    <Stack sx={{ fontWeight: 500, fontSize: 14, mt: 1 }}>Environment</Stack>
                                    <CustomField
                                        name="Environment"
                                        label="Environment"
                                        controlName="select"
                                        options={projectList}
                                        valueKey="value"
                                        labelKey="label"
                                        size="small"
                                    />
                                </Stack>
                                <Stack sx={{ maxWidth: '180px', width: '100%' }}>
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
                                <Stack sx={{ maxWidth: '180px', width: '100%' }}>
                                    <Stack sx={{ fontWeight: 500, text: 'black', fontSize: 14, mt: 1 }}>Lastupdated</Stack>
                                    <CustomField
                                        name="LastupdatedOn"
                                        label="LastupdatedOn"
                                        controlName="select"
                                        options={projectList}
                                        valueKey="value"
                                        labelKey="label"
                                        size="small"
                                    />
                                </Stack>
                                <Stack sx={{ maxWidth: '180px', width: '100%' }}>
                                    <Stack sx={{ fontWeight: 500, fontSize: 14, mt: 1 }}>Lastexecuted</Stack>
                                    <CustomField
                                        name="LastexecutedOn"
                                        label="LastexecutedOn"
                                        controlName="select"
                                        options={branchList}
                                        valueKey="value"
                                        labelKey="label"
                                        size="small"
                                    />
                                </Stack>
                            </Stack>
                            <Stack sx={{ mt: 1 }}>
                                <Button className='bg-dark'
                                    variant='contained'
                                    sx={{ bgcolor: "black", mt: 4, width: '180px', height: '40px', textTransform: "none" }}  // Adjust button size here
                                >
                                    Create New Flow
                                </Button>
                            </Stack>
                        </Stack>
                    </Form>
                )}
            </Formik>
        </Box>
    );
}

export default ManageFlowHeader;
