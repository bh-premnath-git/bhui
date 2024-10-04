import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tooltip from '@mui/material/Tooltip';
import { MouseEvent, useState } from 'react';
import Box from '@mui/material/Box';
import TableHead from '@mui/material/TableHead';
import { lighten } from '@mui/material/styles';
import { styled } from '@mui/material/styles';

/**
 * The table head row type.
 */
type rowType = {
	id: string;
	align: 'left' | 'center' | 'right';
	disablePadding: boolean;
	label: string;
	sort: boolean;
};


const StyledTableCell = styled(TableCell)(({ theme }) => ({
	[`&.${tableCellClasses.head}`]: {
	  backgroundColor: '#f2f3f5',
	  color: 'black',
	},
	[`&.${tableCellClasses.body}`]: {
	  fontSize: 14,
	},
  }));

/**
 * The table head rows data.
 */
const rows: rowType[] = [
	 
	{
		id: 'projectName',
		align: 'center',
		disablePadding: false,
		label: 'Project Name',
		sort: true
	},
	{
		id: 'platformCd',
		align: 'center',
		disablePadding: false,
		label: 'Cloud Platform',
		sort: true
	},
	{
		id: 'platformRegionSno',
		align: 'center',
		disablePadding: false,
		label: 'AWS Region',
		sort: true
	},
	{
		id: 'lakeName',
		align: 'center',
		disablePadding: false,
		label: 'Lake Name',
		sort: true
	},
	{
		id: 'businessURL',
		align: 'center',
		disablePadding: false,
		label: 'Business URL',
		sort: true
	},
	{
		id: 'environmentCd',
		align: 'center',
		disablePadding: false,
		label: 'Environment',
		sort: true
	},
	{
		id: 'actions',
		align: 'center',
		disablePadding: false,
		label: 'Action',
		sort: true
	}
];

type ProjectsTableHeadPropsType = {
	selectedProjectIds: string[];
	onRequestSort: (event: MouseEvent<HTMLSpanElement>, property: string) => void;
	onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
	tableOrder: {
		direction: 'asc' | 'desc';
		id: string;
	};
	rowCount: number;
	onMenuItemClick: () => void;
};

/**
 * The projects table head component.
 */
function ProjectsTableHead(props: ProjectsTableHeadPropsType) {
	const { selectedProjectIds, tableOrder, onSelectAllClick, onRequestSort, rowCount, onMenuItemClick } = props;

	const numSelected = selectedProjectIds.length;

	const [selectedProjectsMenu, setSelectedProjectsMenu] = useState<HTMLButtonElement | null>(null);


	const createSortHandler = (event: MouseEvent<HTMLSpanElement>, property: string) => {
		onRequestSort(event, property);
	};

	function openSelectedProjectsMenu(event: MouseEvent<HTMLButtonElement>) {
		setSelectedProjectsMenu(event.currentTarget);
	}

	function closeSelectedProjectsMenu() {
		setSelectedProjectsMenu(null);
	}

	return (
		<TableHead>
			<TableRow className="h-32 sm:h-32">
				
				{rows.map((row) => {
					return (
						<StyledTableCell
							sx={{
								backgroundColor: '#f2f3f5'
							}}
							className="p-4 md:p-16"
							key={row.id}
							align={row.align}
							padding={row.disablePadding ? 'none' : 'normal'}
							sortDirection={tableOrder.id === row.id ? tableOrder.direction : false}
						>
							{row.sort && (
								<Tooltip
									title="Sort"
									placement={row.align === 'right' ? 'bottom-end' : 'bottom-start'}
									enterDelay={300}
								>
									<TableSortLabel
										active={tableOrder.id === row.id}
										direction={tableOrder.direction}
										onClick={(ev: MouseEvent<HTMLSpanElement>) => createSortHandler(ev, row.id)}
										className="font-semibold"
									>
										{row.label}
									</TableSortLabel>
								</Tooltip>
							)}
						</StyledTableCell>
					);
				})}
			</TableRow>
		</TableHead>
	);
}

export default ProjectsTableHead;
