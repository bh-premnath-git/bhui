import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Typography } from '@mui/material';
import { Stack } from '@mui/material';
import { Box } from '@mui/system';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import useToast from '../../oldcomponents/teast-service';
import {ApiService} from '@/services/apiServices';
import { Label } from '@/components/ui/label';

interface StopPopUpProps {
    open: boolean;
    jobDetail: any;
    onClose: () => void;
}

const StopPopUp: React.FC<StopPopUpProps> = ({ open, onClose, jobDetail }) => {
    const [reason, setReason] = useState('');
    const handleChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setReason(event.target.value);
    };
    const handleClose2 = () => {
        onClose();
    };

    const [ToastComponent, showToast]: any = useToast();
    const handleClick = () => {
        saveEvent2();
    };
    useEffect(() => {
        if (jobDetail && !jobDetail.job_statistics) {
            jobDetail.job_statistics = {
                record_discarded: 0,
                record_failed: 0,
                records_passed: 0,
                records_read: 0,
            };
        }
    }, [jobDetail]);
    const currentDate = new Date().toISOString();
    const saveEvent2 = async () => {
        var body = {
            "event_triggered_by": jobDetail?.created_by,
            "user_comments": reason,
            "event_status": 'Success',
            "event_metadata": {},
            "event_type": 'Restart',
            "pipeline_id": jobDetail?.pipeline_id,
            "job_id": jobDetail?.job_id,
            "task_id": jobDetail?.job_id,
            "trace_id": jobDetail?.trace_id,
            "event_start_time": currentDate,
            "event_end_time": currentDate,
            "created_at": currentDate,
            "created_by": jobDetail?.created_by,
            "updated_at": currentDate,
            "updated_by": jobDetail?.updated_by
        }
        try {
            const url = '/event_details';
            const result = await ApiService('8003', 'post', url, body);
            if (result) {
                showToast('Job has been stopped successfully', { vertical: 'top', horizontal: 'center' });
                setTimeout(() => {
                    handleClose2();
                }, 3000);
            }
        }
        catch (error) {
            console.error('Error fetching Status', error);
        }
    }
    const updateEvent2 = async (pipeline_status: string) => {
        const data = {
            'pipeline_status': pipeline_status,
            'batch_id': jobDetail?.batch_id,
            'pipeline_type': jobDetail?.pipeline_type,
            'zone_name': jobDetail?.zone_name,
            'tags': {},
            'trace_id': jobDetail?.trace_id,
            'job_statistics': {
                record_discarded: jobDetail?.job_statistics.records_discarded,
                record_failed: jobDetail?.job_statistics.records_failed,
                records_passed: jobDetail?.job_statistics.records_passed,
                records_read: jobDetail?.job_statistics.records_read
            },
            'job_start_time': currentDate,
            'job_end_time': currentDate,
            'updated_at': currentDate,
            'updated_by': jobDetail?.updated_by
        };
        try {
            const url = `/job_details/${jobDetail?.job_id}`;
            const result = await ApiService('8003', 'put', url, data);
            if (!result) {
                throw new Error(`HTTP error! status: ${result.status}`);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    return (
        <Dialog open={open} onClose={handleClose2} sx={{ borderRadius: 4 }}>
            <Label className='mx-4 my-2 text-md font-bold'>Stop Job</Label>
                <DialogContentText className='p-2 m-3'>
                    <Stack>
                        <Label>Are you sure you want to stop the job? if yes, Please provide a reason below.</Label>
                        
                        <Box
                            sx={{
                                py: 2,
                                display: 'grid',
                                gap: 2,
                                alignItems: 'center',
                                flexWrap: 'wrap',
                            }}
                        >
                            <TextareaAutosize
                                aria-label="empty textarea"
                                placeholder="Type your Reason Here"
                                style={{ width: '100%', border: '1px solid lightgrey' }}
                                minRows={5}
                                onChange={handleChange}
                            />
                        </Box>
                    </Stack>
                </DialogContentText>
            <DialogActions sx={{ margin: 'auto' }}>
                <Stack direction={'row'} spacing={2}>
                    <Button onClick={handleClose2} sx={{ border: '1px solid black',color:'black' }}>Close</Button>
                    <Button sx={{
                        border: '1px solid black', backgroundColor: 'black', color: 'white',
                        '&:hover': {
                            backgroundColor: 'black',
                        },
                    }} onClick={() => {
                        handleClick();
                        updateEvent2("Stop submit");

                    }}>Stop Job</Button>
                </Stack>
                <ToastComponent />
            </DialogActions>
        </Dialog>
    );
};

export default StopPopUp;