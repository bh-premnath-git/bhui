import { Controller, useFormContext } from 'react-hook-form';
import { TextField, Button, Stack, Typography, Chip, Grid, Dialog, IconButton, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import * as React from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { useLocation } from 'react-router';
import ApiService from '../../../../../Services/ApiServices';
import CommonDialog from '../../../../../oldcomponents/common-dialoge';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

type Tag = {
    tagKey: string;
    tagValue: string;
};

const validationSchema = yup.object({
    tagKey: yup.string().required('Tag Key is required'),
    tagValue: yup.string().required('Tag Value is required'),
});

function TaggingStep(props: any) {
    const { onNext, data, onBack } = props;
    const [customerData, setCustomerData] = React.useState<any>(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const [tags, setTags] = React.useState<Tag[]>([]);
    const [open, setOpen] = React.useState(false);
    const [showDialog, setShowDialog] = React.useState(true);
    const location = useLocation();
    const userData = location.state;

    React.useEffect(() => {
        if (userData) {
            setTags(userData.tags.tagList);
        }
        if (data) {
            const fetchConnection = async () => {
                try {
                    const result = await ApiService('8011', 'get', `/customer/${data}`);
                    console.log(result);
                    setCustomerData(result);
                    if (result.tags) {
                        setTags(result.tags.tagList);
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            fetchConnection();
        }
    }, [data, userData]);

    const handleSubmit = (values: any, { setSubmitting }: any) => {
        console.log('Form values:', values);
        const newTag: Tag = { tagKey: values.tagKey, tagValue: values.tagValue };
        setTags([...tags, newTag]);
        setSubmitting(false);
        setIsOpen(false);
        console.log('Form tags:', tags);
    };

    const handleTagDelete = (i: number) => {
        const updatedTags = [...tags];
        updatedTags.splice(i, 1);
        setTags(updatedTags);
    };

    const navigate = useNavigate();

    const handleClickOpen = async () => {
        if (tags.length && customerData) {
            customerData.tags = { tagList: tags };
            try {
                const result = await ApiService('8011', 'put', `/customer/${props.data}`, customerData);
                console.log(result);
                if (result) {
                    setOpen(true);
                    const redirectTimer = setTimeout(() => {
                        navigate('/Admin Console/Manage Customer');
                    }, 5000);
                    return () => clearTimeout(redirectTimer);
                }
            } catch (error) {
                console.error('Error fetching Status', error);
            }
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <div className='text-start pt-4 mb-10'>
                <br></br>
                <h5 className='pt-10 mb-10' style={{ fontWeight: '600' }}>Add Tags</h5>
                <p style={{ fontSize: '16px', color: 'grey' }}>List of tags given below will be added automatically for all the delivery products configured for the customer.
                </p>
            </div>

            <div className='text-start pt-10 mb-10'>
                {tags.map((tag, index) => (
                    <Chip
                        key={index}
                        label={`${tag.tagKey} >> ${tag.tagValue}`}
                        variant="outlined"
                        style={{ fontSize: '12px', borderRadius: '5px', background: '#eeeeee', marginLeft: `${index === 0 ? '' : '16px'}` }}
                        onDelete={() => handleTagDelete(index)}
                    />
                ))}
            </div>

            <Dialog open={isOpen} onClose={() => setIsOpen(false)} PaperProps={{ sx: { borderRadius: '2px' } }}>
                <DialogTitle mx={2} px={5} className='text-start'>Add Tags</DialogTitle>
                <DialogContent sx={{ width: '350px' }}>
                    <Formik
                        initialValues={{ tagKey: '', tagValue: '' }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize={true}
                    >
                        {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                            <Form style={{ textAlign: 'center' }}>
                                <div>
                                    <div style={{ paddingTop: '8px', paddingBottom: '8px', textAlign: 'start', paddingLeft: '21px' }}>
                                        <label htmlFor="tagKey">Tag Key</label>
                                    </div>
                                    <Field type="text" id="tagKey" name="tagKey" as={TextField} />
                                    <div style={{ color: 'red', textAlign: 'start', paddingLeft: '21px' }}>
                                        <ErrorMessage name="tagKey" component="div" />
                                    </div>
                                </div>

                                <div>
                                    <div style={{ paddingTop: '8px', paddingBottom: '8px', textAlign: 'start', paddingLeft: '21px' }}>
                                        <label className='py-12 my-12' htmlFor="tagValue">Tag Value</label>
                                    </div>
                                    <Field type="text" id="tagValue" name="tagValue" as={TextField} />
                                    <div style={{ color: 'red', textAlign: 'start', paddingLeft: '21px' }}>
                                        <ErrorMessage name="tagValue" component="div" />
                                    </div>
                                </div>

                                <DialogActions sx={{ justifyContent: 'space-between', mx: 3, my: 2 }}>
                                    <Button onClick={() => setIsOpen(false)} variant="contained" size="large"
                                        className='bg-secondary'>
                                        Close
                                    </Button>
                                    <Button type='submit' variant="contained" className='bg-dark' size="large" sx={{ width: 80 }}>
                                        Ok
                                    </Button>
                                </DialogActions>
                            </Form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>

            <div className='text-start text-success'>
                <Button onClick={() => setIsOpen(true)}
                    className="group inline-flex items-center mt-2 -ml-4 py-2 px-4 rounded cursor-pointer">
                    <AddCircleIcon style={{ color: 'green' }} />
                    <span className={`ml-8 font-large group-hover:underline `} style={{ color: 'green', fontWeight: '600' }}>Add a Tag</span>
                </Button>
            </div>
            <br></br>
            <Stack direction={'row'} justifyContent={'space-between'} mt={5}>
                <Button className="bg-secondary text-white"
                    onClick={onBack}
                    variant="contained"
                    sx={{ textTransform: 'none' }}
                >
                    Back
                </Button>

                <Button className="bg-dark text-white"
                    variant="contained"
                    onClick={handleClickOpen}
                    sx={{ textTransform: 'none' }}
                    size="large">
                    {userData ? 'Update Customer' : 'Create Customer'}
                </Button>

                {showDialog && (
                    <CommonDialog
                        open={open}
                        onClose={handleClose}
                        title={userData ? "Customer updated successfully" : "Customer added successfully"}
                        description="You'll be automatically redirected to homepage shortly."
                        imageUrl="/assets/success.png"
                    />
                )}
            </Stack>
        </>
    );
}

export default TaggingStep;
