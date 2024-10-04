import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { Button, FormControl, FormControlLabel, Grid, MenuItem, Radio, RadioGroup, Select, Chip, FormHelperText } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import ApiService from '../../../../../Services/ApiServices';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import useToast from '../../../../../oldcomponents/teast-service';
import TagDialog from '../../../../../common/TagDialog';
import CustomField from '../../../../../common/CustomField';
import { IoAddCircleOutline } from 'react-icons/io5';
import { CiFileOn } from 'react-icons/ci';
import { IoMdClose } from 'react-icons/io';
import axios from 'axios';

type Tag = {
    tagKey: string;
    tagValue: string;
};

const baseValidationSchema = Yup.object({
    bh_env_name: Yup.string().required('Environment Name is required'),
    bh_project_cld_id: Yup.string().required('Please Select Your Cloud Platform'),
    cloud_region_cd: Yup.string().required('Please Select Your Cloud Region'),
    cloud_provider_cd: Yup.number().required('Cloud Provider is required'),
    bh_env_provider: Yup.number().required('Environment is required'),
    aws_access_key_id: Yup.string().when('bh_project_cld_id', ([bh_project_cld_id], sch) => {
        return bh_project_cld_id == '101'
            ? sch.required()
            : sch.notRequired();
    }),
    aws_secret_access_key: Yup.string().when('bh_project_cld_id', ([bh_project_cld_id], sch) => {
        return bh_project_cld_id == '101'
            ? sch.required("aws secret access key is required")
            : sch.notRequired();
    }),
    gcp_project_id: Yup.string().when('bh_project_cld_id', ([bh_project_cld_id], sch) => {
        return bh_project_cld_id == '102'
            ? sch.required("GCP Project Id is required")
            : sch.notRequired();
    }),
    location: Yup.string().when('bh_project_cld_id', ([bh_project_cld_id], sch) => {
        return bh_project_cld_id == '102'
            ? sch.required("Location is required")
            : sch.notRequired();
    }),
    file: Yup.string().when('bh_project_cld_id', ([bh_project_cld_id], sch) => {
        return bh_project_cld_id == '102'
            ? sch.required("Private Key is required")
            : sch.notRequired();
    }),
});

