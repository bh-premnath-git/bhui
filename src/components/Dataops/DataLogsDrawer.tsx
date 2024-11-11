import React from 'react';
import {
    Box,
    Drawer,
    Stack,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    Tabs,
    Tab,
    Divider
} from '@mui/material';
import { FaExpandAlt } from 'react-icons/fa';
import { Search } from '@mui/icons-material';
import { TbFilter } from 'react-icons/tb';
import { IoFilterSharp } from 'react-icons/io5';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { logData } from './DataOpsColumn';
import { LogItem } from './ShowingLogs';

const DataLogsDrawer = ({
    isExpanded,
    toggleDrawer,
    handleClick,
    drawerHeight,
    selectedTab,
    handleTabChange,
    isFullScreen,
    selectedRowData
}: any) => {
    return (
        <Drawer
            anchor="bottom"
            open={isExpanded}
            onClose={() => toggleDrawer(false)}
            PaperProps={{
                style: {
                    height: drawerHeight,
                    transition: 'height 0.3s ease',
                },
            }}
        >
            <Box
                sx={{ width: 'auto', padding: 2 }}
                role="presentation"
                onClick={() => toggleDrawer(false)}
                onKeyDown={() => toggleDrawer(false)}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Label >
                        Job Name: <span style={{ fontWeight: 'bold' }}>{selectedRowData?.pipeline_name}</span>
                    </Label>

                    <div className='flex items-center'>
                        <Input placeholder="Search logs" className="w-48 mr-3" />
                        <img src="/assets/dataops/Download.svg" alt="download" className="w-8 h-8 mr-2" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false" />
                        <img onClick={handleClick} src="/assets/dataops/minimise.svg" alt="download" className="w-8 h-8 mr-2" />
                        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                            <li><a className="dropdown-item " href="#">CSV</a></li>
                            <li><a className="dropdown-item" href="#">Excel</a></li>
                            <li><a className="dropdown-item" href="#">Json</a></li>
                        </ul>
                        {/* <Link to='/downloadlogs' style={{ marginRight: '1rem', color: '#448EE4', fontWeight: 'bold' }}><Label className='font-bold'>Download Logs</Label></Link>
                    <Link to='/DataOps-Hub/Dataops/View-All-Log' style={{ color: '#448EE4', fontWeight: 'bold' }}><Label  className='font-bold'>View All Logs</Label></Link> */}
                    </div>
                </Stack>
                {logData.map((log, index) => (
                    <LogItem
                        key={index}
                        date={log.date}
                        label={log.label}
                        description={log.description}
                        isEven={index % 2 === 0}
                    />
                ))}
            </Box>
        </Drawer>
    );
};

export default DataLogsDrawer;
