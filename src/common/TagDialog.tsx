import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Define the validation schema for the form
const validationSchema = Yup.object({
    tagKey: Yup.string().required('Tag Key is required'),
    tagValue: Yup.string().required('Tag Value is required')
});

interface Tag {
    tagKey: string;
    tagValue: string;
}

interface TagDialogProps {
    isOpen: boolean;
    closeDialog: () => void;
    tags: Tag[];
    setTags: (tags: Tag[]) => void;
}

const TagDialog: React.FC<TagDialogProps> = ({ isOpen, closeDialog, tags, setTags }) => {
    const handleSubmit = (values: any, { setSubmitting }: any) => {
        const newTag: Tag = { tagKey: values.tagKey, tagValue: values.tagValue };
        setTags([...tags, newTag]);
        setSubmitting(false);
        closeDialog();
    };

    return (
        <Dialog open={isOpen} onClose={closeDialog} PaperProps={{ sx: { borderRadius: '2px' } }}>
            <DialogTitle mx={2} px={5}>Add Tags</DialogTitle>
            <DialogContent sx={{ width: '450px' }}>
                <Formik
                    initialValues={{ tagKey: '', tagValue: '' }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                        <Form style={{ textAlign: 'start' }}>
                            <div>
                                <div style={{ textAlign: 'start' }}>
                                    <label htmlFor="tagKey">Tag Key</label>
                                </div>
                                <Field fullWidth className="text-start shadow-sm" size='small' type="text" id="tagKey" name="tagKey" as={TextField} />
                                <div style={{ color: 'red', textAlign: 'start', paddingLeft: '21px' }}>
                                    <ErrorMessage name="tagKey" component="div" />
                                </div>
                            </div>

                            <div className='my-3'>
                                <div style={{ textAlign: 'start' }}>
                                    <label className='py-12 my-12' htmlFor="tagValue">Tag Value</label>
                                </div>
                                <Field className="text-start shadow-sm" size='small' fullWidth type="text" id="tagValue" name="tagValue" as={TextField} />
                                <div style={{ color: 'red', textAlign: 'start', paddingLeft: '21px' }}>
                                    <ErrorMessage name="tagValue" component="div" />
                                </div>
                            </div>

                            <DialogActions sx={{ justifyContent: 'space-between', mb: 2 }}>
                                <Button onClick={closeDialog} variant="contained" className='bg-secondary myFont' sx={{textTransform:'none'}} >Close</Button>
                                <Button type='submit' variant="contained" className='bg-dark text-white myFont' sx={{ width: 80,textTransform:'none' }} disabled={!values.tagKey || !values.tagValue}>Ok</Button>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
};

export default TagDialog;
