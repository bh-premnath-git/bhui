import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { createProject, searchProject, updateProject } from '../../redux/ProjectSlice';
import ApiService from '../../Services/ApiServices';
import useToast from '../../oldcomponents/teast-service';
import {
    Button, MenuItem, Stack, Chip, Select, FormHelperText,
    TextField, Typography, Box, Modal, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import TagDialog from '../../common/TagDialog';
import CommonDialog from '../../oldcomponents/common-dialoge';

interface GithubProvider {
    id: string;
    dtl_desc: string;
}

interface ProjectFormValues {
    bh_project_id: string | null;
    bh_project_name: string;
    bh_github_provider: string;
    bh_github_username: string;
    bh_github_email: string;
    bh_default_branch: string;
    bh_github_url: string;
    bh_github_token_url: string;
    tags: {
        tagList: { tagKey: string; tagValue: string }[];
    } | null;
}

const textFieldStyle = {
    '& .MuiInputBase-input': { color: 'black', backgroundColor: 'white', height: '30px' },
    '& .MuiInputBase-input:focus': { color: 'black', backgroundColor: 'white' },
    '& .MuiInputLabel-root': { color: 'black' },
    '& .MuiInputLabel-root.Mui-focused': { color: 'black' },
    '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: '#ccc' },
        '&:hover fieldset': { borderColor: '#ccc' },
        '&.Mui-focused fieldset': { borderColor: '#1976d2' },
    },
};

