import * as React from 'react';
import TextField from '@mui/material/TextField';
import { Controller, useFormContext, useForm } from 'react-hook-form';
import { Button, DialogActions, FormControl, FormControlLabel, FormLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, Dialog, DialogContent, DialogTitle, Stack, Chip } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useLocation } from 'react-router';
import ApiService from '../../../../../services/ApiServices';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import useToast from '../../../../../components/teast-service';

type Tag = {
    tagKey: string;
    tagValue: string;
};

const schema = Yup.object().shape({
    bh_project_name: Yup.string().required('Project Name is required'),
    bh_project_cld_id: Yup.string().required('Please Select Your Cloud Platform'),
    cloud_region_cd: Yup.string().required('Please Select Your Cloud Region'),
    cloud_provider_cd: Yup.number(),
    tags: Yup.object().shape({

    }),
});

const validationSchema = Yup.object({
    tagKey: Yup.string().required('Tag Key is required'),
    tagValue: Yup.string().required('Tag Value is required'),
});

function ProjectDetailsTab(props: any) {
    const [platfomRegionList, setPlatfomRegionList] = React.useState([]);
    const { onNext, data, onBack } = props;
    const [platFormList, setPlatformList] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [lakeData, setLakeData]: any = React.useState([]);
    const [ToastComponent, showToast] = useToast()

    const location = useLocation();
    const projectData = location.state;
    const [initialValue, setInitialValue] = React.useState({
        bh_project_name: '',
        bh_project_cld_id: '',
        cloud_region_cd: '',
        cloud_provider_cd: 0,
        tags: {

        },
    });
    const [tags, setTag] = React.useState<Tag[]>([]);


    React.useEffect(() => {
        console.log(projectData)
        console.log(data);

        // Define an async function inside the useEffect hook to fetch data
        const fetchData = async () => {
            try {
                const result = await ApiService('8011', 'get', '/codes_hdr/2');
                console.log(result.codes_dtl);
                for (let i = 0; i < result.codes_dtl.length; i++) {
                    if (result.codes_dtl[i].dtl_desc == "Amazon Web Services") {
                        result.codes_dtl[i].img = '../../assets/cloud/aws8.png';
                    } else if (result.codes_dtl[i].dtl_desc == "Google Cloud Platform") {
                        result.codes_dtl[i].img = '../../assets/cloud/gcp8.png';
                    } else {
                        result.codes_dtl[i].img = '../../assets/cloud/msa8.png';

                    }
                }

                setPlatformList(result.codes_dtl)
                console.log(platFormList);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        const fetchPlatformRegion = async () => {
            try {
                const result = await ApiService('8011', 'get', '/platform_region/search');
                console.log(result);
                setPlatfomRegionList(result);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
        fetchPlatformRegion();
        console.log(projectData)
        if (projectData) {
            setInitialValue(projectData)
            setTag(projectData?.tags?.tagList)
        }
        if (props.data.length > 0) {
            console.log(props.data)
            const fetchProjectDetail = async () => {

                try {
                    const result = await ApiService('8011', 'get', `/bh_project/${props.data}`);
                    console.log(result);
                    setLakeData(result)
                    if (result) {
                        setInitialValue({
                            bh_project_name: result?.bh_project_name, bh_project_cld_id: result?.bh_project_cld_id,
                            cloud_region_cd: result?.cloud_region_cd, cloud_provider_cd: result?.cloud_provider_cd, tags: result?.tags
                        })
                    }
                    // setAccessList(result.codes_dtl)
                    // console.log(accessList);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            fetchProjectDetail()
        }

        return () => {
        };
    }, []);



    const goToSave = async (data: any) => {
        try {
            if (projectData) {

                console.log(data)
                lakeData.bh_project_name = data.bh_project_name
                lakeData.bh_project_cld_id = data.bh_project_cld_id
                lakeData.cloud_region_cd = data.cloud_region_cd
                lakeData.cloud_provider_cd = data.cloud_provider_cd
                lakeData.tags = data.tags
                console.log(lakeData);
                const result = await ApiService('8011', 'put', `/bh_project/${projectData.bh_project_id}`, lakeData);
                if (result) {
                    onNext(result);

                }

            } else {
                console.log(data)
                const result = await ApiService('8011', 'post', '/bh_project', data);
                console.log('Response:', result);
                if (result) {
                    onNext(result);

                }
            }


        } catch (error) {
            showToast('Project is already exist', { color: 'red' })
            console.error('Error:', error);
        }
    }

    const [isOpen, setIsOpen] = React.useState(false);

    const openDialog = () => {
        setIsOpen(true);
    };

    const closeDialog = () => {
        setIsOpen(false);
    };



    const handleSubmit = (values: any, { setSubmitting }: any) => {
        console.log('Form values:', values);
        const newTag: Tag = { tagKey: values.tagKey, tagValue: values.tagValue };
        setTag([...tags, newTag]);
        setSubmitting(false);
        setIsOpen(false);

    };
    const handleTagDelete = (i: any) => {
        console.log(i)
        const updatedTags = tags.filter((_, index) => index !== i);

        setTag(updatedTags)
        // tags.splice(index,1);        
    };


    return (
        <div>
            <Formik
                initialValues={initialValue}
                validationSchema={schema}
                onSubmit={(values, { setSubmitting }) => {
                    console.log(values);
                    values.tags = { 'tagList': tags };
                    console.log(values);

                    goToSave(values);
                    // updateProjectDetails(values);
                    setSubmitting(false);
                }}
                enableReinitialize={true}
            >
                {({ isSubmitting, isValid, dirty }) => (
                    <Form>
                        <div className='col-4'>
                            <div style={{ marginBottom: '8px', fontSize: '14px', textAlign: 'start' }}>
                                <label htmlFor="bh_project_name">Project Name</label> <span style={{ color: 'red', paddingTop: '6px' }}>*</span>
                            </div>
                            <ToastComponent />
                            <Field className='shadow-sm' disabled={projectData ? true : false} name="bh_project_name" as={TextField} placeholder="Enter Project Name" variant="outlined" fullWidth />
                            <div style={{ color: 'red', marginTop: '8px', textAlign: 'start' }}>
                                <ErrorMessage name="bh_project_name" component="div" />
                            </div>
                        </div>

                        <div >
                            <div style={{ marginBottom: '8px', fontSize: '14px', textAlign: 'start' }}>
                                <label>Cloud Platform</label> <span style={{ color: 'red', paddingTop: '6px' }}>*</span>
                            </div>
                            <Field name="bh_project_cld_id" >
                                {({ field }: any) => (
                                    <RadioGroup {...field} row className="SwombSettings-group" >
                                        {
                                            platFormList.map((platform: any) => (
                                                <div key={platform.id} className=" py-2 px-3 mx-2 shadow-sm rounded" style={{ border: '1px solid #eef0f2' }} >
                                                    <img src={platform.img} alt='AWS' width={50} /><br></br>
                                                    <FormControlLabel value={platform.id} control={
                                                        <Radio
                                                            style={{ color: "green" }}
                                                            disabled={platform.dtl_desc === 'Google Cloud Platform' || platform.dtl_desc === 'Microsoft Azure'}
                                                        />
                                                    }
                                                         label={platform.dtl_desc} />
                                                </div>
                                            ))
                                        }
                                    </RadioGroup>
                                )}
                            </Field>
                            <div style={{ color: 'red', marginTop: '8px', textAlign: 'start' }}>
                                <ErrorMessage name="bh_project_cld_id" component="div" />
                            </div>
                        </div>


                        <div className='col-4 text-start' >
                            <div style={{ marginBottom: '8px', fontSize: '14px', textAlign: 'start' }}>
                                <label htmlFor="cloud_region_cd">Cloud Region</label> <span style={{ color: 'red', paddingTop: '6px' }}>*</span>
                            </div>
                            <Field name="cloud_region_cd" >
                                {({ field }: any) => (
                                    <FormControl variant="outlined" fullWidth>
                                        <Select disabled={projectData ? true : false}
                                            className='shadow-sm'
                                            labelId="cloud-region-label"
                                            placeholder='Select Cloud Region'
                                            id="cloud-region-select"
                                            {...field}
                                        >
                                            {platfomRegionList.map((region: any) => (
                                                <MenuItem key={region.id} value={region.id}>{region.region_identifier}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            </Field>
                            <div style={{ color: 'red', marginTop: '8px' }}>
                                <ErrorMessage name="cloud_region_cd" component="div" />
                            </div>
                        </div>

                        <div className='text-start pt-10 mb-10'>
                            <h6 className='text-start' >Add Tags</h6>
                            <p className='text-start'>Add one or more tags to easily identify compute instances created by BigHammer.ai in your AWS account (Eg : Key : Product, Value : BigHammer.ai)
                            </p>
                            {/* <p style={{ marginTop: '12px' }}>
                                {tags.map((tag, index) => (
                                    <Chip label={`${tag.key} >> ${tag.value}`} variant="outlined" style={{ fontSize: '12px', borderRadius: '5px', background: '#eeeeee', marginLeft: `${index == 0 ? '' : '16px'}` }} onDelete={() => handleDelete(index)} />
                                ))}
                            </p> */}
                        </div>
                        {/* <Grid container spacing={2} style={{ marginTop: '12px' }}>
                            <Grid item xs={6}>
                                <div style={{ marginBottom: '8px', fontSize: '14px', textAlign: 'start' }}>
                                    <label htmlFor="tags.tagKey" >Tag Key</label>
                                </div>
                                <Field name="tags.tagKey" as={TextField} placeholder="Enter Tag Key" variant="outlined" fullWidth />
                                <div style={{ color: 'red', marginTop: '8px' }}>
                                    <ErrorMessage name="tags.tagKey" component="div" />
                                </div>
                            </Grid>

                            <Grid item xs={6}>
                                <div style={{ marginBottom: '8px', fontSize: '14px', textAlign: 'start' }}>

                                    <label htmlFor="tags.tagValue">Tag Value </label>
                                </div>

                                <Field name="tags.tagValue" as={TextField} placeholder="Enter Tag Value" variant="outlined" fullWidth />

                                <div style={{ color: 'red', marginTop: '8px' }}>
                                    <ErrorMessage name="tags.tagValue" component="div" />
                                </div>
                            </Grid>
                        </Grid> */}
                        <div className='text-start pt-10 mb-10'>
                            <p style={{ marginTop: '12px' }}>
                                {tags?.map((tag: any, index) => (
                                    <Chip label={`${tag.tagKey} >> ${tag.tagValue}`} variant="outlined" style={{ fontSize: '12px', borderRadius: '5px', background: '#eeeeee', marginLeft: `${index == 0 ? '' : '16px'}` }}
                                        onDelete={() => handleTagDelete(index)} />
                                ))}
                            </p>
                        </div>
                        <Dialog open={isOpen} onClose={closeDialog} PaperProps={{ sx: { borderRadius: '2px' } }}>
                            <DialogTitle mx={2} px={5}>Add Tags</DialogTitle>
                            <DialogContent sx={{ width: '450px', }} >
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
                                                <Field fullWidth className="text-start shadow-sm" type="text" id="tagKey" name="tagKey" as={TextField} />
                                                <div style={{ color: 'red', textAlign: 'start', paddingLeft: '21px' }}>
                                                    <ErrorMessage name="tagKey" component="div" />
                                                </div>
                                            </div>

                                            <div className='my-3'>
                                                <div style={{ textAlign: 'start' }}>
                                                    <label className='py-12 my-12' htmlFor="tagValue">Tag Value</label>

                                                </div>
                                                <Field className="text-start shadow-sm" fullWidth type="text" id="tagValue" name="tagValue" as={TextField} />
                                                <div style={{ color: 'red', textAlign: 'start', paddingLeft: '21px' }}>
                                                    <ErrorMessage name="tagValue" component="div" />
                                                </div>
                                            </div>


                                            <DialogActions sx={{ justifyContent: 'space-between', mb: 2 }} >

                                                <Button onClick={closeDialog} variant="contained" className='bg-secondary'
                                                    size="large">Close</Button>
                                                <Button type='submit' variant="contained"
                                                    className='bg-dark text-white'
                                                    size="large" sx={{ width: 80 }} disabled={!values.tagKey || !values.tagValue}>Ok</Button>

                                            </DialogActions>
                                        </Form>
                                    )}
                                </Formik>
                            </DialogContent>
                        </Dialog>
                        {/* onClick={addTag} */}
                        <div className='text-start'>
                            <Button onClick={openDialog}
                                className="group mt-2  py-2  rounded cursor-pointer">
                                <AddCircleOutlineIcon className='text-success' />
                                <span className={` font-large text-secondary group-hover:underline `} style={{ color: 'green', fontWeight: '600' }}>Add a Tag</span>
                            </Button>
                        </div>


                        <div className='text-center m-20'>
                            <Button sx={{ textTransform: 'none' }}
                                className="ml-8 px-4 bg-dark "
                                variant="contained"
                                color='primary'
                                disabled={isSubmitting}
                                type="submit"
                            >
                                Next
                            </Button>


                        </div>

                    </Form>
                )}
            </Formik>



        </div>
    );
}

export default ProjectDetailsTab;

