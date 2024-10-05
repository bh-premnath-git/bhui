import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { Dayjs } from 'dayjs';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 565,
    bgcolor: 'background.paper',
    // border: '2px solid #000',
    height: 301,
    borderRadius: '5px',
    boxShadow: 24,
    p: 2,
};

function TimeSetPopUp({ handleCloseTime, openTime }) {
    const [timeOpen, setTimeOpen] = useState(false);
    const [activeButton, setActiveButton] = useState(null);
    const handleClick = (index) => {
        setActiveButton(index);

        if (index === 0) {
            setTimeOpen(false);
        } else if (index === 1) {
            setTimeOpen(true);
        } else {
            setTimeOpen(false);
        }
    };




    return (
        <div>
            <Modal
                open={openTime}
                onClose={handleCloseTime}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Button
                        onClick={handleCloseTime}
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
                    <Typography id="modal-modal-title" variant="h6" component="h2" className="fw-bold">
                        Schedule Interval
                    </Typography>
                    <div className="d-flex justify-content-between">
                        <Typography id="modal-modal-description">
                            {['Minutes', 'Hourly', 'Daily', 'Weekly', 'Monthly', 'Yearly'].map((label, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className={`btn ms-2 border ${activeButton === index ? 'bg-primary text-white' : 'btn-outline-primary text-black'}`}
                                    onClick={() => handleClick(index)}
                                    style={{
                                        color: activeButton === index ? 'white' : 'black',
                                        backgroundColor: activeButton === index ? '#007bff' : 'transparent',
                                        transition: 'color 0.2s ease-in-out',
                                    }}
                                    onMouseEnter={(e: any) => {
                                        e.target.style.color = 'blue'; // Change hover color here
                                    }}
                                    onMouseLeave={(e: any) => {
                                        e.target.style.color = activeButton === index ? 'white' : 'black'; // Revert back on leave
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </Typography>

                    </div>
                    <div className="mt-2">
                        <div className="d-flex justify-content-start align-items-center">
                            <div className="me-5">
                                <p className="mb-1">Repeat every</p>
                                <div className="d-flex align-items-center">
                                    <input
                                        type="number"
                                        className="border"
                                        style={{ width: '89px', height: '45px' }}
                                    />
                                    <p className="mb-0 ms-2">Minutes</p>
                                </div>
                            </div>
                            {timeOpen && (
                                <div>
                                    <p className="mb-0">Time</p>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={['TimePicker', 'TimePicker']}>
                                            <TimePicker
                                                sx={{ width: '125px' }}
                                                label=""
                                                defaultValue={dayjs('2022-04-17T15:30')}
                                            />
                                        </DemoContainer>
                                    </LocalizationProvider>
                                </div>
                            )}
                        </div>

                        <div className="d-flex justify-content-center mt-4">
                            <Button
                                variant="outlined"
                                className="me-4 border border-black text-dark"
                                style={{ width: '207px', textTransform: 'none' }}
                            >
                                Close
                            </Button>
                            <Button
                                variant="contained"
                                className="bg-dark"
                                style={{ width: '207px', textTransform: 'none' }}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </Box>
            </Modal>
        </div>
    );
}

export default TimeSetPopUp;