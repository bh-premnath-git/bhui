import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import ApiService from '../../../../../services/ApiServices';
import { MenuItem, Select, FormControl, Button, Stack, TextareaAutosize, FormHelperText } from '@mui/material';
import CustomField from '../../../../../common/CustomField';

const schema = Yup.object().shape({
	business_url: Yup.string().required('Business URL is required'),
	lake_name: Yup.string().required('Lake Name is required').max(10),
	lake_desc: Yup.string().required('Lake Description is required'),
	env_cd: Yup.string().required('Please Select Your Environment'),
});

function CreateLakeTab(props) {
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
		const fetchData = async () => {
			try {
				const result = await ApiService('8011', 'get', '/codes_hdr/4');
				setEnvList(result.codes_dtl);
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};

		fetchData();
		if (props.data) {
			const fetchAccessDetail = async () => {
				try {
					const result = await ApiService('8011', 'get', `/bh_project/${props.data}`);
					setLakeData(result);

					if (result && result?.lake_name) {
						setInitialValue({
							business_url: result?.business_url,
							lake_name: result?.lake_name,
							lake_desc: result?.lake_desc,
							env_cd: result?.env_cd,
						});
					}
				} catch (error) {
					console.error('Error fetching data:', error);
				}
			};
			fetchAccessDetail();
		}
	}, [props.data]);

	const updateLakeDetails = async (data) => {
		var bh_broject_id = props.data;
		lakeData.business_url = data.business_url;
		lakeData.lake_name = data.lake_name;
		lakeData.lake_desc = data.lake_desc;
		lakeData.env_cd = data.env_cd;
		const result = await ApiService('8011', 'put', `bh_project/${bh_broject_id}`, lakeData);
		if (result) {
			onNext(data);
		}
	};

	return (
		<div>
			<Formik
				initialValues={initialValue}
				validationSchema={schema}
				enableReinitialize={true}
				onSubmit={(values, { setSubmitting }) => {
					// updateLakeDetails(values);
					// setSubmitting(false);
					onNext(values);

				}}
			>
				{({ isSubmitting, isValid, dirty }) => (
					<Form className='w-75 m-auto'>
						<div className="row text-start">
							<div className='col-4'>
								<CustomField
									name="business_url"
									label="Business URL"
									placeholder="Enter Business URL"
								// disabled={props.data ? true : false}
								/>
							</div>
							<div className='col-4'>
								<CustomField
									name="lake_name"
									label="Lake Name"
									placeholder="Enter Lake Name"
								/>
							</div>
							<div className='col-4' style={{ textAlign: 'start' }}>
								<FormControl variant="outlined" fullWidth margin="normal">
									<label htmlFor="env_cd">Environment</label>
									<Field name="env_cd">
										{({ field }) => (
											<Select
												labelId="env_cd-label"
												id="env_cd-select"
												{...field}
												className='shadow-sm'
												size='small'
											>
												{envList.map((env: any) => (
													<MenuItem key={env.id} value={env.id}>{env.dtl_desc}</MenuItem>
												))}
											</Select>
										)}
									</Field>

									<ErrorMessage name={'env_cd'}>
										{msg => <FormHelperText error>{msg}</FormHelperText>}
									</ErrorMessage>
								</FormControl>
							</div>
							<div className='col-6'>
								<div style={{ marginBottom: '8px', fontSize: '14px', textAlign: 'start' }}>
									<label htmlFor="lake_desc">Lake Description</label> <span style={{ color: 'red', paddingTop: '6px' }}>*</span>
								</div>
								<Field name="lake_desc">
									{({ field }) => (
										<TextareaAutosize
											{...field}
											minRows={3}
											placeholder="Enter Lake Description"
											style={{ width: '100%', padding: '8px', fontSize: '16px', borderColor: '#eef0f2', borderRadius: '4px' }}
											className='shadow-sm'
										/>
									)}
								</Field>
								<ErrorMessage name={'lake_desc'}>
									{msg => <FormHelperText error>{msg}</FormHelperText>}
								</ErrorMessage>
							</div>
						</div>
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
			<br></br>
		</div>
	);
}

export default CreateLakeTab;
