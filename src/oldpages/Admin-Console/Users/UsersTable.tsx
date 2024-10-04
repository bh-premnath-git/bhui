import _ from 'lodash';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { Many, values } from 'lodash';
import * as React from 'react';
import UsersTableHead from './UsersTableHead';
import { Chip, IconButton, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Label, MoreVert } from '@mui/icons-material';
import ApiService from '../../../Services/ApiServices';
import { useNavigate } from 'react-router-dom';




const StyledTableRow = styled(TableRow)(({ theme }) => ({
	// '&:nth-of-type(odd)': {
	// 	backgroundColor: theme.palette.action.hover,
	// },
	// hide last border
	'&:last-child td, &:last-child th': {
		border: 1,
	},
}));

/**
 * The users table.
 */
function UsersTable(props: any,) {
	// UsersTableProps
	const receivedData = props.data;
	
	const [anchorEl, setAnchorEl] = useState(null);
	const [codesDtl, setCodesDtl]:any = useState(localStorage.getItem('codesDtl'));
	const [selectedItem, setSelectedItem]:any = useState(null);

	const  navigate  = useNavigate();

	const [loading, setLoading] = useState(true);
	const [selected, setSelected] = useState<string[]>([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [tableOrder, setTableOrder] = useState<{
		direction: 'asc' | 'desc';
		id: string;
	}>({
		direction: 'asc',
		id: ''
	});

	function findValue(value:any) {
		var staticData=JSON.parse(codesDtl)
		if (Array.isArray(staticData)) {
			var filteredData: any = staticData.find((code:any) => code.id.toString() === value?.toString());
			return filteredData?.dtl_desc?.toString()
		} else {
			console.error('codesDtl is not an array.');
			return ''

		}
	}

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

	function handleSelectAllClick(event: ChangeEvent<HTMLInputElement>) {
		if (event.target.checked) {
			return;
		}

		setSelected([]);
	}

	function handleDeselect() {
		setSelected([]);
	}

	const handleClose = async (item: any, name: any) => {
		setAnchorEl(null);
	};

	function handleClick() {
		navigate(`/Admin-Console/Users/Edit`, { state: selectedItem });
	}

	async function handleStatus() {
		const statusId = selectedItem.user_status_cd === 26 ? 27 : 26
		selectedItem.user_status_cd = statusId;
		setAnchorEl(null);
		try {
			const url = `/bh_user/${selectedItem.bh_user_id}`;
			const result = await ApiService('8011','put', url, selectedItem);
			console.log(result)
		}
		catch (error) {
			console.error('Error fetching Status', error);

		}
	}

    const handleClick1 = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

	function handleChangePage(event: React.MouseEvent<HTMLButtonElement> | null, page: number) {
		setPage(+page);
	}

	function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
		setRowsPerPage(+event.target.value);
	}

	if (receivedData.length === 0) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1, transition: { delay: 0.1 } }}
				className="flex flex-1 items-center justify-center h-full"
			>
				<Typography
					color="text.secondary"
					variant="h5"
				>
					There are no users!
				</Typography>
			</motion.div>
		);
	}

	const formattedDate = (timestamp:any) => {
		// Parse the timestamp string into a Date object
		const date = new Date(timestamp);

		// Get the date components
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1 and pad with '0'
		const day = String(date.getDate()).padStart(2, '0'); // Pad with '0'

		// Format the date string as YYYY-MM-DD
		return `${day}-${month}-${year}`;
	};


	async function handleCellClick(item: any) {
		console.log(item);
		setSelectedItem(item)
	}


	return (
		<div >
				<Table style={{border:'1px solid #f2f3f5'}}
					stickyHeader 
					className="myHeadFont"
					aria-labelledby="tableTitle"
				>
					<UsersTableHead
						selectedUserIds={selected}
						tableOrder={tableOrder}
						onSelectAllClick={handleSelectAllClick}
						onRequestSort={handleRequestSort}
						rowCount={receivedData.length}
						onMenuItemClick={handleDeselect}
					/>

					<TableBody>
						{_.orderBy(
							receivedData,
							[
								(o) => {
									switch (o.id) {
										default: {
											return o.id;
										}
									}
								}
							],
							[tableOrder.direction] as Many<boolean | 'asc' | 'desc'>
						)
							.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
							.map((n, index) => {
								// const isSelected = selected.indexOf(n.id) !== -1;

								console.log(index);
								return (
									<StyledTableRow
										hover
										role="checkbox"
										// aria-checked={isSelected}
										tabIndex={-1}
										key={index}
									// selected={isSelected}
									>
										<TableCell  sx={{ borderBottom: '1px solid #f2f3f5'}}

											className="myFont"
											// component="th"
											scope="row"
											align="center"
										>{`${n.bh_user_first_name} ${n.bh_user_last_name} `}

										</TableCell>

										<TableCell sx={{ borderBottom: '1px solid #f2f3f5'}}

											className="myFont"
											// component="th"
											scope="row"
											align="center"
										>
											{n.user_email_id}
										</TableCell>

										<TableCell sx={{ borderBottom: '1px solid #f2f3f5'}}

											className=" truncate myFont"
											component="th"
											scope="row"
											align="left"
										>
											{
												n?.project_details?.map((data:any, index:any) => (
													<>
														<TableRow key={data.projectSno}>
															<TableCell className='myFont'>Project{index + 1}</TableCell>

															<TableCell>
																<span style={{ backgroundColor: "#feecc6", padding: '6px', borderRadius: '4px', fontWeight: '600' }}>{data.project?.label}</span>
															</TableCell>

														</TableRow>
														<TableRow key={index}>
															<TableCell> </TableCell>
															{
                                                            data?.projectRole?.map((item: any, index: any) => (
                                                                <>
                                                                    <TableCell key={index} > <span style={{ backgroundColor: "#d4f5e7", padding: '6px', borderRadius: '4px', fontWeight: '600' }}>{item.dtl_desc}</span> </TableCell>
                                                                </>
                                                            ))
                                                        }
														</TableRow>

													</>
												))
											}

										</TableCell>
										<TableCell sx={{ borderBottom: '1px solid #f2f3f5'}}

											className="myFont"
											component="th"
											scope="row"
											align="center"
										>
											{findValue(n.user_status_cd) === "Enable" ?
												<span style={{ color: "green", padding: '8px', borderRadius: '4px', fontWeight: 'bold' }}>
													{findValue(n.user_status_cd)}</span>
												: <span style={{ color: "grey", padding: '8px', borderRadius: '4px', fontWeight: 'bold' }}>
													{findValue(n.user_status_cd)}</span>
											}
										</TableCell>
										<TableCell sx={{ borderBottom: '1px solid #f2f3f5'}}

											className="myFont"
											// component="th"
											scope="row"
											align="center"
										>
											{formattedDate(n.created_at)}
										</TableCell>
										<TableCell sx={{ borderBottom: '1px solid #f2f3f5'}}

											className="myFont"
											scope="row"
											align="center"
										>
											{formattedDate(n.updated_at)}
										</TableCell>

										<TableCell sx={{ borderBottom: '1px solid #f2f3f5'}}

											className=" cursor-pointer myFont"
											component="th"
											scope="row"
											align="center"
											onClick={() => handleCellClick(n)} // Assuming handleCellClick is your click handler
										>
											<div style={{ boxShadow: 'none' }}>
												<IconButton
													id={`basic-button-${index}`}
													aria-controls={`simple-menu-${index}`}
													aria-haspopup="true"
													onClick={handleClick1}
												>
													<MoreVert />
												</IconButton>
												<Menu
													id={`simple-menu-${index}`}
													anchorEl={anchorEl}
													open={Boolean(anchorEl)}
													onClose={handleClose}
													MenuListProps={{
														'aria-labelledby': `basic-button-${index}`,
													}}
												>
													<MenuItem style={{ margin: '2px', borderBottom: `2px solid lightgrey` }} onClick={() => handleClick()}>Edit</MenuItem>
													<MenuItem onClick={() => handleStatus()}>{findValue(n.user_status_cd) === "Enable" ? `Disable ` : `Enable`}</MenuItem>
												</Menu>
											</div>
										</TableCell>
									</StyledTableRow>
								);
							})}
					</TableBody>
				</Table>

			<TablePagination
				className="shrink-0 border-t-1"
				component="div"
				count={receivedData.length}
				rowsPerPage={rowsPerPage}
				page={page}
				backIconButtonProps={{
					'aria-label': 'Previous Page'
				}}
				nextIconButtonProps={{
					'aria-label': 'Next Page'
				}}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/>
		</div>
	);
}

export default UsersTable;