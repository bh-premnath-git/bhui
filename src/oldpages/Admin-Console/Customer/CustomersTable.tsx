import _ from 'lodash';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { ChangeEvent, MouseEvent, useState } from 'react';
import { Many } from 'lodash';
import * as React from 'react';
import CustomersTableHead from './CustomersTableHead';
import { IconButton, Menu, MenuItem, Stack } from '@mui/material';

import { styled } from '@mui/material/styles';
import { MoreVert } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
const StyledTableRow = styled(TableRow)(({ theme }) => ({
	// '&:nth-of-type(odd)': {
	// 	backgroundColor: theme.palette.action.hover,
	// },
	// hide last border
	'&:last-child td, &:last-child th': {
		border: 0,
	},
}));

/**
 * The customers table.
 */
function CustomersTable(props: any) {
	const navigate = useNavigate();

	const [anchorEl, setAnchorEl] = useState(null);
	const receivedData = props.data;
	const [selectedItem, setSelectedItem] = useState(null);
	const [loading, setLoading] = useState(true);
	const [selected, setSelected] = useState<string[]>([]);
	// const [data, setData] = useState(customers);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [tableOrder, setTableOrder] = useState<{
		direction: 'asc' | 'desc';
		id: string;
	}>({
		direction: 'asc',
		id: ''
	});


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

	function handleClick(item: any) {
        navigate(`/Admin Console/Manage Customer/Add Customer`, { state: selectedItem });
    }
	const handleClick1 = (event: any) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

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



	if (receivedData.length === 0) {
		return (
			<>
				<div style={{ textAlign: 'center', marginLeft: '0%', marginTop: '12%' }}>
					<img src="/assets/userlanding/Layer 34.png" width={'10%'} />
					<div className="h6 py-2 text-secondary">There is no customer Found !</div>
				</div>
			</>
		);
	}
	const formattedDate = (timestamp: any) => {
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
		setSelectedItem(item)
	}

	return (
		<div className="flex flex-col min-h-full ml p-100">
			<Table style={{ borderTop: '1px solid #f2f3f5', borderLeft: '1px solid #f2f3f5', borderRight: '1px solid #f2f3f5' }}
				stickyHeader
				className="min-w-xl"
				aria-labelledby="tableTitle"
			>
				<CustomersTableHead
					selectedCustomerIds={selected}
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
						.map((n) => {
							const isSelected = selected.indexOf(n.id) !== -1;
							return (
								<StyledTableRow

									hover
									role="checkbox"
									aria-checked={isSelected}
									tabIndex={-1}
									key={n.id}
									selected={isSelected}
								>

									<TableCell style={{ borderBottom: '1px solid #f2f3f5' }}
										className=" "
										component="th"
										scope="row"
										align="center"
									>
										{n.relation_ship_owner}
									</TableCell>
									<TableCell style={{ borderBottom: '1px solid #f2f3f5' }}
										className=" "
										component="th"
										scope="row"
										align="center"
									>
										{n.relation_ship_owner_email}

									</TableCell>

									{/* <TableCell
											className="py-4 md:p-8"
											component="th"
											scope="row"
											align="center"
										>
											{n.onboardedDate}
										</TableCell> */}

									<TableCell style={{ borderBottom: '1px solid #f2f3f5' }}
										className=" truncate"
										component="th"
										scope="row"
										align="center"
									>
										{formattedDate(n.created_at)}
									</TableCell>


									<TableCell style={{ borderBottom: '1px solid #f2f3f5' }}
										className=" cursor-pointer"
										component="th"
										scope="row"
										align="center"
										onClick={() => handleCellClick(n)}
									// onClick={() => handleClick(n)}
									>
										<div style={{ boxShadow: 'none' }}>
											<IconButton
												id="basic-button"
												aria-controls={'simple-menu'}
												aria-haspopup="true"
												onClick={handleClick1}
											>
												<MoreVert />
											</IconButton>
											<Menu
												id="simple-menu"
												anchorEl={anchorEl}
												// keepMounted
												open={Boolean(anchorEl)}
												onClose={handleClose}
												MenuListProps={{
													'aria-labelledby': 'basic-button',
												}}
											>
												<MenuItem style={{ margin: '2px', borderBottom: `2px solid #f2f3f5` }} onClick={() => handleClick(n)}>Edit</MenuItem>
												<MenuItem onClick={handleClose}>Disable</MenuItem>
											</Menu>
										</div>
										{/* <SwombSvgIcon
											color="action"
											size={24}
											style={{justifySelf:'center',alignItems:'center'}}
											 
										>
										 material-outline:edit
										</SwombSvgIcon> */}
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

export default CustomersTable;
