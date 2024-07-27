import React, { useEffect } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';


const DialoguePopUp1 = ({ open, handleClose }) => {
    
   

    return (
        <React.Fragment>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"

                PaperProps={{
                    sx: {
                        borderRadius: '8%', // Set border radius here
                    },
                }}
            >
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <img src="/src/assets/Successful.png" alt="Description of the image" style={{ width: "20%", height: '20%', margin: 'auto', marginTop: '18%' }} />
                <Typography sx={{ margin: 'auto', fontWeight: 'bold', mt: '5%', fontSize: '30px' }}>
                  Project Created Successfully
                </Typography>
               
                <Typography sx={{ margin: "auto", marginBottom: '20%', mt: '5%' }}>You'll be automatically redirected to homepage shortly</Typography>
            </Dialog>
        </React.Fragment>
    );
};

export default DialoguePopUp1;
