import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Controller, useFormContext, useForm } from 'react-hook-form';

import {
	FormControl, FormControlLabel, FormLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, Typography,
	Button, Stack
} from '@mui/material';
import * as yup from 'yup';
import { Formik, Form, Field } from 'formik';
import ConnectionDetailsStep from './ConnectionDetailsStep';
import { useLocation } from 'react-router';
import ApiService from '../../../../../Services/ApiServices';



const schema = yup.object().shape({
	relation_ship_owner: yup.string().required('Owner name is required'),
	relation_ship_owner_email: yup.string().required('Owner email is required').email('Invalid email'),
	technology_owner: yup.string().required('Technology owner name is required'),
	technology_owner_email: yup.string().required('Technology emailId is required').email('Invalid email'),
});
/**
 * The Consumer Details tab.
 */
function CustomerDetailsStep(props: any) {
	const { onNext, data } = props;
	const location = useLocation();
	const customerData = location.state;
	const [initialValue, setInitialValue] = React.useState({
		relation_ship_owner: '',
		relation_ship_owner_email: '',
		technology_owner: '',
		technology_owner_email: '',

	});
	React.useEffect(() => {
		console.log(customerData)
		if (customerData) {
			const fetchConnection = async () => {
				try {
					const result = await ApiService('8011', 'get', `/customer/${customerData.customer_id}`);
					console.log(result);
					if (result) {
						setInitialValue(result)
					}
				} catch (error) {
					console.error('Error fetching data:', error);
				}
			};
			fetchConnection();
		}

	}, []);


	const saveData = async (values: any, { setSubmitting }: any) => {
		if (customerData) {
			customerData.relation_ship_owner = values.relation_ship_owner;
			customerData.relation_ship_owner_email = values.relation_ship_owner_email;
			customerData.technology_owner = values.technology_owner;
			customerData.technology_owner_email = values.technology_owner_email;
			try {
				const url = `/customer/${customerData.customer_id}`;
				const result = await ApiService('8011', 'put', url, customerData);
				console.log(result)
				onNext(result)
			}
			catch (error) {
				console.error('Error fetching Status', error);
			}
		} else {
			try {
				const url = '/customer';
				const result = await ApiService('8011', 'post', url, values);
				console.log(result)
				onNext(result)
			}
			catch (error) {
				console.error('Error fetching Status', error);
			}
		}
		console.log('Form values:', values);
		setSubmitting(false);
	};

	return (
		<div style={{ margin: 'auto' }}>
			<Formik
				initialValues={initialValue}
				validationSchema={schema}
				onSubmit={saveData}
				enableReinitialize={true}
			// onSubmit={(values, { setSubmitting }) => {
			// 	onNext(values)
			// 	console.log(values);
			// 	setSubmitting(false);
			// }}
			>
				{({ errors, touched, isSubmitting }) => (
					<Form>
						<Grid container spacing={4} style={{ marginTop: '8px' }}>
							{/* First item in the row */}
							<Grid item xs={6}>

								<>
									<Typography className='my-1 text-start' sx={{ fontWeight: '500', fontSize: '15px' }} variant="body2" >
										Customer Relationship Owner <span style={{ color: 'red' }}>*</span>
									</Typography>

									<Field className='mx-2 text-start'
										name="relation_ship_owner"
										placeholder="Enter Customer Relationship Owner Name"
										size={'medium'}
										as={TextField}
										error={errors.relation_ship_owner && touched.relation_ship_owner}
										helperText={errors.relation_ship_owner && touched.relation_ship_owner ? errors.relation_ship_owner : ''}
										fullWidth
										variant="outlined"
										required
									/>
								</>
								{/* )} */}
								{/* /> */}
							</Grid>
							<Grid item xs={6}>
								<>
									<Typography className='my-1 text-start' sx={{ fontWeight: '500', fontSize: '15px' }} variant="body2" >
										Customer Relationship Owner Email ID <span style={{ color: 'red' }}>*</span>
									</Typography>
									
									<Field className='mx-2'
										name="relation_ship_owner_email"
										placeholder="Enter Email Id"
										as={TextField}
										error={errors.relation_ship_owner_email && touched.relation_ship_owner_email}
										helperText={errors.relation_ship_owner_email && touched.relation_ship_owner_email ? errors.relation_ship_owner_email : ''}
										fullWidth
										variant="outlined"
										required
									/>
								</>
								{/* )} */}
								{/* /> */}
							</Grid>
						</Grid>

						<Grid container spacing={4} style={{ marginTop: '8px' }}>
							<Grid item xs={6}>
								
								<>
									<Typography className='my-1 text-start' sx={{ fontWeight: '500', fontSize: '15px' }} variant="body2" >
										Customer Technology Owner <span style={{ color: 'red' }}>*</span>
									</Typography>
									<Field className='mx-2'
										name="technology_owner"
										placeholder="Enter Customer Technology Owner Name"
										as={TextField}
										error={errors.technology_owner && touched.technology_owner}
										helperText={errors.technology_owner && touched.technology_owner ? errors.technology_owner : ''}
										fullWidth
										variant="outlined"
										required
									/>
								</>
								{/* )} */}
								{/* /> */}
							</Grid>
							<Grid item xs={6}>

								<>
									<Typography className='my-1 text-start' sx={{ fontWeight: '500', fontSize: '15px' }} variant="body2" >
										Customer Technology Owner Email ID <span style={{ color: 'red' }}>*</span>
									</Typography>

									<Field className='mx-2'
										name="technology_owner_email"
										placeholder="Enter Email Id"
										as={TextField}
										error={errors.technology_owner_email && touched.technology_owner_email}
										helperText={errors.technology_owner_email && touched.technology_owner_email ? errors.technology_owner_email : ''}
										fullWidth
										variant="outlined"
										required
									/>
								</>
							</Grid>
						</Grid>
						<div style={{ height: '100px' }}>

						</div>



						<Stack>
							<Button sx={{textTransform:'none'}}
								className="px-4 m-auto py-2 bg-dark"
								variant="contained"
								color="primary"
								type='submit'
							// onClick={handleNext}
							>
								Next
							</Button>
						</Stack>


					</Form>
				)}
			</Formik>
		</div >
	);
}

export default CustomerDetailsStep;