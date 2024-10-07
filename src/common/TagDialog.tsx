import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

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
                            <Field
                                fullWidth
                                size="small"
                                name="tagKey"
                                label="Tag Key"
                                as={TextField}
                                margin="dense"
                                helperText={<ErrorMessage name="tagKey" />}
                                error
                            />
                            <Field
                                fullWidth
                                size="small"
                                name="tagValue"
                                label="Tag Value"
                                as={TextField}
                                margin="dense"
                                helperText={<ErrorMessage name="tagValue" />}
                                error
                            />
                            <DialogActions sx={{ justifyContent: 'space-between', mt: 2 }}>
                                <Button onClick={closeDialog} variant="contained" sx={{ textTransform: 'none',backgroundColor:'gray' }} >Close</Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{ textTransform: 'none',backgroundColor:'black' }}
                                    disabled={isSubmitting || !isValid}
                                >
                                    Ok
                                </Button>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
};

export default TagDialog;
