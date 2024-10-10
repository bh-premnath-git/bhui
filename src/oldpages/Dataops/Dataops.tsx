import * as React from 'react';
import Box from '@mui/material/Box';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import { styled } from '@mui/material/styles';
import { left } from '@popperjs/core';
import { Card, CardContent, Divider, Grid, IconButton, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography, tableCellClasses } from '@mui/material';
import { Stack } from '@mui/material';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { Tabs, Tab } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

import { useState } from 'react';
import { MenuItem, Select } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { AnyNode } from 'postcss';
import { RestartAltOutlined, SkipNextOutlined, StopCircleOutlined } from '@mui/icons-material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import ShowingLogs from './ShowingLogs';
import SkipPopUp from './SkipPopUp';
import RestartPopUp from './RestartPopUp';
import StopPopUp from './StopPopUp';
import { useEffect } from 'react';
import {ApiService} from '@/services/apiServices';
import MyChartComponent from './ChartComponent';
import { Button } from 'antd';
import { formatDate } from '../../Utils/dateFormatter';
import moment from 'moment';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
const { RangePicker } = DatePicker;

interface Column {
	id: 'job' | 'pipeline' | 'status' | 'time' | 'zone' | 'duration' | 'records' | 'owner' | 'action';
	label: string;
	minWidth?: number;
	align?: 'left';
	format?: (value: number) => string;
}

const columns: readonly Column[] = [
	{ id: 'job', label: 'Job type', minWidth: 170, },
	{ id: 'pipeline', label: 'Pipeline', minWidth: 100 },
	{
		id: 'status',
		label: 'Status',
		minWidth: 170,
		align: 'left',
		// format: (value: number) => value.toLocaleString('en-US'),
	},
	{
		id: 'time',
		label: 'Start Time',
		minWidth: 170,
		align: 'left',
		format: (value: number) => value.toLocaleString('en-US'),
	},
	{
		id: 'zone',
		label: 'Target Zone',
		minWidth: 170,
		align: 'left',
		// format: (value: number) => value.toFixed(2),
	},
	{
		id: 'duration',
		label: 'Duration',
		minWidth: 170,
		align: 'left',
		// format: (value: number) => value.toFixed(2),
	},
	// {
	// 	id: 'records',
	// 	label: 'Total records',
	// 	minWidth: 170,
	// 	align: 'left',
	// 	// format: (value: number) => value.toFixed(2),
	// },
	{
		id: 'owner',
		label: 'Owner',
		minWidth: 170,
		align: 'left',
		// format: (value: number) => value.toFixed(2),
	},
	{
		id: 'action',
		label: 'Action',
		minWidth: 170,
		align: 'left',
		// format: (value: number) => value.toFixed(2),
	},
];
const handleSkip = () => {
	// Add your skip logic here
	console.log('Skip button clicked');
};

interface Data {
	job: string;
	pipeline: string;
	status: any;
	time: string;
	zone: any;
	duration: any;
	records: any;
	owner: any;
	action: any;

}

function createData(
	job: string,
	pipeline: string,
	status: any,
	time: string,
	zone: any,
	duration: any,
	records: any,
	owner: any,
	action: any

): Data {

	return { job, pipeline, status, time, zone, duration, records, owner, action };
}


