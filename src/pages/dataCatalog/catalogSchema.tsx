import Button from '@mui/material/Button';
import { Grid, IconButton, Stack } from '@mui/material/';
import Typography from '@mui/material/Typography';
import { ChangeEvent, useState } from 'react';
import { InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from 'lodash';
import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Input } from '@/components/ui/input';
import CatalogsBody from '@/pages/dataCatalog/catalogsBody';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { getDataSourceLayout } from '@/redux/CatalogSlice';
// import CatalogsBody from './CatalogsBody';
// import Lineage from './Lineage/Lineage';
// import Properties from './properties/Properties';
// import ValidationDtl from './validation/validationbody';
// import DocumentEditor from './DocumentEditor';


interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

export function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box >
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

export function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}


function CatalogSchema() {
    const { layoutList }: any = useSelector((state: RootState) => state.catalogApi);
    
    const [value, setValue] = React.useState(0);
    const [searchValue, setSearchValue] = useState('');
    const debouncedSearchLayout = debounce((value) => {
        // props.fetchDatasourceRegion(value);
    }, 1000);

    const searchDataSource = (event: any) => {
        const { value } = event.target;
        setSearchValue(value);
        debouncedSearchLayout(value);
    };
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };


    return (
        <Box className="container" sx={{ width: '100%' }}>
            <Stack direction={'row'} spacing={2} justifyContent={'space-between'}>
                <Stack>
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" centered
                        TabIndicatorProps={{
                            style: {
                                textTransform: 'none',
                                backgroundColor: '#000', // Customize the background color of the indicator
                                height: 5,
                                width: '30px', // Set the width of the indicator based on the number of tabs
                                marginLeft: 'calc((100% / 1.5) / 2)',
                                borderRadius: '10px 10px 0px 0px' // Center the indicator within each tab
                            },
                        }}
                        TabScrollButtonProps={{
                            style: {
                                display: 'none' // Hide scroll buttons if not needed
                            }
                        }}
                        sx={{
                            '& .MuiTabs-flexContainer': {
                                justifyContent: 'center', // Center tabs horizontally
                            },
                            '& .MuiTab-root': {
                                display: 'flex', // Make each tab a flex container
                                justifyContent: 'center', // Center tab content horizontally
                            }
                        }}
                    >
                        <Tab sx={{
                            textTransform: 'none', color: 'black', '&.Mui-selected': { // Add this to target the selected tab
                                color: 'black',
                                fontWeight: 'bold'
                            },
                        }} label="Schema" {...a11yProps(0)} />
                        {/* <Tab label="Lineage" {...a11yProps(1)} />
                        <Tab label="Properties" {...a11yProps(2)} />
                        <Tab label="Queries" {...a11yProps(3)} />
                        <Tab label="Stats" {...a11yProps(4)} />
                        <Tab label="Validation" {...a11yProps(5)} />
                        <Tab label="Documentation" {...a11yProps(6)} /> */}

                    </Tabs>
                </Stack>
                <Stack>
                    <Stack direction={'row'} spacing={2}>
                        <Stack>
                            <Input id="retries" value={searchValue}
                                onChange={searchDataSource} placeholder="Search By Keywords" type="text" min="0" />

                        </Stack>
                        <Stack>
                            <button className="bg-gray-900 hover:bg-gray-950 text-md text-white  py-1 px-2 rounded-sm">
                                Request Access
                            </button>

                        </Stack>
                    </Stack>
                </Stack>

            </Stack>




            <CustomTabPanel value={value} index={0}>
                {/* welcome */}
                <CatalogsBody search={searchValue} />
            </CustomTabPanel>
            {/* <CustomTabPanel value={value} index={1}>
                <Lineage data={props.data} />
            </CustomTabPanel>
            
           
            <CustomTabPanel value={value} index={2}>
                <Properties data={props.data} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={5}>
                <ValidationDtl data={props.data}  />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={6}>
                <DocumentEditor />
            </CustomTabPanel> */}

        </Box>

    );
}

export default CatalogSchema;
