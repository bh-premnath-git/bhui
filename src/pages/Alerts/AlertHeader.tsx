import { Controller, useFormContext } from 'react-hook-form';
import { Box, Typography, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import ApiService from '../../services/ApiServices';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'start',
    // color: theme.palette.text.secondary,
}));



function AlertHeader() {
    const [isLoading, setIsLoading] = useState(false);
    const [templateCountList, setTemplateCountList]:any = useState();
    useEffect(() => {
        fetchJobDetails()
    }, [])

    const fetchJobDetails = async () => {
        var params = { "skip": 0, 'limit': 3 }
        try {
            setIsLoading(true)
            const result = await ApiService('8004', 'post', '/monitor_template_data/count', params);
            console.log(result);
            if (result&&result.length>0&&result[0]?.get_monitor_template_data) {
                setTemplateCountList(result[0]?.get_monitor_template_data)
            }
            setIsLoading(false)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <>
            <Box sx={{ width: '100%' }} >
                <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} >
                    <Grid item xs={4} >
                        <Item sx={{ px: 3, borderRadius: '1px' }}>
                            <Typography fontSize={26} fontFamily={'Inter'} >
                                Alert Summary
                            </Typography>
                            <Stack direction={'row'} spacing={2} justifyContent={'space-evenly'} my={4}>
                                {templateCountList?.map((item: any,index:number) => (
                                    <Stack key={index} style={{marginRight:"2px solid grey"}}>
                                        <Typography className='myHeadFont' fontSize={22} fontFamily={'Inter'}>{item?.type?? 'Freshness'}</Typography>
                                        <Typography variant='h4' fontWeight={'bold'} fontFamily={'Inter'}>{item?.count?? '0'}</Typography>
                                    </Stack>
                                ))}

                            </Stack>
                        </Item>
                    </Grid>
                    <Grid item xs={8}>
                        <Item sx={{ borderRadius: '1px' }}>
                            <Typography fontSize={26} px={3} fontFamily={'Inter'}>
                                Total Monitors Enabled
                            </Typography>
                            <Stack direction={'row'} spacing={3} my={2} px={3}>
                                <Stack>
                                    <Box fontFamily={'Inter'} sx={{ bgcolor: '#f2f2f2', color: '#505050', textAlign: 'center', py: 1, px: 1, borderRadius: '5px' }}>
                                        <span className='myHeadFont' style={{ fontSize: '17px' }}>Freshness : </span> <span className='h5 fw-bold'>50</span>
                                    </Box>
                                </Stack>
                                <Stack fontFamily={'Inter'}>
                                    <Box sx={{ bgcolor: '#f2f2f2', color: '#505050', textAlign: 'center', py: 1, px: 1, borderRadius: '5px' }}>
                                        <span className='myHeadFont' style={{ fontSize: '17px', fontFamily: 'inter' }}>Field Health : </span> <span className='h5 fw-bold'>20</span>
                                    </Box>
                                </Stack>
                                <Stack>
                                    <Box sx={{ bgcolor: '#f2f2f2', color: '#505050', textAlign: 'center', py: 1, px: 1, borderRadius: '5px' }}>
                                        <span className='myHeadFont' style={{ fontSize: '17px' }}>Volume : </span> <span className='h5 fw-bold'>10</span>
                                    </Box>
                                </Stack>
                                <Stack>
                                    <Box sx={{ bgcolor: '#f2f2f2', color: '#505050', textAlign: 'center', py: 1, px: 1, borderRadius: '5px' }}>
                                        <span className='myHeadFont' style={{ fontSize: '17px' }}>Security And Compliance : </span> <span className='h5 fw-bold'>50</span>
                                    </Box>
                                </Stack>

                            </Stack>
                            <Stack direction={'row'} spacing={3} px={3} mb={4}>
                                <Stack>
                                    <Box sx={{ bgcolor: '#f2f2f2', color: '#505050', textAlign: 'center', py: 1, px: 1, borderRadius: '5px' }}>
                                        <span className='myHeadFont' style={{ fontSize: '17px' }}>Cost Monitor : </span> <span className='h5 fw-bold'>20</span>
                                    </Box>
                                </Stack>
                                <Stack>
                                    <Box sx={{ bgcolor: '#f2f2f2', color: '#505050', textAlign: 'center', py: 1, px: 1, borderRadius: '5px' }}>
                                        <span className='myHeadFont' style={{ fontSize: '17px' }}>Platform Health : </span> <span className='h5 fw-bold'>10</span>
                                    </Box>
                                </Stack>
                            </Stack>
                        </Item>
                    </Grid>

                </Grid>
            </Box>
        </>
    );
}

export default AlertHeader;