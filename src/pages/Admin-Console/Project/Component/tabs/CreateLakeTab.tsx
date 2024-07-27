import InputAdornment from '@mui/material/InputAdornment';
import { FormControl, FormControlLabel, TextField, InputLabel, MenuItem, Radio, RadioGroup, Select, Button ,Stack, TextareaAutosize} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { Formik, Form, Field, ErrorMessage, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import ApiService from '../../../../../services/ApiServices';



const schema = Yup.object().shape({
	business_url: Yup.string().required('Business URL is required'),
	lake_name: Yup.string().required('Lake Name is required').max(10),
	lake_desc: Yup.string().required('Lake Description is required'),
	env_cd: Yup.string().required('Please Select Your Environment'),
});
/**
 * The pricing tab.
 */
function CreateLakeTab(props:any) {
	const methods = useFormContext();
	const [envList, setEnvList] = useState([]);
	const { onNext, project, onBack } = props;
	const [initialValue, setInitialValue] = useState({
		business_url: '',
		lake_name: '',
		lake_desc: '',
		env_cd: '',
	});
	const [lakeData, setLakeData]: any = useState([]);

	useEffect(() => {
		console.log(props.data)
		const fetchData = async () => {
			try {
				const result = await ApiService('8011','get', '/codes_hdr/4');
				console.log(result.codes_dtl);
				setEnvList(result.codes_dtl)
				console.log(envList);
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};

		fetchData();
		if (props.data) {
			const fetchAccessDetail = async () => {
				try {
					const result = await ApiService('8011','get', `/bh_project/${props.data}`);
					console.log(result);
					setLakeData(result)

					if (result && result?.lake_name) {
						setInitialValue({
							business_url: result?.business_url, lake_name: result?.lake_name,
							lake_desc: result?.lake_desc, env_cd: result?.env_cd
						})
					}
					// setAccessList(result.codes_dtl)
					// console.log(accessList);
				} catch (error) {
					console.error('Error fetching data:', error);
				}
			};
			fetchAccessDetail()
		}
		return () => {
		};
	}, []);
	// const envList = [
	// 	{ value: '1', label: 'Development' },
	// 	{ value: '2', label: 'Testing-QA' },
	// 	{ value: '3', label: 'Staging' },
	// 	{ value: '4', label: 'UAT' },
	// 	{ value: '5', label: 'Production' }
	//   ];

	const updateLakeDetails = async (data: any) => {
		var bh_broject_id = props.data;
		console.log(lakeData);

		lakeData.business_url = data.business_url
		lakeData.lake_name = data.lake_name
		lakeData.lake_desc = data.lake_desc
		lakeData.env_cd = data.env_cd
		console.log(lakeData);
		const result = await ApiService('8011','put', `bh_project/${bh_broject_id}`, lakeData);
		console.log(result)
		if (result) {
			onNext(data)
		}
	}
	return (
		<div>
			<Formik
				initialValues={initialValue}
				validationSchema={schema}
				enableReinitialize={true}

				onSubmit={(values, { setSubmitting }) => {
					// Handle form submission
					// onNext(values);
					updateLakeDetails(values)
					setSubmitting(false);
				}}
			>
				{({ isSubmitting, isValid, dirty }) => (
					<Form className='w-75 m-auto'>
						<div className="row">
						<div className='col-4'>
							<div style={{ marginBottom: '8px', fontSize: '14px', textAlign: 'start' }}>
								<label htmlFor="business_url">Business URL</label> <span style={{ color: 'red', paddingTop: '6px' }}>*</span>
							</div>
							<Field name="business_url" as={TextField} placeholder="Enter Business URL" variant="outlined" fullWidth className='shadow-sm'/>
							{/* disabled={props.data ? true : false} */}
							<div style={{ color: 'red', marginTop: '8px', textAlign: 'start' }}>
								<ErrorMessage name="business_url" component="div" />
							</div>
						</div>
						<div  className='col-4'>
							<div style={{ marginBottom: '8px', fontSize: '14px', textAlign: 'start' }}>
								<label htmlFor="lake_name">Lake Name</label> <span style={{ color: 'red', paddingTop: '6px' }}>*</span>
							</div>
							<Field name="lake_name" as={TextField} placeholder="Enter Lake Name" variant="outlined" fullWidth className='shadow-sm'/>
							<div style={{ color: 'red', marginTop: '8px', textAlign: 'start' }}>
								<ErrorMessage name="lake_name" component="div" />
							</div>
						</div>
						<div className='col-4' style={{ textAlign: 'start' }}>
							<div style={{ marginBottom: '8px', fontSize: '14px', textAlign: 'start' }}>
								<label htmlFor="env_cd">Environment</label> <span style={{ color: 'red', paddingTop: '6px' }}>*</span>
							</div>
							<Field name="env_cd">
								{({ field }:any) => (
									<FormControl variant="outlined" fullWidth>
										<Select 
											labelId="cloud-region-label"
											placeholder='Select Environment'
											id="cloud-region-select"
											{...field}
											className='shadow-sm'
										>
											{envList.map((env:any) => (
												<MenuItem key={env.id} value={env.id}>{env.dtl_desc}</MenuItem>
											))}
										</Select>
									</FormControl>
								)}
							</Field>
							<div style={{ color: 'red', marginTop: '8px' }}>
								<ErrorMessage name="env_cd" component="div" />
							</div>
						</div>
						</div>
						<div className='col-6'>
							<div style={{ marginBottom: '8px', fontSize: '14px', textAlign: 'start' }}>
								<label htmlFor="lake_desc">Lake  Description</label> <span style={{ color: 'red', paddingTop: '6px' }}>*</span>
							</div>
							<Field name="lake_desc" as={TextareaAutosize} minRows={3} placeholder="Enter Lake  Description" variant="outlined" fullWidth
							    style={{ width: '100%', padding: '8px', fontSize: '16px', borderColor: '#eef0f2', borderRadius: '4px' }} className='shadow-sm'
								/>
							<div style={{ color: 'red', marginTop: '8px', textAlign: 'start' }}>
								<ErrorMessage name="lake_desc" component="div" />
							</div>
						</div>

						

						{/* <div className='text-center m-32'> */}
						<Stack direction={'row'} spacing={63} mt={5}>
							<Button sx={{ textTransform: 'none' }}
								className="bg-secondary"
								variant="contained"
								color='secondary'
								onClick={onBack}
							>
								Back
							</Button>
							<Button sx={{ textTransform: 'none' }}
								className="bg-dark text-white"
								variant="contained"
								disabled={isSubmitting}
								type="submit"
							>
								Next
							</Button>

						</Stack>
					</Form>
				)}
			</Formik>

		</div>
	);
}

export default CreateLakeTab;
