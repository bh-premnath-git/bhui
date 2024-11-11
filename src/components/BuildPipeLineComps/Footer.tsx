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
import PipelineDrawer from './PipeLineDrawer';

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
             
                <PipelineDrawer
                    isExpanded={isExpanded}
                    toggleDrawer={toggleDrawer}
                    expandDrawer={expandDrawer}
                    drawerHeight={drawerHeight}
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                    isFullScreen={isFullScreen}/>
            </Stack>

        </footer>
    );
}
