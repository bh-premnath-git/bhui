import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Button, MenuItem, Stack, Chip, Select, FormHelperText } from '@mui/material';
import TagDialog from '../../common/TagDialog';
import CustomField from '../../common/CustomField';
import ApiService from '../../services/ApiServices';
import useToast from '../../components/teast-service';
import * as Yup from 'yup';
import CommonDialog from '../../components/common-dialoge';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { isEmpty } from '../../common/CustomTable';
import { updateProject } from '../../redux/ProjectSlice';

function ProjectForm() {
    const { editProjectData } = useSelector((state: RootState) => state.projectApi);
    const [tags, setTags]: any = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [githubProviderList, setGithubProviderList] = useState([]);
    const [ToastComponent, showToast] = useToast();
    const [open, setOpen] = React.useState(false);
    const [showDialog, setShowDialog] = React.useState(true);
    const [isTokenValid, setIsTokenValid] = React.useState(!isEmpty(editProjectData) ? 'valid' : 'inValid');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [initialValue, setInitialValue] = useState({
        bh_project_id: null,
        bh_project_name: '',
        bh_github_provider: '',
        bh_github_username: '',
        bh_github_email: '',
        bh_default_branch: 'Main',
        bh_github_url: '',
        bh_github_token_url: '',
    })
    const handleTagDelete = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    useEffect(() => {
        if (!isEmpty(editProjectData)) {
            alert()
            setInitialValue({
                bh_project_id: editProjectData.bh_project_id,
                bh_project_name: editProjectData.bh_project_name,
                bh_github_provider: editProjectData.bh_github_provider,
                bh_github_username: editProjectData.bh_github_username,
                bh_github_email: editProjectData.bh_github_email,
                bh_default_branch: editProjectData.bh_default_branch,
                bh_github_url: editProjectData.bh_github_url,
                bh_github_token_url: editProjectData.bh_github_token_url,
            });
            setTags(editProjectData?.tags?.tagList)
        }
        const fetchData = async () => {
            try {
                const result = await ApiService('8011', 'get', '/codes_hdr/30');
                console.log(result.codes_dtl);
                setGithubProviderList(result.codes_dtl);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);
    const handleClose = () => {
        setOpen(false);
    };
    async function handleVerification(values) {
        console.log(values);
        const body = { token: values.bh_github_token_url, bh_github_provider: values.bh_github_provider };
        try {
            const result = await ApiService('8011', 'post', 'bh_project/validate-token/', body);
            console.log(result);
            if (result.status > 400) {
                setIsTokenValid('inValid');
                showToast('Invalid Token, please check your token', { color: '#FF0000' });
            } else if (result.status >= 200 && result.status < 300) {
                setIsTokenValid('valid');
                showToast('Token Validated Successfully', { color: '#4caf50' });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const validationSchema = Yup.object().shape({
        bh_project_id: Yup.string().notRequired(),
        bh_project_name: Yup.string().required('Project Name is required'),
        bh_github_provider: Yup.string().required('GitHub Provider is required'),
        bh_github_username: Yup.string().required('GitHub Username is required'),
        bh_github_email: Yup.string().email('Invalid email').required('GitHub Email is required'),
        bh_github_url: Yup.string().url('Invalid URL').required('GitHub Repository URL is required'),
        bh_github_token_url: Yup.string().required('GitHub Token is required'),
    });

    async function createproject(values) {
        console.log(values)
        try {
            const result = await ApiService('8011', 'post', 'bh_project', values);
            console.log(result);
            if (result) {
                setOpen(true);
                const redirectTimer = setTimeout(() => {
                    navigate('/Home');
                }, 5000);
                return () => clearTimeout(redirectTimer);
            }
        } catch (error: any) {
            showToast(error.response?.data?.message, { color: '#FF0000' });
            console.error('Error fetching data:', error);
        }

    }
    async function updateProjects(values) {
        try {
            var response = await dispatch(updateProject(values))
            console.log(response);
            if (response.payload) {
                setOpen(true);
                const redirectTimer = setTimeout(() => {
                    navigate('/Home');
                }, 5000);
                return () => clearTimeout(redirectTimer);
            }

        } catch (error: any) {
            showToast(error.response?.data?.message, { color: '#FF0000' });
            console.error('Error fetching data:', error);
        }

    }
    function handleChange() {
        setIsTokenValid('inValid');
    }
    return (
        <div className='m-auto'>
            <Stack direction={'row'} justifyContent={'end'} className='my-4 mx-4'>
                <Button variant="contained" sx={{
                    bgcolor: 'black', color: 'white', textTransform: 'none', py: 1, fontFamily: 'Inter', '&:hover': {
                        bgcolor: 'black',
                    }
                }}>
                    View All Projects
                </Button>
            </Stack>
            <div className="w-75 m-auto shadow p-5">
                <Formik
                    initialValues={initialValue}
                    validationSchema={validationSchema}
                    enableReinitialize={true}
                    onSubmit={(values: any) => {
                        values.tags = { tagList: tags };
                        console.log(values);
                        if (isEmpty(editProjectData)) {
                            createproject(values);
                        } else {
                            updateProjects(values)
                            console.log(values);
                        }
                    }}
                >
                    {({ handleSubmit, isSubmitting, isValid, values }) => (
                        <Form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-4">
                                    <CustomField
                                        name="bh_project_name"
                                        label="Project Name"
                                        placeholder="Enter Project Name"
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-3 mt-3">
                                    <label htmlFor="bh_github_provider">GitHub Provider</label>
                                    <Field name="bh_github_provider" size='small' as={Select} className="shadow-sm" fullWidth>
                                        {githubProviderList?.map((item: any) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item.dtl_desc}
                                            </MenuItem>
                                        ))}
                                    </Field>
                                    <div style={{ color: 'red', marginTop: '8px', textAlign: 'start' }}>
                                        <ErrorMessage name='bh_github_provider'>
                                            {msg => <FormHelperText error>{msg}</FormHelperText>}
                                        </ErrorMessage>
                                    </div>
                                </div>

                                <div className="col-3">
                                    <CustomField
                                        name="bh_github_username"
                                        label="GitHub Username"
                                        placeholder="Enter GitHub Username"
                                    />
                                </div>

                                <div className="col-3">
                                    <CustomField
                                        name="bh_github_email"
                                        label="GitHub Email"
                                        placeholder="Enter GitHub Email"
                                        type="email"
                                    />
                                </div>

                                <div className="col-3">
                                    <CustomField
                                        name="bh_default_branch"
                                        label="Default Branch"
                                        placeholder="Default Branch"
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <CustomField
                                        name="bh_github_url"
                                        label="GitHub Repository URL"
                                        placeholder="Enter URL"
                                        type="url"
                                    />
                                </div>

                                <div className="col-6">
                                    <CustomField
                                        onChange={handleChange}
                                        name="bh_github_token_url"
                                        label="GitHub Token"
                                        placeholder="Enter GitHub Token"
                                        type="password"
                                    />
                                </div>
                            </div>
                            <div className='text-center text-info'
                                onClick={() => handleVerification(values)} style={{ textDecoration: 'underline' }}>
                                Validate GitHub Credentials</div>
                            <div className="text-start pt-10 mb-10 col-8">
                                <h6 className="text-start fw-bold">Add Tags</h6>
                                <p className="text-start">
                                    Add one or more tags to easily identify compute instances created by BigHammer.ai in your AWS account (e.g., Key: Product, Value: BigHammer.ai)
                                </p>
                                <div className="d-flex align-items-center">
                                    <Button className='myHeadFont'
                                        sx={{ textTransform: 'none' }}
                                        variant="text"
                                        color="success"
                                        onClick={() => setDialogOpen(true)}
                                    >
                                        + Add Tag
                                    </Button>
                                </div>
                                <div className="mt-2">
                                    {tags.map((tag: any, index) => (
                                        <Chip
                                            key={index}
                                            label={`${tag.tagKey} >> ${tag.tagValue}`}
                                            variant="outlined"
                                            style={{ fontSize: '12px', borderRadius: '5px', background: '#eeeeee', marginLeft: `${index === 0 ? '' : '16px'}` }}
                                            onDelete={() => handleTagDelete(index)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="text-center m-auto">
                                <Button
                                    sx={{ textTransform: 'none' }}
                                    className="ml-8 px-4 bg-dark text-white myFont"
                                    variant="contained"
                                    disabled={!isValid}
                                    type="submit"
                                >
                                    {/* Create Project */}
                                    {isEmpty(editProjectData) ? ' Create Project' : " Update Project"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
                <TagDialog
                    isOpen={dialogOpen}
                    closeDialog={() => setDialogOpen(false)}
                    tags={tags}
                    setTags={setTags}
                />
            </div>
            <ToastComponent />
            {showDialog && (
                <CommonDialog 
                    open={open}
                    onClose={handleClose}
                    title={isEmpty(editProjectData) ? "Project added successfully" : "Project updated successfully"}
                    description="You'll be automatically redirected to homepage shortly."
                    imageUrl="/assets/success.png"
                />
            )}
        </div>
    );
};

export default ProjectForm;
