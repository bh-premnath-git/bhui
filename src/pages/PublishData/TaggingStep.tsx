import { FormControl, FormControlLabel, TextField, InputLabel, MenuItem, Radio, RadioGroup, Select, Button, Stack, Typography, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { green } from '@mui/material/colors';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import * as React from 'react';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as yup from 'yup';
import { IoIosAddCircle } from 'react-icons/io';
import ApiService from '../../services/ApiServices';

const validationSchema = yup.object({
	tagKey: yup.string().required('Tag Key is required'),
	tagValue: yup.string().required('Tag Value is required'),
});
function TaggingStep({ handlePrivious, handleNext, publishId }: any) {
	const [tag, setTags]: any = React.useState([]);
	const [zone, setZone] = React.useState([])
	const [tagKey, setTagKey] = React.useState('')
	const [tagValue, setTagValue] = React.useState('')
	const [publishData, setPublishData]: any = React.useState()
	const [isOpen, setIsOpen] = React.useState(false);
	const [initialValue, setInitialValue] = React.useState({ tagKey: '', tagValue: '' })


	const openDialog = () => {
		setIsOpen(true);
	};

	const closeDialog = () => {
		setIsOpen(false);
	};
	const handleSubmit = (values: any, { setSubmitting }: { setSubmitting: (isSubmitting: any) => void }) => {
		const newTag = { key: values.tagKey, value: values.tagValue };
		const updatedTags = [...tag, newTag];
		setTags([...tag, newTag]);
		setSubmitting(false);
		setIsOpen(false);
	};
	const handleTagDelete = (i: any) => {
		console.log(i)
		const updatedTags = tag.filter((_: any, index: any) => index !== i);
		setTags(updatedTags)
	};
	React.useEffect(() => {
		if (publishId) {
			getData(publishId)
		}
	}, [])

	async function getData(publishdataId) {
		var data = {};
		var result = await ApiService('8011', 'get', `/publish_data/publish_details/${publishdataId}`, data);
		if (result) {
			setPublishData(result)
			if (result.tag?.tag) {
				console.log(result?.tag?.tag)
				setTags(result?.tag?.tag)
			}
		}
		console.log(result)
	}

	const addTag = () => {
		if (tagKey.trim().length > 0 && tagValue.trim().length > 0) {
			tag.push({
				"key": tagKey, "value": tagValue
			});
			setTagKey('');
			setTagValue('');
		}
	};
	async function saveTag() {
		publishData.tag = { tag: tag };
		var result = await ApiService('8011', 'put', `/publish_data/publish_details/${publishId}`, publishData);
		console.log(result)
		if (result) {
			handleNext(result)
		}
	}

	return (
		<>

			<Stack className='m-auto w-75'>
				<Stack>
					<Typography className='tag myHeadFont ' textAlign={'start'} sx={{ mt: 10 }} >
						Add Tags
					</Typography>
					<Typography variant='subtitle1' textAlign={'start'} sx={{ mt: 1.5, mx: 2 ,fontFamily:'Inter !important'}}>
						Add one or more tags to easily identify compute instances created by bighammer.ai in your <br />
						Aws account(Eg : key : Product, Value : Bighammer.ai)
					</Typography>
				</Stack>


			</Stack>

			<br></br>
			<Stack className='w-75 m-auto' textAlign={'start'} sx={{}}>
				<div className=' pt-10'>
					{tag?.map((tag, index) => (
						<Chip key={index} label={`${tag.key} >> ${tag.value}`}
							variant="outlined" className='bg-white shadow-sm rounded'
							style={{ fontSize: '12px', borderRadius: '5px', background: '#eeeeee', marginLeft: `${index === 0 ? '' : '16px'}` }} onDelete={() => handleTagDelete(index)} />
					))}
				</div>

				<div className='text-start mt-2 green-btn'>
					<Button onClick={openDialog}
					>
						<IoIosAddCircle style={{ color: '#07A260' }} size={20}>heroicons-solid:plus-circle</IoIosAddCircle>

						<span className={`mx-2 `}
							style={{ color: '#07A260', fontWeight: '600',fontFamily:'Inetr !important' }}>
							Add Tag</span>
					</Button>
				</div>

				<br></br>
				<br></br>
				<Stack direction={'row'} spacing={3} justifyContent={'center'}>
					<Button variant="contained" className='back-btn' onClick={handlePrivious}
					>Back
					</Button>
					<Button variant="contained" disabled={tag?.length == 0} className='create-btn' type='submit'
						onClick={saveTag}> {publishData?.tag?.tag ? "Update" : "Next"}
					</Button>
				</Stack>
			</Stack>
			<Dialog open={isOpen} onClose={closeDialog} PaperProps={{ sx: { borderRadius: '2px' } }}>
				<DialogTitle px={5} className='tags myHeadFont'>Add Tags</DialogTitle>
				<DialogContent sx={{ width: '450px', }} >
					<Formik
						initialValues={initialValue}
						validationSchema={validationSchema}
						onSubmit={handleSubmit}
						enableReinitialize={true}
					>
						{({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
							<Form style={{ textAlign: 'start' }}>
								<div>
									<div style={{ paddingTop: '8px', paddingBottom: '8px', textAlign: 'start' }}>
										<label htmlFor="tagKey" className='myHeadFont'>Tag Key</label>
									</div>
									<Field type="text" id="tagKey" name="tagKey" as={TextField} className='w-100' />
									<div style={{ color: 'red', textAlign: 'start', paddingLeft: '21px' }}>
										<ErrorMessage name="tagKey" component="div" />
									</div>
								</div>

								<div>
									<div style={{ paddingTop: '8px', paddingBottom: '8px', textAlign: 'start', }}>
										<label className='py-12 my-12 myHeadFont' htmlFor="tagValue">Tag Value</label>

									</div>
									<Field type="text" id="tagValue" name="tagValue" as={TextField} className='w-100' />
									<div style={{ color: 'red', textAlign: 'start', paddingLeft: '21px' }}>
										<ErrorMessage name="tagValue" component="div" />
									</div>
								</div>


								<DialogActions sx={{ justifyContent: 'space-between', my: 2 }} >

									<Button onClick={closeDialog} className='bg-secondary' variant="contained"
										size="large">Close</Button>
									<Button type='submit' variant="contained"
										className='bg-dark text-white' size="large" sx={{ width: 80 }}
										disabled={!values.tagKey || !values.tagValue}>Ok</Button>

								</DialogActions>

							</Form>
						)}
					</Formik>
				</DialogContent>
			</Dialog>
		</>

	);
}

export default TaggingStep;