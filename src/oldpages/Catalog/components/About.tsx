import {
    Stack, LinearProgress, Typography, IconButton, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions, Button, Box, TextField, Chip, Divider, Link
} from '@mui/material';
import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { formatDate } from '@/Utils/dateFormatter';
import TagDialog from '@/common/TagDialog';

const validationSchema = Yup.object({
    tagKey: Yup.string().required('Tag Key is required'),
    tagValue: Yup.string().required('Tag Value is required'),
});
const validationSchemaLink = Yup.object({
    url: Yup.string().required('URL is required'),
    label: Yup.string().required('Label is required'),
});

export default function About(props: any) {
    const { layoutList } = useSelector((state: RootState) => state.catalogApi);

    const [open, setOpen] = useState(false);
    const [openAddLink, setOpenAddLink] = useState(false);
    const [closeAddLink, setCloseAddLink] = useState()
    const data = props.data;
    const [tags, setTag]: any = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [tagKey, setTagKey] = useState('');
    const [tagValue, setTagValue] = useState('');

    const openDialog = () => {
        setIsOpen(true);
    };
    const closeDialog = () => {
        setIsOpen(false);
    };
    const openLinkDialog = () => {
        setOpenAddLink(true)
    };
    const closeLinkDialog = () => {
        setOpenAddLink(false)
    }
    const handleTagDelete = (i: any) => {
        console.log(i)
        const updatedTags = tags.filter((_: any, index: any) => index !== i);

        setTag(updatedTags)
        // tags.splice(index,1);		
    };

    const handleSubmit = (values: any, { setSubmitting }: { setSubmitting: (isSubmitting: any) => void }) => {
        console.log('Form values:', values);
        tags.push(values);
        setSubmitting(false);
        setIsOpen(false);
    };
    const linkSubmit = (values: any, { setSubmitting }: { setSubmitting: (isSubmitting: any) => void }) => {
        console.log('Form values:', values);
        tags.push(values)
        setSubmitting(false);
        setOpenAddLink(false);

    };


    const addTag = () => {
        if (tagKey.trim().length > 0 && tagValue.trim().length > 0) {
            tags.push({
                "key": tagKey, "value": tagValue
            });
            setTagKey('');
            setTagValue('');
        }
    };
    return (
        <Stack sx={{ p: '16px' }}>
            <Typography variant='body2' sx={{ p: '4px', fontSize: '10px' }}>Last Updated On: <span className="font-bold"> {formatDate(layoutList[0].updated_at)}</span></Typography>
            <Divider />
            <Stack className='mt-12'>
                <Typography variant='body2' fontWeight={'600'} fontSize={'17px'}>About</Typography>
                <Typography variant='body1' fontSize={'13px'} color={'#5e5e5e'}>Loream Ipusum is simply Dummy Test of The <br></br>Printing and Typecasting Industry.Loream Ipusm <br></br> Text Typecasting Industry.</Typography>
                <Stack direction={"row"} justifyContent={'space-between'}>
                    <Stack sx={{ fontSize: '14px' }}>
                        <Button onClick={openLinkDialog}>
                            <Typography variant='subtitle2' fontWeight={"bold"} sx={{ color: '#00b060', }} onClick={addTag}>
                                <AddCircleIcon sx={{ color: '#00b060' }} /> ADD LINK
                            </Typography>
                        </Button>
                    </Stack>
                    <Stack style={{ color: '#008cda' }} sx={{ mt: '8px' }}>
                        <Link style={{ color: '#008cda' }}> Edit</Link>
                    </Stack>
                </Stack>
            </Stack>
            <Divider />

            <Stack mt={2} sx={{ fontSize: '14px' }}>
                <Typography variant='body2' fontWeight={'600'} fontSize={'17px'}>Owners</Typography>

                <Stack>
                    <Typography variant='subtitle2' fontWeight={"bold"} sx={{ color: '#00b060', }} onClick={addTag}>
                        <AddCircleIcon sx={{ color: '#00b060', mr: '4px' }} />  ADD OWNERS
                    </Typography>
                </Stack>
            </Stack>
            <br></br>
            <Divider />

            <Stack mt={2}>
                <Stack>
                    <Typography variant='body2' fontWeight={'600'} fontSize={'17px'}>Tags</Typography>
                </Stack>
                {/* <Stack direction={"row"} spacing={1} sx={{ mt: 2 }}>
                                <Stack>
                                    <AddCircleIcon sx={{ color: '#00b060' }} />
                                </Stack>
                                <Stack>
                                    <Typography variant='subtitle2' fontWeight={"bold"} sx={{ color: '#00b060', }} onClick={addTag}>
                                        ADD TAGS
                                    </Typography>
                                </Stack>
                            </Stack> */}
                <div className='text-left  mb-10'>
                    <p style={{ marginTop: '2px' }}>
                        {tags.map((tag: any, index: any) => (
                            <Chip label={`${tag.tagKey} >> ${tag.tagValue}`} variant="outlined" style={{ fontSize: '12px', borderRadius: '5px', background: '#eeeeee', marginLeft: `${index == 0 ? '' : '16px'}` }}
                                onDelete={() => handleTagDelete(index)} />
                        ))}
                    </p>
                </div>
                <TagDialog
                                isOpen={isOpen}
                                closeDialog={() => setIsOpen(false)}
                                tags={tags}
                                setTags={setTag}
                            />
               
                <Dialog open={openAddLink} onClose={closeLinkDialog} PaperProps={{ sx: { borderRadius: '2px' } }}>
                    <DialogTitle px={2}>Add Link</DialogTitle>
                    <DialogContent sx={{ width: '420px', height: '300px' }} >
                        <Formik
                            initialValues={{ url: '', label: '' }}
                            validationSchema={validationSchemaLink}
                            onSubmit={linkSubmit}
                        >
                            {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                                <Form style={{ textAlign: 'center' }}>
                                    <div>
                                        <div style={{ paddingTop: '8px', paddingBottom: '8px', textAlign: 'start', paddingLeft: '3px', fontSize: '14px' }}>
                                            <label htmlFor="url">URL<span style={{ color: 'red' }}>*</span></label>
                                        </div>
                                        <Field type="text" id="url" name="url" placeholder="Enter URL" as={TextField} sx={{ width: '100%' }} />
                                        <div style={{ color: 'red', textAlign: 'start', paddingLeft: '21px' }}>
                                            <ErrorMessage name="url" component="div" />
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ paddingTop: '8px', paddingBottom: '8px', textAlign: 'start', paddingLeft: '3px', fontSize: '14px' }}>
                                            <label className='py-12 my-12' htmlFor="label">Label<span style={{ color: 'red' }}>*</span></label>

                                        </div>
                                        <Field type="text" id="label" name="label" placeholder="Enter a label for this link" as={TextField} sx={{ width: '100%' }} />
                                        <div style={{ color: 'red', textAlign: 'start', paddingLeft: '21px' }}>
                                            <ErrorMessage name="label" component="div" />
                                        </div>
                                    </div>


                                    <DialogActions sx={{ mt: 4, justifyContent: 'center', }} >

                                        <Button onClick={closeLinkDialog} variant="outlined"
                                            size="large" sx={{ width: 100, bgcolor: 'white', borderColor: 'black' }}  >Close</Button>
                                        <Button type='submit' variant="contained"
                                            color="secondary"
                                            size="large" sx={{ width: 100 }}>Add</Button>
                                        {/* disabled={!values.tagKey || !values.tagValue} */}
                                    </DialogActions>
                                </Form>
                            )}
                        </Formik>
                    </DialogContent>
                </Dialog>
                {/* onClick={addTag} */}
                <div className='text-left'>
                    <Stack onClick={openDialog} sx={{ fontSize: '14px' }}>
                        <Typography variant='subtitle2' fontWeight={"bold"} sx={{ color: '#00b060', }} onClick={addTag}>
                            <AddCircleIcon sx={{ color: '#00b060', mr: '4px' }} />  ADD TAGS
                        </Typography>
                    </Stack>
                    {/* <Button onClick={openDialog}
                        className="group inline-flex items-center  -ml-4 py-1 px-1 rounded cursor-pointer">
                        <SwombSvgIcon style={{ color: '#00b060' }} size={20}>heroicons-solid:plus-circle</SwombSvgIcon>

                        <span className={`ml-8  text-secondary  `} style={{ color: '#00b060', fontWeight: 'Bold', fontSize: '16px' }}>ADD TAGS</span>
                    </Button> */}
                </div>
            </Stack>
        </Stack>
    );
}