import { Controller, useFormContext } from 'react-hook-form';
import { FormControl, FormControlLabel, TextField, InputLabel, MenuItem, Radio, RadioGroup, Select, Button , Stack} from '@mui/material';
import * as React from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import ApiService from '../../../../../Services/ApiServices';
/**
 * The inventory tab.
 */




const validationSchema = Yup.object().shape({
	zone_list: Yup.array().of(
		Yup.object().shape({
			lake_zone_cd: Yup.number(),
			lake_zone_name: Yup.string(),
			lake_zone_url: Yup.string().required('Zone URL is required'),
			lake_zone_std_days: Yup.number(),
			lake_zone_arch_days: Yup.number(),
			bh_project_id: Yup.number(),
		})
	)
});



function PreconfiguredZonesTab(props:any) {
	const [preconfiguredList, setPreconfiguredList]:any = React.useState([]);
	const [preconForm, setPreconForm] = React.useState([]);
	const [codesDtl, setCodesDtl] = React.useState([]);
	const methods = useFormContext();
	const { onNext, data, onBack } = props;
	const [url, setUrl] = React.useState('');
	const [isUpdate, setUpdate] = React.useState(false);

	const [initialValues, setInitialValues] = React.useState({
		zone_list: [{
			lake_zone_cd: 0,
			lake_zone_name: '',
			lake_zone_url: '',
			lake_zone_std_days: 0,
			lake_zone_arch_days: 0,
			bh_project_id: props.data.id
		}]
	});

	React.useEffect(() => {
		console.log(props.data)
		getItem();
		if (props.data.bh_project_id) {
			const fetchAccessDetail = async () => {
				try {
					const result = await ApiService('8011','get', `/bh_project/${props.data.bh_project_id}`);
					console.log(result);
					if (result && result?.lake_zone.length) {
						setUpdate(true);
						setInitialValues({ zone_list: result?.lake_zone })
					} else {
						const fetchData = async () => {
							try {
								const result = await ApiService('8011','get', '/codes_hdr/5');
								console.log(result.codes_dtl);
								setPreconfiguredList(result.codes_dtl)
								console.log(preconfiguredList);
								var tempList: any = [];
								setPreconForm([])
								for (let i = 0; i < preconfiguredList.length; i++) {
									let myObj: any = {};
									myObj.lake_zone_cd = preconfiguredList[i].id;
									myObj.lake_zone_name = preconfiguredList[i].dtl_desc;
									myObj.lake_zone_url = url;
									myObj.lake_zone_std_days = 0;
									myObj.lake_zone_arch_days = 0;
									myObj.bh_project_id = props.data.bh_project_id;
									tempList.push(myObj)
								}
								setPreconForm(tempList)
								console.log(tempList)
								if (tempList.length) {
									setInitialValues({ zone_list: tempList })
								}

							} catch (error) {
								console.error('Error fetching data:', error);
							}
						};

						fetchData();
					}

				} catch (error) {
					console.error('Error fetching data:', error);
				}
			};
			fetchAccessDetail()
		}

		envType((result:any) => {
			var name = `s3://${data?.lake_name?.toLowerCase()}.${result?.toLowerCase()}.${generateRandomCode()}.${getDomainName(data.business_url)}`;
			console.log(data)
			console.log(name)
			setUrl(name)
			// setInitialValues({
			// 	bronze_zone: name,
			// 	silver_zone:name,
			// 	gold_zone:name,
			// 	log_zone:name,
			// 	quarantine_zone:name,
			// })
		});
	}, [(url != null && url.length > 0 && preconfiguredList.length)]);
	const getItem = async () => {
		var value: any = await localStorage.getItem('codesDtl');
		setCodesDtl(JSON.parse(value))
	};

	function findName(value:any) {
		// console.log(value)
		if (Array.isArray(codesDtl)) {
			var filteredData: any = codesDtl.find((code:any) => code.id.toString() === value?.toString());
			// console.log(filteredData)
			return filteredData?.dtl_desc.toString()
		} else {
			console.error('codesDtl is not an array.');
			return ''

		}

	}
	const envType = async (callback:any) => {
		try {
			var letter;
			const result = await ApiService('8011','get', `/codes_hdr/codes_dtl/${data.env_cd}`);
			console.log(result);
			if (result) {
				letter = result?.dtl_desc?.charAt(0); // "e"
				callback(letter)
				// setUrl(letter)
				// setInitialValues({
				// 	bronze_zone:'asas',
				// 	silver_zone:'',
				// 	gold_zone:'',
				// 	log_zone:'',
				// 	quarantine_zone:'',
				// })
			}
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};

	const getDomainName = (url: any) => {
		// Remove protocol (http, https, etc.)    
		let domain = url.replace(/(^\w+:|^)\/\//, '');     // Remove www. if present    
		domain = domain.replace(/^www\./, '');     // Split by dot and get the last two parts   
		const parts = domain.split('.');
		if (parts.length >= 2) {
			domain = parts[parts.length - 2] + '.' + parts[parts.length - 1];
		} return domain;
	};

	const generateRandomCode = () => {
		// Generate random letters for the first three characters
		const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		let firstThreeChars = '';
		for (let i = 0; i < 3; i++) {
			firstThreeChars += letters.charAt(Math.floor(Math.random() * letters.length));
		}

		// Generate random digits for the last two characters
		const digits = '0123456789';
		let lastTwoDigits = '';
		for (let i = 0; i < 2; i++) {
			lastTwoDigits += digits.charAt(Math.floor(Math.random() * digits.length));
		}

		// Concatenate the letters and digits to form the code
		const code = firstThreeChars + lastTwoDigits;
		return code?.toLowerCase();
	};
	const createPreConfiguredZone = async (values:any) => {
var data:any;
		if (isUpdate) {
			console.log(values)
			for (let i = 0; i < values.zone_list.length; i++) {
				var body: any = values.zone_list[i];
				try {
					console.log(values)
					const result = await ApiService('8011','put', `/bh_project/lake_zone/${values.zone_list[i].lake_zone_id}`, body);
					console.log('Response:', result);
					if (result) {
data=result;
					}

				} catch (error) {
					console.error('Error:', error);
				}
			}
			onNext(data);

		} else {
			for (let i = 0; i < values.zone_list.length; i++) {
				var body: any = values.zone_list[i];
				try {
					console.log(values)
					const result = await ApiService('8011','post', '/bh_project/lake_zone', body);
					console.log('Response:', result);
					if (result) {
						onNext(result);

					}

				} catch (error) {
					console.error('Error:', error);
				}
			}
		}
		// onNext(values);
		console.log(values)
	}
	return (
		<div>
			<div className='text-center w-75 m-auto py-2'>
					Based on the business URL and Silver Zone, all zone are preconfigured. Please find the zone details below. To know more about data zone click here.
			</div>

			<Formik
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={(values, { setSubmitting }) => {
					console.log(values);
					createPreConfiguredZone(values)
					setSubmitting(false);
				}}
				enableReinitialize={true}

			>
				{({ values, isSubmitting }) => (
					<Form>
						<FieldArray name="zone_list">
							{({ push, remove }) => (
								<div>
									{values.zone_list.map((zone, index) => (
										<div key={index} className='my-2'>
											<div className='row ' >
												<div className='col-2' style={{ marginBottom: '8px', fontSize: '14px', textAlign: 'start' }}>
													<label htmlFor={`zone_list.${index}.lake_zone_url`}>{values.zone_list[index].lake_zone_name ?? findName(values.zone_list[index].lake_zone_cd)} </label> <span style={{ color: 'red', paddingTop: '6px' }}>*</span>
												</div>
												
												<div className="col-10">
												<Field name={`zone_list.${index}.lake_zone_url`} as={TextField} variant="outlined" fullWidth disabled size='medium' className='shadow-sm'/>
												</div>
											</div>
											<div style={{ color: 'red', marginTop: '8px', textAlign: 'start' }}>
													<ErrorMessage name={`zone_list.${index}.lake_zone_url`} component="div" />
												</div>
										</div>
									))}

								</div>
							)}
						</FieldArray>
						{/* <div className='text-center m-32'> */}
						<Stack direction={'row'} justifyContent={'space-between'} mt={5}>
							<Button sx={{ textTransform: 'none' }}
								className="bg-secondary"
								variant="contained"
								onClick={onBack}
							>
								Back
							</Button>
							<Button sx={{ textTransform: 'none' }}
								className="bg-dark text-white"
								variant="contained"
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

export default PreconfiguredZonesTab;
