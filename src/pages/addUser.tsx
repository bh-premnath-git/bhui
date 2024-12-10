import React, { useCallback, useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormFieldWrapper } from '@/components/FormFieldWrapper';
import { Autocomplete, TextField } from '@mui/material';
import useToast from '@/oldcomponents/teast-service';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { debounce } from 'lodash';
import { createUserDeployment } from '@/redux/UserSlice';
import { Spinner } from '@/components/ui/spinner';
import { ApiService } from '@/services/apiServices';

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
            project: Yup.array().of(
                Yup.object().shape({
                    label: Yup.string().required('Project label is required'),
                    value: Yup.string().required('Project value is required'),
                })
            ).min(1, 'At least one project is required'),
            projectRole: Yup.array().of(
                Yup.string().required('Role is required')
            ).min(1, 'At least one role is required'),
        })
    )
});

// admin-user, ops-user, designer-user

const AddUser = () => {
    const roles = ["admin-user", "ops-user", "designer-user"];
    const [projects, setProjects] = useState<Array<{value: string, label: string}>>([]);
    const [initialValue, setInitialValue] = useState({
        bh_user_first_name: '',
        bh_user_middle_name: '',
        bh_user_last_name: '',
        user_email_id: '',
        user_status_cd: '701',
        user_admin_status_cd: '2102',
        project_details: [{ 
            project: [], 
            projectRole: [] 
        }]
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
        const fetchProjects = async () => {
            try {
                const projectsRes = await ApiService('8011', 'get', '/bh_project/search');
                const formattedProjects = projectsRes.map((proj: any) => ({
                    value: proj.bh_project_id.toString(),
                    label: proj.bh_project_name
                }));
                setProjects(formattedProjects);
            } catch (error) {
                console.error('Error fetching projects:', error);
                showToast('Error fetching projects', { color: '#FF0000' });
            }
        };

        fetchProjects();
    }, []);

    const createKeyCloakUser = async (value: any, { setSubmitting }: any) => {
        try {
            const selectedRoles = value.project_details.flatMap((detail: any) => detail.projectRole);
            const selectedProjects = value.project_details.flatMap((detail: any) => detail.project.map((proj: any) => proj.label));

            const userData = {
                email: value.user_email_id,
                email_verified: true,
                enabled: true,
                first_name: value.bh_user_first_name,
                last_name: value.bh_user_last_name,
                realm_roles: selectedRoles,
                projects: selectedProjects,
                username: `${value.bh_user_first_name}_${value.bh_user_last_name}`,
            };
            dispatch(createUserDeployment(userData));

            // TODO: Add API call to create user

            handleNext1();
        } catch (error) {
            console.error('Error creating user:', error);
            showToast('Error creating user', { color: 'red' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleNext1 = () => {
        showToast('User created successfully', { color: '#4caf50' });
        setTimeout(() => {
            navigate('/admin-console/users');
        }, 1000);
    };

    // Add a debug handler to check form values
    const handleFormChange = (values: any, setFieldValue: any) => {
        console.log('Form Values:', values); // This will help debug the values
    };

    return (
        <div className="max-w-6xl mx-auto p-8 space-y-8 rounded-xl border bg-card text-card-foreground shadow-lg w-full mt-6">
            <div className="border-b pb-4 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold">Create New User</h2>
                    <p className="text-muted-foreground mt-1">Add a new user and configure their access permissions</p>
                </div>
                <Button
                    variant="outline"
                    className="hover:bg-gray-100"
                    onClick={() => navigate('/admin-console/users')}
                >
                    View All Users
                </Button>
            </div>

            <Formik
                initialValues={initialValue}
                validationSchema={schema}
                onSubmit={createKeyCloakUser}
                enableReinitialize
            >
                {({ values, isSubmitting, setFieldValue }) => (
                    <Form className="space-y-8">
                        <div className="space-y-6 w-full">
                            <div className="grid grid-cols-3 gap-6">
                                <FormFieldWrapper
                                    name="bh_user_first_name"
                                    label="First Name"
                                    required
                                >
                                    <Field
                                        as={Input}
                                        name="bh_user_first_name"
                                        placeholder="Enter first name"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFirstName(e, setFieldValue)}
                                    />
                                </FormFieldWrapper>

                                <FormFieldWrapper
                                    name="bh_user_middle_name"
                                    label="Middle Name"
                                >
                                    <Field
                                        as={Input}
                                        name="bh_user_middle_name"
                                        placeholder="Enter middle name"
                                    />
                                </FormFieldWrapper>

                                <FormFieldWrapper
                                    name="bh_user_last_name"
                                    label="Last Name"
                                    required
                                >
                                    <Field
                                        as={Input}
                                        name="bh_user_last_name"
                                        placeholder="Enter last name"
                                    />
                                </FormFieldWrapper>
                            </div>

                            <FormFieldWrapper
                                name="user_email_id"
                                label="Email Address"
                                required
                                className="w-1/2"
                            >
                                <Field
                                    as={Input}
                                    name="user_email_id"
                                    placeholder="Enter email address"
                                    type="email"
                                />
                            </FormFieldWrapper>
                        </div>

                        {/* Project Access Section */}
                        <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                            <h3 className="text-lg font-medium">Project Access</h3>
                            {values.project_details.map((detail, index) => (
                                <div key={index} className="grid grid-cols-2 gap-6">
                                    <FormFieldWrapper
                                        name={`project_details.${index}.project`}
                                        label="Projects"
                                        required
                                    >
                                        <Autocomplete
                                            multiple
                                            size="small"
                                            options={projects.filter(project => !values.project_details[index].project.some(selected => selected.value === project.value))}
                                            getOptionLabel={(option: any) => option.label || ''}
                                            isOptionEqualToValue={(option, value) => option.value === value.value}
                                            value={values.project_details[index].project}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Select projects"
                                                    variant="outlined"
                                                    className="bg-white"
                                                />
                                            )}
                                            onChange={(_, value) => {
                                                setFieldValue(`project_details.${index}.project`, value);
                                            }}
                                            onBlur={() => {}}
                                        />
                                    </FormFieldWrapper>

                                    <FormFieldWrapper
                                        name={`project_details.${index}.projectRole`}
                                        label="Roles"
                                        required
                                    >
                                        <Autocomplete
                                            multiple
                                            size="small"
                                            options={roles.filter(role => !values.project_details[index].projectRole.includes(role))}
                                            value={values.project_details[index].projectRole}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Select roles"
                                                    variant="outlined"
                                                    className="bg-white"
                                                />
                                            )}
                                            onChange={(_, value) => {
                                                setFieldValue(`project_details.${index}.projectRole`, value);
                                            }}
                                            onBlur={() => {}}
                                        />
                                    </FormFieldWrapper>
                                </div>
                            ))}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center pt-4">
                            <Button
                                type="submit"
                                className="w-1/4 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                disabled={
                                    isSubmitting || 
                                    !values.bh_user_first_name || 
                                    !values.bh_user_last_name || 
                                    !values.user_email_id || 
                                    !values.project_details[0].project || 
                                    values.project_details[0].project.length === 0 || 
                                    !values.project_details[0].projectRole || 
                                    values.project_details[0].projectRole.length === 0
                                }
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center">
                                        <Spinner className="mr-2" />
                                        Creating...
                                    </div>
                                ) : (
                                    'Create User'
                                )}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>

            {/* User Exists Dialog */}
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
                            <p className="text-gray-700">
                                Please choose a different first name.
                            </p>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            <ToastComponent />
        </div>
    );
};

export default AddUser;
