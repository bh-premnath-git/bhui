import _ from 'lodash';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Many } from 'lodash';
import * as React from 'react';
import { Chip, IconButton, Menu, MenuItem } from '@mui/material';

import { styled } from '@mui/material/styles';
import { MoreVert } from '@mui/icons-material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import {
	Box, Stack, Popover, Button,
	Dialog, DialogTitle, DialogContent,
	DialogContentText, DialogActions, TextField, Divider
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import AddCircleIcon from '@mui/icons-material/AddCircle';
const StyledTableRow = styled(TableRow)(({ theme }) => ({
	'&:nth-of-type(odd)': {
		backgroundColor: theme.palette.action.hover,
	},
	// hide last border
	'&:last-child td, &:last-child th': {
		border: 0,
	},
}));
interface Column {
	id: 'project' | 'source' | 'updatedby' | 'updatedon' | 'executedon' | 'action';
	label: string;
	minWidth?: number;
	align?: 'left';
	format?: (value: number) => string;
}

const columns: readonly Column[] = [
	{ id: 'project', label: 'Project Name', minWidth: 170, },
	{ id: 'source', label: 'Source Name', minWidth: 100 },
	{
		id: 'updatedby',
		label: 'Updated By',
		minWidth: 170,
		align: 'left',
		// format: (value: number) => value.toLocaleString('en-US'),
	},
	{
		id: 'updatedon',
		label: 'Updated On',
		minWidth: 170,
		align: 'left',
		format: (value: number) => value.toLocaleString('en-US'),
	},
	{
		id: 'executedon',
		label: 'Executed On',
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

interface Data {
	project: string;
	source: string;
	updatedby: number;
	updatedon: number;
	executedon: any;
	action: any;
}

function createData(
	project: string,
	source: string,
	updatedby: any,
	updatedon: any,
	executedon: any,
	action: any,
): Data {

	return { project, source, updatedby, updatedon, executedon, action };
}

const validationSchemaLink = Yup.object({
	label: Yup.string().required('User Name is required'),
});

function OnBoardTables(props:any) {
	
	const jobDetailList = props.data;
	console.log('jobDetailList:',jobDetailList	);
	const selectedRow = props.selectedRow;
	console.log('selectedRow:',selectedRow	);

	const [anchorEl, setAnchorEl] = useState(null);
	const [openAddLink, setOpenAddLink] = useState(false);

	const handleOpen = (event: any) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);
	const id = open ? 'popup' : undefined;
	const openLinkDialog = () => {
		setOpenAddLink(true)
	};
	const closeLinkDialog = () => {
		setOpenAddLink(false)
	}

	const formatTimestamp = (timestamp) => {
		// Create a new Date object from the timestamp
		const date = new Date(timestamp);
	  
		// Extract the date components
		const day = String(date.getUTCDate()).padStart(2, '0');
		const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-indexed
		const year = date.getUTCFullYear();
	  
		// Extract the time components
		const hours = String(date.getUTCHours()).padStart(2, '0');
		const minutes = String(date.getUTCMinutes()).padStart(2, '0');
		const seconds = String(date.getUTCSeconds()).padStart(2, '0');
	  
		// Format the date and time
		const formattedDate = `${day}/${month}/${year}`;
		const formattedTime = `${hours}:${minutes}:${seconds}`;
	  
		// Combine date and time
		return `${formattedDate} ${formattedTime}`;
	  }; 
	 

	const rows = jobDetailList?.map(item=>(
		createData(' Project Name 1', item?.data_src_name
		, 'Johnnie Doe',formatTimestamp(item?.updated_at),formatTimestamp(item?.created_at),
		<IconButton onClick={handleOpen}>
			<MoreVertIcon />
		</IconButton>)
	)) ;



	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(+event.target.value);
		setPage(0);
	};
	const linkSubmit = (values: any, { setSubmitting }: { setSubmitting: (setSubmitting: any) => void }) => {
		console.log('Form values:', values);
		setSubmitting(false);
		setOpenAddLink(false);

	};
	


	return (
		<>
			<Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: '1px', my: 2 }}>
				<TableContainer sx={{ maxHeight: 440 }}>
					<Table stickyHeader aria-label="sticky table" style={{ border: '1px solid #f2f3f5' }}>
						<TableHead >
							<TableRow >
								{columns.map((column) => (
									<TableCell
										key={column.label}
										align={column.align}
										style={{ minWidth: column.minWidth, backgroundColor: '#f2f2f8', fontSize: '16px' }}
									>
										{column.label}
									</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{rows?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
								.map((row) => {
									return (
										<TableRow hover role="checkbox" tabIndex={-1} >
											{columns.map((column) => {
												const value = row[column.id];
												return (
													<TableCell key={column.id} align={column.align} sx={{ borderBottom: '1px solid #f2f3f5', padding: '4px' }}>
														{column.format && typeof value === 'number'
															? column.format(value)
															: value}
													</TableCell>
												);
											})}
										</TableRow>
									);
								})}
						</TableBody>
					</Table>
				</TableContainer>
				<Popover
					elevation={1}
					id={id}
					open={open}
					anchorEl={anchorEl}
					onClose={handleClose}
					anchorOrigin={{
						vertical: 'top',
						horizontal: 'left',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
				// sx={{ width: 300 }}
				>
					<Button sx={{ my: 1, mx: 1 }} onClick={openLinkDialog} >
						Acknowledge Alert
					</Button><br />
					<Button sx={{ mx: 1 }}>Close Alert</Button><br />

				</Popover>
				<Dialog open={openAddLink} onClose={closeLinkDialog} PaperProps={{ sx: { borderRadius: '2px' } }}>
					<DialogTitle px={2} >Acknowledge Alert</DialogTitle>
					<DialogContent sx={{ width: '100%', height: '400px' }} >
						<Formik
							initialValues={{ url: '', label: '' }}
							validationSchema={validationSchemaLink}
							onSubmit={linkSubmit}
						>
							{({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
								<Form style={{ textAlign: 'center' }}>
									<div>
										<div style={{ paddingTop: '2px', paddingBottom: '8px', textAlign: 'start', paddingLeft: '3px', fontSize: '12px' }}>
											<label htmlFor="url">Are you sure you want to acknowledge Alert? If yes,please provide comment below.</label>
										</div>
										<Field type="text" id="comment" name="comment" placeholder="Type your comment here" multiline rows={5} as={TextField} sx={{
											width: '100%',
										}} />

									</div>

									<div>
										<div style={{ paddingTop: '14px', paddingBottom: '8px', textAlign: 'start', paddingLeft: '3px', fontSize: '14px' }}>
											<label className='py-12 my-12' htmlFor="label">Assign User<span style={{ color: 'red' }}>*</span></label>

										</div>
										<Field type="text" id="label" name="label" placeholder="Enter User Name" as={TextField} sx={{ width: '100%' }} />
										<div style={{ color: 'red', textAlign: 'start', paddingLeft: '21px' }}>
											<ErrorMessage name="label" component="div" />
										</div>
									</div>
									<Stack direction={"row"} spacing={1} sx={{ mt: 2 }}>
										<Stack>
											<AddCircleIcon sx={{ color: '#42CD3F', mt: 1 }} />
										</Stack>
										<Stack>
											<Button onClick={openLinkDialog}>
												<Typography variant='subtitle1' fontWeight={"bold"} sx={{ color: '#42CD3F', }} >
													ADD ATTACHMENTS
												</Typography>
											</Button>
										</Stack>
									</Stack>


									<DialogActions sx={{ mt: 4, justifyContent: 'center', }} >

										<Button onClick={closeLinkDialog} variant="outlined"
											size="large" sx={{ width: '25%', bgcolor: 'white', borderColor: 'black' }}  >Close</Button>
										<Button type='submit' variant="contained"
											color="secondary"
											size="large" sx={{ width: '50%' }}>Acknowledge Alert</Button>
										{/* disabled={!values.tagKey || !values.tagValue} */}
									</DialogActions>
								</Form>
							)}
						</Formik>
					</DialogContent>
				</Dialog>
				<TablePagination
					rowsPerPageOptions={[10, 25, 100]}
					component="div"
					count={jobDetailList?.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			</Paper>
		</>

	);
}

export default OnBoardTables;