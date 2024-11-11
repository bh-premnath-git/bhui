import * as React from 'react';
import { IconButton, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Stack } from '@mui/system';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import DataLogsDrawer from './DataLogsDrawer';
import { logData } from './DataOpsColumn';

export default function ShowingLogs({ selectedRowData }: any) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [drawerHeight, setDrawerHeight]: any = React.useState('95%');
    const [selectedTab, setSelectedTab] = React.useState(0);
    const [isFullScreen, setIsFullScreen] = React.useState(false);


    const toggleDrawer = (newState: boolean) => () => {
        setOpen(newState);
    };

    const expandDrawer = () => {
        setIsFullScreen((prevState: any) => !prevState);
        // setDrawerHeight((prevState:any) => (prevState === '60%' ? '99%' : '99%'));

    };
    const handleClick = () => {
        toggleDrawer(true)
        setIsExpanded(!isExpanded);
    };
    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setSelectedTab(newValue);
    };
   
    return (
        <>
            <Stack direction={'row'} sx={{ display: 'flex', justifyContent: 'space-between', my: '1rem' }}>
                <Label className="text-md">Showing logs from <span style={{ fontWeight: 'bold' }}>last hour</span> ending at <span style={{ fontWeight: 'bold' }}>13:41</span></Label>
                <div className='flex items-center'>
                    <Input placeholder="Search logs" className="w-44 mr-3" />
                    <img src="/assets/dataops/Download.svg" alt="download" className="w-8 h-8 mr-2" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false" />
                    <img onClick={handleClick} src="/assets/dataops/maximise.svg" alt="download" className="w-8 h-8 mr-2" />
                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                        <li><a className="dropdown-item " href="#">CSV</a></li>
                        <li><a className="dropdown-item" href="#">Excel</a></li>
                        <li><a className="dropdown-item" href="#">Json</a></li>
                    </ul>
                    {/* <Link to='/downloadlogs' style={{ marginRight: '1rem', color: '#448EE4', fontWeight: 'bold' }}><Label className='font-bold'>Download Logs</Label></Link>
                    <Link to='/DataOps-Hub/Dataops/View-All-Log' style={{ color: '#448EE4', fontWeight: 'bold' }}><Label  className='font-bold'>View All Logs</Label></Link> */}
                </div>
            </Stack>
            <>
            {logData.map((log, index) => (
                <LogItem 
                    key={index} 
                    date={log.date} 
                    label={log.label} 
                    description={log.description} 
                    isEven={index % 2 === 0} 
                />
            ))}
        </>
            <DataLogsDrawer
                selectedRowData={selectedRowData}
                isExpanded={isExpanded}
                toggleDrawer={toggleDrawer}
                expandDrawer={expandDrawer}
                drawerHeight={drawerHeight}
                selectedTab={selectedTab}
                handleTabChange={handleTabChange}
                handleClick={handleClick}
                isFullScreen={isFullScreen} />
        </>
    );
}

export const LogItem = ({ date, label, description, isEven }:any) => (
    <Stack 
        sx={{ backgroundColor: isEven ? 'transparent' : '#e9e9e9' }} 
        className='rounded-sm'
        direction='row' 
        justifyContent='space-between' 
    >
        <Stack direction='row' spacing={2} alignItems='center'>
            <PlayArrowIcon />
            <Label>{date}</Label>
            <Label>{label}</Label>
            <Label>{description}</Label>
        </Stack>
        <IconButton aria-label="more-options">
            <MoreVertIcon />
        </IconButton>
    </Stack>
);
// export default ShowingLogs;
