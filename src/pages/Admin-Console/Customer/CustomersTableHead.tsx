import TableCell,{tableCellClasses} from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tooltip from '@mui/material/Tooltip';
import { MouseEvent, useState } from 'react';
import TableHead from '@mui/material/TableHead';
import { lighten } from '@mui/material/styles';
import { styled } from '@mui/material/styles';


const StyledTableCell = styled(TableCell)(({ theme }) => ({
	[`&.${tableCellClasses.head}`]: {
	  backgroundColor: '#f2f2f8',
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
		id: 'customerName',
		align: 'center',
		disablePadding: false,
		label: 'Consumer Name',
		sort: true
	},
	
	{
		id: 'customerEmail',
		align: 'center',
		disablePadding: false,
		label: 'Customer Email',
		sort: true
	} ,
	{
		id: 'createdOn',
		align: 'center',
		disablePadding: false,
		label: 'Created On',
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

type CustomersTableHeadPropsType = {
	selectedCustomerIds: string[];
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
 * The customers table head component.
 */
function CustomersTableHead(props: CustomersTableHeadPropsType) {
	const { selectedCustomerIds, tableOrder, onSelectAllClick, onRequestSort, rowCount, onMenuItemClick } = props;

	const numSelected = selectedCustomerIds.length;

	const [selectedCustomersMenu, setSelectedCustomersMenu] = useState<HTMLButtonElement | null>(null);


	const createSortHandler = (event: MouseEvent<HTMLSpanElement>, property: string) => {
		onRequestSort(event, property);
	};

	function openSelectedCustomersMenu(event: MouseEvent<HTMLButtonElement>) {
		setSelectedCustomersMenu(event.currentTarget);
	}

	function closeSelectedCustomersMenu() {
		setSelectedCustomersMenu(null);
	}

	return (
		<TableHead>
			<TableRow className="h-34 sm:h-32">
				
				{rows.map((row) => {
					return (
						<StyledTableCell
							sx={{
								backgroundColor: (theme) =>
									theme.palette.mode === 'light'
										? lighten(theme.palette.background.default, 0.4)
										: lighten(theme.palette.background.default, 0.02)
							}}
							className="p-4 md:p-8"
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

export default CustomersTableHead;
