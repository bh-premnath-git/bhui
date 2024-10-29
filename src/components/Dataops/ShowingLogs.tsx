import * as React from 'react';
import { IconButton, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Stack } from '@mui/system';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Link } from 'react-router-dom';
import { Label } from '../ui/label';

export default function ShowingLogs() {

    return (
        <>
            <Stack direction={'row'} sx={{ display: 'flex', justifyContent: 'space-between', my: '1rem' }}>
                <Label className="text-md">Showing logs from <span style={{ fontWeight: 'bold' }}>last hour</span> ending at <span style={{ fontWeight: 'bold' }}>13:41</span></Label>
                <div>
                    <Link to='/downloadlogs' style={{ marginRight: '1rem', color: '#448EE4', fontWeight: 'bold' }}><Label className='font-bold'>Download Logs</Label></Link>
                    <Link to='/DataOps-Hub/Dataops/View-All-Log' style={{ color: '#448EE4', fontWeight: 'bold' }}><Label  className='font-bold'>View All Logs</Label></Link>
                </div>
            </Stack>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => (
                <Stack sx={{ backgroundColor: ((index % 2) != 0) ? '#e9e9e9' : 'transparent' }} className='rounded-sm'
                    direction={'row'} justifyContent={'space-between'}>
                    <Stack direction={'row'} spacing={2} alignContent={'center'} alignItems={'center'}>
                        <PlayArrowIcon />
                        <Label>2020-05-15 13:26:38.000</Label>
                        <Label>BST</Label>
                        <Label>Starting scan to move intermediate done files</Label>


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