const isEmpty = (obj) => {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

const validationSchema = Yup.object().shape({
    bh_project_name: Yup.string().required('Project Name is required'),
    bh_github_provider: Yup.string().required('GitHub Provider is required'),
    bh_github_username: Yup.string().required('GitHub Username is required'),
    bh_github_email: Yup.string().email('Invalid email').required('GitHub Email is required'),
    bh_github_url: Yup.string().url('Invalid URL').required('GitHub Repository URL is required'),
    bh_github_token_url: Yup.string().required('GitHub Token is required'),
});

function ProjectForm() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { editProjectData, searchProjectList, error, loading } = useAppSelector((state) => state.projectApi);
    const [tags, setTags] = useState<{ tagKey: string; tagValue: string }[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [githubProviderList, setGithubProviderList] = useState<GithubProvider[]>([]);
    const [ToastComponent, showToast] = useToast();
    const [open, setOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [projectJustCreated, setProjectJustCreated] = useState(false);
    const [debouncedProjectName, setDebouncedProjectName] = useState('');
    const [projectExistsModalOpen, setProjectExistsModalOpen] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState<'valid' | 'inValid'>(!isEmpty(editProjectData) ? 'valid' : 'inValid');

    const [initialValue, setInitialValue] = useState<ProjectFormValues>({
        bh_project_id: null,
        bh_project_name: '',
        bh_github_provider: '',
        bh_github_username: '',
        bh_github_email: '',
        bh_default_branch: 'Main',
        bh_github_url: '',
        bh_github_token_url: '',
        tags: { tagList: [] },
    });

    useEffect(() => {
        if (!isEmpty(editProjectData)) {
            setInitialValue({
                bh_project_id: editProjectData.bh_project_id,
                bh_project_name: editProjectData.bh_project_name,
                bh_github_provider: editProjectData.bh_github_provider,
                bh_github_username: editProjectData.bh_github_username,
                bh_github_email: editProjectData.bh_github_email,
                bh_default_branch: editProjectData.bh_default_branch,
                bh_github_url: editProjectData.bh_github_url,
                bh_github_token_url: "",
                tags: { tagList: [] },
            });
            setTags(editProjectData?.tags?.tagList || []);
        }
        const fetchData = async () => {
            try {
                const result = await ApiService('8011', 'get', '/codes_hdr/30');
                setGithubProviderList(result.codes_dtl);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [editProjectData]);

    useEffect(() => {
        setModalOpen(!!error || loading);
    }, [error, loading]);

    const debouncedSearchProject = useCallback(
        debounce((projectName: string) => {
            dispatch(searchProject(projectName));
            setDebouncedProjectName(projectName);
        }, 3000),
        [dispatch]
    );

    const handleProjectNameChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, setFieldValue: (field: string, value: any) => void) => {
        const projectName = e.target.value;
        setFieldValue('bh_project_name', projectName);
        if (projectName.length >= 3) {
            debouncedSearchProject(projectName);
        } else {
            setDebouncedProjectName('');
        }
        setIsTokenValid('inValid');
    };

    useEffect(() => {
        if (debouncedProjectName && searchProjectList && !projectJustCreated) {
            const projectExists = searchProjectList.some(
                (project: any) => project.bh_project_name.toLowerCase() === debouncedProjectName.toLowerCase()
            );
            setProjectExistsModalOpen(projectExists);
        } else {
            setProjectExistsModalOpen(false);
        }
    }, [searchProjectList, debouncedProjectName, projectJustCreated]);

    const handleVerification = async (values: ProjectFormValues) => {
        try {
            const result = await ApiService('8011', 'post', 'bh_project/validate-token/', {
                token: values.bh_github_token_url,
                bh_github_provider: values.bh_github_provider,
            });
            if (result.status >= 200 && result.status < 300) {
                setIsTokenValid('valid');
                showToast('Token Validated Successfully', { color: '#4caf50' });
            } else {
                setIsTokenValid('inValid');
                showToast('Invalid Token, please check your token', { color: '#FF0000' });
            }
        } catch (error) {
            showToast('Error validating token', { color: '#FF0000' });
        }
    };

    const handleCreateProject = async (values: ProjectFormValues) => {
        try {
            const { bh_project_id, ...creationValues } = values;
            const result = await dispatch(createProject(creationValues));
            if (result.payload) {
                setProjectJustCreated(true);
                setOpen(true);
                setTimeout(() => {
                    navigate('/All Projects')
                    setProjectJustCreated(false);
                    setIsTokenValid('inValid');
                }, 5000);
            }
        } catch (error: any) {
            showToast(error.response?.data?.message, { color: '#FF0000' });
            console.error('Error creating project:', error);
        }
    };

    const handleUpdateProject = async (values: ProjectFormValues) => {
        try {
            const response = await dispatch(updateProject(values));
            if (response.payload) {
                setOpen(true);
                setTimeout(() => navigate('/All Projects'), 5000);
            }
        } catch (error: any) {
            showToast(error.response?.data?.message, { color: '#FF0000' });
            console.error('Error updating project:', error);
        }
    };

    const renderTextField = (name: string, label: string, placeholder: string, type: string = 'text') => (
        <Field name={name}>
            {({ field }) => (
                <TextField
                    {...field}
                    fullWidth
                    label={label}
                    placeholder={placeholder}
                    type={type}
                    sx={textFieldStyle}
                    InputProps={{
                        style: { border: '1px solid #ccc', borderRadius: '4px' }
                    }}
                />
            )}
        </Field>
    );

    return (
        <Box maxWidth="md" mx="auto" p={3} position="relative">
            <Formik
                initialValues={initialValue}
                validationSchema={validationSchema}
                enableReinitialize
                onSubmit={(values) => {
                    values.tags = { tagList: tags };
                    if (isEmpty(editProjectData)) {
                        handleCreateProject(values);
                    } else {
                        handleUpdateProject(values);
                    }
                }}
            >
                {({ handleSubmit, isValid, values, setFieldValue, handleChange }) => (
                    <Form onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box width="40%">
                                    <Field name="bh_project_name">
                                        {({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                label="Project Name"
                                                placeholder="Enter Project Name"
                                                InputProps={{
                                                    style: { border: '1px solid #ccc', borderRadius: '4px' }
                                                }}
                                                sx={textFieldStyle}
                                                onChange={(e) => handleProjectNameChange(e, setFieldValue)}
                                            />
                                        )}
                                    </Field>
                                </Box>
                                <Button
                                    variant="contained"
                                    sx={{
                                        bgcolor: 'black',
                                        color: 'white',
                                        '&:hover': {
                                            bgcolor: 'white',
                                            color: 'black',
                                        },
                                        position: 'absolute',
                                        right: 24,
                                        top: 24,
                                        height: '48px',
                                        width: '170px',
                                        fontSize: '0.71rem',
                                        fontWeight: 'bold',
                                    }}
                                    onClick={() => navigate('/All Projects')}
                                >
                                    View All Projects
                                </Button>
                            </Box>

                            <Stack direction="row" spacing={2}>
                                <Box width="25%">
                                    <Field name="bh_github_provider">
                                        {({ field }) => (
                                            <Select
                                                {...field}
                                                fullWidth
                                                displayEmpty
                                                renderValue={(selected) => {
                                                    if (!selected) {
                                                        return <em>Select Git Provider</em>;
                                                    }
                                                    return githubProviderList.find((item) => item.id === selected)?.dtl_desc;
                                                }}
                                                sx={{ border: '1px solid #ccc', borderRadius: '4px' }}
                                            >
                                                <MenuItem value="" disabled>
                                                    <em>Select Git Provider</em>
                                                </MenuItem>
                                                {githubProviderList.map((item) => (
                                                    <MenuItem key={item.id} value={item.id}>
                                                        {item.dtl_desc}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        )}
                                    </Field>
                                    <FormHelperText error>
                                        <ErrorMessage name="bh_github_provider" />
                                    </FormHelperText>
                                </Box>
                                <Box width="25%">
                                    {renderTextField("bh_github_username", "Github Username", "Enter Github Username")}
                                </Box>
                                <Box width="25%">
                                    {renderTextField("bh_github_email", "Github Email", "Enter Github Email", "email")}
                                </Box>
                                <Box width="25%">
                                    {renderTextField("bh_default_branch", "Default Branch", "Main")}
                                </Box>
                            </Stack>

                            <Stack direction="row" spacing={2}>
                                <Box width="50%">
                                    {renderTextField("bh_github_url", "Github Repository URL", "Enter URL", "url")}
                                </Box>
                                <Box width="50%">
                                    <Field name="bh_github_token_url">
                                        {({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                label="Github Token"
                                                placeholder="Enter Github Token"
                                                type="password"
                                                onChange={(e) => {
                                                    setIsTokenValid('inValid');
                                                    field.onChange(e);
                                                }}
                                                InputProps={{
                                                    style: { border: '1px solid #ccc', borderRadius: '4px' }
                                                }}
                                            />
                                        )}
                                    </Field>
                                </Box>
                            </Stack>

                            <Box display="flex" justifyContent="center">
                                <Button
                                    variant="text"
                                    color="primary"
                                    onClick={() => handleVerification(values)}
                                >
                                    Validate Git Credentials
                                </Button>
                            </Box>

                            <Box>
                                <Typography variant="h6" gutterBottom>Add Tags</Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Add one or more tags to easily identify compute instances created by BigHammer.ai in your AWS account (e.g., Key: Product, Value: BigHammer.ai)
                                </Typography>
                                <Stack direction="row" flexWrap="wrap" spacing={1} mb={1}>
                                    {tags.map((tag, index) => (
                                        <Chip
                                            key={index}
                                            label={`${tag.tagKey} >> ${tag.tagValue}`}
                                            onDelete={() => setTags(tags.filter((_, i) => i !== index))}
                                            deleteIcon={<CloseIcon />}
                                        />
                                    ))}
                                </Stack>
                                <Button
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={() => setDialogOpen(true)}
                                >
                                    ADD TAG
                                </Button>
                            </Box>

                            <Box display="flex" justifyContent="center">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    sx={{ width: '200px', height: '40px' }}
                                    disabled={isTokenValid === 'inValid'}
                                >
                                    {isEmpty(editProjectData) ? 'Create Project' : 'Update Project'}
                                </Button>
                            </Box>
                        </Stack>
                    </Form>
                )}
            </Formik>

            <TagDialog
                isOpen={dialogOpen}
                closeDialog={() => setDialogOpen(false)}
                tags={tags}
                setTags={setTags}
            />
            <ToastComponent />
            <CommonDialog
                open={open}
                onClose={() => setOpen(false)}
                title={isEmpty(editProjectData) ? 'Project added successfully' : 'Project updated successfully'}
                description="You'll be automatically redirected to the homepage shortly."
                imageUrl="/assets/success.png"
            />
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                aria-labelledby="error-loading-modal"
                aria-describedby="error-loading-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                }}>
                    {error ? (
                        <>
                            <Typography id="error-loading-modal" variant="h6" component="h2">
                                Error
                            </Typography>
                            <Typography id="error-loading-modal-description" sx={{ mt: 2 }}>
                                {error}
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Typography id="error-loading-modal" variant="h6" component="h2">
                                Loading
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <CircularProgress />
                            </Box>
                        </>
                    )}
                </Box>
            </Modal>
            <Modal
                open={projectExistsModalOpen}
                onClose={() => setProjectExistsModalOpen(false)}
                aria-labelledby="project-exists-modal"
                aria-describedby="project-exists-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                }}>
                    <Typography id="project-exists-modal" variant="h6" component="h2">
                        Project Already Exists
                    </Typography>
                    <Typography id="project-exists-modal-description" sx={{ mt: 2 }}>
                        A project with this name already exists. Please choose a different name.
                    </Typography>
                    <Button onClick={() => setProjectExistsModalOpen(false)} sx={{ mt: 2 }}>
                        Close
                    </Button>
                </Box>
            </Modal>
        </Box>
    );
}

export default ProjectForm;