import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tooltip from '@mui/material/Tooltip';
import { MouseEvent, useState } from 'react';
import Box from '@mui/material/Box';
import TableHead from '@mui/material/TableHead';
import { lighten } from '@mui/material/styles';
import { styled } from '@mui/material/styles';


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
 * The table head row type.
 */
type rowType = {
	id: string;
	align: 'left' | 'center' | 'right';
	disablePadding: boolean;
	label: string;
	sort: boolean;
};

/**
 * The table head rows data.
 */
const rows: rowType[] = [
	 
	{
		id: 'userName',
		align: 'center',
		disablePadding: false,
		label: 'Full Name',
		sort: true
	},
	{
		id: 'emailId',
		align: 'center',
		disablePadding: false,
		label: 'Email ID',
		sort: true
	},
	{
		id: 'tags',
		align: 'center',
		disablePadding: false,
		label: 'Project Details',
		sort: true
	},
	{
		id: 'userStatus',
		align: 'center',
		disablePadding: false,
		label: 'Status',
		sort: true
	},
	{
		id: 'createdOn',
		align: 'center',
		disablePadding: false,
		label: 'Created On',
		sort: true
	} ,
	{
		id: 'lastActive',
		align: 'center',
		disablePadding: false,
		label: 'Last Active On',
		sort: true
	} ,
	{
		id: 'actions',
		align: 'center',
		disablePadding: false,
		label: 'Action',
		sort: true
	}
];

type UsersTableHeadPropsType = {
	selectedUserIds: string[];
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
 * The users table head component.
 */
function UsersTableHead(props: UsersTableHeadPropsType) {
	const { selectedUserIds, tableOrder, onSelectAllClick, onRequestSort, rowCount, onMenuItemClick } = props;

	const numSelected = selectedUserIds.length;

	const [selectedUsersMenu, setSelectedUsersMenu] = useState<HTMLButtonElement | null>(null);

	const createSortHandler = (event: MouseEvent<HTMLSpanElement>, property: string) => {
		onRequestSort(event, property);
	};

	function openSelectedUsersMenu(event: MouseEvent<HTMLButtonElement>) {
		setSelectedUsersMenu(event.currentTarget);
	}

	function closeSelectedUsersMenu() {
		setSelectedUsersMenu(null);
	}

	return (
		<TableHead>
			<TableRow className="h-32 sm:h-32">
				
				{rows.map((row) => {
					return (
						<StyledTableCell
							sx={{
								backgroundColor: (theme) =>
									theme.palette.mode === 'light'
										? lighten(theme.palette.background.default, 0.4)
										: lighten(theme.palette.background.default, 0.02)
							}}
							className="p-6 md:p-12"
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

export default UsersTableHead;