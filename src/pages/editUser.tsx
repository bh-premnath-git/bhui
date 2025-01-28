import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { Autocomplete, Switch, TextField } from '@mui/material';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormFieldWrapper } from '@/components/FormFieldWrapper';
import { Spinner } from '@/components/ui/spinner';
import { Label } from '@/components/ui/label';
import useToast from '@/components/teast-service';
import { ApiService } from '@/services/apiServices';
import { editUserDeployment } from '@/redux/UserSlice';
import { useAppDispatch } from '@/redux/hooks';
import { CATALOG_API_PORT } from '@/configration/environment';

interface RoleType {
  dtl_code: string;
  dtl_desc: string;
}

interface ProjectType {
  value: string;
  label: string;
}

interface ProjectDetail {
  project: Array<ProjectType>;
  projectRole: Array<RoleType>;
}

interface UserFormValues {
  bh_user_first_name: string;
  bh_user_middle_name: string;
  bh_user_last_name: string;
  user_email_id: string;
  user_status_cd: string;
  user_admin_status_cd: string;
  project_details: ProjectDetail[];
}

// ------------------ Validation Schema ------------------
const schema = Yup.object().shape({
  bh_user_first_name: Yup.string().required('First Name is required'),
  bh_user_last_name: Yup.string().required('Last Name is required'),
  user_email_id: Yup.string().email('Invalid email address').required('Email is required'),
  user_status_cd: Yup.string().required('Please select status'),
  user_admin_status_cd: Yup.string().required('Please select admin status'),
  project_details: Yup.array().of(
    Yup.object().shape({
      project: Yup.array()
        .of(
          Yup.object().shape({
            value: Yup.string().required('Project value is required'),
            label: Yup.string().required('Project label is required'),
          })
        )
        .min(1, 'At least one project is required'),
      projectRole: Yup.array()
        .of(
          Yup.object().shape({
            dtl_code: Yup.string().required('Role code is required'),
            dtl_desc: Yup.string().required('Role description is required'),
          })
        )
        .min(1, 'At least one role is required'),
    })
  ),
});

