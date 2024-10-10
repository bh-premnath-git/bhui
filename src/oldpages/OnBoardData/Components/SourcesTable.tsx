import _ from 'lodash';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import * as React from 'react';
import { Box, Button, IconButton, Card, CardContent, Divider, Drawer, Paper, Stack, TableContainer, TableHead } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import TagIcon from '@mui/icons-material/Tag';
import AbcIcon from '@mui/icons-material/Abc';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SwombLoading from '../../Portal/SwombLoading';
import OptionHeader from './OptionHeader';
import {ApiService} from '@/services/apiServices';
import { jwtDecode } from 'jwt-decode';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';



/**
 * The sources table.
 */
function SourcesTable(props: any) {
	const [isLoading, setIsLoading] = useState(false);
	const [columnDetails, setColumnDetails]: any = useState();
	const [recomentationRule, setRecomentationRule]: any = useState();
	const [layoutFieldId, setLayoutFieldId]: any = useState();

	const [jobDetail, setJobDetail] = useState();
	const [tabStatus, setTabStatus] = useState('OPEN');
	const { navigate } = props;
	const [open, setOpen] = React.useState(false);
	const [loading, setLoading] = useState(true);
	const [selected, setSelected] = useState<string[]>([]);
	const [keyList, setKeyList] = useState(Object.keys(props?.data?.sourceItem?.sample_data[0]));
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const codeDtl = props.codeDtl;
	const [tableOrder, setTableOrder] = useState<{
		direction: 'asc' | 'desc';
		id: string;
	}>({
		direction: 'asc',
		id: ''
	});
	const [value, setValue] = React.useState(0);

	const handleChange = async (event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
		console.log(newValue)
		if (newValue == 0) {
			setTabStatus("OPEN")
			fetchColumnDetails(layoutFieldId, null);

		} else if (newValue == 1) {
			setTabStatus("ACCEPTED")

			fetchColumnDetails(layoutFieldId, 'ACCEPTED');

		} else if (newValue == 2) {
			setTabStatus("REJECTED")

			fetchColumnDetails(layoutFieldId, 'REJECTED');

		}
	};
	console.log(layoutFieldId)
	function a11yProps(index: number) {
		return {
			id: `simple-tab-${index}`,
			'aria-controls': `simple-tabpanel-${index}`,
		};
	}
	useEffect(() => {
		fetchJobDetails(null)
		// dispatch(getSources()).then(() => setLoading(false));
	}, [columnDetails]);


	const getIconItem = (iconId: any) => {
		// console.log(props.codesDtl)
		if (Array.isArray(props.codesDtl)) {
			var filteredData: any = props.codesDtl.find((code: any) => code.id.toString() === iconId?.toString());
			if (filteredData?.dtl_desc.toString() == 'Date') {
				return <DateRangeOutlinedIcon />;
			} else if (filteredData?.dtl_desc.toString() == 'Integer') {
				return <WidgetsOutlinedIcon />;
			} else if (filteredData?.dtl_desc.toString() == 'Double') {
				return <TagIcon />;
			} else {
				return <AbcIcon />;
			}
		} else {
			console.error('codeDtl is not an array.');
			return ''

		}

	}
	function CustomTabPanel(props: any) {
		const { children, value, index, ...other } = props;

		return (
			<div
				role="tabpanel"
				hidden={value !== index}
				id={`simple-tabpanel-${index}`}
				aria-labelledby={`simple-tab-${index}`}
				{...other}
			>
				{value === index && (
					<Box sx={{ p: 3 }}>
						<Typography>{children}</Typography>
					</Box>
				)}
			</div>
		);
	}

	async function applyRule(item) {
		// var user: any = sessionStorage.getItem('token');
		// const decoded: any = jwtDecode(user);
		var data: any = {
			"fld_dq_params": item?.rule_params,
			"fld_dq_level": item?.rule_dq_level,
			"lyt_fld_id": item?.rule_lyt_id,
			"fld_dq_type_id": item?.rule_dq_type_id
		}
		console.log(data)
		try {
			setIsLoading(true)
			const result = await ApiService('8011', 'post', `/layout_fields_dq/`, data);
			console.log(result);
			if (result != null) {
				removeRule(item, 'ACCEPTED')
				// setRecomentationRule(result)
			}
			setIsLoading(false)

		} catch (error) {
			console.error('Error fetching data:', error);
		}
	}
	const fetchJobDetails = async (fieldId) => {
		if (fieldId) {
			const params = { "fld_id": fieldId };
			fetchColumnDetails(fieldId, null);
			console.log(params);
			try {
				setIsLoading(true)
				const result = await ApiService('8011', 'get', '/field_properties/list/', null, params);
				console.log(result);
				if (result != null) {
					setColumnDetails(result[0])
				}
				setIsLoading(false)

			} catch (error) {
				console.error('Error fetching data:', error);
			}
		}

	};
	const fetchColumnDetails = async (rule_fld_id, status) => {
		const params = { "rule_fld_id": rule_fld_id, 'rule_status': status ?? null };
		console.log(params);
		try {
			setIsLoading(true)
			const result = await ApiService('8011', 'get', '/field_recommendations/list/', null, params);
			console.log(result);
			if (result != null) {
				setRecomentationRule(result)
			} else {
				setRecomentationRule([])
			}
			setIsLoading(false)

		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};


	const toggleDrawer = (newOpen: boolean, lyt_fld_id) => () => {
		console.log(newOpen)
		setOpen(newOpen);
		setLayoutFieldId(lyt_fld_id);
		console.log(lyt_fld_id);
		fetchJobDetails(lyt_fld_id);


	};
	function onCancel() {
		console.log('cancel')
		setOpen(false);

	}
	async function removeRule(item, status) {
		var user: any = sessionStorage.getItem('token');
		const decoded: any = jwtDecode(user);
		const data = { "rule_status": status, "rule_rejected_by": decoded?.name, "rule_accepted_by": '' };

		console.log(data);
		try {
			setIsLoading(true)
			const result = await ApiService('8011', 'put', `/field_recommendations/${item?.rule_id}`, data);
			console.log(result);
			console.log(tabStatus);

			fetchColumnDetails(layoutFieldId, tabStatus);
			if (result != null) {
				// setRecomentationRule(result)
			}
			setIsLoading(false)

		} catch (error) {
			console.error('Error fetching data:', error);
		}
	}
	function fetchUpdated(item, status) {
		if (status == 'REJECTED') {
			removeRule(item, status);

		} else {
			applyRule(item)
		}
		// fetchColumnDetails(layoutFieldId, status);
	}
	const DrawerList = (

		<Box sx={{ width: 430, marginLeft: 2 }} role="presentation" >
			<IconButton
				sx={{ position: 'absolute', right: 5, top: 5 }}

			>
				<CloseIcon sx={{ color: 'black' }} onClick={onCancel} />
			</IconButton>
			<p style={{ fontWeight: 'bold' }}><h4>Profile Results</h4></p><br></br>

			<Stack direction={'row'} spacing={2}>
				<Typography><h6>
					Column Name: <Typography component="span" fontWeight="bold">{columnDetails?.fld_name}</Typography></h6>
				</Typography>
				<Divider orientation="vertical" flexItem />
				<Typography><h6>
					Data Type: <Typography component="span" fontWeight="bold">{columnDetails?.fld_datatype}</Typography></h6>
				</Typography>
				<Divider orientation="vertical" flexItem />
				<Typography><h6>
					Unique: <Typography component="span" fontWeight="bold">{columnDetails?.is_fld_unique ? '100%' : '0%'}</Typography></h6>
				</Typography>
			</Stack><br></br>
			<Stack direction={'row'} spacing={2}>
				<Typography><h6>
					Minimum length: <Typography component="span" fontWeight="bold">{columnDetails?.fld_min_value}</Typography></h6>
				</Typography>
				<Divider orientation="vertical" flexItem />
				<Typography><h6>
					Maximum Length: <Typography component="span" fontWeight="bold">{columnDetails?.fld_max_value}</Typography></h6>
				</Typography>
				<Divider orientation="vertical" flexItem />
				<Typography><h6>
					Not Null: <Typography component="span" fontWeight="bold">{columnDetails?.is_fld_mandatory ? '100%' : '0%'}</Typography></h6>
				</Typography>
			</Stack><br></br>
			<Divider sx={{ width: '92%' }} /><br></br>
			<Box sx={{ width: '100%' }}>
				<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
					<Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
						<Tab label="All" {...a11yProps(0)} />
						<Tab label="Accepted" {...a11yProps(1)} />
						<Tab label="Rejected" {...a11yProps(2)} />
					</Tabs>

				</Box>
				<CustomTabPanel value={value} index={0}>
					<Card sx={{ width: '95%', backgroundColor: '#e8f5ff', borderRadius: 2 }} elevation={0}>
						{recomentationRule?.length > 0 ? (<CardContent>
							<Typography sx={{ fontWeight: 'bold' }}>Recommended Rules For {columnDetails?.fld_name} </Typography><br></br>
							{recomentationRule?.map((item, index) => (
								<>
									<Card sx={{ width: '98%', backgroundColor: '#DFE9F5', borderRadius: 2 }}
										className='my-2' elevation={0}>
										<CardContent>
											<Typography sx={{ fontWeight: 'bold' }}>{item?.rule_name}</Typography>
											<Typography ><h6>{item?.rule_params?.rule_expr}</h6></Typography>
											<Stack direction={'row'} justifyContent={'space-between'}>
												<Stack onClick={() => applyRule(item)} style={{ color: '#09B1EC', fontWeight: 'bold' }} >Apply Rule</Stack>
												<Stack onClick={() => removeRule(item, 'REJECTED')} style={{ color: 'red', fontWeight: 'bold' }} >Remove Rule</Stack>
											</Stack>
										</CardContent>
									</Card>
								</>
							))}

						</CardContent>) : (<>
							<div className='text-center p-3'>
								<img src="/assets/userlanding/Layer 34.png" alt="" width={100} />
								<h6 className='my-2'>Rules Not Applied</h6>

							</div>						</>)}

					</Card>
				</CustomTabPanel>
				<CustomTabPanel value={value} index={1}>
					<Card sx={{ width: '95%', backgroundColor: '#e8f5ff', borderRadius: 2 }} elevation={0}>
						{recomentationRule?.length > 0 ? (<CardContent>
							<Typography sx={{ fontWeight: 'bold' }}>Recommended Rules For {columnDetails?.fld_name} </Typography><br></br>
							{recomentationRule?.map((item, index) => (
								<>
									<Card sx={{ width: '98%', backgroundColor: '#DFE9F5', borderRadius: 2 }}
										className='my-2' elevation={0}>
										<CardContent>
											<Typography sx={{ fontWeight: 'bold' }}>{item?.rule_name}</Typography>
											<Typography ><h6>{item?.rule_params?.rule_expr}</h6></Typography>
											<Stack direction={'row'} justifyContent={'end'}>
												{/* <Stack onClick={() => applyRule(item)} style={{ color: '#09B1EC', fontWeight: 'bold' }} >Apply Rule</Stack> */}
												<Stack onClick={() => fetchUpdated(item, 'REJECTED')} style={{ color: 'red', fontWeight: 'bold' }} >Remove Rule</Stack>
											</Stack>
										</CardContent>
									</Card>
								</>
							))}

						</CardContent>) : (<>
							<div className='text-center p-3'>
								<img src="/assets/userlanding/Layer 34.png" alt="" width={100} />
								<h6 className='my-2'>Rules Not Applied</h6>

							</div></>)}

					</Card>
				</CustomTabPanel>
				<CustomTabPanel value={value} index={2}>
					<Card sx={{ width: '95%', backgroundColor: '#e8f5ff', borderRadius: 2 }} elevation={0}>
						{recomentationRule?.length > 0 ? (<CardContent>
							<Typography sx={{ fontWeight: 'bold' }}>Recommended Rules For {columnDetails?.fld_name} </Typography><br></br>
							{recomentationRule?.map((item, index) => (
								<>
									<Card sx={{ width: '98%', backgroundColor: '#DFE9F5', borderRadius: 2 }}
										className='my-2' elevation={0}>
										<CardContent>
											<Typography sx={{ fontWeight: 'bold' }}>{item?.rule_name}</Typography>
											<Typography ><h6>{item?.rule_params?.rule_expr}</h6></Typography>
											<Stack direction={'row'} justifyContent={'space-between'}>
												<Stack onClick={() => fetchUpdated(item, 'ACCEPTED')} style={{ color: '#09B1EC', fontWeight: 'bold' }} >Apply Rule</Stack>
												{/* <Stack onClick={() => removeRule(item, 'REJECTED')} style={{ color: 'red', fontWeight: 'bold' }} >Remove Rule</Stack> */}
											</Stack>
										</CardContent>
									</Card>
								</>
							))}

						</CardContent>) : (<>
							<div className='text-center p-3'>
								<img src="/assets/userlanding/Layer 34.png" alt="" width={100} />
								<h6 className='my-2'>Rules Not Applied</h6>
							</div>
						</>)}
					</Card>
				</CustomTabPanel>
			</Box>


		</Box>
	);

	function handleRequestSort(event: MouseEvent<HTMLSpanElement>, property: string) {
		const newOrder: {
			direction: 'asc' | 'desc';
			id: string;
		} = { id: property, direction: 'desc' };

		if (tableOrder.id === property && tableOrder.direction === 'desc') {
			newOrder.direction = 'asc';
		}

		setTableOrder(newOrder);
	}

	// function handleSelectAllClick(event: ChangeEvent<HTMLInputElement>) {
	// 	if (event.target.checked) {
	// 		setSelected(data.map((n:any) => n.id));
	// 		return;
	// 	}

	// 	setSelected([]);
	// }

	// function handleDeselect() {
	// 	setSelected([]);
	// }

	// function handleClick(item: SourceType) {
	// 	navigate(`/meta-data/sources/${item.id}`);
	// }
	const columns: any = [
		{ id: 'field', label: 'Field', align: 'left' },
		{ id: 'description', label: 'Description', align: 'left' },
		{ id: 'tags', label: 'Tags', align: 'left' },
		{ id: 'glossaryterms', label: 'Glossary Terms', align: 'center' },
		// { id: 'edit', label: ' ', align: 'center', },

	];
	function handleCheck(event: ChangeEvent<HTMLInputElement>, id: string) {
		const selectedIndex = selected.indexOf(id);
		let newSelected: string[] = [];

		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected, id);
		} else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1));
		} else if (selectedIndex === selected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1));
		} else if (selectedIndex > 0) {
			newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
		}

		setSelected(newSelected);
	}

	function handleChangePage(event: React.MouseEvent<HTMLButtonElement> | null, page: number) {
		setPage(+page);
	}

	function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
		setRowsPerPage(+event.target.value);
	}

	// if (loading) {
	// 	return (
	// 		<div className="flex items-center justify-center h-full">
	// 			<SwombLoading />
	// 		</div>
	// 	);
	// }

	// if (data.length === 0) {
	// 	return (
	// 		<motion.div
	// 			initial={{ opacity: 0 }}
	// 			animate={{ opacity: 1, transition: { delay: 0.1 } }}
	// 			className="flex flex-1 items-center justify-center h-full"
	// 		>
	// 			<Typography
	// 				color="text.secondary"
	// 				variant="h5"
	// 			>
	// 				There are no sources!
	// 			</Typography>
	// 		</motion.div>
	// 	);
	// }

	return (
		<>
			<OptionHeader />
			<Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: '4px', border: '1px solid #f2f3f5', my: 2 }} elevation={0}>
				<TableContainer sx={{ maxHeight: 500 }}>
					<Table stickyHeader aria-label="sticky table" style={{ border: '1px solid #f2f3f5' }} >
						<TableHead >
							<TableRow  >
								{props?.data?.sourceItem?.layout_fields?.map((column: any) => (

									<TableCell onClick={toggleDrawer(true, column?.lyt_fld_id)}
										key={column?.lyt_fld_id}
										// align={column.align}
										sx={{ backgroundColor: '#f2f2f8', color: 'black', fontSize: 'medium', fontWeight: "500" }}
									>
										<Stack direction={'row'}>
											<Stack sx={{ backgroundColor: '#e3e1eb', borderRadius: '1pc', p: '4px' }}>
												{getIconItem(column?.lyt_fld_data_type_cd)}
											</Stack>
											<Stack sx={{ mx: 1, p: '4px' }} >
												{column?.lyt_fld_name}
											</Stack>
											<Stack sx={{ p: '4px' }} >
												<MoreVertIcon />
											</Stack>
										</Stack>


									</TableCell>

								))}

							</TableRow>
						</TableHead>
						<TableBody >

							{props?.data?.sourceItem?.sample_data?.map((row: any, index: any) => {
								return (
									<TableRow className=' ' key={index} hover role="checkbox" tabIndex={-1}  >
										{keyList.map((key, index) => (
											<TableCell key={index} align="center" className=' my-2' style={{ borderBottom: '1px solid #f2f3f5', color: 'grey', fontWeight: '600', fontSize: '13px' }}>{row[key]}</TableCell>
										))}
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</TableContainer>
				<TablePagination
					rowsPerPageOptions={[10, 50, 100]}
					component="div"
					count={props?.data?.sourceItem?.sample_data?.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>

			</Paper>
			<Drawer open={open} anchor={'right'} onClose={toggleDrawer(false, null)}>
				{DrawerList}
			</Drawer>
			<Stack sx={{
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
				mt: 6


			}} >
				<Box >
					<Button variant="contained" sx={{
						color: 'white', backgroundColor: 'black', width: '200px', ml: 7,

						textTransform: 'none',
						'&:hover': {
							backgroundColor: 'black',
						},


					}} onClick={props.handleNext}>Next


					</Button>


				</Box>
			</Stack>

		</>
	);
}

export default SourcesTable;