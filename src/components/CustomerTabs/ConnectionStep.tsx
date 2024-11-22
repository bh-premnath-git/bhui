import TextField from '@mui/material/TextField';
import { Button, MenuItem, Select, Typography, Stack } from '@mui/material';
import * as yup from 'yup';
import { Formik, Form, FieldArray, Field, ErrorMessage } from 'formik';
import { useEffect, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { color } from 'framer-motion';
import {ApiService} from '@/services/apiServices';
import useToast from '@/oldcomponents/teast-service';
import CustomField from '@/common/CustomField';
import { Label } from '@/components/ui/label';

const validationSchema = yup.object().shape({
	connections: yup.array().of(
		yup.object().shape({
			connection_name: yup.string().required('Connection Name is required'),
			target_delivery_platform_cd: yup.string().required('Target Delivery Platform is required'),
			connection_details: yup.object().shape({
				// Add validation for dynamic fields if needed
			})
		})
	)
});

function ConnectionStep(props: any) {
	const { onNext, data, onBack } = props;

	const [tragetPlatformList, setTragetPlatformList]: any = useState([]);
	const [dynamicFields, setDynamicFields]: any = useState({});
	const [isTestConnection, setIsTestConnection] = useState(false);
	const [isUpdate, setIsUpdate] = useState(false);
	const [ToastComponent, showToast] = useToast();
	const [initialValue, setInitialValue] = useState({
		connections: [
			{
				connection_name: '',
				target_delivery_platform_cd: '',
				connection_details: {}
			}
		]
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const result = await ApiService('8011', 'get', '/codes_hdr/10');
				setTragetPlatformList(result.codes_dtl);
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};

		fetchData();

		if (props.data) {
			const fetchConnection = async () => {
				try {
					const result = await ApiService('8011', 'get', `/customer/${props.data}`);
					if (result.connection_dtl?.length) {
						setIsUpdate(true);
						setInitialValue({ connections: result.connection_dtl });
					}
				} catch (error) {
					console.error('Error fetching data:', error);
				}
			};
			fetchConnection();
		}
	}, [props.data]);

	const fetchConnectionField = async (id: any, index: any) => {
		try {
			const result = await ApiService('8011', 'get', `/codes_hdr/${id}`);
			setDynamicFields((prevFields: any) => ({
				...prevFields,
				[index]: result.codes_dtl
			}));
		} catch (error) {
			console.error('Error fetching dynamic fields:', error);
		}
	};

	const handleClick = async (values: any, index: any) => {
		var body = {
			'aws_access_key_id': values.connections[index]?.connection_details?.access_key,
			"aws_secret_access_key": values.connections[index]?.connection_details?.secret_access_key,
		}
		try {
			const result = await ApiService('8011', 'post', `/aws/test_connection`, body);
			if (result.status) {
				setIsTestConnection(true)
				showToast('Successfully able to connect', { color: '#00b060' });
			} else {
				setIsTestConnection(false)
				showToast('Invalid credentials', { color: 'red' });

			}
		} catch (e) {
			setIsTestConnection(false)
			showToast('Invalid credentials', { color: 'red' });

		}
	};

	const saveData = async (values: any, { setSubmitting }: any) => {
		try {
			for (let connection of values.connections) {
				connection.customer_id = props.data;
				if (isUpdate && connection.connection_dtl_id) {
					await ApiService('8011', 'put', `/customer/connection_dtl/${connection.connection_dtl_id}`, connection);
				} else {
					await ApiService('8011', 'post', `/customer/connection_dtl`, connection);
				}
			}
			onNext(values);
		} catch (error) {
			console.error('Error saving data:', error);
		} finally {
			setSubmitting(false);
		}
	};

	const handleChange = (index: any, setFieldValue: any, event: any) => {
		setIsTestConnection(false)
		const platformCode = event.target.value;
		const id = tragetPlatformList.find((platform: any) => platform.id === platformCode)?.dtl_id_filter;
		setFieldValue(`connections[${index}].target_delivery_platform_cd`, platformCode);
		fetchConnectionField(id, index);
	};

	const renderDynamicFields = (fields: any, index: any) => {
		return <Stack direction={'row'}>
			{fields.map((field: any) => (
				<div key={field.id} style={{ width: '100%', margin: '10px 10px' }}>
					<CustomField name={`connections[${index}].connection_details.${field.dtl_desc.toLowerCase().replace(' ', '_')}`}
						placeholder={convertToReadableFormat(field.dtl_desc)} label={convertToReadableFormat(field.dtl_desc)} />
				</div>
			))}
		</Stack>;
	};
	function convertToReadableFormat(input: any) {
		return input.replace(/_/g, ' ');
	}

	return (
		<Formik
			initialValues={initialValue}
			validationSchema={validationSchema}
			onSubmit={saveData}
			enableReinitialize={true}
		>
			{({ values, setFieldValue }) => (
				<Form className='w-10/12 m-auto'>
					<FieldArray name="connections">
						{({ push, remove }) => (
							<div style={{ textAlign: 'start' }}>
								{values.connections.map((connection, index) => (
									<Accordion style={{ margin: '10px' }}
										className='shadow-sm rounded'
										elevation={0} key={index}>
										<AccordionSummary
											expandIcon={<ExpandMoreIcon />}
											aria-controls="panel1-content"
											id="panel1-header"
										>
											<Typography sx={{ fontWeight: 'bold', marginTop: '10px' }}>{`Connection ${index + 1}`}</Typography>
										</AccordionSummary>
										<AccordionDetails>
											<Stack direction={'row'}>
												<Stack width={'100%'} className='px-1'>
													<CustomField name={`connections[${index}].connection_name`} placeholder="Connection Name" label='Connection Name' />
												</Stack>
												<Stack width={'100%'} className='px-1 mt-2'>
													<Label className="font-normal">
														Target Delivery Platform
													</Label>

													<Field
														name={`connections[${index}].target_delivery_platform_cd`}
														render={({ field }: any) => (
															<Select size='small' className='shadow-sm'
																{...field}
																fullWidth
																value={field.value}
																onChange={(event) => handleChange(index, setFieldValue, event)}
																placeholder="Target Delivery Platform"
															>
																{tragetPlatformList?.map((targetPlatform: any) => (
																	<MenuItem key={targetPlatform.id} value={targetPlatform.id}>
																		{targetPlatform.dtl_desc}
																	</MenuItem>
																))}
															</Select>
														)}
													/>
													<div style={{ color: 'red', textAlign: 'start' }}>
														<ErrorMessage name={`connections[${index}].target_delivery_platform_cd`} />
													</div>
												</Stack>
											</Stack>
											{dynamicFields[index] && renderDynamicFields(dynamicFields[index], index)}
											<div className='text-cyan-400 ' style={{ textAlign: 'center', padding: '8px', margin: '8px', fontSize: '14px' }}>
												<Button sx={{ textTransform: 'none' }} variant="contained" type="button" className='bg-dark text-white' onClick={() => handleClick(values, index)}>Test Connection</Button>
											</div>
											<div>
												<ToastComponent />
											</div>
											<div style={{ float: 'right', padding: '8px', margin: '8px', color: 'red',}}>
												<button type="button" onClick={() => remove(index)}>Remove</button>
											</div>
										</AccordionDetails>
									</Accordion>
								))}
								<div style={{ float: 'left', padding: '8px', margin: '8px', color: 'green', fontWeight: 'bold' }}>
									<button
										className='text-success bg-white'
										type="button"
										onClick={() => push({
											connection_name: '',
											target_delivery_platform_cd: '',
											connection_details: {},
										})}
									>+ Add Connection</button>
								</div>
							</div>
						)}
					</FieldArray>
					<br />
					<Stack direction={'row'} mt={10} justifyContent={'space-between'}>
						<Button sx={{ textTransform: 'none' }}
							className="bg-secondary text-white"
							variant="contained"
							onClick={onBack}
						>
							Back
						</Button>
						<Button sx={{ textTransform: 'none' }}
							className="bg-dark text-white"
							variant="contained"
							type='submit'
							disabled={!isTestConnection}
						>
							Next
						</Button>
					</Stack>
				</Form>
			)}
		</Formik>
	);
}

export default ConnectionStep;