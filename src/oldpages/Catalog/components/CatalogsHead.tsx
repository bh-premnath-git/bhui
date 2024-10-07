import Button from '@mui/material/Button';
import { Grid, IconButton} from '@mui/material/';
import Typography from '@mui/material/Typography';
import { ChangeEvent, useState } from 'react';
import { InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from 'lodash';
import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import CatalogsBody from '../../../pages/dataCatalog/catalogsBody';
import Lineage from './Lineage/Lineage';
import Properties from './properties/Properties';
import ValidationDtl from './validation/validationbody';
import DocumentEditor from './DocumentEditor';


interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
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
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}


function CatalogsHead(props:any) {
    const childRef = React.useRef(null);

    const data = props.data;
    // const searchText = useAppSelector(selectProjectsSearchText);
    const [value, setValue] = React.useState(0);
    const [searchValue, setSearchValue] = useState('');
    const debouncedSearchLayout = debounce((value) => {
        // props.fetchDatasourceRegion(value);
    }, 1000);

    const searchDataSource = (event:any) => {
        const { value } = event.target;
        setSearchValue(value);
        debouncedSearchLayout(value);
    };
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };


    return (
        <Box sx={{ width: '100%' }}>

            <Grid container spacing={2} >
                <Grid item xs={8} textAlign={'end'} >
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" centered
                        TabIndicatorProps={{
                            style: {
                                backgroundColor: '#000', // Customize the background color of the indicator
                                height: 5,
                                width: '30px', // Set the width of the indicator based on the number of tabs
                                marginLeft: 'calc((100% / 2 - 45%) / 2)',
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
                        <Tab label="Schema" {...a11yProps(0)} />
                        <Tab label="Lineage" {...a11yProps(1)} />
                        <Tab label="Properties" {...a11yProps(2)} />
                        <Tab label="Queries" {...a11yProps(3)} />
                        <Tab label="Stats" {...a11yProps(4)} />
                        <Tab label="Validation" {...a11yProps(5)} />
                        <Tab label="Documentation" {...a11yProps(6)} />

                    </Tabs>
                </Grid>
                <Grid item xs={2} textAlign={'end'}>
                    <TextField
                        variant="outlined"
                        placeholder="Search"
                        size='small'
                        fullWidth
                        value={searchValue}
                        onChange={searchDataSource}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <IconButton>
                                        <SearchIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={2} textAlign={'center'}>
                    <Button variant='contained' sx={{ color: 'white', backgroundColor: '#000', textTransform:'none' }}>
                        Request Access
                    </Button>
                </Grid>
            </Grid>



            <CustomTabPanel value={value} index={0}>
                <CatalogsBody data={data} search={searchValue}/>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <Lineage data={props.data} />
            </CustomTabPanel>
            
           
            <CustomTabPanel value={value} index={2}>
                <Properties data={props.data} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={5}>
                <ValidationDtl data={props.data}  />
                {/* data={props.data}  */}
            </CustomTabPanel>
            <CustomTabPanel value={value} index={6}>
                <DocumentEditor />
            </CustomTabPanel>
           
        </Box>

    );
}

export default CatalogsHead;
