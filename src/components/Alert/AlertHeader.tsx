import { Box, Typography, Stack, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { PieChart } from '@mui/x-charts/PieChart';
import { JSXElementConstructor, ReactElement, ReactNode, useEffect, useState } from 'react';
import {ApiService} from '@/services/apiServices';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(0.5), // Reduced padding
    textAlign: 'start',
}));

const size = {
    width: 180,  // Reduced width
    height: 150, // Reduced height
};

const pieChartData = {
    freshness: [
        { value: 50, label: 'Total 50', color: '#07a260' },
        { value: 5, label: 'Enabled 5', color: '#69be70' }
    ],
    health: [
        { value: 50, label: 'Total 30', color: '#f7a01f' },
        { value: 50, label: 'Enabled 20', color: '#f1c381' }
    ],
    volume: [
        { value: 10, label: 'Total 70', color: '#69caf2' },
        { value: 3, label: 'Enabled 10', color: '#0198d7' }
    ],
    security: [
        { value: 50, label: 'Total 40', color: '#05aaad' },
        { value: 20, label: 'Enabled 15', color: '#8cd8d9' }
    ],
    cost: [
        { value: 20, label: 'Total 60', color: '#8237e3' },
        { value: 5, label: 'Enabled 10', color: '#b88af3' }
    ],
    platform: [
        { value: 10, label: 'Total 45', color: '#c049c0' },
        { value: 10, label: 'Enabled 25', color: '#ed96ed' }
    ],
};
 
 

function AlertHeader() {
    const [isLoading, setIsLoading] = useState(false);
    const [templateCountList, setTemplateCountList] = useState([]);

    useEffect(() => {
        fetchJobDetails();
    }, []);

    const fetchJobDetails = async () => {
        const params = { "skip": 0, 'limit': 3 };
        try {
            setIsLoading(true);
            const result = await ApiService('8004', 'post', '/monitor_template_data/count', params);
            if (result && result.length > 0 && result[0]?.get_monitor_template_data) {
                setTemplateCountList(result[0]?.get_monitor_template_data);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const renderPieChartWithLabels = (title: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined, data: any[]) => (
        <Stack direction="row" alignItems="center" spacing={1}> {/* Reduced spacing */}
            <Stack sx={{ width: 100, height: 160 }}> {/* Adjusted height */}
                <Typography variant="h6" sx={{ mb: 0.2 }}> {/* Reduced margin below text */}
                    {title}
                </Typography>
                <PieChart
                    width={size.width}
                    height={size.height}
                    series={[{ data, innerRadius: 20 }]}
                    slotProps={{
                        legend: { hidden: true },
                    }}
                />
            </Stack>
            <Stack sx={{ ml: 1, mt: 1 }}> {/* Reduced margins */}
                {data.map((item, index) => (
                    <Stack direction="row" spacing={0.5} key={index} alignItems="center">
                        <Box
                            sx={{
                                width: 8, // Reduced dot size
                                height: 8,
                                backgroundColor: item.color,
                                borderRadius: '50%',
                            }}
                        />
                        <Typography variant="body2">{item.label}</Typography>
                    </Stack>
                ))}
            </Stack>
        </Stack>
    );

    return (
        <Box sx={{ width: '100%' }}>
            <Grid container xs={12} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                <Grid item xs={12}>
                    <Item sx={{ borderRadius: '1px' }} elevation={0} className='shadow-sm'>
                        <Stack direction={"row"} justifyContent={"space-between"} alignItems={'center'}>
                            <Typography  sx={{ fontSize: "30px" }}>
                                Alert Summary
                            </Typography>
                            <div style={{ position: 'absolute', top: 20, right: 100 }}>
                                <img src="/assets/designer/Bg design.png" alt="" width={'200px'} />
                            </div>
                        </Stack>
                        <Stack direction={'row'} spacing={4} mt={1} px={2}> {/* Reduced spacing and padding */}
                            {renderPieChartWithLabels('Freshness', pieChartData.freshness)}
                            <Divider orientation="vertical" flexItem />
                            {renderPieChartWithLabels('Health', pieChartData.health)}
                            <Divider orientation="vertical" flexItem />
                            {renderPieChartWithLabels('Volume', pieChartData.volume)}
                            <Divider orientation="vertical" flexItem />
                            {renderPieChartWithLabels('Security', pieChartData.security)}
                            <Divider orientation="vertical" flexItem />
                            {renderPieChartWithLabels('Cost', pieChartData.cost)}
                            <Divider orientation="vertical" flexItem />
                            {renderPieChartWithLabels('Platform', pieChartData.platform)}
                        </Stack>
                    </Item>
                </Grid>
            </Grid>
        </Box>
    );
}

export default AlertHeader;