// import React from 'react';
// import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

// interface PipelineConfigPopupProps {
//     open: boolean;
//     config: any;
//     onClose: () => void;
//     onConfirm: (config: any) => void;
// }

// export default function PipelineConfigPopup({ open, config, onClose, onConfirm }: PipelineConfigPopupProps) {
//     return (
//         <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
//             <DialogTitle>Pipeline Configuration</DialogTitle>
//             <DialogContent>
//                 <pre>
//                     {JSON.stringify(config, null, 2)}
//                 </pre>
//             </DialogContent>
//             <DialogActions>
//                 <Button onClick={onClose}>Cancel</Button>
//                 <Button onClick={() => onConfirm(config)} variant="contained" color="primary">
//                     Start Pipeline
//                 </Button>
//             </DialogActions>
//         </Dialog>
//     );
// } 