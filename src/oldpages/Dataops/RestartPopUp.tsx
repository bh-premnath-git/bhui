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
import ApiService from '../../Services/ApiServices';

interface RestartPopUpProps {
    open1: boolean;
    jobDetail: any;
    onClose1: () => void;
}

const RestartPopUp: React.FC<RestartPopUpProps> = ({ open1, onClose1, jobDetail }) => {
    console.log(jobDetail);
    const [reason, setReason] = useState('');
    const handleChange = (e) => {
        setReason(e.target.value);
    };
    const handleClose1 = () => {
        onClose1();
    };

    const [ToastComponent, showToast]: any = useToast();
    const handleClick = () => {
        saveEvent1();

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
    const saveEvent1 = async () => {
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
        console.log('Body:', body);
        try {
            const url = '/event_details';
            const result = await ApiService('8003', 'post', url, body);
            console.log('Response:', result);
            if (result) {
                showToast('Restart request has been submitted successfully', { vertical: 'top', horizontal: 'center' });
                setTimeout(() => {
                    handleClose1();
                }, 3000);
            }
            console.log(result)
        }
        catch (error) {
            console.error('Error fetching Status', error);
        }
    }
    const updateEvent1 = async (pipeline_status) => {
        console.log(jobDetail)
        const data = {
            'pipeline_status': pipeline_status,
            'batch_id': jobDetail?.batch_id,
            'pipeline_type': jobDetail?.pipeline_type,
            'zone_name': jobDetail?.zone_name,
            'tags': {},
            'trace_id': jobDetail?.trace_id,
            'job_statistics': {
                record_discarded: jobDetail?.job_statistics.record_discarded,
                record_failed: jobDetail?.job_statistics.record_failed,
                records_passed: jobDetail?.job_statistics.records_passed,
                records_read: jobDetail?.job_statistics.records_read
            },
            'job_start_time': currentDate,
            'job_end_time': currentDate,
            'updated_at': currentDate,
            'updated_by': jobDetail?.updated_by
        };
        console.log(data)
        try {
            const url = `/job_details/${jobDetail.job_id}`;
            const result = await ApiService('8003', 'put', url, data);
            console.log('Response:', result);
            if (!result) {
                throw new Error(`HTTP error! status: ${result.status}`);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    return (
        <Dialog open={open1} onClose={handleClose1} sx={{ borderRadius: 0 }}>
            <DialogTitle>Restart Job</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <Stack>
                        <Typography>
                            Are you sure you want to restart the job? if yes,
                        </Typography>
                        <Typography>
                            Please provide a reason below.
                        </Typography>
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
            </DialogContent>
            <DialogActions sx={{ margin: 'auto' }}>
                <Stack direction={'row'} spacing={2}>
                    <Button onClick={handleClose1} sx={{ border: '1px solid black' }}>Close</Button>
                    <Button sx={{
                        border: '1px solid black', backgroundColor: 'black', color: 'white',
                        '&:hover': {
                            backgroundColor: 'black',
                        },
                    }} onClick={(pipeline_status) => {
                        handleClick();
                        updateEvent1("Restart submit");

                    }}>Restart Job</Button>
                </Stack>
                <ToastComponent />
            </DialogActions>
        </Dialog>
    );
};

export default RestartPopUp;