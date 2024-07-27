import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box, Button, Input, Stack, TextField, Typography } from '@mui/material';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import * as React from 'react';
import { Popover } from '@mui/material';
import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { IoIosAddCircle } from 'react-icons/io';


const StyledTableCell = styled(TableCell)(({ theme }) => ({
	[`&.${tableCellClasses.head}`]: {
		backgroundColor: 'gray',
		color: theme.palette.common.white,
	},
	[`&.${tableCellClasses.body}`]: {
		fontSize: 14,
	},
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
	'&:nth-of-type(odd)': {
		backgroundColor: theme.palette.action.hover,
	},
	// hide last border
	'&:last-child td, &:last-child th': {
		border: 0,
	},
}));

function createData(
	col1: string,
	col2: string,
	col3: string,
	col4: string,
	col5: string,
) {
	return { col1, col2, col3, col4, col5 };
}

type FormType = {

	sourceName: string;

};

const schema = yup.object().shape({
	sourceName: yup.string().required('sourceName is required')
});


function CodePipelineLanding() {

	const rows = [
		createData('Project Name 1', 'Pipeline Name 1', 'data', 'data', 'data'),
		createData('Project Name 1', 'Pipeline Name 2', 'data', 'data', 'data'),
		createData('Project Name 1', 'Pipeline Name 3', 'data', 'data', 'data'),
		createData('Project Name 1', 'Pipeline Name 4', 'data', 'data', 'data'),
		createData('Project Name 1', 'Pipeline Name 5', 'data', 'data', 'data'),
		createData('Project Name 1', 'Pipeline Name 6', 'data', 'data', 'data'),
		createData('Project Name 1', 'Pipeline Name 7', 'data', 'data', 'data'),
		createData('Project Name 1', 'Pipeline Name 8', 'data', 'data', 'data'),
		createData('Project Name 1', 'Pipeline Name 3', 'data', 'data', 'data'),
		createData('Project Name 1', 'Pipeline Name 4', 'data', 'data', 'data'),
		createData('Project Name 1', 'Pipeline Name 5', 'data', 'data', 'data'),
		createData('Project Name 1', 'Pipeline Name 6', 'data', 'data', 'data'),
		createData('Project Name 1', 'Pipeline Name 2', 'data', 'data', 'data'),
		createData('Project Name 1', 'Pipeline Name 3', 'data', 'data', 'data'),
		createData('Project Name 1', 'Pipeline Name 5', 'data', 'data', 'data'),

	];

	const { control, watch, reset, handleSubmit, formState } = useForm<FormType>({
		mode: 'all',
		resolver: yupResolver(schema)
	});



	// const [open, setOpen] = useState(false);

	// const handleOpen = () => {
	// 	setOpen(true);
	// };

	// const handleClose = () => {
	// 	setOpen(false);
	// };

	const [anchorEl, setAnchorEl] = useState(null);

	const handleOpen = (event: any) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);
	const id = open ? 'popup' : undefined;


	return (

		<>
				<div >
					<div className="d-flex justify-content-between mt-5">

						<div>

							<Input
								placeholder="Search Pipelines"
								className="flex flex-1"
								disableUnderline
								fullWidth
								inputProps={{
									'aria-label': 'Search'
								}}
							/>
						</div>
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
						>
							<Button className='bg-dark'
								component={Link}
								to="/Designer/BuildPipeLine/new"
								variant="contained"
								size="medium"
							>
								Create New Pipeline
							</Button>
						</motion.div>
						{/* </div> */}
					</div>
					<br></br>
					<div >
						<Box  sx={{ width: '100%', justifyContent: 'center', paddingTop: '10px' }}>

							<div className='p-20'>
								<TableContainer>
									<Table sx={{ minWidth: 700 }} aria-label="customized table">
										<TableHead>
											<TableRow>
												<StyledTableCell>Project Name</StyledTableCell>
												<StyledTableCell align="center" >Pipeline Name</StyledTableCell>
												<StyledTableCell align="center" > </StyledTableCell>

											</TableRow>
										</TableHead>
										<TableBody>
											{rows.map((row) => (
												<StyledTableRow key={row.col1}>
													<StyledTableCell component="th" scope="row">
														{row.col1}
													</StyledTableCell>
													<StyledTableCell align="center">

														{row.col2}

														{/* <Button
component={Link}
to="/Designer/BuildPipeLine/new"
variant="contained"
color="secondary"
// startIcon={<SwombSvgIcon>heroicons-outline:plus</SwombSvgIcon>}
size="small"
>
<SwombSvgIcon
	// color="white"
	className="cursor-pointer"
	size={24}
	style={{ justifySelf: 'center', alignItems: 'center' }}

>
	material-outline:edit
</SwombSvgIcon>
</Button> */}
													</StyledTableCell>
													<StyledTableCell align="center">

														<Button
															// component={Link}
															// to="/Designer/BuildPipeLine/new"
															variant="outlined"
															sx={{ color: 'gray', border: 'none' }}
															// startIcon={<SwombSvgIcon>heroicons-outline:plus</SwombSvgIcon>}
															size="small"
															onClick={handleOpen}

														>

															<MoreVertIcon />

															{/* <SwombSvgIcon
	// color="white"
	className="cursor-pointer"
	size={24}
	style={{ justifySelf: 'center', alignItems: 'center' }}

>
	material-outline:file_copy
</SwombSvgIcon> */}
														</Button>
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
															sx={{ width: 250 }}
														>
															<Button>Edit</Button><br />
															<Button>Clone</Button><br />
															<Button>Delete</Button>
														</Popover>


														{/* {row.col3} */}
													</StyledTableCell>

												</StyledTableRow>
											))}
										</TableBody>
									</Table>
								</TableContainer>

							</div>

						</Box>


					</div>
				</div>
		</>


	);
}

export default CodePipelineLanding;

//  <motion.span
// 						initial={{ x: -20 }}
// 						animate={{ x: 0, transition: { delay: 0.2 } }}
// 					>
// 						<Typography className="text-14 sm:text-20 truncate font-semibold">
// 							code
// 							</Typography>
// 					</motion.span>