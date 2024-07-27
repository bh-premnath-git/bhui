import {
	FormControl, FormControlLabel, TextField, InputLabel, MenuItem, Radio,
	RadioGroup, Select, Checkbox, Button, Typography, Stack, Box, Tooltip, SelectChangeEvent, Card, CardContent, IconButton
	, OutlinedInput, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';
import * as React from 'react';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useState, useEffect } from 'react';
import * as yup from 'yup';
import { green } from '@mui/material/colors';
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
	const methods = useFormContext();


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

	// const [selectedValue, setSelectedValue] = useState('');

	// const [isButtonClicked, setIsButtonClicked] = useState<boolean>(null);
	const [selectedSeduledOption, setSelectedSeduledOption] = useState('');
	// const [isButtonClick, setIsButtonClick] = useState<boolean>(false);
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
						
						{/* <Box border={1} borderColor={"lightgray"} borderRadius={2} pl={1} width={"200px"}>
							<FormControlLabel
								// key="21"
								value="Wizard based"
								control={<Radio sx={{
									'&.Mui-checked': {
										color: green[500],
									},
									'&:not(.Mui-checked)': {
										color: "black",
									},
								}} />}
								label="Wizard Based"
							></FormControlLabel>
						</Box> */}
						<Box border={1} borderColor={"white"} borderRadius={2} pl={1} width={"200px"}>
							<Typography sx={{fontWeight:'bold'}}>Corn Expression</Typography>
							
								

							
						</Box>
					{/* </RadioGroup> */}

				</FormControl>



			</Stack>
			 <Stack> 
				
					{/*<Stack ml={40}>
						<Stack direction={"row"} spacing={102} mt={4}>
							<Typography variant='subtitle1' fontWeight={"bold"} textAlign={'left'}>Date & Time </Typography>
							{/* <Typography variant='subtitle1' fontWeight={"bold"} textAlign={'left'}>Date & Time</Typography> 
						</Stack>
						<Stack direction={'row'} spacing={2}>
							<Stack>
								<LocalizationProvider dateAdapter={AdapterDayjs}>
									<Typography textAlign={'left'} sx={{ mt: 2 }}>Start Date</Typography>
									<DemoContainer components={['DatePicker']}>
										<DatePicker

											value={startDate} onChange={(newValue: any) => setStartDate(newValue)}
										/>
									</DemoContainer>
								</LocalizationProvider>
							</Stack>
							<Stack>
								<LocalizationProvider dateAdapter={AdapterDayjs}>
									<Typography textAlign={'left'} sx={{ mt: 2, }}>End Date</Typography>
									<DemoContainer components={['DatePicker']}>
										<DatePicker

											value={endDate}
											onChange={(newValue: any) => setEndDate(newValue)}
										/>

									</DemoContainer>
								</LocalizationProvider>
							</Stack>
							<Stack>
								<Typography textAlign={'left'} sx={{ mt: 2, }}>Time</Typography>
								<LocalizationProvider dateAdapter={AdapterDayjs} >


									<TimePicker

										value={time}
										onChange={(newValue: any) => setTime(newValue)}


										sx={{ mt: 1 }}

									/>


								</LocalizationProvider>
							</Stack>
						</Stack>
						<Stack>
							<Typography variant='subtitle2' fontWeight={'bold'} textAlign={'start'} mt={4}>Frequency</Typography>
							<Typography textAlign={'left'} sx={{ mt: 2, }}>Occurrence</Typography>
							<Box sx={{ width: '290px', mt: 1 }}>
								<FormControl fullWidth>


									<Select

										value={occurance}
										displayEmpty
										input={<OutlinedInput />}

										onChange={handleChange}



									>

										<MenuItem value={10}>Does Not Repeat</MenuItem>
										<MenuItem value={20}>Daily</MenuItem>
										<MenuItem value={30}>Weekly</MenuItem>
										<MenuItem value={40}>Monthly</MenuItem>
										<MenuItem value={50}>Yearly</MenuItem>
										<MenuItem value={60} sx={{ fontWeight: 'bold' }} onClick={handleMenuItemClick}>
											Customise
										</MenuItem>
									</Select>

									{isCardOpen && (
										<Box sx={{
											position: 'fixed',
											top: '50%',
											left: '50%',
											transform: 'translate(-50%, -50%)',
											zIndex: 9999,
										}}>
											<Card  >
												<CardContent>
													<Stack>
														<Typography variant='subtitle1' fontWeight={"bold"} textAlign={'left'}>
															Custom Occurrence
														</Typography>
														<Typography variant='subtitle2' textAlign={'left'} mt={3} fontWeight={'bold'}>
															Repeat Every
														</Typography>
														<Stack direction={"row"} spacing={2} mt={2}>
															<TextField
																id="outlined-number"

																type="number"
																InputLabelProps={{
																	shrink: true,
																}}
																InputProps={{
																	inputProps: { min: "0" }
																}}
																sx={{ width: '120px' }}
															/>
															<Select
																value={occurance}
																onChange={handleChange} sx={{ width: '120px' }}>

																<MenuItem value={20}>Daily</MenuItem>
																<MenuItem value={30}>Week</MenuItem>
																<MenuItem value={40}>Monthly</MenuItem>

															</Select>
														</Stack>
														<Stack mt={3}>
															<Typography variant='subtitle2' textAlign={'left'} fontWeight={'bold'}>Repeate On</Typography>
														</Stack>
														<Stack direction={'row'} spacing={2} mt={2}>
															<Box
																onClick={() => handleBoxClick(1)}
																sx={{
																	width: 60,
																	height: 50,
																	backgroundColor: selectedBox === 1 ? '#27B0F0' : 'transparent',
																	color: selectedBox === 1 ? 'white' : 'black',
																	margin: 2,

																	cursor: 'pointer',
																	display: 'flex',
																	alignItems: 'center',
																	justifyContent: 'center',
																	border: 1,
																	borderColor: 'lightgrey',
																	borderRadius: 1
																}}
															>
																Mon
															</Box>
															<Box
																onClick={() => handleBoxClick(2)}
																sx={{
																	width: 60,
																	height: 50,
																	backgroundColor: selectedBox === 2 ? '#27B0F0' : 'transparent',
																	color: selectedBox === 2 ? 'white' : 'black',
																	margin: 2,

																	cursor: 'pointer',
																	display: 'flex',
																	alignItems: 'center',
																	justifyContent: 'center',
																	border: 1,
																	borderColor: 'lightgrey',
																	borderRadius: 1
																}}
															>
																Tue
															</Box>
															<Box
																onClick={() => handleBoxClick(3)}
																sx={{
																	width: 60,
																	height: 50,
																	backgroundColor: selectedBox === 3 ? '#27B0F0' : 'transparent',
																	color: selectedBox === 3 ? 'white' : 'black',
																	margin: 2,

																	cursor: 'pointer',
																	display: 'flex',
																	alignItems: 'center',
																	justifyContent: 'center',
																	border: 1,
																	borderColor: 'lightgrey',
																	borderRadius: 1
																}}
															>
																Wed
															</Box>
															<Box
																onClick={() => handleBoxClick(4)}
																sx={{
																	width: 60,
																	height: 50,
																	backgroundColor: selectedBox === 4 ? '#27B0F0' : 'transparent',
																	color: selectedBox === 4 ? 'white' : 'black',
																	margin: 2,

																	cursor: 'pointer',
																	display: 'flex',
																	alignItems: 'center',
																	justifyContent: 'center',
																	border: 1,
																	borderColor: 'lightgrey',
																	borderRadius: 1
																}}
															>
																Thu
															</Box>
															<Box
																onClick={() => handleBoxClick(5)}
																sx={{
																	width: 60,
																	height: 50,
																	backgroundColor: selectedBox === 5 ? '#27B0F0' : 'transparent',
																	color: selectedBox === 5 ? 'white' : 'black',
																	margin: 2,

																	cursor: 'pointer',
																	display: 'flex',
																	alignItems: 'center',
																	justifyContent: 'center',
																	border: 1,
																	borderColor: 'lightgrey',
																	borderRadius: 1
																}}
															>
																Fri
															</Box>
															<Box
																onClick={() => handleBoxClick(6)}
																sx={{
																	width: 60,
																	height: 50,
																	backgroundColor: selectedBox === 6 ? '#27B0F0' : 'transparent',
																	color: selectedBox === 6 ? 'white' : 'black',
																	margin: 2,

																	cursor: 'pointer',
																	display: 'flex',
																	alignItems: 'center',
																	justifyContent: 'center',
																	border: 1,
																	borderColor: 'lightgrey',
																	borderRadius: 1
																}}
															>
																Sat
															</Box>
															<Box
																onClick={() => handleBoxClick(7)}
																sx={{
																	width: 60,
																	height: 50,
																	backgroundColor: selectedBox === 7 ? '#27B0F0' : 'transparent',
																	color: selectedBox === 7 ? 'white' : 'black',
																	margin: 2,

																	cursor: 'pointer',
																	display: 'flex',
																	alignItems: 'center',
																	justifyContent: 'center',
																	border: 1,
																	borderColor: 'lightgrey',
																	borderRadius: 1
																}}
															>
																Sun
															</Box>


														</Stack>
														<Stack>



															<FormControl
																component="fieldset"
																className="formControl"
																sx={{ mt: 2, textAlign: 'left' }}
															>
																<Typography variant='subtitle2' textAlign={'left'} fontWeight={'bold'}>Ends</Typography>
																<RadioGroup

																	aria-label="Layout Direction"
																	className="SwombSettings-group"
																// row
																>
																	<br></br>
																	<Box >
																		<FormControlLabel
																			key="11"
																			value="11"
																			control={<Radio sx={{
																				'&.Mui-checked': {
																					color: green[500],
																				},
																				'&:not(.Mui-checked)': {
																					color: "black",
																				},
																			}} />}
																			label="Never"
																		></FormControlLabel>
																	</Box>
																	<Stack direction={'row'} spacing={3} mt={2}>
																		<Box >
																			<FormControlLabel
																				key="12"
																				value="12"
																				control={<Radio sx={{
																					'&.Mui-checked': {
																						color: green[500],
																					},
																					'&:not(.Mui-checked)': {
																						color: "black",
																					},
																				}} />}
																				label="On"



																			/>
																		</Box>
																		<LocalizationProvider dateAdapter={AdapterDayjs}>

																			<DemoContainer components={['DatePicker']}>
																				<DatePicker

																					sx={{ width: '20px', pl: 1 }}
																					value={date} onChange={(newValue: any) => setDate(newValue)}
																				/>
																			</DemoContainer>
																		</LocalizationProvider>
																	</Stack>
																	<Stack direction={'row'} spacing={2} mt={2}>
																		<Box >
																			<FormControlLabel
																				key="13"
																				value="13"
																				control={<Radio sx={{
																					'&.Mui-checked': {
																						color: green[500],
																					},
																					'&:not(.Mui-checked)': {
																						color: "black",
																					},
																				}} />}
																				label="After"
																			/>
																		</Box>
																		<TextField
																			id="outlined-number"
																			// label="Number"
																			type="number"
																			placeholder='Occurance'
																			InputLabelProps={{
																				shrink: true,

																			}}
																			InputProps={{
																				inputProps: { min: "0" } // Ensure only non-negative numbers can be typed
																			}}
																			sx={{ width: '192px' }}
																		/>
																	</Stack>
																</RadioGroup>
																<Stack direction={'row'} spacing={2} ml={12} mt={4}>
																	<Box >
																		<Button variant="outlined" sx={{
																			color: 'Black', width: '150px',

																			textTransform: 'none',


																		}} onClick={handleMenuItemClick}  >Close


																		</Button>
																	</Box>
																	<Box >
																		<Button variant="contained" sx={{
																			color: 'white', backgroundColor: 'black', width: '150px',

																			textTransform: 'none', '&:hover': {
																				backgroundColor: 'black',
																			},


																		}} onClick={handleMenuItemClick}>Done


																		</Button>
																	</Box>
																</Stack>

															</FormControl>



														</Stack>
													</Stack>

												</CardContent>
											</Card>
										</Box>
									)}
								</FormControl>
							</Box>
						</Stack>

					</Stack> */}



				
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


						{/* <Stack mt={4}>
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

						</Stack> */}
					</Stack>

				
				{/* <Box sx={{ mx: "45%", mt: '13%' }}>
					<Button variant="contained" sx={{
						color: 'white', backgroundColor: 'black', width: '200px',

						textTransform: 'none',
						'&:hover': {
							backgroundColor: 'black',
						},


					}} onClick={props.handleNext} >Next


					</Button>


				</Box> */}
			</Stack >



			{/* <Box >
				<Stack direction={'row'} spacing={8} bgcolor={'#E5E5E5'} width={950} mt={4} p={4}>

					<Typography variant='subtitle2' fontWeight={'bold'}>Minute (0-59)</Typography>
					<Typography variant='subtitle2' fontWeight={'bold'}>Hours (0-23)</Typography>
					<Typography variant='subtitle2' fontWeight={'bold'}>Day Of The Month (1-31)</Typography>
					<Typography variant='subtitle2' fontWeight={'bold'}>Month (1-12)</Typography>
					<Typography variant='subtitle2' fontWeight={'bold'}>Day Of The Week (0-6)</Typography>

				</Stack>
				<Stack direction={'row'} width={950} >
					<TextField variant="standard" placeholder='Enter Minutes' InputProps={{ disableUnderline: true }} />
					<TextField variant="standard" placeholder='Enter Hours' InputProps={{ disableUnderline: true }} />
					<TextField variant="standard" placeholder='Enter Day Of The Month' InputProps={{ disableUnderline: true }} />
					<TextField variant="standard" placeholder='Enter Month' InputProps={{ disableUnderline: true }} />
					<TextField variant="standard" placeholder='Enter Day Of The Week' InputProps={{ disableUnderline: true }} />
				</Stack>
			</Box> */}

			{/* <Controller
				name="ruleTypeCd"
				control={control}
				render={({ field }) => (
					<FormControl
						component="fieldset"
						className="formControl"
					>
						<RadioGroup
							{...field}
							aria-label="Layout Direction"
							className="SwombSettings-group"
							row
						>
							<br></br>
							<div className="border-1 p-20">
								<FormControlLabel
									key="11"
									value="11"
									control={<Radio />}
									label="Wizard Based"
								></FormControlLabel>
							</div><div className="border-1 p-20">
								<FormControlLabel
									key="12"
									value="12"
									control={<Radio />}
									label="Cron Expression"
								/></div>
						</RadioGroup>
					</FormControl>
				)}
			/> */}

		</Stack>

	);
}

export default ScheduleStep;