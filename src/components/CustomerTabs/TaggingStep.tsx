import { Controller, useFormContext } from 'react-hook-form';
import { TextField, Button, Stack, Typography, Chip, Grid, Dialog, IconButton, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import * as React from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { useLocation } from 'react-router';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {ApiService} from '@/services/apiServices';
import TagDialog from '@/common/TagDialog';
import CommonDialog from '@/oldcomponents/common-dialoge';
import { COLORS } from '@/Utils/constants';

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
            setTags(userData?.tags?.tagList);
        }
        if (data) {
            const fetchConnection = async () => {
                try {
                    const result = await ApiService('8011', 'get', `/customer/${data}`);
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
        const newTag: Tag = { tagKey: values.tagKey, tagValue: values.tagValue };
        setTags([...tags, newTag]);
        setSubmitting(false);
        setIsOpen(false);
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
                if (result) {
                    setOpen(true);
                    const redirectTimer = setTimeout(() => {
                        navigate('/AllCustomers');
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
            <div className="w-10/12 m-auto">
                <div className='text-start pt-4 '>
                    <br></br>
                    <h5 className='pt-2 mb-2' style={{ fontWeight: '600' }}>Add Tags</h5>
                    <div style={{ fontSize: '16px', color: 'grey' }}>
                        List of tags given below will be added automatically for all the delivery products configured for the customer.
                    </div>
                </div>

                <div className='text-start pt-10 mb-2'>
                    {tags?.map((tag, index) => (
                        <Chip
                            key={index}
                            label={`${tag.tagKey} >> ${tag.tagValue}`}
                            variant="outlined"
                            style={{ fontSize: '12px', borderRadius: '5px', background: '#eeeeee', marginLeft: `${index === 0 ? '' : '16px'}` }}
                            onDelete={() => handleTagDelete(index)}
                        />
                    ))}
                </div>
                <TagDialog
                    isOpen={isOpen}
                    closeDialog={() => setIsOpen(false)}
                    tags={tags}
                    setTags={setTags}
                />


                <div className='text-start text-success'>
                    <Button onClick={() => setIsOpen(true)}
                        className="">
                        <AddCircleIcon style={{ color: COLORS.green }} />
                        <span className={`ml-2 font-large group-hover:underline `} style={{ color: COLORS.green, fontWeight: '600' }}>Add a Tag</span>
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
                            imageUrl="/assets/success.svg"
                        />
                    )}
                </Stack>
            </div>
        </>
    );
}

export default TaggingStep;
