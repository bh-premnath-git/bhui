import { COLORS } from "@/Utils/constants"
import { Stack } from "@mui/material";
import SkipPopUp from "./SkipPopUp";
import { useState } from "react";
import RestartPopUp from "./RestartPopUp";
import StopPopUp from "./StopPopUp";
import CostOptimizationForm from "@/components/Dataops/CostOptimizationForm";
import { IoSearchSharp } from "react-icons/io5";
import ExploreDrawer from "./ExploreDrawer";
import { cn } from "@/lib/utils";
import { CircleCheckBig, Hourglass, XCircle } from "lucide-react";

type ColumnConfig = {
    key: string;
    header: string;
    sortable?: boolean;
    filterable?: boolean;
    type?: 'text' | 'number' | 'date' | 'badge';
    badgeConfig?: {
        colorMap: Record<string, string>;
    };
    render?: (value: any, row: any) => React.ReactNode;
};

export const dataopsColumn: ColumnConfig[] = [
    {
        key: 'pipeline_type',
        header: 'Job Type',
        sortable: true,
        filterable: false,
        type: 'text',
    },
    {
        key: 'project_name',
        header: 'Project',
        type: 'number',
        sortable: false,
        filterable: false,
    },
    {
        key: 'pipeline_name',
        header: 'Pipeline',
        type: 'number',
        sortable: false,
        filterable: false,
        render: (value: any) => {
            const [isExpanded, setIsExpanded] = useState(false);
            const [open, setOpen] = useState(false);

            const toggleDrawer = (newState: boolean) => () => {
                setOpen(newState);
                if (!newState) {
                    setIsExpanded(false);
                }
            };
            
            const handleClick = (e: React.MouseEvent) => {
                e.stopPropagation();
                setOpen(true);
                setIsExpanded(!isExpanded);
            };

            return (
                <>
                    <div className="text-black flex items-center cursor-pointer" onClick={handleClick}>
                        <IoSearchSharp className="mr-1" /> {value}
                    </div>
                    {open && (
                        <ExploreDrawer 
                            isExpanded={isExpanded}
                            toggleDrawer={toggleDrawer}
                            handleClick={handleClick}
                        />
                    )}
                </>
            )
        }
    },
    {
        key: 'pipeline_status',
        header: 'Status',
        type: 'number',
        filterable: false,
        sortable: false,
        render: (value: any) => {
            return (
                <div
                className={cn(
                "inline-flex items-center gap-2 text-sm font-bold",
                {
                    "text-green-600": value === "Success",
                    "text-red-600": value === "Failed",
                    "text-yellow-500": value !== "Success" && value !== "Failed",
                }
                )}>
                    {value === "Success" && <CircleCheckBig className="h-4 w-4" style={{ strokeWidth: '4' }}/>}
                    {value === "Failed" && <XCircle className="h-4 w-4" style={{ strokeWidth: '4' }} />}
                    {value !== "Success" && value !== "Failed" && <Hourglass className="h-4 w-4" style={{ strokeWidth: '4' }} />}
                    {value}
            </div>
            )
        }
    },
    {
        key: 'job_start_time',
        header: 'Start Time',
        type: 'number',
        sortable: false,
        filterable: false,
    },
    {
        key: 'zone_name',
        header: 'Target Zone',
        type: 'number',
        sortable: false,
        filterable: false,
    },
    {
        key: 'job_end_time',
        header: 'Duration',
        type: 'number',
        sortable: false,
    },
    {
        key: 'created_by',
        header: 'Owner',
        type: 'number',
        sortable: false,
    },
    {
        key: 'action',
        header: 'Action',
        type: 'number',
        sortable: false,
        render: (value: any, row: any) => {
            const [openSkip, setOpenSkip] = useState(false);
            const [openRestart, setOpenRestart] = useState(false);
            const [openStop, setOpenStop] = useState(false);
            const [openCost, setOpenCost] = useState(false);

            const handleActionClick = (e: React.MouseEvent, action: () => void) => {
                e.stopPropagation();
                action();
            };

            const handleCostClose = (e?: React.MouseEvent) => {
                if (e) {
                    e.stopPropagation();
                }
                setOpenCost(false);
            };

            return (
                <div className="text-white" onClick={(e) => e.stopPropagation()}>
                    {row?.pipeline_status == 'Success' && (
                        <Stack direction={'row'}>
                            <div 
                                onClick={(e) => handleActionClick(e, () => setOpenCost(true))} 
                                className="bg-gray-600 p-1 rounded cursor-pointer"
                            >
                                <span className="px-1 rounded-sm bg-white text-black">$</span> Optimize Cost
                            </div>
                        </Stack>
                    )}
                    {row?.pipeline_status == 'Failed' && (
                        <Stack direction={'row'} spacing={2}>
                            <div 
                                className="underline text-black p-1 rounded cursor-pointer" 
                                onClick={(e) => handleActionClick(e, () => setOpenSkip(true))}
                            >
                                Skip
                            </div>
                            <div 
                                className="underline text-black p-1 rounded cursor-pointer" 
                                onClick={(e) => handleActionClick(e, () => setOpenRestart(true))}
                            >
                                Restart
                            </div>
                        </Stack>
                    )}
                    {row?.pipeline_status == 'In Progress' && (
                        <Stack direction={'row'} spacing={2}>
                            <div 
                                className="underline text-black p-1 rounded cursor-pointer" 
                                onClick={(e) => handleActionClick(e, () => setOpenStop(true))}
                            >
                                Stop
                            </div>
                        </Stack>
                    )}
                    
                    <SkipPopUp open={openSkip} jobDetail={row} onClose={() => setOpenSkip(false)} />
                    <RestartPopUp open={openRestart} jobDetail={row} onClose={() => setOpenRestart(false)} />
                    <StopPopUp open={openStop} jobDetail={row} onClose={() => setOpenStop(false)} />
                    <CostOptimizationForm open={openCost} jobDetail={row} onClose={handleCostClose} />
                </div>
            )
        }
    },
];

