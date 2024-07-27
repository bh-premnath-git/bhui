import _ from 'lodash';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { Many } from 'lodash';
import * as React from 'react';
import ProjectsTableHead from './ProjectsTableHead';
import { styled } from '@mui/material/styles';
import { Edit } from '@mui/icons-material';
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
 * The projects table.
 */
function ProjectsTable(props: any) {
	const navigate = useNavigate();
	const codesDtl = JSON.parse(props.data.codesDtl);
	const platformRegion = JSON.parse(props.data.platformRegion);
	const receivedData = props.data.project;

	// const dispatch = useAppDispatch();
	// const projects = useAppSelector(selectProjects);
	// const searchText = useAppSelector(selectProjectsSearchText);

	const [loading, setLoading] = useState(true);
	const [selected, setSelected] = useState<string[]>([]);
	// const [data, setData] = useState(projects);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [tableOrder, setTableOrder] = useState<{
		direction: 'asc' | 'desc';
		id: string;
	}>({
		direction: 'asc',
		id: ''
	});

	// useEffect(() => {
	// 	console.log(props.data)
	// 	dispatch(getProjects()).then(() => setLoading(false));
	// 	// getItem();
	// }, [dispatch]);

	// useEffect(() => {
	// 	if (searchText.length !== 0) {
	// 		setData(_.filter(projects, (item) => item.projectName.toLowerCase().includes(searchText.toLowerCase())));
	// 		setPage(0);
	// 	} else {
	// 		setData(projects);
	// 	}
	// }, [projects, searchText]);


	function findValue(value: any) {
		// console.log(value)
		if (Array.isArray(codesDtl)) {
			// Now you can safely use the filter method
			var filteredData: any = codesDtl.find(code => code.id.toString() === value);
			// console.log(filteredData)
			return filteredData?.dtl_desc.toString()
			// Further processing...
		} else {
			console.error('codesDtl is not an array.');
			return ''

		}

	}

	function findEnv(value: any) {
		// console.log(value)
		if (Array.isArray(codesDtl)) {
			var filteredData: any = codesDtl.find(code => code.id.toString() === value?.toString());
			// console.log(filteredData)
			return filteredData?.dtl_desc.toString()
		} else {
			console.error('codesDtl is not an array.');
			return ''

		}

	}
	function findRegion(value: any) {
		// console.log(value)
		if (Array.isArray(platformRegion)) {
			// Now you can safely use the filter method
			var filteredData: any = platformRegion.find(code => code.id.toString() === value.toString());
			// console.log(filteredData)
			return filteredData?.description.toString()
			// Further processing...
		} else {
			console.error('platRegion is not an array.');
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
			setSelected(receivedData.map((n: any) => n.bh_project_id));
			return;
		}

		setSelected([]);
	}

	function handleDeselect() {
		setSelected([]);
	}

	function handleClick(item: any) {
		console.log(item)
		navigate(`/Admin-Console/Projects/new`, { state: item });
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

	if (receivedData.length === 0 && codesDtl === null) {
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
					There are no projects!
				</Typography>
			</motion.div>
		);
	}

	return (
		<div className="flex flex-col min-h-full ml p-100">
			{/* <SwombScrollbars className="grow overflow-x-auto"> */}
			<Table
				stickyHeader
				className="min-w-xl"
				aria-labelledby="tableTitle" style={{ border: '1px solid #f2f3f5' }}
			>
				<ProjectsTableHead
					selectedProjectIds={selected}
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
								switch (o.bh_project_id) {
									default: {
										return o.bh_project_id;
									}
								}
							}
						],
						[tableOrder.direction] as Many<boolean | 'asc' | 'desc'>
					)
						.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
						.map((n, index: any) => {
							const isSelected = selected.indexOf(n.bh_project_id) !== -1;
							return (
								<StyledTableRow

									hover
									role="checkbox"
									aria-checked={isSelected}
									tabIndex={-1}
									key={n.bh_project_id}
									selected={isSelected}

								>
									<TableCell sx={{ borderBottom: '1px solid #f2f3f5' }}
										className="p-4 md:p-8"
										component="th"
										scope="row"
										align="center"
									>
										{n.bh_project_name}
									</TableCell>

									<TableCell sx={{ borderBottom: '1px solid #f2f3f5' }}
										className="p-4 md:p-8"
										component="th"
										scope="row"
										align="center"
									>
										{findValue(n.bh_project_cld_id)}
									</TableCell>

									<TableCell sx={{ borderBottom: '1px solid #f2f3f5' }}
										className="p-4 md:p-8 truncate"
										component="th"
										scope="row"
										align="center"
									>
										{findRegion(n.cloud_region_cd)}
									</TableCell>

									<TableCell sx={{ borderBottom: '1px solid #f2f3f5' }}
										className="p-4 md:p-8"
										component="th"
										scope="row"
										align="center"
									>
										{n.lake_name}
									</TableCell>
									<TableCell sx={{ borderBottom: '1px solid #f2f3f5' }}
										className="p-4 md:p-8"
										component="th"
										scope="row"
										align="center"
									>
										{n.business_url}
									</TableCell>

									<TableCell sx={{ borderBottom: '1px solid #f2f3f5' }}
										className="p-4 md:p-8"
										component="th"
										scope="row"
										align="center"
									>
										{findEnv(n.env_cd)}
										{/* {n.env_cd === 13 ? "Development" : n.env_cd === 14 ? 'Testing' : n.env_cd === 15 ? 'UAT' : n.env_cd === 16 ? 'Staging' : n.env_cd === 17 ? 'Production' : 'Disaster Recovery'} */}

									</TableCell>

									<TableCell sx={{ borderBottom: '1px solid #f2f3f5' }}

										className="cursor-pointer p-4 md:p-8"
										component="th"
										scope="row"
										align="center"
										onClick={() => handleClick(n)}
									>

										<Edit />
										
										{/* <SwombSvgIcon
												color="action"
												size={24}
												style={{ justifySelf: 'center', alignItems: 'center' }}

											>
												material-outline:edit
											</SwombSvgIcon> */}
									</TableCell>
								</StyledTableRow>
							);
						})}
				</TableBody>
			</Table>
			{/* </SwombScrollbars> */}

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

export default ProjectsTable;