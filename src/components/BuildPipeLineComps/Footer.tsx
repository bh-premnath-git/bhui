// Footer.tsx
import React, { useState } from 'react';
import { Box, Divider, IconButton, Stack, Button, Tooltip, Tabs, Tab, Typography, Drawer, TextField, InputAdornment } from '@mui/material';
import { PiAlignCenterHorizontalLight } from 'react-icons/pi';
import { CiZoomIn, CiZoomOut } from 'react-icons/ci';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { FaExpandAlt } from 'react-icons/fa';
import ResultTable from './ResultTable';
import LogsPage from './LogsPage';
import { Search } from '@mui/icons-material';
import { TbFilter } from "react-icons/tb";
import { IoFilterSharp } from "react-icons/io5";

export default function Footer({ com }: any) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [open, setOpen] = useState(false);
    const [drawerHeight, setDrawerHeight]: any = useState('60%');
    const [selectedTab, setSelectedTab] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);


    const toggleDrawer = (newState: boolean) => () => {
        setOpen(newState);
    };

    const expandDrawer = () => {
        setIsFullScreen(prevState => !prevState);
        setDrawerHeight((prevState:any) => (prevState === '60%' ? '99%' : '60%'));

    };
    const handleClick = () => {
        toggleDrawer(true)
        setIsExpanded(!isExpanded);
    };
    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setSelectedTab(newValue);
    };

    return (
        <footer
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '10px 0',
                zIndex: 10000,
            }}
        >
            <Divider sx={{ borderColor: 'black', marginBottom: '1%' }} />
            <Stack
                direction="row"
                spacing={3}
                sx={{
                    justifyContent: 'flex-end',
                    pr: 6,


                }}
            >
                <Stack>
                    {com}
                </Stack>
                <Tooltip title="Auto Align" placement="top">
                    <IconButton
                        sx={{
                            border: '1px solid gray',
                            borderRadius: '6px',
                            '&:hover': {
                                border: '1px solid gray',
                            },
                        }}
                    >
                        <PiAlignCenterHorizontalLight color={'black'} />
                    </IconButton>
                </Tooltip>
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Zoom In" placement="top">
                        <IconButton
                            sx={{
                                border: '1px solid gray',
                                borderRadius: '6px',
                                '&:hover': {
                                    border: '1px solid gray',
                                },
                            }}
                        >
                            <CiZoomIn color={'black'} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Zoom Out" placement="top">
                        <IconButton
                            sx={{
                                border: '1px solid gray',
                                borderRadius: '6px',
                                '&:hover': {
                                    border: '1px solid gray',
                                },
                            }}
                        >
                            <CiZoomOut color={'black'} />
                        </IconButton>
                    </Tooltip>
                </Stack>
                <Button
                    onClick={handleClick}
                    endIcon={isExpanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                    sx={{
                        textTransform: 'none',
                        border: '1px solid gray',
                        color: 'black',
                        '&:hover': {
                            backgroundColor: 'black',
                            color: 'white',
                            border: '1px solid gray',
                        },

                    }}
                >
                    Data Preview
                </Button>
                <Drawer
                    anchor="bottom"
                    open={isExpanded}
                    onClose={toggleDrawer(false)}
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
                        onClick={toggleDrawer(false)}
                        onKeyDown={toggleDrawer(false)}
                    >
                        <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                            <Typography sx={{ color: 'black', fontSize: '15px' }} className='myHeadFont'>
                                Pipeline Name : Test_Pipeline
                            </Typography>

                            <Stack direction={'row'} alignItems={'center'} spacing={2} >
                                {selectedTab === 1 && (
                                    <TextField
                                        className="my-1 bg-white-1000 border-gray-700"
                                        id="tab-2-search"
                                        size="small"
                                        placeholder="Search By Keywords"
                                        variant="outlined"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Search />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                )}

                                <button className="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                    Download
                                </button>
                                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                    <li><a className="dropdown-item" href="#">CSV</a></li>
                                    <li><a className="dropdown-item" href="#">Excel</a></li>
                                    <li><a className="dropdown-item" href="#">Json</a></li>
                                </ul>
                                <IconButton
                                    sx={{ backgroundColor: '#0B5ED7', borderRadius: '3px', '&:hover': { backgroundColor: '#0B5ED7' } }}
                                    onClick={expandDrawer}
                                >
                                    <FaExpandAlt color={'white'} />
                                </IconButton>
                            </Stack>
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
                                    <Tab label="Results" className='myHeadFont' sx={{ textTransform: 'none' }} />
                                    <Tab label="Logs" className='myHeadFont' sx={{ textTransform: 'none' }} />
                                </Tabs>

                                <Divider sx={{ width: '12%', color: 'gray' }} />
                            </>
                        )}
                        <Box p={3} sx={{ maxHeight: '100px' }}>
                            {!isFullScreen && selectedTab === 0 && <ResultTable drawerHeight={drawerHeight} />}
                            {!isFullScreen && selectedTab === 1 && <LogsPage drawerHeight={drawerHeight} />}
                            {isFullScreen && (
                                <Box sx={{ height: '100%' }}>
                                    {selectedTab === 0 &&
                                        <>
                                            <Stack direction={'row'} spacing={3} marginBottom={3}>
                                                <Stack direction={'row'} spacing={1}>
                                                    <TbFilter size={20} />
                                                    <Typography>Filter</Typography>
                                                </Stack>
                                                <Stack direction={'row'} spacing={1}>
                                                    <IoFilterSharp size={20} />
                                                    <Typography>Sort</Typography>
                                                </Stack>
                                            </Stack>
                                            <ResultTable drawerHeight={drawerHeight} />
                                        </>}
                                    {selectedTab === 1 &&
                                        <>
                                            <Typography sx={{ fontWeight: 'bold' }}>Showing All Logs</Typography>
                                            <LogsPage drawerHeight={drawerHeight} />
                                        </>}
                                </Box>
                            )}
                        </Box>
                    </Box>


                </Drawer>
            </Stack>

        </footer>
    );
}
