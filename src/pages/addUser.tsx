import React, { useCallback, useEffect, useState } from 'react';
import { Formik, Field, Form, FieldArray, ErrorMessage } from 'formik';
import { TextField, Button, Grid } from '@mui/material';
import * as Yup from 'yup';
import Autocomplete from '@mui/material/Autocomplete';
import { ApiService } from '@/services/apiServices';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomField from '@/common/CustomField';
import { Label } from '@/components/ui/label';
import useToast from '@/oldcomponents/teast-service';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { debounce } from 'lodash';

interface ErrorResponse {
    detail: string;
}

const schema = Yup.object().shape({
    bh_user_first_name: Yup.string().required('First Name is required'),
    bh_user_last_name: Yup.string().required('Last Name is required'),
    user_email_id: Yup.string().email('Invalid email address').required('Email is required'),
    user_status_cd: Yup.string().required('Please select status'),
    user_admin_status_cd: Yup.string().required('Please select admin status'),
    project_details: Yup.array().of(
        Yup.object().shape({
            project: Yup.array().of(Yup.object().required('Project is required')),
            projectRole: Yup.array().of(Yup.object().required('Role is required'))
        })
    )
});

const AddUser = () => {
    const [roles, setRoles] = useState([]);
    const [projects, setProjects] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [open, setOpen] = useState(false);
    const [initialValue, setInitialValue] = useState({
        bh_user_first_name: '',
        bh_user_middle_name: '',
        bh_user_last_name: '',
        user_email_id: '',
        user_status_cd: '701',
        user_admin_status_cd: '2102',
        project_details: [{ project: [], projectRole: [] }]
    });
    const [ToastComponent, showToast] = useToast();
    const [userExistModelOpen, setuserExistModelOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { userDataList } = useAppSelector((state) => state.userApi);
    const [debouncedUserName, setDebouncedUserName] = useState('');
    const userData = location.state?.rowData;

    const debouncedSearchUser = useCallback(
        debounce((firstName: string) => {
            if (firstName.length >= 3) {
                dispatch(userDataList(firstName));
            }
            setDebouncedUserName(firstName);
        }, 500),
        [dispatch]
    );

    const handleFirstName = (
        e: React.ChangeEvent<HTMLInputElement>, 
        setFieldValue: (field: string, value: string) => void
    ) => {
        const firstName = e.target.value;
        setFieldValue('bh_user_first_name', firstName);

        if (firstName.length >= 3) {
            setuserExistModelOpen(false); 
            debouncedSearchUser(firstName);
        } else {
            setDebouncedUserName('');
            setuserExistModelOpen(false);
        }
    };
    
    useEffect(() => {
        if (debouncedUserName && userDataList.length > 0) {
            const userExists = userDataList.some(
                (user: any) =>
                    user.bh_user_first_name?.toLowerCase() === debouncedUserName.toLowerCase()
            );
            if (userExists) {
                setuserExistModelOpen(true);
            }
        }
    }, [userDataList, debouncedUserName]);

    useEffect(() => {

        const fetchData = async () => {
            try {
                const [rolesRes, projectsRes, statusRes] = await Promise.all([
                    ApiService('8011', 'get', '/codes_hdr/1'),
                    ApiService('8011', 'get', '/bh_project/search'),
                    ApiService('8011', 'get', '/codes_hdr/8'),
                    ApiService('8011', 'get', '/codes_hdr/22')
                ]);

                setRoles(rolesRes.codes_dtl);
                setStatusOptions(statusRes.codes_dtl);

                const tempProjects = projectsRes.map((proj: any) => ({
                    value: proj.bh_project_id,
                    label: proj.bh_project_name
                }));
                setProjects(tempProjects);
                if (userData) setInitialValue(userData);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [userData]);


    const addUser = async (values: any, { setSubmitting }: any) => {
        try {            
            if (userData) {
                await ApiService('8011', 'put', `/bh_user/${userData.bh_user_id}`, values);
                navigate(`/admin-console/users`);
            } else {
                createKeyCloakUser(values);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const createKeyCloakUser = async (value: any) => {
        //fetch('http://54.157.234.126:8005/create-user', {
        fetch('http://localhost:8005/create-user', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: {
                    username: `${value?.bh_user_first_name}`,
                    email: value?.user_email_id,
                    password: 'Bighammer@123',
                    first_name: `${value?.bh_user_first_name}`,
                    last_name: `${value?.bh_user_last_name}`,
                    enabled: true,
                    email_verified: true,
                    credentials: [
                        {
                            type: 'password',
                            value: 'password',
                            temporary: false
                        }
                    ]
                },
                token_data: {
                    server_url: 'http://keycloak:8080',
                    username: 'admin',
                    password: 'password',
                    grant_type: 'password',
                    realm_name: 'master',
                    client_id: 'admin-cli'
                }
            })
        })
            .then(response => {
                if (!response.ok) {
                    response.json().then((errorData: ErrorResponse) => {
                        let errorMessage = 'An error occurred while creating the user';
                        
                        if (errorData?.detail) {
                            if (errorData.detail.includes('User exists with same email')) {
                                errorMessage = 'User exists with same email';
                            } else if (errorData.detail.includes('User with this username already exists')) {
                                errorMessage = 'User with this username already exists';
                            }
                        }
                    });
                    return;
                }
                return response.json();
            })
            .then(data => {
                add(value)
            })
            .catch(error => {
            });

    };

    async function add(value: any) {
        const url = '/bh_user'; // Adjust the endpoint URL as needed
        try {
            const result = await ApiService('8011', 'post', url, value);
    
            if (result) {
                handleNext1();
            } else {
                showToast('Failed to create user. Please try again.', { color: '#f44336' });
            }
        } catch (error: any) {
            console.error('Error adding user:', error);
            showToast(error.message || 'An unexpected error occurred.', { color: '#f44336' });
        }
    }
    
    const handleNext1 = () => {
        setOpen(true);
        showToast('User created successfully', { color: '#4caf50' });
        setTimeout(() => {
            navigate('/admin-console/users');
        }, 1000);
    };
    
    return (
            <>
            <div className="container shadow p-4 rounded w-8/12  m-auto mt-4">
                <Formik
                    initialValues={initialValue}
                    validationSchema={schema}
                    onSubmit={addUser}
                    enableReinitialize
                >
                    {({ values, isSubmitting, isValid, dirty, setFieldValue }) => (
                        <Form className='w-full m-auto'>

                            <Grid container justifyContent="flex-end">
                                    <Button
                                        sx={{
                                            backgroundColor: 'black',
                                            color: 'white',
                                            alignItems: 'right',
                                            marginRight:'10px',
                                            '&:hover': {
                                            backgroundColor: 'black',
                                            },
                                        }}
                                        className="mt-1 align-right"
                                        onClick={() => navigate('/admin-console/users')}
                                    >
                                        View All User
                                    </Button>
                             </Grid>
                            <Grid container spacing={2} className='m-1'>
                                <Grid item xs={2.5}>
                                    <CustomField
                                        name="bh_user_first_name"
                                        label="First Name"
                                        placeholder='Enter First name'
                                        required={true}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                        handleFirstName(e, setFieldValue)
                                    }
                                    />
                                </Grid>
                                <Grid item xs={2.5}>
                                    <CustomField
                                        name="bh_user_middle_name"
                                        label="Middle Name"
                                        placeholder='Enter Middle name '
                                    />
                                </Grid>
                                <Grid item xs={2.5}>
                                    <CustomField
                                        required={true}
                                        name="bh_user_last_name"
                                        label="Last Name"
                                        placeholder='Enter Last name '
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} className='m-1'>
                                <Grid item xs={5}>
                                    <CustomField
                                        name="user_email_id"
                                        label="Email"
                                        placeholder='Enter Email ' required={true}
                                    />
                                </Grid>

                            </Grid>

                            <FieldArray name="project_details">
                                {({ push }) => (
                                    <>
                                    {values?.project_details?.map((project: any, index: number) => (
                                        <Grid container spacing={2} key={index} className='m-1'>
                                            <Grid item xs={5}>
                                                <Label className='font-normal'>Project <span style={{ color: 'red' }}>*</span></Label>
                                                <Field
                                                name={`project_details.${index}.project`}
                                                render={({ field, form }: any) => (
                                                    <Autocomplete
                                                    size='small'
                                                    className='shadow-sm rounded'
                                                    multiple
                                                    {...field}
                                                    options={projects.filter((option) => 
                                                        !field.value.some((selected) => selected.label === option.label)
                                                    )}
                                                    getOptionLabel={(option: any) => option.label}
                                                    value={field.value || []}
                                                    onChange={(event, value) =>
                                                        form.setFieldValue(`project_details.${index}.project`, value)
                                                    }
                                                    renderOption={(props, option: any, { selected }) => (
                                                        <li {...props} key={option.label}>
                                                        {option.label}
                                                        </li>
                                                    )}
                                                    renderInput={(params) => (
                                                        <TextField {...params} placeholder="Select Project" variant="outlined" />
                                                    )}
                                                    />
                                                )}
                                                />
                                                <ErrorMessage name={`project_details.${index}.project`} component="div" />
                                            </Grid>
                                            <Grid item xs={5}>
                                                <Label className="font-normal">
                                                Role <span style={{ color: 'red' }}>*</span>
                                                </Label>
                                                <Field
                                                name={`project_details.${index}.projectRole`}
                                                render={({ field, form }: any) => (
                                                    <Autocomplete
                                                    multiple
                                                    size="small"
                                                    className="shadow-sm rounded"
                                                    {...field}
                                                    options={roles.filter((option) => 
                                                        !field.value.some((selected) => selected.dtl_desc === option.dtl_desc)
                                                    )}
                                                    getOptionLabel={(option: any) => option.dtl_desc || ""}
                                                    value={field.value || []}
                                                    onChange={(event, value) => 
                                                        form.setFieldValue(`project_details.${index}.projectRole`, value)
                                                    }
                                                    renderOption={(props, option: any, { selected }) => (
                                                        <li {...props} key={option.dtl_desc}>
                                                            {option.dtl_desc}
                                                        </li>
                                                    )}
                                                    renderInput={(params) => (
                                                        <TextField {...params} placeholder="Select Roles" variant="outlined" />
                                                    )}
                                                    />
                                                )}
                                                />
                                                <ErrorMessage name={`project_details.${index}.projectRole`} component="div" />
                                            </Grid>
                                        </Grid>
                                    ))}
                                    </>
                                )}
                            </FieldArray>

                            <div className='text-center mt-6'>
                                <Button type="submit" variant="contained" sx={{ textTransform: 'none' }} className='bg-black text-white px-5 my-3' disabled={isSubmitting || !(isValid && dirty)}>
                                    Add User
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
                {userExistModelOpen && (
                    <Dialog open={userExistModelOpen} onOpenChange={setuserExistModelOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>User Already Exists</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-center justify-center gap-2 py-2">
                                <p className="text-gray-700">
                                    A user with this first name already exists.
                                </p>
                                <p className="text-gray-700">Please choose a different first name.</p>
                            </div>
                            <DialogFooter>
                                <Button
                                    className='text-white bg-black'
                                    onClick={() => setuserExistModelOpen(false)}
                                >
                                    Close
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
                <ToastComponent />
            </div>
        </>
    );
};

export default AddUser;
