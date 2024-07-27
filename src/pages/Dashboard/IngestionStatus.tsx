import { Stack, Typography } from '@mui/material';
import { useState } from 'react';
import Chart from 'react-apexcharts';

function IngestionStatus() {
    const [state] = useState({
        chart: {
            width: '80%'
        },
        options: {
            labels: ['Completed On Time : 80 Jobs', 'Completed with Delay : 10 Jobs', 'Did Not Arrive : 10 Jobs', 'Total Ingestion Failed : 20'],
            colors: ['#00b060', '#c4f1df', '#d84413', '#e49a0b']
        },
        series: [45, 15, 15, 15]
    });
    return (
        <>
            <div>

                <Stack sx={{ width: '100%',borderRadius:'4px' ,ml:3,border:'1px solid #f2f3f5' }}>
                    <Typography variant='h5' fontWeight={'bold'} mx={2} my={4}>Ingestion Status</Typography>
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
            </div>
        </>

    );
}

export default IngestionStatus;