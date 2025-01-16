import { Dialog, DialogContent, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

interface CommonDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  imageUrl?: string;
  additionalContent?: string
}

const CommonDialog: React.FC<CommonDialogProps> = ({ open, onClose, title, description, imageUrl ,additionalContent}) => {
  return (
    <Dialog
      sx={{ margin: 'auto', width: 550,height: 600, textAlign: 'center' ,borderRadius:'7px'}}
      open={open}
      onClose={onClose}
      aria-labelledby="title"
      aria-describedby="description"
    >
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500]
        }}
      >
        <CloseIcon />
      </IconButton>
      <br />
      <DialogContent>
        {imageUrl && (
          <img
            height="150"
            width="150"
            style={{ margin: 'auto' }}
            src={imageUrl}
            alt="Success"
          />
        )}
        {title && (
          <Typography variant="h4" sx={{ fontSize: 18 }}>
            <b>{title}</b>
          </Typography>
        )}
        {description && (
          <Typography sx={{ marginLeft: 4, marginRight: 5, marginTop: 1, marginBottom: 2, fontSize: 14,fontWeight:'bold' }}>
            {description}
          </Typography>
        )}
         {additionalContent}
         
      </DialogContent>
    </Dialog>
  );
}

export default CommonDialog;
