import { Box, Card, IconButton, Paper,Stack, Typography } from '@mui/material';
import { useState } from 'react';
import Chart from 'react-apexcharts';

export default function PublishStatus() {
    const [state] = useState({
        chart: {
            width: '40%'
        },
        options: {
            labels: ['Published On Time : 80 Jobs', 'Published with Delay : 10 Jobs', ' Not Publish : 10 Jobs', 'Total Published Failed : 15'],
            colors: ['#00b060', '#c4f1df', '#d84413', '#e49a0b']
        },
        series: [45, 15, 15, 15]
    });
    return (
        <>
                <Stack sx={{ width: '100%',  borderRadius: '4px',mt:6,ml:3,border:'1px solid #f2f3f5' }}>
                    <Typography variant='h5' fontWeight={'bold'} mx={2} my={4}>Publish Status</Typography>
                    {/* className="flex flex-col flex-auto shadow rounded-2xl overflow-hidden menu-bg" */}
                    <div >
                        <div className="donut">
                            <Chart
                                options={state.options}
                                series={state.series}
                                type="donut"
                                width="450" />
                                <br></br>

                        </div>
                    </div>
                </Stack>
        </>

    );
}

