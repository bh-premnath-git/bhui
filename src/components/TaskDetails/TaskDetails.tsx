import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { 
    IconButton, 
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Menu,
    MenuItem,
} from '@mui/material';
import { X as CloseIcon, Settings } from 'lucide-react';

interface TaskDetail {
    task_name: string;
    task_status: string;
    task_start_time: string;
    task_end_time: string | null;
    task_metadata?: Record<string, any>;
    task_statistics?: Record<string, any>;
    job_metadata?: Record<string, any>;
    [key: string]: any;
}

interface Column {
    id: string;
    label: string;
    visible: boolean;
    render?: (value: any) => React.ReactNode;
}

interface TaskDetailsProps {
    jobId: string;
    onClose: () => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ jobId, onClose }) => {
    const [tasks, setTasks] = useState<TaskDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(true);
    const [columns, setColumns] = useState<Column[]>([
        { 
            id: 'task_name', 
            label: 'Task Name', 
            visible: true 
        },
        { 
            id: 'task_status', 
            label: 'Status', 
            visible: true,
            render: (value) => (
                <Chip 
                    label={value}
                    color={getStatusColor(value)}
                    size="small"
                />
            )
        },
        { 
            id: 'task_start_time', 
            label: 'Start Time', 
            visible: true,
            render: (value) => format(new Date(value), 'PPp')
        },
        { 
            id: 'task_end_time', 
            label: 'End Time', 
            visible: true,
            render: (value) => value ? format(new Date(value), 'PPp') : '-'
        },
        { 
            id: 'task_metadata.task_type', 
            label: 'Task Type', 
            visible: false 
        },
        { 
            id: 'task_metadata.priority', 
            label: 'Priority', 
            visible: false 
        },
        { 
            id: 'task_statistics.records_processed', 
            label: 'Records Processed', 
            visible: false 
        },
        { 
            id: 'task_statistics.processing_time_ms', 
            label: 'Processing Time (ms)', 
            visible: false 
        }
    ]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8003/api/v1/task_details/list/?job_id=${jobId}&offset=0&limit=100&order_desc=false`,
                    {
                        headers: {
                            'accept': 'application/json',
                        }
                    }
                );
                const data = await response.json();
                setTasks(data);
            } catch (error) {
                console.error('Error fetching task details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (jobId) {
            fetchTasks();
        }
    }, [jobId]);

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(onClose, 300);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'success':
                return 'success';
            case 'failed':
                return 'error';
            case 'in progress':
                return 'warning';
            default:
                return 'default';
        }
    };

    const handleColumnToggle = (columnId: string) => {
        setColumns(columns.map(col => 
            col.id === columnId ? { ...col, visible: !col.visible } : col
        ));
    };

    const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    return (
        <div 
            className={`fixed top-0 right-0 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{
                width: '1000px',
                zIndex: 1000,
                borderLeft: '1px solid #e5e7eb'
            }}
        >
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <Typography variant="h6" className="font-semibold">Task Details</Typography>
                    <div className="flex items-center gap-2">
                        <IconButton 
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                            size="small"
                            className="hover:bg-gray-200"
                        >
                            <Settings size={20} />
                        </IconButton>
                        <IconButton 
                            onClick={handleClose}
                            size="small"
                            className="hover:bg-gray-200"
                        >
                            <CloseIcon size={20} />
                        </IconButton>
                    </div>
                </div>

                {/* Column Selection Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                >
                    <div className="p-2">
                        <Typography variant="subtitle2" className="px-3 py-1">
                            Show/Hide Columns
                        </Typography>
                        <FormGroup>
                            {columns.map((column) => (
                                <MenuItem key={column.id} dense>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={column.visible}
                                                onChange={() => handleColumnToggle(column.id)}
                                                size="small"
                                            />
                                        }
                                        label={column.label}
                                    />
                                </MenuItem>
                            ))}
                        </FormGroup>
                    </div>
                </Menu>

                {/* Table Content */}
                <div className="flex-1 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Typography>Loading tasks...</Typography>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <Typography>No tasks found</Typography>
                        </div>
                    ) : (
                        <div className="h-full overflow-auto">
                            <TableContainer>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            {columns
                                                .filter(col => col.visible)
                                                .map(column => (
                                                    <TableCell 
                                                        key={column.id}
                                                        style={{
                                                            whiteSpace: 'nowrap',
                                                            minWidth: getColumnWidth(column.id),
                                                            maxWidth: getColumnWidth(column.id),
                                                        }}
                                                    >
                                                        {column.label}
                                                    </TableCell>
                                                ))
                                            }
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {tasks.map((task) => (
                                            <TableRow key={task.task_name} hover>
                                                {columns
                                                    .filter(col => col.visible)
                                                    .map(column => (
                                                        <TableCell 
                                                            key={column.id}
                                                            style={{
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                minWidth: getColumnWidth(column.id),
                                                                maxWidth: getColumnWidth(column.id),
                                                            }}
                                                        >
                                                            {column.render 
                                                                ? column.render(getNestedValue(task, column.id))
                                                                : getNestedValue(task, column.id)
                                                            }
                                                        </TableCell>
                                                    ))
                                                }
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const getColumnWidth = (columnId: string): number => {
    switch (columnId) {
        case 'task_name':
            return 300;
        case 'task_status':
            return 150;
        case 'task_start_time':
        case 'task_end_time':
            return 200;
        case 'task_metadata.task_type':
            return 180;
        case 'task_metadata.priority':
            return 120;
        case 'task_statistics.records_processed':
            return 180;
        case 'task_statistics.processing_time_ms':
            return 180;
        default:
            return 180;
    }
};

export default TaskDetails; 