function EnvDetailsTab(props: any) {
    const [platfomRegionList, setPlatfomRegionList] = useState([]);
    const [platFormList, setPlatformList] = useState([]);
    const [envList, setEnvList] = useState([]);
    const [lakeData, setLakeData] = useState<any>(null);
    const [ToastComponent, showToast] = useToast();
    const location = useLocation();
    const projectData = location.state;
    const [tags, setTags] = useState<Tag[]>([]);
    const [initialValue, setInitialValue] = useState({
        bh_env_name: '',
        bh_project_cld_id: '',
        cloud_region_cd: '',
        bh_env_provider: '',
        cloud_provider_cd: 0,
        aws_access_key_id: '',
        aws_secret_access_key: '',
        gcp_project_id: '',
        location: '',
        file: null,
        tags: { tagList: [] },
    });
    const [isOpen, setIsOpen] = useState(false);
    const fileInputRef: any = useRef(null);
    const [fileInfo, setFileInfo] = useState({ name: '', size: null });


    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await ApiService('8011', 'get', '/codes_hdr/4');
                setEnvList(result.codes_dtl);

                const platformResult = await ApiService('8011', 'get', '/codes_hdr/2');
                const platforms = platformResult.codes_dtl.map((platform: any) => ({
                    ...platform,
                    img: platform.dtl_desc === 'Amazon Web Services' ? '/assets/cloud/aws8.png'
                        : platform.dtl_desc === 'Google Cloud Platform' ? '/assets/cloud/gcp8.png'
                            : platform.dtl_desc === 'Microsoft Azure' ? '/assets/cloud/msa8.png'
                                : '/assets/cloud/bh.png'
                }));
                setPlatformList(platforms);

                const regionResult = await ApiService('8011', 'get', '/platform_region/search');
                setPlatfomRegionList(regionResult);

                if (projectData) {
                    setInitialValue(projectData);
                    setTags(projectData?.tags?.tagList || []);
                }

                if (props.data.length > 0) {
                    const projectResult = await ApiService('8011', 'get', `/bh_project/${props.data}`);
                    setLakeData(projectResult);
                    setInitialValue({
                        bh_env_name: projectResult?.bh_env_name,
                        bh_project_cld_id: projectResult?.bh_project_cld_id,
                        cloud_region_cd: projectResult?.cloud_region_cd,
                        cloud_provider_cd: projectResult?.cloud_provider_cd,
                        bh_env_provider: projectResult?.bh_env_provider,
                        aws_access_key_id: '',
                        aws_secret_access_key: '',
                        gcp_project_id: '',
                        location: '',
                        file: projectResult.file,
                        tags: projectResult?.tags || { tagList: [] }
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [props.data, projectData]);

    const handleCardClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event, setFieldValue) => {
        const file = event.target.files[0];
        if (file) {
            const sizeInKB: any = (file.size / 1024).toFixed(2); // Convert size to KB and format to 2 decimal places
            setFileInfo({ name: file.name, size: sizeInKB });
            console.log('Selected file:', file);
            setFieldValue('file', new Blob([file], { type: 'application/json' }), 'private-key.json');
            // Handle the file here
        }
    };
    function clearFile(values) {
        values.file = '';
        setFileInfo({ name: '', size: null });

    }

    const goToSave = async (data: any) => {
        const { aws_access_key_id, aws_secret_access_key, ...filteredData } = data;
        const finalData = {
            ...filteredData,
            tags: JSON.stringify({ tagList: tags }),
            status_cd: 1
        };
        console.log(finalData);
        try {
            const formData = new FormData();
            Object.keys(finalData).forEach((key) => {
                formData.append(key, finalData[key]);
            });
            const response = await fetch('http://localhost:8011/api/v1/bh_project/project_environment', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                },
            });
            const responseData = await response.json();
            console.log('Response data:', responseData);
            showToast('Project saved successfully', { color: 'green' });
            props.onNext();
        } catch (error) {
            showToast('Project already exists', { color: 'red' });
            console.error('Error:', error);
        }
    };


    const handleTagDelete = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    return (
        <div>
            <Formik
                initialValues={initialValue}
                validationSchema={baseValidationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    console.log(values)
                    // props.onNext(values);
                    goToSave(values);
                    // setSubmitting(false);
                }}
                enableReinitialize
            >
                {({ isSubmitting, setFieldValue, values }: any) => (
                    <Form>
                        <Grid container spacing={2} textAlign="start">
                            <Grid item xs={12} md={4}>
                                <CustomField
                                    name="bh_env_name"
                                    label="Environment Name"
                                    placeholder="Enter Environment Name"
                                    disabled={!!projectData}
                                />

                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl variant="outlined" fullWidth margin="normal">
                                    <label htmlFor='bh_env_provider'>Environment</label>
                                    <Field name="bh_env_provider" size='small'>
                                        {({ field }: any) => (
                                            <Select {...field} label="Environment" className='shadow-sm' size='small'>
                                                {envList.map((env: any) => (
                                                    <MenuItem key={env.id} value={env.id}>{env.dtl_desc}</MenuItem>
                                                ))}
                                            </Select>
                                        )}
                                    </Field>
                                    <ErrorMessage name="bh_env_provider">
                                        {msg => <FormHelperText error>{msg}</FormHelperText>}
                                    </ErrorMessage>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl variant="outlined" fullWidth margin="normal">
                                    <label htmlFor='cloud_region_cd'>Cloud Region</label>
                                    <Field name="cloud_region_cd" size='small'>
                                        {({ field }: any) => (
                                            <Select {...field} label="Cloud Region" className='shadow-sm' size='small'>
                                                {platfomRegionList.map((region: any) => (
                                                    <MenuItem key={region.id} value={region.id}>{region.region_identifier}</MenuItem>
                                                ))}
                                            </Select>
                                        )}
                                    </Field>
                                    <ErrorMessage name="cloud_region_cd">
                                        {msg => <FormHelperText error>{msg}</FormHelperText>}
                                    </ErrorMessage>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <div>
                            <div style={{ marginBottom: '8px', textAlign: 'start' }}>
                                <label>Cloud Platform</label> <span style={{ color: 'red', paddingTop: '6px' }}>*</span>
                            </div>
                            <Field name="bh_project_cld_id" >
                                {({ field }: any) => (
                                    <RadioGroup {...field} row className="SwombSettings-group">
                                        {
                                            platFormList.map((platform: any) => (
                                                <div key={platform.id} className="py-2 px-3 mx-2 shadow-sm rounded" style={{ border: '1px solid #eef0f2' }}>
                                                    <img src={platform.img} alt='Cloud Platform' width={50} /><br />
                                                    <FormControlLabel value={platform.id} control={<Radio style={{ color: "green" }} />} label={platform.dtl_desc} />
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

                        {values.bh_project_cld_id === '101' && (
                            <>
                                <div className='fw-bold text-start'>Access Key Validation</div>
                                <Grid container spacing={2} textAlign="start">
                                    <Grid item xs={12} md={4}>
                                        <CustomField
                                            name="aws_access_key_id"
                                            label="Access Key"
                                            placeholder="Enter Access Key"
                                            type="password"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <CustomField
                                            name="aws_secret_access_key"
                                            label="Secret Access Key"
                                            placeholder="Enter Secret Access Key"
                                            type="password"
                                        />
                                    </Grid>
                                </Grid>
                                <div className="text-info col-8 " style={{ textDecoration: 'underline' }}>validate</div>
                            </>
                        )}
                        {values.bh_project_cld_id === '102' && (
                            <>
                                <div className='fw-bold text-start'>credentials</div>
                                <Grid container spacing={2} textAlign="start">
                                    <Grid item xs={12} md={4}>
                                        <CustomField
                                            name="gcp_project_id"
                                            label="GCP Project ID"
                                            placeholder="Enter Project ID"
                                            type="text"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <CustomField
                                            name="location"
                                            label="Location"
                                            placeholder="Select Location"
                                            type="text"
                                        />
                                    </Grid>
                                </Grid>
                                <div className="text-info col-8 my-2">
                                    <div className="shadow-sm p-2 rounded m-auto text-center border border-light" onClick={handleCardClick}>
                                        <IoAddCircleOutline className="text-secondary w-100 h3 my-2" />
                                        <div className='text-dark'>
                                            Drag & Drop your file here or{' '}
                                            <span style={{ textDecoration: 'underline' }} className="text-info">
                                                Upload
                                            </span>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        accept=".json"
                                        onChange={() => handleFileChange(event, setFieldValue)}
                                    />
                                    {fileInfo.name && (
                                        <div className="shadow-sm p-1 rounded text-center border border-light mt-3 col-4">
                                            <div className="d-flex justify-content-between">
                                                <div className="d-flex p-2 ">
                                                    <CiFileOn className='h2 text-info fw-bold' />
                                                    <div className='text-start text-dark'>
                                                        <div>{fileInfo.name}</div>
                                                        <div className="text-secondary">{fileInfo.size} KB</div>
                                                    </div>

                                                </div>
                                                <div className='mx-2 my-2 fw-bold text-dark'>
                                                    <IoMdClose onClick={() => clearFile(values)} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                        <div className='text-start pt-10 mb-10'>
                            <h6 className='fw-bold'>Add Tags</h6>
                            <p>Add one or more tags to easily identify compute instances created by BigHammer.ai in your AWS account (e.g., Key: Product, Value: BigHammer.ai)</p>
                            <div>
                                {tags.map((tag: Tag, index: number) => (
                                    <Chip
                                        key={index}
                                        label={`${tag.tagKey} >> ${tag.tagValue}`}
                                        variant="outlined"
                                        style={{ fontSize: '12px', borderRadius: '5px', background: '#eeeeee', marginLeft: '16px' }}
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
                            <Button onClick={() => setIsOpen(true)}
                                sx={{ color: 'green', textTransform: 'none' }}
                                className="group mt-2 py-2 rounded cursor-pointer fw-bold">
                                <AddCircleOutlineIcon className='text-success' />
                                <span className='myHeadFont text-secondary' style={{ fontWeight: '600' }}>Add a Tag</span>
                            </Button>
                        </div>

                        <div className='text-center my-3'>
                            <Button
                                sx={{ textTransform: 'none' }}
                                className="ml-8 px-4 bg-dark text-white"
                                variant="contained"
                                // disabled={isSubmitting}
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

export default EnvDetailsTab;


export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file); // Read as data URL (base64 encoded)
    });
};
