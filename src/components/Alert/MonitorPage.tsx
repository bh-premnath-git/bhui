import { useFormContext } from 'react-hook-form';
import { Box, Button, Typography, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { useNavigate, Link } from 'react-router-dom';
import {ApiService} from '@/services/apiServices';
import { MONITOR_PORT } from '@/configration/environment';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'start',
    // color: theme.palette.text.secondary,
}));



function MonitorPage() {
    const methods = useFormContext();
    const [show, setShow] = useState(false);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [jobDetailList, setjobDetailList] = useState([]);

    useEffect(() => {
        fetchJobDetails();
    }, []);

    const fetchJobDetails = async () => {
        try {
            setIsLoading(true)
            const result = await ApiService(MONITOR_PORT, 'get', '/monitor_template_data/');
            setjobDetailList(result)
            setIsLoading(false)

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const colors = [
        { bgcolor: '#d0f4e8', color: '#00c286' },
        { bgcolor: '#fff4dc', color: '#dd8f00' },
        { bgcolor: '#d2f1f9', color: '#3ac4e7' },
        { bgcolor: '#fdfee0', color: '#928f32' },
        { bgcolor: '#f6defe', color: '#ad00e2' },
    ];

    return (
        <>
            <Stack >
                <Typography variant='h6' fontWeight={'bold'} className='mmf'
                fontFamily={'inter'} mx={5} my={2}>Please Select a KPI to monitor</Typography>
                <Box sx={{ width: '100%' }}>
                    <Grid container rowSpacing={5} columnSpacing={{ xs: 2, sm: 3, md: 3 }} >
                        {jobDetailList.map((job: any, index: number) => (
                            <Grid key={index} item xs={3.5} ml={5} style={{boxShadow:'none'}} >
                                <Item  style={{boxShadow:'none'}} className='rounded shadow-sm' sx={{ px: 3, borderRadius: '1px', border: 1, borderColor: '#f2f2f8' }}>
                                    <Box sx={{
                                        // bgcolor: colors[index]?.bgcolor || '#ffdefe',
                                        color: colors[index % 5]?.color || '#e82cc8',
                                        fontFamily: 'inter', borderRadius: '5px', my: 1,
                                        textAlign: 'start'
                                    }}>
                                        <span className='p-2 myFont'
                                            style={{
                                                borderRadius:'3px',
                                                fontSize: '15px', fontFamily: 'inter',
                                                backgroundColor: colors[index]?.bgcolor || '#ffdefe'
                                            }}>
                                            {job?.monitor_template_name}</span>
                                    </Box>
                                    <Typography my={2} className='mmf'>
                                        {job?.monitor_description}
                                    </Typography>
                                    <Stack alignItems={'center'}>
                                        <Button variant="contained" className='myFont' sx={{
                                            bgcolor: 'black', color: 'white', width: 110,
                                            textTransform: 'none',
                                            '&:hover': {
                                                bgcolor: 'black',
                                            }, my: 1
                                        }} component={Link}
                                            to="/Alerts/New Monitor/Monitor">
                                            Configure
                                        </Button>
                                    </Stack>
                                </Item>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Stack >
        </>
    );
}

export default MonitorPage;