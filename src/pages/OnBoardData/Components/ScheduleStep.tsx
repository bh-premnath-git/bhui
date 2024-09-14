import {
	FormControl, TextField,Button, Typography, Stack, Box, Tooltip, SelectChangeEvent, IconButton
	,  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import { useState, useEffect } from 'react';
import * as yup from 'yup';
import ApiService from '../../../services/ApiServices';
import { ErrorMessage, Field, Form, Formik } from 'formik';

const validationSchema = yup.object().shape({
	minute: yup.number().integer().min(0).max(59).required('Minute is required'),
	hours: yup.number().integer().min(0).max(23).required('Hours is required'),
	dayOfMonth: yup.number().integer().min(1).max(31).required('Day of the month is required'),
	month: yup.number().integer().min(1).max(12).required('Month is required'),
	dayOfWeek: yup.number().integer().min(0).max(6).required('Day of the week is required'),
});

function ScheduleStep(props: any) {


	const [activePicker, setActivePicker] = useState(null);
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [date, setDate] = useState(null);

	const [time, setTime] = useState(null);
	const [occurance, setOccurance] = useState('');
	const [isCardOpen, setIsCardOpen] = useState(false);
	// const [date, setDate] = useState(null);
	const [count, setCount] = useState(0);
	console.log(props.sourceItem)
	console.log(props.tags)
	const initialValues = {
		minute: '',
		hours: '',
		dayOfMonth: '',
		month: '',
		dayOfWeek: '',
	};
	const [formValues, setFormValues] = useState({

		minute: '',
		hours: '',
		dayOfMonth: '',
		month: '',
		dayOfWeek: '',

	});

	const [selectedSeduledOption, setSelectedSeduledOption] = useState('');
	const [pipelineValues, setPipelineValues] = useState();


	const handledChange = (event: any) => {
		console.log(event.target.value)

		setSelectedSeduledOption(event.target.value);

	};




	const handleChange = (event: SelectChangeEvent) => {
		setOccurance(event.target.value as string);
	};
	const handleMenuItemClick = () => {
		setIsCardOpen(!isCardOpen);
	};
	const handleNextButtonClick = (values) => {
		console.log('Form Values:', values);
		setFormValues(values);
		fetchPipeline(values);

		// Add any other logic you need here
		props.handleNext(); // Call the handleNext function from props
	};



	const [selectedBox, setSelectedBox] = useState(null);

	const handleBoxClick = (boxId: any) => {
		setSelectedBox(boxId);
	};
	const fetchPipeline = async (formValues) => {

		const body = {
			"pipeline_id": 0,
			"pipeline_name": "string",
			"pipeline_key": "string",
			"pipeline_desc": "string",
			"pipeline_type_cd": 0,
			"tags": {
				"key":props.tags
			},
			"pipeline_schedule": {
				formValues
			},
			"pipeline_zone_type_cd": 0,
			"data_src_id": props.sourceItem,
			"pipeline_sources": [
			  {
				"pipeline_id": 0,
				"data_src_id": props.sourceItem,
				"data_src_lyt_id": 2,
				"pipeline_src_order": 0
			  }
			],
			"pipeline_targets": [
			  {
				"pipeline_id": 0,
				"data_src_id": props.sourceItem,
				"data_src_lyt_id": 2,
				"pipeline_src_order": 0
			  }
			]
		  }
		console.log(body)
		
		try {
			// setIsLoading(true)
			const result = await ApiService('8011', 'post', '/pipelines/',body);
			console.log('Result:', result);
			setPipelineValues(result);

			console.log(result)
			// setIsLoading(false)

		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};
	// useEffect(() => {
	// 	if (selectedSeduledOption === 'Cron Expression') {
	// 		fetchPipeline(formValues);
	// 	}
	// }, [selectedSeduledOption, formValues]);


	return (

		<Stack>
			<Stack ml={70} mt={5}>
				<Typography variant='subtitle1' fontWeight={'bold'}>
					Select Any One Schedule Option
				</Typography>

				<FormControl
					component="fieldset"
					className="formControl"
					sx={{ mt: 2, textAlign: 'left' }}
				>
					{/* <RadioGroup

						aria-label="Layout Direction"
						className="SwombSettings-group"
						row
						
					> */}
						
					
						<Box border={1} borderColor={"white"} borderRadius={2} pl={1} width={"200px"}>
							<Typography sx={{fontWeight:'bold'}}>Corn Expression</Typography>
							
								

							
						</Box>
					{/* </RadioGroup> */}

				</FormControl>



			</Stack>
			 <Stack> 
				
					<Stack ml={30}>

						<Formik
							initialValues={initialValues}
							validationSchema={validationSchema}
							onSubmit={(values) => {
								console.log('Submitted values:', values);
							}}
						>
							{({ values, handleChange }) => (
								<Form>
									<TableContainer component={Paper} sx={{ width: 1000, mt: 2 }}>
										<Table sx={{ minWidth: 650 }} aria-label="simple table">
											<TableHead sx={{ backgroundColor: '#E5E5E5' }}>
												<TableRow>
													<TableCell>Minute (0-59)</TableCell>
													<TableCell align="left">Hours (0-23)</TableCell>
													<TableCell align="left">Day Of The Month (1-31)</TableCell>
													<TableCell align="left">Month (1-12)</TableCell>
													<TableCell align="left">Day Of The Week (0-6)</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												<TableRow>
													<TableCell>
														<Field
															name="minute"
															as={TextField}
															placeholder="Enter Minute"
															InputProps={{ disableUnderline: true }}
															variant="standard"
															onChange={(e) => handleChange(e)}
														/>
														<ErrorMessage name="minute" render={(msg) => <div style={{ color: 'red' }}>{msg}</div>} />

													</TableCell>
													<TableCell>
														<Field
															name="hours"
															as={TextField}
															placeholder="Enter Hours"
															InputProps={{ disableUnderline: true }}
															variant="standard"
															onChange={(e) => handleChange(e)}
														/>
														<ErrorMessage name="hours" render={(msg) => <div style={{ color: 'red' }}>{msg}</div>} />

													</TableCell>
													<TableCell>
														<Field
															name="dayOfMonth"
															as={TextField}
															placeholder="Enter day of the month"
															InputProps={{ disableUnderline: true }}
															variant="standard"
															onChange={(e) => handleChange(e)}
														/>
														<ErrorMessage name="dayOfMonth" render={(msg) => <div style={{ color: 'red' }}>{msg}</div>} />
													</TableCell>
													<TableCell>
														<Field
															name="month"
															as={TextField}
															placeholder="Enter Month"
															InputProps={{ disableUnderline: true }}
															variant="standard"
															onChange={(e) => handleChange(e)}
														/>
														<ErrorMessage name="month" render={(msg) => <div style={{ color: 'red' }}>{msg}</div>} />
													</TableCell>
													<TableCell>
														<Field
															name="dayOfWeek"
															as={TextField}
															placeholder="Enter day of the week"
															InputProps={{ disableUnderline: true }}
															variant="standard"
															onChange={(e) => handleChange(e)}
														/>
														<ErrorMessage name="dayOfWeek" render={(msg) => <div style={{ color: 'red' }}>{msg}</div>} />

													</TableCell>


													{/* Repeat for other cells */}
												</TableRow>
											</TableBody>
										</Table>
									</TableContainer>
									<Stack mt={4}>
										<Typography color={'inherit'} align='left' mt={2}
											variant='subtitle2'>Here are some examise for you</Typography>

										<TableContainer component={Paper} sx={{ width: 1000, mt: 2 }} >
											<Table sx={{ minWidth: 650 }} aria-label="simple table">
												<TableHead sx={{ backgroundColor: '#E5E5E5' }} >
													<TableRow>
														<TableCell>Cron Expression</TableCell>
														<TableCell align="left">Schedule</TableCell>

													</TableRow>
												</TableHead>
												<TableBody>

													<TableRow
														sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
													>
														<TableCell component="th" scope="row">

															<Typography>*****</Typography><br />
															<Typography>0****</Typography><br />
															<Typography>00***</Typography><br />
															<Typography>00**Fri</Typography><br />

														</TableCell>
														<TableCell align="left">

															<Typography>Every Minute</Typography><br />
															<Typography>Every Hour</Typography><br />
															<Typography>Every Day At 12.00 AM</Typography><br />
															<Typography>At 12.00 AM, Only On Friday</Typography><br />

														</TableCell>

													</TableRow>

												</TableBody>
											</Table>
										</TableContainer>

									</Stack>


									<Box sx={{ mx: "45%", mt: '13%' }}>
										<Button
											variant="contained"
											sx={{
												color: 'white',
												backgroundColor: 'black',
												width: '200px',
												textTransform: 'none',
												'&:hover': {
													backgroundColor: 'black',
												},
											}}
											onClick={() => handleNextButtonClick(values)} // Call handleNextButtonClick with form values
										>
											Next
										</Button>
									</Box>
								</Form>
							)}
						</Formik>


					</Stack>

				
			</Stack >



		</Stack>

	);
}

export default ScheduleStep;