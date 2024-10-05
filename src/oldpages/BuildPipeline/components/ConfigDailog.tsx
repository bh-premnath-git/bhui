import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { IoAddCircleOutline } from "react-icons/io5";
import { RiDeleteBin6Line } from 'react-icons/ri';
import { Formik, Form, FieldArray, Field } from 'formik';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 780,
    maxHeight: '500px',
    overflowY: 'auto',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const inputContainerStyle = {
    display: 'flex' as 'flex',
    alignItems: 'center' as 'center',
    gap: '8px',
};

const inputStyle = {
    height: '45px',
    width: '320px',
};

const iconStyle = {
    fontSize: '24px',
    cursor: 'pointer' as 'pointer',
    marginTop: '12px',
};

function ConfigDialog({ handleCloseConfig, openConfig }) {
    return (
        <Modal
            open={openConfig}
            onClose={handleCloseConfig}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Button
                    onClick={handleCloseConfig}
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
                    <span aria-label="Close" style={{ fontSize: '25px' }}>×</span>
                </Button>
                <Typography id="modal-modal-title" variant="body1" className='fw-bold mff'>
                    Config
                </Typography>
                <Formik
                    initialValues={{
                        config: [{ key: '', value: '' }]
                    }}
                    onSubmit={(values, { setSubmitting }) => {
                        // Submit logic here
                        console.log(values);
                        setSubmitting(false);
                    }}
                >
                    {({ values, handleSubmit, isSubmitting }) => (
                        <Form>
                            <FieldArray
                                name="config"
                                render={(arrayHelpers) => (
                                    <div>
                                        {values.config.map((config, index) => (
                                            <div className='my-1' key={index} style={inputContainerStyle}>
                                                <div>
                                                    key
                                                    <Field
                                                        type="text"
                                                        name={`config.${index}.key`}
                                                        style={inputStyle}
                                                        className="form-control"
                                                        placeholder="Enter Key"
                                                    />
                                                </div>
                                                <div>
                                                    Value
                                                    <Field
                                                        type="text"
                                                        name={`config.${index}.value`}
                                                        style={inputStyle}
                                                        className="form-control"
                                                        placeholder="Enter Value"
                                                    />
                                                </div>
                                                <IoAddCircleOutline
                                                    style={iconStyle}
                                                    className='text-success fs-4 '
                                                    onClick={() => arrayHelpers.push({ key: '', value: '' })}
                                                />
                                                <RiDeleteBin6Line
                                                    style={iconStyle}
                                                    className='text-danger fs-4'
                                                    onClick={() => arrayHelpers.remove(index)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            />
                            <div className='d-flex justify-content-center' style={{ marginTop: '30px' }}>
                                <Button
                                    variant="outlined"
                                    className='me-4 border border-black text-dark'
                                    style={{ width: '207px', textTransform: 'none' }}
                                    onClick={handleCloseConfig}
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
                                    Save
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Box>
        </Modal>
    );
}

export default ConfigDialog;
