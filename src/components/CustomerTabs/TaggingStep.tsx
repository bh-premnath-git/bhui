import { Button, Stack, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import * as React from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useLocation } from 'react-router';
import {ApiService} from '@/services/apiServices';
import TagDialog from '@/common/TagDialog';
import { COLORS } from '@/Utils/constants';
import useToast from '@/oldcomponents/teast-service';

type Tag = {
    tagKey: string;
    tagValue: string;
};

function TaggingStep(props: any) {
    const { onNext, data, onBack } = props;
    const [customerData, setCustomerData] = React.useState<any>(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const [tags, setTags] = React.useState<Tag[]>([]);
    const [open, setOpen] = React.useState(false);
    // const [showDialog, setShowDialog] = React.useState(true);
    const location = useLocation();
    const userData = location.state;
    const [ToastComponent, showToast] = useToast();

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
                    if (userData){
                        showToast('Customer Updated successfully', { color: '#4caf50' });
                    } else{
                        showToast('Customer created successfully', { color: '#4caf50' });
                    }
                    const toastTimer = setTimeout(() => {
                        showToast('');
                    }, 1000);
                    const redirectTimer = setTimeout(() => {
                        navigate('/admin-console/customers');
                    }, 1000);
                    return () => {clearTimeout(toastTimer); clearTimeout(redirectTimer);};
                }
            } catch (error) {
                showToast('Failed to create user. Please try again.', { color: '#f44336' });
                console.error('Error fetching Status', error);
            }
        }
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
                </Stack>
                <ToastComponent />
            </div>
        </>
    );
}

export default TaggingStep;