function Dataops() {
	// Add similar state variables for other dropdowns as needed
	const [open, setOpen] = useState(false);
	const [open1, setOpen1] = useState(false);
	const [open2, setOpen2] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [jobDetailList, setjobDetailList] = useState([]);
	const [jobDetail, setJobDetail] = useState();
	const [selectedvalue, setSelectedValue] = useState<any>({
		'pipeline_type': null,
		'pipeline_name': null,
		'job_start_time': null,
		'job_end_time': null,
		'pipeline_status': null,
		'zone_name': null
	})
	const updateSelectedValue = (field: string, value: string) => {
		setSelectedValue((prevState: any) => ({
			...prevState,
			[field]: value,
		}));

	};
	const [selectedSearchList, setSelectedSearchList] = useState([])
	console.log(selectedvalue)
	const handleClickOpen = (row: any) => {
		console.log('Dialog opened');
		setJobDetail(row);
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleClickOpen1 = () => {
		console.log('Dialog opened');
		setOpen1(true);
	};

	const handleClose1 = () => {
		console.log('Dialog closed');
		setOpen1(false);
	};
	const handleClickOpen2 = (row: any) => {
		console.log('Dialog opened');
		setJobDetail(row);
		setOpen2(true);
	};

	const handleClose2 = () => {
		console.log('Dialog closed');
		setOpen2(false);
	};

	const [searchValue, setSearchValue] = useState('');

	const handleSearchChange = (event: any) => {
		setSearchValue(event.target.value);
	};

	const fetchJobDetails = async () => {
		setIsLoading(true);
		const params = { ...selectedvalue }
		console.log(selectedvalue)
		console.log(params)
		const filteredValues = Object.fromEntries(
			Object.entries(selectedvalue).filter(([key, value]) => value !== '')
		);
		console.log(filteredValues)

		try {
			// setIsLoading(true)
			const result = await ApiService('8003', 'get', '/job_details/list/?offset=0&limit=100&order_desc=false', null, filteredValues);
			console.log(result);
			setjobDetailList(result)
			if (selectedSearchList.length == 0) {
				setSelectedSearchList(result);
			}
			setSelectedRowData(result[0])
			setIsLoading(false)

		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};

	useEffect(() => {
		fetchJobDetails();
	}, []);

	const handleSearch = () => {
		fetchJobDetails();
	};
	const [selectedRowData, setSelectedRowData] = useState<any>(1);
	console.log(selectedRowData)

	const handleRowClick = (rowData: any) => {
		setSelectedRowData(rowData);
	};
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(4);
	const [selectedTab, setSelectedTab] = useState(0);

	const handleTabChange = (event: any, newValue: any) => {
		setSelectedTab(newValue);
	};
	const getUniqueValues = (data: any, key: any) => {
		const uniqueSet = new Set();
		const uniqueValues: any = [];

		data.forEach((item: { [x: string]: any; }) => {
			const value = item[key]?.toLowerCase();
			if (value && !uniqueSet.has(value)) {
				uniqueSet.add(value);
				uniqueValues.push(item[key]);
			}
		});

		return uniqueValues;
	};

	const handleDateChange = (_dates: any, dateStrings: string[]) => {
		updateSelectedValue('job_start_time', dateStrings[0]);
		updateSelectedValue('job_end_time', dateStrings[1]);
	};


	return (

		<Stack sx={{ my: 2 }}>
			<Stack direction="row" justifyContent={'space-between'}>
				<Stack direction="row" mt={2} spacing={2}>

					<Stack>
						<Typography sx={{ py: 1, fontWeight: 'bold' }} className='text-start'>Job Type</Typography>
						<Select sx={{ minWidth: "190px" }}
							placeholder='Select Job Type'
							id="dropdown1"
							displayEmpty
							value={selectedvalue.pipeline_type || ''}
							onChange={(e) => updateSelectedValue('pipeline_type', e.target.value)}
							endAdornment={
								selectedvalue.pipeline_type && (
									<IconButton
										aria-label="clear"
										size="small"
										onClick={() => updateSelectedValue('pipeline_type', '')}
									>
										<ClearIcon sx={{ fontSize: '14px' }} className='m-1 text-danger' />
									</IconButton>
								)
							}
						>
							<MenuItem value="" disabled>
								Select Job Type
							</MenuItem>

							{getUniqueValues(selectedSearchList, 'pipeline_type').map((job: any, index: React.Key | null | undefined) =>
								<MenuItem className='myFont' key={index} value={job}>{job}</MenuItem>
							)}
						</Select>
					</Stack>
					<Stack>
						<Typography sx={{ py: 1, fontWeight: 'bold' }} className='text-start'>Pipeline</Typography>
						<Select sx={{ minWidth: "190px" }} className='myFont'
							placeholder='Select Pipeline'
							displayEmpty
							id="dropdown2"
							value={selectedvalue.pipeline_name || ''}
							onChange={(e) => updateSelectedValue('pipeline_name', e.target.value)}
							endAdornment={
								selectedvalue.pipeline_name && (
									<IconButton
										aria-label="clear"
										size="small"
										onClick={() => updateSelectedValue('pipeline_name', '')}
									>
										<ClearIcon sx={{ fontSize: '14px' }} className='m-1 text-danger' />
									</IconButton>
								)
							}
						>
							<MenuItem value="" disabled className='myFont'>
								Select Pipeline
							</MenuItem>

							{getUniqueValues(selectedSearchList, 'pipeline_name').map((job: any, index: React.Key | null | undefined) =>
								<MenuItem className='myFont' key={index} value={job}>{job}</MenuItem>
							)}
						</Select>
					</Stack>

					{/* <Stack>
						<Typography fontWeight={'bold'} className='text-start' fontSize={16} my={1}>Start Date</Typography>
						<TextField sx={{ minWidth: "190px" }} className='myFont'
							type="date"
							id="job_start_time"
							name="job_start_time"
							value={selectedvalue.job_start_time}
							onChange={(event) => updateSelectedValue('job_start_time', event.target.value)}
						/>
					</Stack>
					<Stack>
						<Typography fontWeight={'bold'} className='text-start' fontSize={16} my={1}>End Date</Typography>
						<TextField sx={{ minWidth: "190px" }} className='myFont'
							type="date"
							id="job_end_time"
							name="job_end_time"
							value={selectedvalue.job_end_time}
							onChange={(event) => updateSelectedValue('job_end_time', event.target.value)}

						/>
					</Stack> */}

					<Stack spacing={2}>
						<Stack>
							<Typography fontWeight={'bold'} className='text-start' fontSize={16} my={1}>
							Start {'&'} End Date
							</Typography>
							<RangePicker size='large'
								style={{ minWidth: "100px",maxWidth:'310px' ,borderRadius:'3px'}}
								className='myFont border-1'
								value={[
									selectedvalue.job_start_time ? dayjs(selectedvalue.job_start_time) : null,
									selectedvalue.job_end_time ? dayjs(selectedvalue.job_end_time) : null
								]}
								format="DD/MM/YYYY"
								onChange={handleDateChange}
							/>
						</Stack>
					</Stack>

					<Stack>
						<Typography sx={{ py: 1, fontWeight: 'bold' }} className='text-start'>Status</Typography>
						<Select sx={{ minWidth: "190px" }} className='myFont'
							id="dropdown5"
							displayEmpty
							placeholder='Select Status'
							value={selectedvalue.pipeline_status || ''}
							onChange={(e) => updateSelectedValue('pipeline_status', e.target.value)}
							endAdornment={
								selectedvalue.pipeline_status && (
									<IconButton
										aria-label="clear"
										size="small"
										onClick={() => updateSelectedValue('pipeline_status', '')}
									>
										<ClearIcon sx={{ fontSize: '14px' }} className='m-1 text-danger' />
									</IconButton>
								)
							}
						>
							<MenuItem value="" disabled className='myFont'>
								Select Status
							</MenuItem>

							{getUniqueValues(selectedSearchList, 'pipeline_status').map((job: any, index: React.Key | null | undefined) =>
								<MenuItem className='myFont' key={index} value={job}>{job}</MenuItem>
							)}


						</Select>
					</Stack>
					<Stack>
						<Typography sx={{ py: 1, fontWeight: 'bold' }} className='text-start'>Target zone</Typography>
						<Select sx={{ minWidth: "190px" }} className='myFont'
							id="dropdown6"
							displayEmpty
							placeholder='Select Zone'
							value={selectedvalue.zone_name || ''}
							onChange={(e) => updateSelectedValue('zone_name', e.target.value)}
							endAdornment={
								selectedvalue.zone_name && (
									<IconButton
										aria-label="clear"
										size="small"
										onClick={() => updateSelectedValue('zone_name', '')}
									>
										<ClearIcon sx={{ fontSize: '14px' }} className='m-1 text-danger' />
									</IconButton>
								)
							}
						>
							<MenuItem value="" disabled className='myFont'>
								Select Zone
							</MenuItem>

							{getUniqueValues(selectedSearchList, 'zone_name').map((job: any, index: React.Key | null | undefined) =>
								<MenuItem className='myFont' key={index} value={job}>{job}</MenuItem>
							)}
						</Select>
					</Stack>


				</Stack>
				<Stack>
					<Stack sx={{ py: 2, mt: 3 }}></Stack>
					<Button style={{ padding: '18px', fontWeight: 'bold', backgroundColor: 'black', color: 'white' }} onClick={() => handleSearch()}>
						Search
					</Button>
				</Stack>
			</Stack>
			<TableContainer sx={{ my: 2 }}>
				<Table stickyHeader aria-label="sticky table" style={{ border: '1px solid #f2f3f5' }}>
					<TableHead>
						<TableRow>
							{columns.map((column) => (
								<TableCell className='myHeadFont'
									key={column.label}
									align={column.align}
									style={{
										backgroundColor: '#f2f2f8',
										fontSize: '16px',
									}}
								>
									{column.label}
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{jobDetailList?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
							.map((row: any, index: any) => (
								<TableRow key={index} hover role="checkbox" tabIndex={-1} onClick={() => handleRowClick(row)}>
									<TableCell className='myFont' sx={{ borderBottom: '1px solid #f2f3f5' }}>{row?.pipeline_type}
									</TableCell>
									<TableCell className='myFont' sx={{ borderBottom: '1px solid #f2f3f5' }}>{row?.pipeline_name}
									</TableCell>
									<TableCell className='myFont' sx={{ borderBottom: '1px solid #f2f3f5' }}>
										<div style={{
											color: row?.pipeline_status == "Success" ? '#00bf7a' :
												row?.pipeline_status == 'Failed' ? '#d10e00' : '#ffab00', alignContent: 'center'
										}}>
											<span style={{
												backgroundColor: row?.pipeline_status == "Success" ? '#d4f5e7' :
													row?.pipeline_status == 'Failed' ? '#f9e0db' : '#fff4dc', padding: 8, borderRadius: '4px'
											}}>{row?.pipeline_status}</span>
										</div>
									</TableCell>
									<TableCell className='myFont' sx={{ borderBottom: '1px solid #f2f3f5' }}>{formatDate(row?.job_start_time)}
									</TableCell>
									<TableCell className='myFont' sx={{ borderBottom: '1px solid #f2f3f5' }}>{row?.zone_name}
									</TableCell>
									<TableCell className='myFont' sx={{ borderBottom: '1px solid #f2f3f5' }}>{formatDate(row?.job_end_time)}
									</TableCell>

									<TableCell className='myFont' sx={{ borderBottom: '1px solid #f2f3f5' }}>{row?.created_by}
									</TableCell>
									<TableCell className='myFont' sx={{ borderBottom: '1px solid #f2f3f5' }}>
										{row?.pipeline_status == "Failed" ? (<Stack direction={'row'}>
											<Stack direction={'row'} onClick={() => handleClickOpen(row)} sx={{ color: '#448EE4', px: 2 }}>
												<SkipNextOutlined />
												<Typography variant="body1">Skip</Typography>
											</Stack>
											<SkipPopUp open={open} jobDetail={jobDetail} onClose={handleClose} />

											<Stack direction={'row'} onClick={handleClickOpen1} sx={{ color: '#448EE4' }}>
												<RestartAltOutlined />
												<Typography variant="body1">Restart</Typography>
											</Stack>
											<RestartPopUp open1={open1} jobDetail={jobDetail} onClose1={handleClose1} />
										</Stack>) : row?.pipeline_status == "In Progress" ? (
											<>
												<Stack direction={'row'} onClick={() => handleClickOpen2(row)} sx={{ color: '#448EE4' }}>
													<StopCircleOutlined />
													<Typography variant="body1" sx={{ p: '4px' }}>Stop</Typography>
												</Stack>
												<StopPopUp open2={open2} jobDetail={jobDetail} onClose2={handleClose2} />
											</>
										) : (<></>)}
									</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</TableContainer>
			<Card sx={{ backgroundColor: '#f4f4f4' }}>
				<CardContent>
					<Typography className='myHeadFont' sx={{ fontWeight: 'bold' }}>Job Name: {selectedRowData?.pipeline_name}</Typography>
					<div>
						<Tabs value={selectedTab} onChange={handleTabChange}>
							<Tab label="Properties" className='myFont' sx={{ textTransform: 'none' }} />
							<Tab label="Show Logs" className='myFont' sx={{ textTransform: 'none' }} />

						</Tabs>
						<Divider sx={{ width: '12%', color: 'gray' }} />
						{/* Render content based on selectedTab */}
						{selectedTab === 0 && <div>
							<Grid container>
								<Grid item xs={4}>
									<Stack sx={{ textAlign: 'start' }}>
										<Typography className='myFont'>Batch ID : {selectedRowData?.batch_id}</Typography>
										<Typography className='myFont'>Input data: {selectedRowData?.input_data_path}</Typography>
										<Typography className='myFont'>Output data: {selectedRowData?.output_data_path}</Typography>


									</Stack>
								</Grid>
								<Grid item xs={8}>
									<Card sx={{ backgroundColor: '#f4f4f4', border: '1px solid #ccc' }} elevation={0}>
										<CardContent>
											<Typography sx={{ fontWeight: 'bold' }}>Data Statistics</Typography>
											<div>
												<MyChartComponent selectedRowData={selectedRowData} />

											</div>
										</CardContent>

									</Card>

								</Grid>
							</Grid>

						</div>}
						{selectedTab === 1 && <div>
							<Typography>Showing logs from <span style={{ fontWeight: 'bold' }}>last hour</span> ending at <span style={{ fontWeight: 'bold' }}>13:41</span></Typography>
							<ShowingLogs />
						</div>}

					</div>
				</CardContent>

			</Card>
		</Stack>
	);
}

export default Dataops;
