import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Box, LinearProgress, Typography, Stack } from '@mui/material';
import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { Divider } from '@mui/material';

interface PlayPopUp {
    isOpen: boolean;
    onClose: () => void;
}

interface ProgressBarProps {
  percentage: number;
  width: string;
  height: string;
  color: string;
  
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, width, color }) => {
  return (
    <Box sx={{ width }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height:10,
              backgroundColor: '#e0e0e0',
              borderRadius:'3px',
              '& .MuiLinearProgress-bar': {
                backgroundColor: color,
              },
            }}
          />
        </Box>
        <Box minWidth={35}>
          <Typography variant="body2" color="textSecondary">{`${Math.round(percentage)}%`}</Typography>
        </Box>
      </Stack>
    </Box>
  );
};
const PlayPopUp: React.FC<PlayPopUp> = ({ isOpen, onClose }) => {
  
    return (
        <Dialog open={isOpen} onClose={onClose}
            sx={{
                '& .MuiDialog-paper': {
                    minWidth: '25%',
                    height: '33%',
                },
            }}>
            <DialogTitle>Detailed Progress</DialogTitle>
            <IconButton onClick={onClose} sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'black',
            }}>
                <Close />
            </IconButton>
            <DialogContent>
            <Stack spacing={1} sx={{ width: '100%'}}>
             <Typography sx={{fontWeight:"bold"}}>Overall Progress</Typography>
            
        <ProgressBar
          width="100%"
          height="10px"
          color='green'
          percentage={84}
          />
          <Divider style={{backgroundColor:'gray'}}/>
          <Typography sx={{fontWeight:'bold'}}>Total Jobs: 2</Typography>
          <Typography>Job 1</Typography>
          <ProgressBar
           width="100%"
           height="10px"
           color='green'
           percentage={71}
           />
             <Typography>Job 2</Typography>
          <ProgressBar
           width="100%"
           height="10px"
           color='orange'
           percentage={13}
           />

      
        </Stack>
            </DialogContent>

        </Dialog>
    );
};

export default PlayPopUp;
