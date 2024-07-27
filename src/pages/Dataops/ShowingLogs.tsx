import * as React from 'react';
import { IconButton, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Stack } from '@mui/system';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Link } from 'react-router-dom';

export default function ShowingLogs() {

    return (
        <>
            <Stack direction={'row'} sx={{ display: 'flex', justifyContent: 'space-between', my: '1rem' }}>
                <div></div>
                <div>
                    <Link to='/downloadlogs' style={{ marginRight: '1rem', color: '#448EE4', fontWeight: 'bold' }}>Download Logs</Link>
                    <Link to='/DataOps-Hub/Dataops/View-All-Log' style={{ color: '#448EE4', fontWeight: 'bold' }}>View All Logs</Link>
                </div>
            </Stack>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => (
                <Stack sx={{ backgroundColor: ((index % 2) != 0) ? '#e9e9e9' : 'transparent', pt: 1 }} direction={'row'} justifyContent={'space-between'}>
                    <Stack direction={'row'} spacing={3}>
                        <PlayArrowIcon />
                        <Typography>2020-05-15 13:26:38.000</Typography>
                        <Typography>BST</Typography>
                        <Typography>Starting scan to move intermediate done files</Typography>


                    </Stack>
                    <Stack>
                        <IconButton aria-label="play1"><MoreVertIcon /></IconButton>

                    </Stack>
                </Stack>
            ))}

        </>
    );
}

// export default ShowingLogs;
