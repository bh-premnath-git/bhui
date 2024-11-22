import InputAdornment from '@mui/material/InputAdornment';
import {
	FormControl, FormControlLabel, TextField, InputLabel, MenuItem, Radio,
	RadioGroup, Select, Checkbox, Button, Typography, Stack, Box, Tooltip, SelectChangeEvent, Card, CardContent, IconButton
	, OutlinedInput,
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Paper
} from '@mui/material';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import * as React from 'react';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useState } from 'react';
import { green } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
/**
 * The pricing tab.
 */



function SelectScheduleStep() {

	const [value, setValue] = React.useState<Dayjs | null>(null);
	const [activePicker, setActivePicker] = useState(null);
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [date, setDate] = useState(null);

	const [time, setTime] = useState(null);
	const [occurance, setOccurance] = useState('');
	const [occurance1, setOccurance1] = useState('');

	const [isCardOpen, setIsCardOpen] = useState(false);
	// const [date, setDate] = useState(null);
	const [count, setCount] = useState(0);
	const [isButtonClicked, setIsButtonClicked] = useState(false);
	const [isButtonClicked1, setIsButtonClicked1] = useState(false);
	const [selectedOption, setSelectedOption] = useState<string | null>(null);

	const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSelectedOption(event.target.value);
	};




	const handleChange = (event: SelectChangeEvent) => {
		setOccurance(event.target.value as string);
		setIsButtonClicked(event.target.value === '12');
		setIsButtonClicked1(false); // Ensure isButtonClicked1 is set to false when Real Time is selected
	};

	const handleChange1 = (event: SelectChangeEvent) => {
		setOccurance1(event.target.value as string);
		setIsButtonClicked(event.target.value === '21');

		setIsButtonClicked1(true); // Ensure isButtonClicked1 is set to false when Cron Expression is selected
	};


	const handleMenuItemClick = () => {
		setIsCardOpen(!isCardOpen);
	};


	const increment = () => {
		setCount(count + 1);
	};
	const decrement = () => {
		if (count > 0) {
			setCount(count - 1);
		}
	};
	const [selectedBox, setSelectedBox] = useState<number | null>(null);

	const handleBoxClick = (boxId: number) => {
		setSelectedBox(boxId);
	};
	function createData(
		minute: string,
		hours: string,
		daymonth: string,
		month: string,
		dayweek: string,
	) {
		return { minute, hours, daymonth, month, dayweek };
	}

	const rows = [
		createData('', '', '', '', ''),
	];
	function createData1(
		cron: string,
		schedule: string

	) {
		return { cron, schedule };
	}

	const rows1 = [
		createData1('*****', 'Every Minute'),
	];


	return (
		<>

			<Stack>
				<Stack spacing={4} sx={{ pt: '4%', margin: 'auto' }}>
					<Stack>
						<Typography variant='subtitle1' fontWeight={'bold'}>
							Select Any One Schedule Option
						</Typography>

						<FormControl
							component="fieldset"
							className="formControl"
							sx={{ mt: 2, textAlign: 'left' }}
						>
							<RadioGroup
								// {...field}
								aria-label="Layout Direction"
								className="SwombSettings-group"
								row
								onChange={handleChange}
							>
								<br></br>

								<Box border={1} borderColor={"lightgray"} borderRadius={2} pl={1} width={"200px"} >
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
										label="Real Time"
									></FormControlLabel>
								</Box>
								<Box border={1} borderColor={"lightgray"} borderRadius={2} pl={1} width={"200px"} ml={2}>
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
										label="Scheduled"


									/>
								</Box>

							</RadioGroup>

						</FormControl>



					</Stack>
				</Stack>
				{isButtonClicked ? (
					<>

						<Stack sx={{ margin: 'auto', mt: 6 }}>
							<Typography variant='subtitle1' fontWeight={'bold'}>
								Select Schedule Option
							</Typography>

							<FormControl
								component="fieldset"
								className="formControl"
								sx={{ mt: 2, textAlign: 'left' }}
							>
								<RadioGroup

									aria-label="Layout Direction"
									className="SwombSettings-group"
									row
									onChange={handleChange1}
								>
									<br></br>
									<Box border={1} borderColor={"lightgray"} borderRadius={2} pl={1} width={"200px"}>
										<FormControlLabel
											key="21"
											value="21"
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
									</Box>
									<Box border={1} borderColor={"lightgray"} borderRadius={2} pl={1} width={"200px"} ml={2}>
										<FormControlLabel
											key="22"
											value="22"
											control={<Radio sx={{
												'&.Mui-checked': {
													color: green[500],
												},
												'&:not(.Mui-checked)': {
													color: "black",
												},
											}} />}
											label="Cron Expression"


										/>
									</Box>
								</RadioGroup>

							</FormControl>


						</Stack>
						<Stack>
							<Stack direction={"row"} spacing={102} sx={{ ml: '4%' }}>
								<Typography variant='subtitle1' fontWeight={"bold"} textAlign={'left'}>Date & Time</Typography>
								<Typography variant='subtitle1' fontWeight={"bold"} textAlign={'left'}>Fequency</Typography>
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
								<Stack>

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
							</Stack>


						</Stack >
					</>
				) : null}
				{isButtonClicked1 && !isButtonClicked ? (
					<>
						<Stack sx={{ margin: 'auto', mt: 6 }}>
							<Typography variant='subtitle1' fontWeight={'bold'}>
								Select Schedule Option
							</Typography>

							<FormControl
								component="fieldset"
								className="formControl"
								sx={{ mt: 2, textAlign: 'left' }}
							>
								<RadioGroup

									aria-label="Layout Direction"
									className="SwombSettings-group"
									row
									onChange={handleChange1}
								>
									<br></br>
									<Box border={1} borderColor={"lightgray"} borderRadius={2} pl={1} width={"200px"}>
										<FormControlLabel
											key="21"
											value="21"
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
									</Box>
									<Box border={1} borderColor={"lightgray"} borderRadius={2} pl={1} width={"200px"} ml={2}>
										<FormControlLabel
											key="22"
											value="22"
											control={<Radio sx={{
												'&.Mui-checked': {
													color: green[500],
												},
												'&:not(.Mui-checked)': {
													color: "black",
												},
											}} />}
											label="Cron Expression"


										/>
									</Box>
								</RadioGroup>

							</FormControl>


						</Stack>


						<TableContainer component={Paper}>
							<Table sx={{ minWidth: 650 ,mt:4}} aria-label="simple table">
								<TableHead sx={{ backgroundColor: '#f0f0f0' }}>
									<TableRow>
										<TableCell sx={{ fontWeight: 'bold' }}>Minute(0-59)</TableCell>
										<TableCell align="right" sx={{ fontWeight: 'bold' }}>Hours(0-23)</TableCell>
										<TableCell align="right" sx={{ fontWeight: 'bold' }}>Day Of The Month(0-31)</TableCell>
										<TableCell align="right" sx={{ fontWeight: 'bold' }}>Month(1-12)</TableCell>
										<TableCell align="right" sx={{ fontWeight: 'bold' }}>Day Of The Week(0-6)</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{rows.map((row) => (
										<TableRow
											key={row.minute}
											sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
										>
											<TableCell component="th" scope="row">
												{row.minute ? row.minute : <span style={{ color: 'gray' }}>Enter Minutes</span>}
											</TableCell>
											<TableCell align="right" >{row.hours ? row.hours : <span style={{ color: 'gray' }}>Enter Hours</span>}</TableCell>
											<TableCell align="right">{row.daymonth ? row.daymonth : <span style={{ color: 'gray' }}>Enter Day of the month</span>}</TableCell>
											<TableCell align="right">{row.month ? row.month : <span style={{ color: 'gray' }}>Enter Month</span>}</TableCell>
											<TableCell align="right">{row.dayweek ? row.dayweek : <span style={{ color: 'gray' }}>Enter day of the week</span>}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
						<Typography textAlign={'left'} color={'gray'} mt={2}>Here are some examples for you</Typography>
						<TableContainer component={Paper}>
							<Table sx={{ minWidth: 650 ,mt:2}} aria-label="simple table">
								<TableHead sx={{ backgroundColor: '#f0f0f0' }}>
									<TableRow>
										<TableCell sx={{ fontWeight: 'bold', paddingLeft: '150px' }}>CronExpression</TableCell>
										<TableCell align="right" sx={{ fontWeight: 'bold', paddingRight: '800px' }}>Schedule</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{rows1.map((row) => (
										<TableRow
											key={row.cron}
											sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
										>
											<TableCell component="th" scope="row" sx={{ paddingLeft: '150px' }}>
												{row.cron}
											</TableCell>
											<TableCell align="right" sx={{ paddingRight: '800px' }}>{row.schedule}</TableCell>


										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>

					</>
				) : null}

			</Stack >


		</>

	);

}


export default SelectScheduleStep;