import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Checkbox from '@mui/material/Checkbox';
import { MdAccessTime } from 'react-icons/md';
import TimeSetPopUp from '../../oldpages/BuildPipeline/components/TimeSet';
import { Formik, Form, Field } from 'formik';
import { TextField } from '@mui/material';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 960,
    bgcolor: 'background.paper',
    cursor: 'pointer',
    boxShadow: 24,
    p: 4,
};



function SchedulePipeline({ handleClose, open }) {
    const [time, setTime] = React.useState(false);
    const handleTimeToggle = () => {
        setTime(false);
    };

    return (
        <div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box height={701} sx={style}>
                    <Button
                        onClick={handleClose}
                        style={{
                            position: 'absolute',
                            top: '0px',
                            right: '16px',
                            minWidth: 'auto',
                            padding: 0,
                            borderRadius: '50%',
                            color: 'black'
                        }}
                    >
                        <span aria-label="Close" style={{ fontSize: '30px' }}>×</span>
                    </Button>
                    <Typography id="modal-modal-title" variant="h6" component="h2" className='fw-bold mff'>
                        Schedule Pipeline
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }} className='mff'>
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum text of the printing and
                    </Typography>

                    {/* Formik Form Implementation */}
                    <Formik
                        initialValues={{
                            name: '',
                            scheduler: '',
                            scheduleInterval: '',
                            cluster: '',
                            alertsEmail: '',
                            onStart: true,
                            onSuccess: true,
                            onFailure: true
                        }}
                        onSubmit={(values, { setSubmitting }) => {
                            console.log('Form Data:', values);
                            setSubmitting(false);
                            // Logic to handle form submission
                        }}
                    >
                        {({ values, handleChange, isSubmitting }) => (
                            <Form>
                                <div className='d-flex justify-content-between' style={{ paddingTop: '30px', paddingBottom: '20px' }}>
                                    <div>
                                        <div className='my-1'>Name <span className='text-danger'>*</span></div>
                                        <Field
                                            type="text" as={TextField}
                                            size='small'
                                            name="name"
                                            style={{ height: '45px', width: '410px' }}
                                            className="form-control"
                                            placeholder="Enter Name"
                                        />
                                    </div>
                                    <div>
                                        <div className='my-1'>Scheduler <span className='text-danger'>*</span></div>
                                        <Field
                                            as="select"
                                            name="scheduler"
                                            className="form-select"
                                            style={{ height: '45px', width: '410px' }}
                                        >
                                            <option value="" label="Select Scheduler" />
                                            <option value="1" label="One" />
                                            <option value="2" label="Two" />
                                            <option value="3" label="Three" />
                                        </Field>
                                    </div>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <div>
                                        <div className='my-1'>Schedule Interval<span className='text-danger'>*</span>
                                        </div>
                                        <Field
                                            as="select"
                                            name="scheduleInterval"
                                            className="form-select"
                                            style={{ height: '45px', width: '410px' }}
                                        >
                                            <option value="" label="Select Interval" />
                                            <option value="1" label="One" />
                                            <option value="2" label="Two" />
                                            <option value="3" label="Three" />
                                        </Field>
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <div className='my-1'>Cluster <span className='text-danger'>*</span></div>
                                        <div style={{ position: 'relative', width: '410px' }}>
                                            <Field
                                                type="text"
                                                name="cluster"
                                                style={{ height: '45px', width: '100%' }} // Full width within the parent container
                                                className="form-control"
                                                placeholder="Enter Cluster"
                                            />
                                            <MdAccessTime
                                                style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    right: '10px', // Adjust as necessary
                                                    transform: 'translateY(-50%)',
                                                    fontSize: '24px',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => setTime(true)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className='d-flex justify-content-between mt-4'>
                                    <div>
                                        <div className='my-1'>Alerts Email <span className='text-danger'>*</span></div>
                                        <Field as={TextField}
                                            size='small'
                                            type="email"
                                            name="alertsEmail"
                                            style={{ height: '45px', width: '410px' }}
                                            className="form-control"
                                            placeholder="John@Bighammer.Ai"
                                        />
                                    </div>
                                </div>
                                <div style={{ marginTop: '40px' }}>
                                    <h6 className='fw-bold mff'>When Should We Send Alerts?</h6>
                                    <div>
                                        <Field
                                            type="checkbox"
                                            name="onStart"
                                            as={Checkbox}
                                            color="success"
                                            checked={values.onStart}
                                        />
                                        <span>On Start</span>
                                        <Field
                                            type="checkbox"
                                            name="onSuccess"
                                            as={Checkbox}
                                            checked
                                            disabled
                                        />
                                        <span>On Success</span>
                                        <Field
                                            type="checkbox"
                                            name="onFailure"
                                            as={Checkbox}
                                            checked
                                            disabled
                                        />
                                        <span>On Failure</span>
                                    </div>
                                </div>
                                <div className='d-flex justify-content-center' style={{ marginTop: '50px' }}>
                                    <Button
                                        variant="outlined"
                                        className='me-4 border border-black text-dark'
                                        style={{ width: '207px', textTransform: 'none' }}
                                        onClick={handleClose}
                                        disabled={isSubmitting}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        variant="contained"
                                        className='bg-dark'
                                        style={{ width: '207px', textTransform: 'none' }}
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        Create Now
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Box>
            </Modal>
            {time && <TimeSetPopUp handleCloseTime={handleTimeToggle} openTime={time} />}
        </div>
    );
}

export default SchedulePipeline;
