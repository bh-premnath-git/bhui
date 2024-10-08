import React, { useEffect, useState } from 'react';
import { Formik, Field, Form, FieldArray, ErrorMessage } from 'formik';
import { TextField, Button, Grid, Typography, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import * as Yup from 'yup';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import ApiService from '@/Services/ApiServices';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomField from '@/common/CustomField';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/Utils/constants';
import { IoAddCircle } from 'react-icons/io5';
import { notification } from 'antd';
import CommonDialog from '@/oldcomponents/common-dialoge';

const schema = Yup.object().shape({
    bh_user_first_name: Yup.string().required('First Name is required'),
    bh_user_last_name: Yup.string().required('Last Name is required'),
    user_email_id: Yup.string().email('Invalid email address').required('Email is required'),
    user_status_cd: Yup.string().required('Please select status'),
    user_admin_status_cd: Yup.string().required('Please select admin status'),
    project_details: Yup.array().of(
        Yup.object().shape({
            project: Yup.object().required('Project is required'),
            projectRole: Yup.array().of(Yup.object().required('Role is required')),
        })
    )
});

const AddUser = () => {
    const [roles, setRoles] = useState([]);
    const [projects, setProjects] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [adminUsers, setAdminUsers] = useState([]);
    const [selectedOption, setSelectedOption] = useState('Enable');
	const [open, setOpen] = useState(false);
	const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [initialValue, setInitialValue] = useState({
        bh_user_first_name: '',
        bh_user_middle_name: '',
        bh_user_last_name: '',
        user_email_id: '',
        user_status_cd: '601',
        user_admin_status_cd: '2102',
        project_details: [{ project: null, projectRole: [] }]
    });

    const navigate = useNavigate();
    const location = useLocation();
    const userData = location.state?.rowData;

    useEffect(() => {

        const fetchData = async () => {
            try {
                const [rolesRes, projectsRes, statusRes, adminUsersRes] = await Promise.all([
                    ApiService('8011', 'get', '/codes_hdr/1'),
                    ApiService('8011', 'get', '/bh_project/search'),
                    ApiService('8011', 'get', '/codes_hdr/7'),
                    ApiService('8011', 'get', '/codes_hdr/22')
                ]);

                setRoles(rolesRes.codes_dtl);
                setStatusOptions(statusRes.codes_dtl);
                setAdminUsers(adminUsersRes.codes_dtl);

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
                navigate(`/AllUsers`);
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
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				add(value)
				notification.success({
					message: 'User creation successful',
					duration: 3, // Duration in seconds
					placement: 'bottomRight', // Position of the snack bar
				});
			})
			.catch(error => {
			});

        // Create KeyCloak user logic here
    };
    async function add(value:any) {
		const url = '/bh_user'; // Adjust the endpoint URL as needed
		const result = await ApiService('8011', 'post', url, value);

		if (result) {
			handleNext1();
		}
	}
    const handleNext1 = () => {
		toggleSuccessDialog();
		setOpen(true);
		setTimeout(() => {
            navigate("/AllUsers");
		}, 4000);
	};
    const toggleSuccessDialog = () => {
		setShowSuccessDialog(!showSuccessDialog);
	};
    return (
        <div className="shadow p-4 rounded w-10/12 m-auto h-5/6">
            <Formik
                initialValues={initialValue}
                validationSchema={schema}
                onSubmit={addUser}
                enableReinitialize
            >
                {({ values, isSubmitting, isValid, dirty }) => (
                    <Form className='w-10/12 m-auto'>

                        <div className="text-center">
                            <Label className='font-normal text-md '> Fill in the details below to add a new user.</Label>

                        </div>
                        <Grid container spacing={2} className='m-1'>
                            <Grid item xs={2.5}>
                                <CustomField
                                    name="bh_user_first_name"
                                    label="First Name"
                                    placeholder='Enter First name'
                                    required={true}
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
                            <Grid item xs={6}>
                                <CustomField
                                    name="user_email_id"
                                    label="Email"
                                    placeholder='Enter Email ' required={true}
                                />
                            </Grid>

                        </Grid>



                        <Grid container spacing={2} className='m-1'>
                            <Grid item xs={6}>
                                <Label className='font-normal'>Status <span style={{ color: 'red' }}>*</span></Label>
                                <Field name="user_status_cd">
                                    {({ field }: any) => (
                                        <RadioGroup {...field} row>
                                            {statusOptions.map((option: any) => (
                                                <FormControlLabel
                                                    key={option.id}
                                                    value={option.id}
                                                    control={<Radio sx={{
                                                        '&.Mui-checked': { color: COLORS.green, },
                                                    }} />}
                                                    label={option.dtl_desc}
                                                    onChange={() => setSelectedOption(option.dtl_desc)}
                                                />
                                            ))}
                                        </RadioGroup>
                                    )}
                                </Field>
                            </Grid>

                            <Grid item xs={6}>
                                <Label className='font-normal'>Admin User <span style={{ color: 'red' }}>*</span></Label>
                                <Field name="user_admin_status_cd">
                                    {({ field }: any) => (
                                        <RadioGroup {...field} row>
                                            {adminUsers.map((option: any) => (
                                                <FormControlLabel 
                                                    key={option.id}
                                                    value={option.id}
                                                    control={<Radio sx={{
                                                        '&.Mui-checked': { color: COLORS.green, },
                                                    }} />} label={option.dtl_desc}
                                                />
                                            ))}
                                        </RadioGroup>
                                    )}
                                </Field>
                            </Grid>
                        </Grid>

                        <FieldArray name="project_details">
                            {({ push }) => (
                                <>
                                    {values?.project_details?.map((project: any, index: number) => (
                                        <Grid container spacing={2} key={index} className='m-1'>
                                            <Grid item xs={6}>
                                                <Label className='font-normal'>Project {index + 1} <span style={{ color: 'red' }}>*</span></Label>

                                                <Field
                                                    name={`project_details.${index}.project`}
                                                    render={({ field, form }: any) => (
                                                        <Autocomplete size='small' className='shadow-sm rounded'
                                                            {...field}
                                                            options={projects}
                                                            getOptionLabel={(option: any) => option.label}
                                                            onChange={(event, value) =>
                                                                form.setFieldValue(`project_details.${index}.project`, value)
                                                            }
                                                            renderInput={(params) => (
                                                                <TextField {...params} placeholder="Select Project" variant="outlined" />
                                                            )}
                                                        />
                                                    )}
                                                />
                                                <ErrorMessage name={`project_details.${index}.project`} component="div" />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Label className='font-normal'>Project Role <span style={{ color: 'red' }}>*</span></Label>

                                                <Field
                                                    name={`project_details.${index}.projectRole`}
                                                    render={({ field, form }: any) => (
                                                        <Autocomplete size='small' className='shadow-sm rounded'
                                                            {...field}
                                                            multiple
                                                            options={roles}
                                                            getOptionLabel={(option: any) => option.dtl_desc}
                                                            onChange={(event, value) =>
                                                                form.setFieldValue(`project_details.${index}.projectRole`, value)
                                                            }
                                                            renderOption={(props, option: any, { selected }) => (
                                                                <li {...props}>
                                                                    <Checkbox checked={selected} />
                                                                    {option.dtl_desc}
                                                                </li>
                                                            )}
                                                            renderInput={(params) => (
                                                                <TextField {...params} placeholder="Select Role" variant="outlined" />
                                                            )}
                                                        />
                                                    )}
                                                />
                                                <ErrorMessage name={`project_details.${index}.projectRole`} component="div" />
                                            </Grid>
                                        </Grid>
                                    ))}
                                    <Button className='mx-3 my-2 font-bold' sx={{ textTransform: 'none', color: COLORS.green }} onClick={() => push({ project: null, projectRole: [] })}>
                                        <img src="/assets/plus-circle.svg" alt="add" /> <span className="mx-1 font-bold">Add Project</span>
                                    </Button>
                                </>
                            )}
                        </FieldArray>

                        <div className='text-center mt-6'>
                            <Button type="submit" variant="contained" sx={{textTransform:'none'}} className='bg-black text-white px-5 my-3' disabled={isSubmitting || !(isValid && dirty)}>
                                {userData?'Update User':'Add User'}
                            </Button>
                        </div>
                        {showSuccessDialog && (
								<CommonDialog
									open={open}
									onClose={()=>setOpen(false)}
									title=""
									description="User Added Successfully"
									imageUrl="/assets/success.svg"
									additionalContent="You'll be automatically redirected to homepage shortly"
								/>

							)}
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddUser;
