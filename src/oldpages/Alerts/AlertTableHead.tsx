import { Button, TextField, Typography, Stack, Dialog, DialogTitle, IconButton, DialogContent, DialogActions } from '@mui/material';
import { useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseIcon from '@mui/icons-material/Close';
import { Label } from '@/components/ui/label';

const validationSchema = Yup.object({
    project_name: Yup.string(),
    source_id: Yup.string(),
    start_date: Yup.date(),
    alert_status: Yup.string(),
});

function AlertTableHead({ filterOption, status, fetchJobDetails }: any) {
    const [showPopup, setShowPopup] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({});
    const projectList = filterOption?.projectData;
    const pipeLineList = filterOption?.pipeLineData;
    const navigate = useNavigate();

    const handleOpenPopup = () => {
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const handleSaveFilters = (values: any) => {
        const filteredValues = Object.fromEntries(Object.entries(values).filter(([key, value]) => value !== ''));
        setSelectedFilters(filteredValues);
        fetchJobDetails(filteredValues);
        handleClosePopup();
    };

    const monitorPageDetails = () => {
        navigate('/Alerts/New Monitor');
    };

    return (
        <>
            <Stack direction={'row'} spacing={2} justifyContent={'right'} my={3}>
                <Button sx={{ color: "black", bgcolor: "white", border: "1px solid gray" }} onClick={handleOpenPopup}>
                    <FilterAltIcon />
                </Button>
                <Button sx={{ bgcolor: 'black', color: 'white' }} onClick={monitorPageDetails}>
                    New Monitor
                </Button>
            </Stack>

            {/* Popup Dialog for Filters */}
            <Dialog open={showPopup} onClose={handleClosePopup} >
                <Stack direction={'row'} justifyContent={'space-between'} alignItems="center">
                    <Label className='mx-4 text-lg'>Filters</Label>

                    <IconButton onClick={handleClosePopup} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                </Stack>
                <DialogContent sx={{ overflow: 'visible' }}> {/* Prevent scroll */}
                    <Formik
                        initialValues={{
                            project_name: '',
                            source_id: '',
                            start_date: '',
                            alert_status: '',
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleSaveFilters}
                    >
                        {({ values, setFieldValue }) => (
                            <Form>
                                <Stack direction="column" spacing={2} >
                                    <Stack direction={'row'} spacing={2}>
                                        <Stack direction="column" spacing={1}>
                                            <Label>Project</Label>
                                            <Autocomplete size='small'
                                                options={projectList || []}
                                                getOptionLabel={(option: any) => option.project_name}
                                                onChange={(event, newValue) => setFieldValue('project_name', newValue ? newValue.project_name : '')}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        placeholder="Select Project"
                                                        sx={{ width: 250 }}
                                                    />
                                                )}
                                            />
                                        </Stack>
                                        <Stack direction="column" spacing={1}>
                                            <Label>Pipeline</Label>
                                            <Autocomplete size='small'
                                                options={pipeLineList || []}
                                                getOptionLabel={(option: any) => option.source_name}
                                                onChange={(event, newValue) => setFieldValue('source_id', newValue ? newValue.source_id : '')}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        placeholder="Select Pipeline"
                                                        sx={{ width: 250 }}
                                                    />
                                                )}
                                            />
                                        </Stack>
                                    </Stack>

                                    <Stack direction={'row'} spacing={2}>
                                        <Stack direction="column" spacing={1}>
                                            <Label>Tag</Label>
                                            <Autocomplete size='small'
                                                options={status || []}
                                                getOptionLabel={(option: any) => option.dtl_desc}
                                                onChange={(event, newValue) => setFieldValue('alert_monitor_tags', newValue ? newValue.id : '')}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        placeholder="Select Tag"
                                                        sx={{ width: 250 }}
                                                    />
                                                )}
                                            />
                                        </Stack>
                                        <Stack direction="column" spacing={1}>
                                            <Label>Start Time</Label>
                                            <DatePicker size='small' className='border'
                                                style={{ width: 250, height: 38 }}
                                                format="DD/MM/YYYY"
                                                getPopupContainer={(trigger) => trigger.parentElement || document.body} // Ensure it renders in the correct container
                                                onChange={(date, dateString) => {
                                                    setFieldValue('start_date', dateString);
                                                }}
                                            />
                                        </Stack>
                                    </Stack>

                                    <Stack direction="column" spacing={1}>
                                        <Label>Status</Label>
                                        <Autocomplete size='small'
                                            options={status || []}
                                            getOptionLabel={(option: any) => option.dtl_desc}
                                            onChange={(event, newValue) => setFieldValue('alert_status', newValue ? newValue.id : '')}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Select Status"
                                                    sx={{ width: 250, borderRadius: 2 }}
                                                />
                                            )}
                                        />
                                    </Stack>
                                </Stack>
                                <DialogActions sx={{ justifyContent: "center" }}>
                                    <Button onClick={handleClosePopup} sx={{ color: "black", width: "100px", bgcolor: "white", border: "1px solid gray" }}>Close</Button>
                                    <Button type="submit" sx={{ color: "white", width: "100px", bgcolor: "black" }}>Apply</Button>
                                </DialogActions>
                            </Form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>

        </>
    );
}

export default AlertTableHead;