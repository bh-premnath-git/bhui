import React, { useEffect, useState } from 'react';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import { Stack, Typography, FormHelperText, Button } from '@mui/material';
import CustomTextField from '../../oldcomponents/custom-textField'; // Adjust the import path accordingly
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import ApiService from '../../Services/ApiServices';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const validationSchema = Yup.object({
  customer_id: Yup.number().required('Target Customer is required'),
  bh_project_id: Yup.number().required('Project is required'),
  delivery_name: Yup.string().required('Delivery Name is required'),
  connection_id: Yup.number().required('Connection is required'),
});

function TargetSteps({ handleNext, publishData, publishId }) {
  const [customerList, setCustomerList] = useState([]);
  const [connectionList, setConnectionList] = useState([]);
  const [customer, setCustomer] = useState([]);
  const token: any = sessionStorage.getItem('token');
  const [user, setUser] = useState(jwtDecode(token));
  const [projects, setProjects]: any = useState([]);

  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState({
    publish_id: publishId ?? null,
    customer_id: null,
    bh_project_id: null,
    delivery_name: '',
    connection_id: null,
    created_by: user.name,
    updated_by: user.name,
  });

  useEffect(() => {
    const getCustomer = async () => {
      var params = { offset: 0, limit: 12 };
      var result = await ApiService('8011', 'get', `/customer/search`, params);
      if (result && result?.length > 0) {
        setCustomer(result)
        const customerOptions = result.map((customer) => ({
          label: customer.relation_ship_owner,
          value: customer.customer_id,
        }));

        setCustomerList(customerOptions);

        if (publishData) {
          var con = result.find(item => item?.customer_id === publishData.customer_id)
          const connectionOptions = con?.connection_dtl.map((connection) => ({
            label: connection.connection_name,
            value: connection.connection_dtl_id,
          }));
          setConnectionList(connectionOptions);
          setInitialValues({
            publish_id: publishData?.publish_id,
            bh_project_id: publishData?.bh_project_id,
            customer_id: publishData.customer_id,
            delivery_name: publishData.delivery_name,
            connection_id: publishData.connection_id,
            created_by: publishData.created_by || user.name,
            updated_by: user.name,
          });
        }
      }
    };

    getCustomer();
    fetchProject();
  }, [publishData, user.name]);

  async function savePublish(data) {
    var result = await ApiService('8011', 'post', `/publish_data/publish_details`, data);
    if (result) {
      // setPublishdataId(result.publish_id);
      navigate('/Designer/targetsteps', { state: { step: 1, id: result.publish_id } });
      handleNext(result.publish_id);
    }
  }

  async function update(data) {
    var result = await ApiService('8011', 'put', `/publish_data/publish_details/${publishData?.publish_id}`, data);
    if (result) {
      navigate('/Designer/targetsteps', { state: { step: 1, id: result.publish_id } });
      handleNext(result.publish_id);
    }
  }

  const fetchProject = async () => {
    const params = {}
    try {
      const result = await ApiService('8011', 'get', '/bh_project/search', null, params);
      console.log(result)
      const projectOptions = result.map((project) => ({
        label: project.bh_project_name,
        value: project.bh_project_id,
      }));
      setProjects(projectOptions)
    }
    catch (error) {
      console.error('Error fetching Status', error);

    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={(values) => {
        if (publishId || publishData?.publish_id) {
          update(values);
        } else {
          savePublish(values);
        }
      }}
    >
      {(formik) => (
        <form onSubmit={formik.handleSubmit}>
          <div className='my-4' style={{ marginLeft: '15%' }}>
            <Stack direction={"row"} spacing={2}>
              <Stack>
                <Typography className='text-start myHeadFont'>Target Customer</Typography>
                <Autocomplete
                  className='rounded shadow-sm'
                  disablePortal
                  id="target-customer"
                  options={customerList}
                  sx={{ width: '50ch', mt: 1 }}
                  value={customerList.find((option: any) => option.value === formik.values.customer_id) || null}
                  onChange={(event, value: any) => {
                    formik.setFieldValue('customer_id', value ? value.value : '')
                    const selectedCustomer: any = customer?.find((custom: any) => custom?.customer_id == value.value);
                    console.log(selectedCustomer)
                    const connectionOptions = selectedCustomer?.connection_dtl.map((connection) => ({
                      label: connection.connection_name,
                      value: connection.connection_dtl_id,
                    }));
                    setConnectionList(connectionOptions);

                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select Customer"
                      sx={{
                        '& .MuiInputBase-input::placeholder': {
                          fontFamily: 'Inter !important', // Custom font for placeholder
                        },
                      }}
                      error={formik.touched.customer_id && Boolean(formik.errors.customer_id)}
                    />
                  )}
                />
                {formik.touched.customer_id && formik.errors.customer_id && (
                  <FormHelperText error>{formik.errors.customer_id}</FormHelperText>
                )}
              </Stack>
              <Stack>
                <Typography className='text-start myHeadFont'>Connection</Typography>
                <Autocomplete
                  className='rounded shadow-sm'
                  disablePortal
                  id="connection_id"
                  options={connectionList}
                  sx={{ width: '50ch', mt: 1 }}
                  value={connectionList.find((option: any) => option.value === formik.values.connection_id) || null}
                  onChange={(event, value: any) => {
                    formik.setFieldValue('connection_id', value ? value.value : '')

                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select Connection"
                      sx={{
                        '& .MuiInputBase-input::placeholder': {
                          fontFamily: 'Inter !important', // Custom font for placeholder
                        },
                      }}
                      error={formik.touched.connection_id && Boolean(formik.errors.connection_id)}
                    />
                  )}
                />
                {formik.touched.connection_id && formik.errors.connection_id && (
                  <FormHelperText error>{formik.errors.connection_id}</FormHelperText>
                )}
              </Stack>
            </Stack>
            <br></br>
            <Stack direction={'row'} spacing={2}>
              <Stack >
                <Typography className='text-start myHeadFont'>Delivery Name</Typography>
                <Field
                  className='rounded shadow-sm'
                  name="delivery_name"
                  placeholder="Enter Delivery Name"
                  variant="outlined"
                  component={CustomTextField}
                  sx={{ my: 1, width: '50ch', borderRadius: '16px' }}
                />
                {formik.touched.delivery_name && formik.errors.delivery_name && (
                  <FormHelperText error>{formik.errors.delivery_name}</FormHelperText>
                )}
              </Stack>
              <Stack>
                <Typography className='text-start myHeadFont'>Project Name</Typography>
                <Autocomplete
                  className='rounded shadow-sm'
                  disablePortal
                  id="target-customer"
                  options={projects}
                  sx={{ width: '50ch', mt: 1 }}
                  value={projects.find((option: any) => option.value === formik.values.bh_project_id) || null}
                  onChange={(event, value: any) => {
                    formik.setFieldValue('bh_project_id', value ? value.value : '')
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select Customer"
                      sx={{
                        '& .MuiInputBase-input::placeholder': {
                          fontFamily: 'Inter !important', // Custom font for placeholder
                        },
                      }}
                      error={formik.touched.bh_project_id && Boolean(formik.errors.bh_project_id)}
                    />
                  )}
                />
                {formik.touched.bh_project_id && formik.errors.bh_project_id && (
                  <FormHelperText error>{formik.errors.bh_project_id}</FormHelperText>
                )}
              </Stack>
            </Stack>
          </div>
          <Button type="submit" variant="contained" className='create-btn'>
            {publishId ? 'Update' : 'Next'}
          </Button>
        </form>
      )}
    </Formik>
  );
}

export default TargetSteps;