const EditUser: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [ToastComponent, showToast] = useToast();

  const [roles, setRoles] = useState<RoleType[]>([]);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [statusToggle, setStatusToggle] = useState(true);

  const userData = location.state?.rowData || null;

  const [initialValues, setInitialValues] = useState<UserFormValues>({
    bh_user_first_name: '',
    bh_user_middle_name: '',
    bh_user_last_name: '',
    user_email_id: '',
    user_status_cd: '601',
    user_admin_status_cd: '2102',
    project_details: [
      {
        project: [],
        projectRole: [],
      },
    ],
  });

  const handleStatusToggle = () => {
    setStatusToggle((prev) => !prev);
  };

  useEffect(() => {
    if (!userData) return;

    const fetchData = async () => {
      try {
        const [rolesRes, projectsRes] = await Promise.all([
          ApiService(CATALOG_API_PORT, 'get', '/codes_hdr/1'),
          ApiService(CATALOG_API_PORT, 'get', '/bh_project/search'),
        ]);

        setRoles(rolesRes.codes_dtl || []);

        const formattedProjects = projectsRes.map((proj: any) => ({
          value: proj.bh_project_id.toString(),
          label: proj.bh_project_name,
        }));
        setProjects(formattedProjects);

        const isActive = userData.enabled;
        setStatusToggle(isActive);

        setInitialValues({
          bh_user_first_name: userData.firstName || '',
          bh_user_middle_name: userData.middleName || '',
          bh_user_last_name: userData.lastName || '',
          user_email_id: userData.email || '',
          user_status_cd: userData.enabled ? '601' : '602',
          user_admin_status_cd: userData.user_admin_status_cd || '2102',
          project_details: [
            { project: [...userData.projects], projectRole: [...userData.realm_roles] },
          ],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Error fetching data', { color: '#FF0000' });
      }
    };

    fetchData();

  }, [userData]);

  const handleEditUser = async (
    values: UserFormValues,
    { setSubmitting }: { setSubmitting: (loading: boolean) => void }
  ) => {
    try {
      if (userData?.bh_user_id) {
        values.user_status_cd = statusToggle ? '601' : '602';

        await dispatch(
          editUserDeployment({
            id: userData.bh_user_id,
            params: values,
          })
        );

        showToast('User updated successfully', { color: '#4caf50' });
        setTimeout(() => {
          navigate('/admin-console/users');
        }, 1000);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showToast('Error updating user', { color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-3 space-y-6 rounded border bg-white text-black shadow w-full mt-8">
      <div className="border-b pb-2 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Edit User</h2>
          <p className="text-sm text-gray-700 mt-1">
            Update user details and configure their access permissions
          </p>
        </div>
        <Button
          variant="outline"
          className="text-xs font-medium px-3 py-1 border-gray-300 hover:bg-gray-100"
          onClick={() => navigate('/admin-console/users')}
        >
          View All Users
        </Button>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={handleEditUser}
        enableReinitialize
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form className="space-y-6">
            {/* User Details */}
            <div className="p-1 rounded bg-white border space-y-2">
              <h3 className="text-base font-medium text-black border-b pb-2">
                User Details
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <FormFieldWrapper
                  name="bh_user_first_name"
                  label="First Name"
                  required
                >
                  <Field
                    as={Input}
                    name="bh_user_first_name"
                    placeholder="Enter first name"
                    className="h-8 border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400"
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
                    className="h-8 border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400"
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
                    className="h-8 border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400"
                  />
                </FormFieldWrapper>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-2">
                <FormFieldWrapper
                  name="user_email_id"
                  label="Email Address"
                  required
                  className="col-span-1"
                >
                  <Field
                    as={Input}
                    name="user_email_id"
                    placeholder="Enter email address"
                    type="email"
                    className="h-8 border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400 w-full"
                  />
                </FormFieldWrapper>

                <div className="col-span-2 flex items-center pt-4">
                  <Label className="mr-2">Status</Label>
                  <Switch
                    checked={statusToggle}
                    onChange={handleStatusToggle}
                    color="primary"
                  />
                  <span className="ml-2 text-sm">
                    {statusToggle ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-3 rounded bg-white border space-y-4">
              <h3 className="text-base font-medium text-black border-b pb-2">
                Project Access
              </h3>

              <FieldArray name="project_details">
                {() => (
                  <>
                    {values.project_details.map((detail, index) => (
                      <div key={index} className="grid grid-cols-2 gap-4">
                        <FormFieldWrapper
                          name={`project_details.${index}.project`}
                          label="Projects"
                          required
                        >
                          <Autocomplete
                            multiple
                            size="small"
                            options={
                              projects.filter(
                                (proj) =>
                                  !values.project_details[index].project.some(
                                    (selected) => selected.value === proj.value
                                  )
                              )
                            }
                            getOptionLabel={(option) => option.label || ''}
                            isOptionEqualToValue={(option, value) =>
                              option.value === value.value
                            }
                            value={values.project_details[index].project}
                            onChange={(_, newValue) => {
                              setFieldValue(
                                `project_details.${index}.project`,
                                newValue
                              );
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Select projects"
                                variant="outlined"
                                className="bg-white"
                              />
                            )}
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
                            options={
                              roles.filter(
                                (role) =>
                                  !values.project_details[index].projectRole.some(
                                    (selected) =>
                                      selected.dtl_code === role.dtl_code
                                  )
                              )
                            }
                            getOptionLabel={(option) => option.dtl_desc || ''}
                            isOptionEqualToValue={(option, value) =>
                              option.dtl_code === value.dtl_code
                            }
                            value={values.project_details[index].projectRole}
                            onChange={(_, newValue) => {
                              setFieldValue(
                                `project_details.${index}.projectRole`,
                                newValue
                              );
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Select roles"
                                variant="outlined"
                                className="bg-white"
                              />
                            )}
                          />
                        </FormFieldWrapper>
                      </div>
                    ))}
                  </>
                )}
              </FieldArray>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-2">
              <Button
                type="submit"
                className="w-1/4 h-8 bg-black hover:bg-gray-800 text-white font-medium text-sm focus:ring focus:ring-blue-200"
                disabled={
                  isSubmitting ||
                  !values.bh_user_first_name ||
                  !values.bh_user_last_name ||
                  !values.user_email_id ||
                  values.project_details.some(
                    (detail) =>
                      detail.project.length === 0 ||
                      detail.projectRole.length === 0
                  )
                }
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <Spinner />
                    Updating...
                  </div>
                ) : (
                  'Update User'
                )}
              </Button>
            </div>
          </Form>
        )}
      </Formik>

      <ToastComponent />
    </div>
  );
};

export default EditUser;
