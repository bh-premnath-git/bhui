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
import ResultTable from './ResultTable';
import LogsPage from './LogsPage';
import { Input } from '../ui/input';

const PipelineDrawer = ({
    isExpanded,
    toggleDrawer,
    handleClick,
    drawerHeight,
    selectedTab,
    handleTabChange,
    isFullScreen,
}:any) => {
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
                    <Typography sx={{ color: 'black', fontSize: '15px' }} className="myHeadFont">
                        Pipeline Name: Test_Pipeline
                    </Typography>

                    <div className='flex items-center'>
                    <Input placeholder="Search logs" className="w-44 mr-3" />
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

                {!isFullScreen && (
                    <>
                        <Tabs
                            value={selectedTab}
                            onChange={handleTabChange}
                            sx={{
                                '& .MuiTabs-indicator': {
                                    backgroundColor: 'black',
                                    border: '1px solid black',
                                    borderLeftRadius: '8px',
                                },
                                '& .MuiTab-root': {
                                    color: 'black',
                                },
                                '& .MuiTab-root.Mui-selected': {
                                    color: 'black',
                                }
                            }}
                        >
                            <Tab label="Results" className="myHeadFont" sx={{ textTransform: 'none' }} />
                            <Tab label="Logs" className="myHeadFont" sx={{ textTransform: 'none' }} />
                        </Tabs>

                        <Divider sx={{ width: '12%', color: 'gray' }} />
                    </>
                )}

                <Box p={3} sx={{ maxHeight: '100px' }}>
                    {!isFullScreen && selectedTab === 0 && <ResultTable drawerHeight={drawerHeight} />}
                    {!isFullScreen && selectedTab === 1 && <LogsPage drawerHeight={drawerHeight} />}
                    
                    {isFullScreen && (
                        <Box sx={{ height: '100%' }}>
                            {selectedTab === 0 && (
                                <>
                                    <Stack direction="row" spacing={3} marginBottom={3}>
                                        <Stack direction="row" spacing={1}>
                                            <TbFilter size={20} />
                                            <Typography>Filter</Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={1}>
                                            <IoFilterSharp size={20} />
                                            <Typography>Sort</Typography>
                                        </Stack>
                                    </Stack>
                                    <ResultTable drawerHeight={drawerHeight} />
                                </>
                            )}
                            {selectedTab === 1 && (
                                <>
                                    <Typography sx={{ fontWeight: 'bold' }}>Showing All Logs</Typography>
                                    <LogsPage drawerHeight={drawerHeight} />
                                </>
                            )}
                        </Box>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
};

export default PipelineDrawer;
