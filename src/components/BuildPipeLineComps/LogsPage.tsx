import * as React from 'react';
import { IconButton, TextField, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Stack } from '@mui/system';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Link } from 'react-router-dom';

export default function LogsPage({ drawerHeight }:any) {

    return (
        <>
            <Stack direction="column" sx={{ my: '1rem' }}>
                {/* Top section with TextField */}
                <Stack direction="row" justifyContent="space-between">
                    <div>
                        {/* Additional content if needed */}
                    </div>
                  
                </Stack>

                {/* Map section */}
                <Stack>
                    {[1, 2, 3, 4, 5, 6, 7, 8,9,10,11,2,12]
                        .slice(0, drawerHeight == '60%' ? 7 : 15)
                        .map((item, index) => (
                            <Stack
                                key={index}
                                sx={{ backgroundColor: index % 2 !== 0 ? '#e9e9e9' : 'transparent', pt: 1 }}
                                direction="row"
                                justifyContent="space-between"
                            >
                                <Stack direction="row" spacing={3}>
                                    <PlayArrowIcon />
                                    <Typography>2020-05-15 13:26:38.000</Typography>
                                    <Typography>BST</Typography>
                                    <Typography>Starting scan to move intermediate done files</Typography>
                                </Stack>
                            </Stack>
                        ))}
                </Stack>
            </Stack>

        </>
    );
}

// export default ShowingLogs;
