import * as React from 'react';
import {
	Button, Stack,
	Grid
} from '@mui/material';
import * as yup from 'yup';
import { Formik, Form } from 'formik';
import { useLocation } from 'react-router';
import {ApiService} from '@/services/apiServices';
import CustomField from '@/common/CustomField';
import { CATALOG_API_PORT } from '@/configration/environment';

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
	const customerData = location.state?.rowData;
	const [initialValue, setInitialValue] = React.useState({
		relation_ship_owner: '',
		relation_ship_owner_email: '',
		technology_owner: '',
		technology_owner_email: '',

	});
	React.useEffect(() => {
		if (customerData) {
			const fetchConnection = async () => {
				try {
					const result = await ApiService(CATALOG_API_PORT, 'get', `/customer/${customerData.customer_id}`);
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
				const result = await ApiService(CATALOG_API_PORT, 'put', url, customerData);
				onNext(result)
			}
			catch (error) {
				console.error('Error fetching Status', error);
			}
		} else {
			try {
				const url = '/customer';
				const result = await ApiService(CATALOG_API_PORT, 'post', url, values);
				onNext(result)
			}
			catch (error) {
				console.error('Error fetching Status', error);
			}
		}
		setSubmitting(false);
	};

	return (
		<div style={{ margin: 'auto' }}>
			<Formik
				initialValues={initialValue}
				validationSchema={schema}
				onSubmit={saveData}
				enableReinitialize={true}

			>
				{({ errors, touched, isSubmitting }) => (
					<Form>
						<Grid className='m-auto' xs={10} container spacing={6} style={{ marginTop: '8px' }}>
							<Grid item xs={6} className='text-start'>
								<CustomField name='relation_ship_owner' label="Customer Relationship Owner"
									placeholder="Enter Customer Relationship Owner Name" required={true} />
							</Grid>
							<Grid item xs={6} className='text-start'>
								<CustomField name='relation_ship_owner_email' label="Customer Relationship Owner Email ID"
									placeholder="Enter Customer Relationship Owner Email ID" required={true} />
							</Grid>
						</Grid>

						<Grid className='m-auto' xs={10} container spacing={6} style={{ marginTop: '8px' }}>
							<Grid item xs={6} className='text-start'>
								<CustomField name='technology_owner' label="Customer Technology Owner"
									placeholder="Enter Customer Technology Owner" required={true} />
							</Grid>
							<Grid item xs={6} className='text-start'>

								<CustomField name='technology_owner_email' label="Customer Technology Owner Email ID"
									placeholder="Enter Customer Technology Owner Email ID" required={true} />

							</Grid>
						</Grid>
						<div style={{ height: '100px' }}>

						</div>



						<Stack>
							<Button sx={{ textTransform: 'none' }}
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