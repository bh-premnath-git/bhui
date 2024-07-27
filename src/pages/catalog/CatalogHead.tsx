import React, { useEffect, useState } from 'react';
import { Autocomplete, Box, Button, FormControl, IconButton, List, ListItemButton, ListItemText, Menu, MenuItem, OutlinedInput, Select, Stack, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from 'lodash';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import WebhookOutlinedIcon from '@mui/icons-material/WebhookOutlined';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ApiService from '../../services/ApiServices';
import { motion } from 'framer-motion';
import { Typography } from 'antd';
import CloseIcon from '@mui/icons-material/Close';
import { AiOutlineCheckCircle } from "react-icons/ai";




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
    console.log(props.dataSourceList)
    const status: any = [
        { 'id': 1, 'status': 'Active' },
        { 'id': 2, 'status': 'Inactive' }

    ]
    const consumerList = [
        { 'id': 1, 'consumer': 'Consumer1' },
        { 'id': 2, 'consumer': 'Consumer2' }

    ]
    // const tagList = [
    //     { 'id': 1, 'tagkey': 'key1', 'tagvalue': 'value1' },
    //     { 'id': 2, 'tagkey': 'key2', 'tagvalue': 'value2' },

    // ]
    const handleChange = (value) => {
        setSelectedValue1(value);
    };
    const handleChangeConsumer = (value) => {
        setSelectedConsumer(value);
    };
    const handleChangeTag = (field, value) => {
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
        console.log(params)
        console.log(projects)

        try {
            const result = await ApiService('8011', 'get', '/bh_project/search', null, params);
            console.log(result)
            var tempList: any = [];
            for (let i = 0; i < result.length; i++) {
                var data = { value: result[i]?.bh_project_id, label: result[i]?.bh_project_name }
                tempList.push(data);
            }
            console.log(tempList)
            setProjects(tempList)
            // if(!params.data_src_name){
            // 	setSearchList(result)
            // }
        }
        catch (error) {
            console.error('Error fetching Status', error);

        }
    }
    useEffect(() => {

        fetchProject();
        // fetchDataSourceTag()

    }, []);
    // const fetchDataSourceTag = async () => {
    //     const params = {}
    //     try {
    //         const result = await ApiService('8011', 'get', '/data_source/list/?offset=0&limit=10&order_desc=false', null, params);
    //         setSelectedTag(result)
    //         console.log(result)
    //     }
    //     catch (error) {
    //         console.error('Error fetching Status', error);

    //     }

    //     }
    // console.log(selectedTag)
    // const handleSearch1 = (value, selectedRow) => {
    //     setSelectedValue(value);
    //     console.log(value)
    //     setSelectedRow(selectedRow);
    // };
    // const handleSearchData = (value, selectedRow) => {
    //     setSelectedTag(value);
    //     console.log(value)
    //     setSelectedRow(selectedRow);
    // };

    // const handleSearch = () => {
    //     const selectedRow = projects.find(job => job.bh_project_name === selectedValue.bh_project_name);
    //     handleSearch1(selectedValue, selectedRow); // Pass the selected value and row to the parent component
    // };
    const handleSearchDatasource = () => {
        console.log(selectedTag)
		const selectedRow = props.dataSourceList.find(data => data.data_src_name === selectedTag.data_src_name);
		props.onSearch(selectedTag,selectedRow); // Pass the selected value and row to the parent component
	};
    return (
        <>
            <Stack justifyContent={'space-between'} direction="row">
                <Stack direction="row" spacing={2} padding={2}>

                    <Stack>
                        <FormControl sx={{ minWidth: 200 }}>

                            <Select
                                labelId="project-select-label"
                                value={selectedValue}
                                onChange={(e) => handleMenuItemClick(e.target.value)}
                                startAdornment={<WebhookOutlinedIcon sx={{ marginRight: 1 }} />}
                                displayEmpty
                                renderValue={(value: any) => (value ? projects.find(project => project.value === value)?.label : 'Select a project')}
                            >
                                <MenuItem disabled value="">
                                    <em>Select a project</em>
                                </MenuItem>
                                {projects.map((project: any) => (
                                    <MenuItem key={project.value} value={project.value}>
                                        {project.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {/* <Stack mt={2}>
                    {selectedValue && (
                            <Box mt={2} display="flex" alignItems="center"  justifyContent={"space-between"} 
                            sx={{backgroundColor:'#d9f7ec',width:'80%',height:'40%',borderRadius:'15px',padding:'15px'}}>
                                <Typography>{projects.find(project => project.value === selectedValue)?.label}</Typography>
                                <IconButton onClick={handleClearSelection} size="small">
                                    <CloseIcon sx={{fontSize:'15px'}}/>
                                </IconButton>
                            </Box>
                        )}
                    </Stack> */}
                    </Stack>

                    {/* <List>
                    <ListItemButton
                        sx={{
                            bgcolor: 'white',
                            border: 0.5,
                            borderColor: '#f2f3f5',
                            borderRadius: 1,
                        }}
                        onClick={toggleList}
                    >
                        <WebhookOutlinedIcon sx={{ paddingRight: 1 }} />
                        <ListItemText primary="Owner" />
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                </List> */}
                    {/* <List>
                    <ListItemButton sx={{
                        bgcolor: 'background.paper', border: 0.5,
                        borderColor: '#f2f3f5', borderRadius: 1,
                    }} >

                        <WebhookOutlinedIcon sx={{ paddingRight: 1 }} />

                        <ListItemText primary="Tag" />
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>

                </List> */}
                    <FormControl sx={{ m: 3, minWidth: 150 }}>
                        <Select

                            value={selectedTag.data_src_name || ''}
                            onChange={(e) => handleChangeTag('data_src_name', e.target.value)}
                            startAdornment={<WebhookOutlinedIcon sx={{ marginRight: 1 }} />}
                             variant='outlined'
                            displayEmpty
                            >
                            <MenuItem value="" disabled>
                                <em>Data Source</em>
                            </MenuItem>
                            {props.searchDataList.map((tag) => (
                                <MenuItem key={tag.data_src_id} value={tag.data_src_name}>
                                    {tag.data_src_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* <List>
                    <ListItemButton sx={{
                        bgcolor: 'background.paper', border: 0.5,
                        borderColor: '#f2f3f5', borderRadius: 1,
                    }}
                    >

                        <WebhookOutlinedIcon sx={{ paddingRight: 1 }} />

                        <ListItemText primary="Classification" />
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>

                </List> */}
                    {/* <List >
                    <ListItemButton sx={{
                        bgcolor: 'background.paper', border: 0.5,
                        borderColor: '#f2f3f5', borderRadius: 1,
                    }}
                    >
                        <WebhookOutlinedIcon sx={{ paddingRight: 1 }} />
                        <ListItemText primary="Consumer" />
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                </List> */}
                    <FormControl sx={{ m: 3, minWidth: 150 }}>
                        <Select

                            value={selectedConsumer}
                            onChange={(e) => handleChangeConsumer(e.target.value)}
                            startAdornment={<WebhookOutlinedIcon sx={{ marginRight: 1 }} />}
                            variant='outlined'
                            displayEmpty

                        >
                            <MenuItem value="" disabled>
                                <em>Consumer</em>
                            </MenuItem>
                            {consumerList.map((consumerList) => (
                                <MenuItem key={consumerList.id} value={consumerList.id}>
                                    {consumerList.consumer}
                                </MenuItem>
                            ))}
                        </Select>
                        {/* <Box mt={2}>
                        {selectedConsumer && (
                            <Box mt={2} display="flex" alignItems="center" justifyContent={'space-between'}   
                            sx={{backgroundColor:'#d9f7ec',width:'100%',height:'40%',borderRadius:'15px',padding:'15px'}}>
                                <Typography>{consumerList.find(consumerItem => consumerItem.id === selectedConsumer)?.consumer}</Typography>
                                <IconButton onClick={handleClearSelectionConsumer} size="small">
                                    <CloseIcon sx={{fontSize:'15px'}} />
                                </IconButton>
                            </Box>
                        )}
                    </Box> */}
                    </FormControl>
                    {/* <List>
                    <ListItemButton sx={{
                        bgcolor: 'background.paper', border: 0.5,
                        borderColor: '#f2f3f5', borderRadius: 1,
                    }} >

                        <SwapVertIcon sx={{ paddingRight: 1 }} />

                        <ListItemText primary="Sort" />
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>

                </List> */}
                    <FormControl sx={{ m: 3, minWidth: 150 }}>
                        <Select

                            value={selectedValue1}
                            onChange={(e) => handleChange(e.target.value)}
                            startAdornment={<AiOutlineCheckCircle style={{ marginRight: 1 }} fontSize={'30px'} />}
                            variant='outlined'
                            displayEmpty

                        >
                            <MenuItem value="" disabled>
                                <em>Status</em>
                            </MenuItem>
                            {status.map((statusItem) => (
                                <MenuItem key={statusItem.id} value={statusItem.id}>
                                    {statusItem.status}
                                </MenuItem>
                            ))}
                        </Select>
                        {/* <Box mt={2}>
                        {selectedValue1 && (
                            <Box mt={2} display="flex" alignItems="center" justifyContent={'space-between'} 
                            sx={{backgroundColor:'#d9f7ec',width:'80%',height:'40%',borderRadius:'15px',padding:'15px'}}>
                                <Typography>{status.find(statusItem => statusItem.id === selectedValue1)?.status}</Typography>
                                <IconButton onClick={handleClearSelection1} size="small">
                                    <CloseIcon sx={{fontSize:'15px'}}/>
                                </IconButton>
                            </Box>
                        )}
                    </Box> */}
                    </FormControl>
                </Stack>
                <Stack padding={2} paddingTop={4}>
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
                            mx: 2,
                            p: 1,
                            my: 3,
                            backgroundColor: '#000',
                            color: 'white',
                            whiteSpace: 'nowrap',  // Ensure the text does not break into multiple lines
                            textTransform: 'none', // Preserve the button text casing
                        }}

                        variant="contained"
                        onClick={() => handleSearchDatasource()}
                    >
                        Search
                    </Button>
                </motion.div>
            </Stack>
            <Stack direction={'row'} spacing={1}>
                <Stack>
                    {selectedValue && (
                        <Box display="flex" alignItems="center" justifyContent={"space-between"}
                            sx={{ backgroundColor: '#d9f7ec', width: '100%', height: '40%', borderRadius: '15px', padding: '15px' }}>
                            <Typography>{projects.find(project => project.value === selectedValue)?.label}</Typography>
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
                                <Typography>{status.find(statusItem => statusItem.id === selectedValue1)?.status}</Typography>
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
