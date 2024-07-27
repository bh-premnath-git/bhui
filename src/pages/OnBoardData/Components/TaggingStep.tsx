import { Controller, useFormContext } from 'react-hook-form';
import {
	FormControl, FormControlLabel, TextField, InputLabel, MenuItem, Radio, RadioGroup, Select,
	Button, Stack, Typography, Chip, DialogActions, DialogContent, DialogTitle, Dialog, Box
} from '@mui/material';
import * as React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { IoIosAddCircle } from 'react-icons/io';
import ApiService from '../../../services/ApiServices';



/**
 * The inventory tab.
 */

const validationSchema = yup.object({
	tagKey: yup.string().required('Tag Key is required'),
	tagValue: yup.string().required('Tag Value is required'),
});
function TaggingStep(props: any) {

	const [tags, setTags]: any = React.useState([]);

	const [tagKey, setTagKey] = React.useState('');
	const [tagValue, setTagValue] = React.useState('');
	const [isOpen, setIsOpen] = React.useState(false);
	const [initialValue, setInitialValue] = React.useState({ tagKey: '', tagValue: '' })

	const openDialog = () => {
		setIsOpen(true);
	};

	const closeDialog = () => {
		setIsOpen(false);
	};

	const addTag = () => {
		if (tagKey.trim().length > 0 && tagValue.trim().length > 0) {
			setTags([...tags, { key: tagKey, value: tagValue }]);
			setTagKey('');
			setTagValue('');
		}
	};

	const handleDelete = (index: any) => {
		setTags([])
		// tags.splice(index,1);		
	};
	const handleTagDelete = (i: any) => {
		console.log(i)
		const updatedTags = tags.filter((_: any, index: any) => index !== i);
		setTags(updatedTags)
		// tags.splice(index,1);		
	};
	const handleSubmit = (values: any, { setSubmitting }: { setSubmitting: (isSubmitting: any) => void }) => {
		const newTag = { key: values.tagKey, value: values.tagValue };
		const updatedTags = [...tags, newTag];
		props.onTagsChange(updatedTags)
		setTags([...tags, newTag]);
		setSubmitting(false);
		setIsOpen(false);

	};
	console.log(props.sourceItem)
	console.log(tags)


	const fetchTagvalueUpdate = async (data) => {
		console.log(props.sourceItem)
		const body = { 'data_src_tags': { "key": tags }, 'data_src_status_cd': 0, 'data_src_desc': '' }
		console.log(body)
		try {
			const result = await ApiService('8011', 'put', `/data_source/{data_src_id}?data_source_id=${props.sourceItem}`, body);
			console.log(result);


			props.handleNext();
		} catch (error) {
			console.error('Error fetching data:', error);
		}

	};
	// const fetchTagvalueUpdate = async (data) => {
	// 	const data_src_id = 1; // Replace with the actual data source ID
	// 	const url = `/data_source/{data_src_id}?data_source_id=1`;

	// 	const body = {
	// 	  data_src_desc: "string",
	// 	  data_src_status_cd: 0,
	// 	  data_src_tags: data.tags
	// 	};

	// 	try {
	// 	  const response = await fetch(url, {
	// 		method: 'PUT',
	// 		headers: {
	// 		  'accept': 'application/json',
	// 		  'Content-Type': 'application/json'
	// 		},
	// 		body: JSON.stringify(body)
	// 	  });

	// 	  if (!response.ok) {
	// 		throw new Error('Network response was not ok');
	// 	  }

	// 	  const result = await response.json();
	// 	  console.log('Success:', result);
	// 	} catch (error) {
	// 	  console.error('Error:', error);
	// 	}
	//   };
	const handleNextClick = (data) => {
		fetchTagvalueUpdate(data);
	};
	return (
		<>

			<Stack mx={42}>
				<Stack>
					<Typography variant='subtitle1' fontWeight={'bold'} textAlign={'start'} sx={{ mt: 10 }} className='custom-typography'>
						Add Tags
					</Typography>
					<Typography variant='subtitle1' textAlign={'start'} sx={{ mt: 1.5 }} className='custom-typography'>
						Add one or more tags to easily identify compute instances created by bighammer.ai in your <br />
						Aws account(Eg : key : Product, Value : Bighammer.ai)
					</Typography>
				</Stack>

			</Stack>
			<Stack mx={42}>
				<div className=' pt-10'>
					{tags.map((tag, index) => (
						<Chip key={index} label={`${tag.key} >> ${tag.value}`} variant="outlined" style={{ fontSize: '12px', borderRadius: '5px', background: '#eeeeee', marginLeft: `${index === 0 ? '' : '16px'}` }} onDelete={() => handleTagDelete(index)} />
					))}
				</div>

			</Stack>

			<Dialog open={isOpen} onClose={closeDialog} PaperProps={{ sx: { borderRadius: '2px' } }}>
				<DialogTitle mx={2} px={3}>Add Tags</DialogTitle>
				<DialogContent sx={{ width: '450px', }} >
					<Formik
						initialValues={initialValue}
						validationSchema={validationSchema}
						onSubmit={handleSubmit}
						enableReinitialize={true}
					>
						{({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
							<Form style={{ textAlign: 'center' }}>
								<div>
									<div style={{ paddingTop: '8px', paddingBottom: '8px', textAlign: 'start' }}>
										<label htmlFor="tagKey">Tag Key</label>
									</div>
									<Field type="text" id="tagKey" name="tagKey" as={TextField} fullWidth />
									<div style={{ color: 'red', textAlign: 'start' }}>
										<ErrorMessage name="tagKey" component="div" />
									</div>
								</div>

								<div>
									<div style={{ paddingTop: '8px', paddingBottom: '8px', textAlign: 'start' }}>
										<label className='py-12 my-12' htmlFor="tagValue">Tag Value</label>

									</div>
									<Field type="text" id="tagValue" name="tagValue" as={TextField} fullWidth />
									<div style={{ color: 'red', textAlign: 'start' }}>
										<ErrorMessage name="tagValue" component="div" />
									</div>
								</div>
								<br></br>

								<DialogActions sx={{ justifyContent: 'space-between', mb: 2 }} >

									<Button onClick={closeDialog} variant="contained" className='bg-secondary '
										size="large">Close</Button>
									<Button type='submit' variant="contained"
										className='bg-dark'
										size="large" 
										disabled={!values.tagKey || !values.tagValue}>Ok</Button>

								</DialogActions>
							</Form>
						)}
					</Formik>
				</DialogContent>
			</Dialog>
			{/* onClick={addTag} */}
			<Stack sx={{ width: '15%', mx: 36 }}>

				<Button onClick={openDialog}
					className="group inline-flex items-center mt-2 - px-4 rounded cursor-pointer">
					<IoIosAddCircle style={{ color: 'green' }} size={20}>heroicons-solid:plus-circle</IoIosAddCircle>

					<span className={`ml-8 font-large text-secondary group-hover:underline `} style={{ color: 'green', fontWeight: '600' }}>Add a Tag</span>
				</Button>

			</Stack>
			<Box sx={{ mx: "45%", mt: '20%' }}>
				<Button variant="contained" sx={{
					color: 'white', backgroundColor: 'black', width: '200px',

					textTransform: 'none',
					'&:hover': {
						backgroundColor: 'black',
					},


				}} onClick={handleNextClick} >Next


				</Button>


			</Box>


			{/* <p style={{ marginTop: '12px', textAlign: "center" }} >
				{tags.map((tag, index) => (
					<Chip label={`${tag.key} >> ${tag.value}`} variant="outlined"
						style={{ fontSize: '12px', borderRadius: '5px', background: '#eeeeee', marginLeft: `${index == 0 ? '' : '16px'}` }} onDelete={() => handleDelete(index)} />
				))}
			</p>
			<div className="m-auto " style={{ width: '60' }}>
				<div className="flex -mx-4">
					<Controller
						name="tagKey"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								size="small"
								sx={{ ml: 65, mt: 2 }}
								// className="mt-8 mb-16 ml-50"
								label="Tag Key *"
								autoFocus
								id="tagKey"
								variant="outlined"
								// fullWidth
								value={tagKey}
								onChange={(e) => {
									setTagKey(e.target.value);
								}}
							/>
						)}
					/>

					<Controller
						name="tagValue"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								value={tagValue}
								onChange={(e) => {
									setTagValue(e.target.value);
								}}
								size="small"
								// className="mt-8 mb-16 mx-4"
								sx={{ ml: 3, mt: 2 }}
								label="Tag Value *"
								id="tagValue"
								variant="outlined"
							// fullWidth

							/>
						)}
					/>
				</div>
			</div>

			<Stack direction={"row"} spacing={1} sx={{ ml: 64, mt: 4 }}>
				<Stack>
					<AddCircleIcon sx={{ color: '#42CD3F' }} />
				</Stack>
				<Stack>
					<Typography variant='subtitle1' fontWeight={"bold"} sx={{ color: '#42CD3F', }} onClick={addTag}>
						ADD TAG
					</Typography>
				</Stack>
			</Stack> */}
		</>

	);
}

export default TaggingStep;



