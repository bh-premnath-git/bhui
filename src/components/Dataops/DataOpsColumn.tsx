import { COLORS } from "@/Utils/constants"
import { Stack } from "@mui/material";
import SkipPopUp from "./SkipPopUp";
import { useState } from "react";
import RestartPopUp from "./RestartPopUp";
import StopPopUp from "./StopPopUp";
import CostOptimizationForm from "@/components/Dataops/CostOptimizationForm";
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
    },
    {
        key: 'pipeline_status',
        header: 'Status',
        type: 'number',
        filterable: false,
        sortable: false,
        render: (value: any) => {
            return (
                <>
                    <div style={{
                        backgroundColor: value == "Success" ? COLORS.green :
                            value == 'Failed' ? COLORS.red : '#ffa500', color: 'white', padding: 8, borderRadius: '4px'
                    }}>{value}</div>
                </>
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
            return (
                <>
                    <div className="text-white" >
                        <>
                            {row?.pipeline_status == 'Success' && (<Stack direction={'row'}>
                                <div onClick={() => setOpenCost(true)} className="bg-gray-600 p-1 rounded"> <span className=" px-1 rounded-sm bg-white text-black">$</span> Optimize Cost</div>

                            </Stack>)}
                            {row?.pipeline_status == 'Failed' && (
                                <Stack direction={'row'} spacing={2}>
                                    <div className="underline text-black p-1 rounded" onClick={() => setOpenSkip(true)}> Skip</div>
                                    <div className="underline text-black p-1 rounded" onClick={() => setOpenRestart(true)}> Restart</div>
                                </Stack>
                            )}
                            {row?.pipeline_status == 'In Progress' && (
                                <Stack direction={'row'} spacing={2}>
                                    <div className="underline text-black p-1 rounded" onClick={() => setOpenStop(true)}> Stop</div>
                                </Stack>
                            )}
                            <SkipPopUp open={openSkip} jobDetail={row} onClose={() => setOpenSkip(false)} />
                            <RestartPopUp open={openRestart} jobDetail={row} onClose={() => setOpenRestart(false)} />
                            <StopPopUp open={openStop} jobDetail={row} onClose={() => setOpenStop(false)} />
                            <CostOptimizationForm open={openCost} jobDetail={row} onClose={() => setOpenCost(false)} />

                        </>
                    </div>
                </>
            )
        }
    },

]