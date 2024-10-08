import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import CustomField from './CustomField';

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

// Validation schema for the form
const validationSchema = Yup.object({
    tagKey: Yup.string().required('Tag Key is required'),
    tagValue: Yup.string().required('Tag Value is required'),
});

const TagDialog: React.FC<TagDialogProps> = ({ isOpen, closeDialog, tags, setTags }) => {
    const initialValues = { tagKey: '', tagValue: '' };

    const handleSubmit = (values: Tag, { setSubmitting, resetForm }: any) => {
        setTags([...tags, values]);
        setSubmitting(false);
        resetForm();
        closeDialog();
    };

    return (
        <Dialog open={isOpen} onClose={closeDialog} PaperProps={{ sx: { borderRadius: '2px' } }}>
            <DialogTitle >Add Tags</DialogTitle>
            <DialogContent sx={{ width: '350px' }}>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, isValid }) => (
                        <Form>
                            <CustomField name='tagKey' label="Tag Key"/>
                            <CustomField name='tagValue' label="Tag Value"/>
                            <DialogActions sx={{ justifyContent: 'space-between', mt: 2 }}>
                                <Button onClick={closeDialog} variant="contained" sx={{ textTransform: 'none', backgroundColor: 'gray' }} >Close</Button>
                              
                                <button type="submit" disabled={isSubmitting || !isValid} className="bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-sm">
                                    Add
                                </button>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
};

export default TagDialog;
