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
import { IoClose, IoFilterSharp } from 'react-icons/io5';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { logData } from './DataOpsColumn';
import { LogItem } from './ShowingLogs';
import ExportPlayGround from './ExportPlayGround';

const ExploreDrawer = ({
    isExpanded,
    toggleDrawer,
    handleClick,
}: any) => {
    return (
        <Drawer
            anchor="right"
            open={isExpanded}
            onClose={() => toggleDrawer(false)}
            PaperProps={{
                style: {
                    height: '100vh',
                    width: '90%',
                    transition: 'height 0.3s ease',
                },
            }}
        >
            <Box sx={{ width: '100%', padding: 2, position: 'relative' }}>
                <div
                    onClick={handleClick}
                    className="fixed top-0 w-8 h-8 p-2 bg-white rounded-sm cursor-pointer"
                    style={{ left: '8.5%', opacity: 1 }}
                >
                    <IoClose />
                </div>
                <ExportPlayGround />
            </Box>
        </Drawer>
    );
};

export default ExploreDrawer;