export const logData = [
    { date: '2023-11-03 14:35:20.000', label: 'EST', description: 'User login successful for user_id: 1024' },
    { date: '2023-11-03 14:37:12.000', label: 'EST', description: 'File upload initiated by user_id: 1024' },
    { date: '2023-11-03 14:38:45.000', label: 'EST', description: 'Data processing started for file_id: 456' },
    { date: '2023-11-03 14:40:23.000', label: 'EST', description: 'Error encountered: Missing values in column 3 for file_id: 456' },
    { date: '2023-11-03 14:45:19.000', label: 'EST', description: 'Starting scan to move intermediate done files' },
    { date: '2023-11-03 15:05:11.000', label: 'EST', description: 'System check completed successfully' },
    { date: '2023-11-03 15:15:40.000', label: 'EST', description: 'User logout detected for user_id: 1024' },
    { date: '2023-11-03 15:26:53.000', label: 'EST', description: 'Backup completed for database db_id: 789' },
    { date: '2023-11-03 15:28:30.000', label: 'EST', description: 'New user registration for user_id: 1050' },
    { date: '2023-11-03 15:40:15.000', label: 'EST', description: 'Data export initiated by user_id: 1033' },
    { date: '2023-11-03 16:00:05.000', label: 'EST', description: 'Scheduled maintenance started on server 2' },
    { date: '2023-11-03 16:02:29.000', label: 'EST', description: 'Scheduled maintenance completed on server 2' },
    { date: '2023-11-03 16:15:10.000', label: 'EST', description: 'Session timeout for user_id: 1018' },
    { date: '2023-11-03 16:20:08.000', label: 'EST', description: 'Connection reset for db_id: 792 during query execution' },
    { date: '2023-11-03 16:35:54.000', label: 'EST', description: 'Service restart triggered for email subsystem' },
];
