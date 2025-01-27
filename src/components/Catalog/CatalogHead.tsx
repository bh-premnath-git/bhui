import React, { useEffect, useState } from 'react';
import {Box, Button, FormControl, IconButton, MenuItem, Select, Stack } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from 'lodash';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import WebhookOutlinedIcon from '@mui/icons-material/WebhookOutlined';
import { motion } from 'framer-motion';
import { Typography } from 'antd';
import CloseIcon from '@mui/icons-material/Close';
import { AiOutlineCheckCircle } from "react-icons/ai";
import {ApiService} from '@/services/apiServices';
import { CATALOG_API_PORT } from '@/configration/environment';

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));
interface Project {
    value: any;
    label: any;
}

function CatalogHead(props: any) {
    const [searchValue, setSearchValue] = useState('');
    const [projects, setProjects]: any = useState<Project[]>([]);
    const [selectedValue, setSelectedValue]: any = useState('');
    const [selectedValue1, setSelectedValue1]: any = useState('');
    const [selectedConsumer, setSelectedConsumer]: any = useState('');
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedTag, setSelectedTag] = useState({ data_src_id: '', data_src_name: '' });
    const status: any = [
        { 'id': 1, 'status': 'Active' },
        { 'id': 2, 'status': 'Inactive' }

    ]
    const consumerList = [
        { 'id': 1, 'consumer': 'Consumer1' },
        { 'id': 2, 'consumer': 'Consumer2' }

    ]
    
    const handleChange = (value:any) => {
        setSelectedValue1(value);
    };
    const handleChangeConsumer = (value:any) => {
        setSelectedConsumer(value);
    };
    const handleChangeTag = (field:any, value:any) => {
        setSelectedTag(prevState => ({
            ...prevState,
            [field]: value,
        }));
    };
    const handleClearSelection1 = () => {
        setSelectedValue1('');
    };
    const handleClearSelection = () => {
        setSelectedValue('');
    };
    const handleClearSelectionConsumer = () => {
        setSelectedConsumer('');
    };
    const handleClearSelectionTag = () => {
        setSelectedTag({ data_src_id: '', data_src_name: '' });

    };


    const debouncedSearchLayout = debounce((value) => {
        props.search(value);
    }, 1000);

    const searchDataSource = (event: any) => {
        const { value } = event.target;
        setSearchValue(value);
        debouncedSearchLayout(value);
        setSelectedRow(selectedRow)


    };
    const handleMenuItemClick = (value: any) => {
        setSelectedValue(value);
    };


    const fetchProject = async () => {
        const params = { ...projects }
        try {
            const result = await ApiService(CATALOG_API_PORT, 'get', '/bh_project/search', null, params);
            console.log(result)
            var tempList: any = [];
            for (let i = 0; i < result.length; i++) {
                var data = { value: result[i]?.bh_project_id, label: result[i]?.bh_project_name }
                tempList.push(data);
            }
            setProjects(tempList)
            
        }
        catch (error) {
            console.error('Error fetching Status', error);

        }
    }
    useEffect(() => {
        fetchProject();
    }, []);
    
    const handleSearchDatasource = () => {
        console.log(selectedTag)
        const selectedRow = props.dataSourceList.find((data:any) => data.data_src_name === selectedTag.data_src_name);
        props.onSearch(selectedTag, selectedRow);
    };
    return (
        <>
            <Stack justifyContent={'space-between'} direction="row">
                <Stack direction="row" spacing={2} padding={2}>

                    <Stack>
                        <FormControl sx={{ minWidth: 200 }}>

                            <Select size='small'
                                labelId="project-select-label"
                                value={selectedValue}
                                onChange={(e) => handleMenuItemClick(e.target.value)}
                                startAdornment={<WebhookOutlinedIcon sx={{ marginRight: 1 }} />}
                                displayEmpty
                                renderValue={(value: any) => (value ? projects.find((project:any) => project.value === value)?.label : 'Select a project')}
                            >
                                <MenuItem disabled value="" sx={{ fontFamily: 'Inter' }}>
                                    Select a project
                                </MenuItem>
                                {projects.map((project: any) => (
                                    <MenuItem key={project.value} value={project.value}>
                                        {project.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                    </Stack>


                    <FormControl sx={{ m: 3, minWidth: 150 }}>
                        <Select size='small'
                            value={selectedTag.data_src_name || ''}
                            onChange={(e) => handleChangeTag('data_src_name', e.target.value)}
                            startAdornment={<WebhookOutlinedIcon sx={{ marginRight: 1 }} />}
                            variant='outlined'
                            displayEmpty
                        >
                            <MenuItem value="" disabled>
                                Data Source
                            </MenuItem>
                            {props.searchDataList.map((tag:any) => (
                                <MenuItem key={tag.data_src_id} value={tag.data_src_name}>
                                    {tag.data_src_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>


                    <FormControl sx={{ m: 3, minWidth: 150 }}>
                        <Select size='small'
                            value={selectedConsumer}
                            onChange={(e) => handleChangeConsumer(e.target.value)}
                            startAdornment={<WebhookOutlinedIcon sx={{ marginRight: 1 }} />}
                            variant='outlined'
                            displayEmpty
                        >
                            <MenuItem value="" disabled>
                                Consumer
                            </MenuItem>
                            {consumerList.map((consumerList) => (
                                <MenuItem key={consumerList.id} value={consumerList.id}>
                                    {consumerList.consumer}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ m: 3, minWidth: 150 }}>
                        <Select size='small'
                            value={selectedValue1}
                            onChange={(e) => handleChange(e.target.value)}
                            startAdornment={<AiOutlineCheckCircle style={{ marginRight: 1 }} fontSize={'30px'} />}
                            variant='outlined'
                            displayEmpty

                        >
                            <MenuItem value="" disabled>
                                Status
                            </MenuItem>
                            {status.map((statusItem:any) => (
                                <MenuItem key={statusItem.id} value={statusItem.id}>
                                    {statusItem.status}
                                </MenuItem>
                            ))}
                        </Select>

                    </FormControl>
                </Stack>
                <Stack direction={'row'}>
                    <Stack padding={2} paddingTop={2}>
                        <Search
                            sx={{
                                bgcolor: 'background.paper',
                                border: 0.5,
                                borderColor: '#f2f3f5',
                                borderRadius: 1,
                            }}
                        >
                            <SearchIconWrapper>
                                <SearchIcon />
                            </SearchIconWrapper>
                            <StyledInputBase
                                placeholder="Search…"
                                inputProps={{ 'aria-label': 'search' }}
                                value={searchValue}
                                onChange={searchDataSource}
                            />
                        </Search>
                    </Stack>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
                    >
                        <Button
                            className="bg-dark h6 text-white"
                            sx={{
                                px: 2,
                                py: 1,
                                my: 2,
                                backgroundColor: '#000',
                                color: 'white',
                                whiteSpace: 'nowrap',
                                textTransform: 'none',
                            }}

                            variant="contained"
                            onClick={() => handleSearchDatasource()}
                        >
                            Search
                        </Button>
                    </motion.div>
                </Stack>

            </Stack>
            <Stack direction={'row'} spacing={1}>
                <Stack>
                    {selectedValue && (
                        <Box display="flex" alignItems="center" justifyContent={"space-between"}
                            sx={{ backgroundColor: '#d9f7ec', width: '100%', height: '40%', borderRadius: '15px', padding: '15px' }}>
                            <Typography>{projects.find((project:any) => project.value === selectedValue)?.label}</Typography>
                            <IconButton onClick={handleClearSelection} size="small">
                                <CloseIcon sx={{ fontSize: '15px' }} />
                            </IconButton>
                        </Box>
                    )}
                </Stack>

                <Stack>
                    {selectedTag.data_src_name && (
                        <Box display="flex" alignItems='center' justifyContent='space-between'
                            sx={{ backgroundColor: '#d9f7ec', width: '100%', height: '40%', borderRadius: '15px', padding: '15px' }}>
                            <Typography>
                                {selectedTag.data_src_name}
                            </Typography>
                            <IconButton onClick={handleClearSelectionTag} size="small">
                                <CloseIcon sx={{ fontSize: '15px' }} />
                            </IconButton>
                        </Box>
                    )}
                </Stack>
                <Stack>
                    <Box>
                        {selectedConsumer && (
                            <Box display="flex" alignItems="center" justifyContent={'space-between'}
                                sx={{ backgroundColor: '#d9f7ec', width: '100%', height: '40%', borderRadius: '15px', padding: '15px' }}>
                                <Typography>{consumerList.find(consumerItem => consumerItem.id === selectedConsumer)?.consumer}</Typography>
                                <IconButton onClick={handleClearSelectionConsumer} size="small">
                                    <CloseIcon sx={{ fontSize: '15px' }} />
                                </IconButton>
                            </Box>
                        )}
                    </Box>
                </Stack>

                <Stack>
                    <Box>
                        {selectedValue1 && (
                            <Box display="flex" alignItems="center" justifyContent={'space-between'}
                                sx={{ backgroundColor: '#d9f7ec', width: '100%', height: '40%', borderRadius: '15px', padding: '15px' }}>
                                <Typography>{status.find((statusItem:any) => statusItem.id === selectedValue1)?.status}</Typography>
                                <IconButton onClick={handleClearSelection1} size="small">
                                    <CloseIcon sx={{ fontSize: '15px' }} />
                                </IconButton>
                            </Box>
                        )}
                    </Box>
                </Stack>

            </Stack>

        </>
    );
}

export default CatalogHead;
