import { Typography, Stack } from '@mui/material';
import { useState } from 'react';
import Chart from 'react-apexcharts';
import DescriptionIcon from '@mui/icons-material/Description';
import { Link, useNavigate } from 'react-router-dom';

function DataPlatformSummery() {
    const navigate = useNavigate();

    const [state] = useState({
        chart: {
            width: '100%'
        },
        options: {
            labels: ['Total Active', 'Total Inactive'],
            colors: ['#00b060', '#c4f1df']
        },
        series: [70, 30]
    });
    const handleButtonClick = () => {
        // Navigate to a different route
        navigate('/catalog');
      };
    return (
        <>
            <div>


                <Stack sx={{ width: '100%', mt: '10px',borderRadius:'4px', border:'1px solid #f2f3f5',height:'75vh'}} >
                    <Typography variant='h5' fontWeight={'bold'} my={2} ml={2}>
                        Data Platform Summary
                    </Typography>

                    <Stack sx={{ width: '30%',ml:2,borderRadius:'4px',border:'1px solid #f2f3f5',height:'10vh',mt:4}}>
                        <Stack direction={'row'} spacing={2} onClick={handleButtonClick}>
                            <Stack>
                                <DescriptionIcon sx={{ mt: 3 ,ml:2}}  fontSize='large'/>
                            </Stack>
                            <Stack>
                                <Typography variant='h6'>Data Sets</Typography>
                                <Link to={''} ><Typography variant='h4'>2</Typography></Link>
                            </Stack>
                        </Stack>
                    </Stack>
                    {/* className="flex flex-col flex-auto shadow rounded-2xl overflow-hidden menu-bg" */}
                    <Stack direction={'row'} spacing={2} ml={6} my={10}>
                        <Stack >
                            <div >
                                {/* className="flex items-center justify-between px-8 pt-12"  className="px-16 text-lg font-medium tracking-tight leading-6 truncate"
                                    color="text.secondary" */}
                                <Typography ml={5} variant='subtitle1' fontWeight={'bold'}> 
                                Status
                                </Typography>

                            </div>
                            <div >
                                {/* className="text-center mt-8" */}
                                <div className="donut">
                                    <Chart
                                        options={state.options}
                                        series={state.series}
                                        type="donut"
                                        width="400" />
                                </div>
                            </div>
                        </Stack>
                        <Stack>
                            <div >
                                <Typography ml={3} variant='subtitle1' fontWeight={'bold'}>
                                    PII Status
                                </Typography>

                            </div>
                            <div>
                                <div className="donut">
                                    <Chart
                                        options={state.options}
                                        series={state.series}
                                        type="donut"
                                        width="400" />
                                </div>
                            </div>
                        </Stack>
                    </Stack>
                </Stack>
            </div>
        </>

    );
}

export default DataPlatformSummery;