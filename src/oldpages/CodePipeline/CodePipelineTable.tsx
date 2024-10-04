import { Autocomplete, Box, Checkbox, FormControlLabel, IconButton, Input, InputAdornment, MenuItem, Popover, Radio, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography, tableCellClasses } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import React, { useState } from "react";
import Button from '@mui/material/Button';
import { motion } from 'framer-motion';
// import styled from "@emotion/styled";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Link } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import { CheckBox } from "@mui/icons-material";




function createData(Project: any, pipeline: any, updatedby: any, updatedon: any, executedon: any) {
    return { Project, pipeline, updatedby, updatedon, executedon };
}

const rows = [
    createData('Project Name1', 'Pipeline Name1', 'Johnnie Doe', '11/06/2023 10:56:20', '15/06/2023 12:56:20'),
    createData('Project Name1', 'Pipeline Name1', 'Johnnie Doe', '11/06/2023 10:56:20', '15/06/2023 12:56:20'),
    createData('Project Name1', 'Pipeline Name1', 'Johnnie Doe', '11/06/2023 10:56:20', '15/06/2023 12:56:20'),
    createData('Project Name1', 'Pipeline Name1', 'Johnnie Doe', '11/06/2023 10:56:20', '15/06/2023 12:56:20'),
    createData('Project Name1', 'Pipeline Name1', 'Johnnie Doe', '11/06/2023 10:56:20', '15/06/2023 12:56:20'),
    createData('Project Name1', 'Pipeline Name1', 'Johnnie Doe', '11/06/2023 10:56:20', '15/06/2023 12:56:20'),
    createData('Project Name1', 'Pipeline Name1', 'Johnnie Doe', '11/06/2023 10:56:20', '15/06/2023 12:56:20'),
    createData('Project Name1', 'Pipeline Name1', 'Johnnie Doe', '11/06/2023 10:56:20', '15/06/2023 12:56:20'),
    createData('Project Name1', 'Pipeline Name1', 'Johnnie Doe', '11/06/2023 10:56:20', '15/06/2023 12:56:20'),

]


export default function CodePipelineTable() {
    const [selectedProject, setSelectedProject] :any = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [openAddLink, setOpenAddLink] = useState(false);
    const [selectedOption, setSelectedOption] :any= useState('');
    const projectList = [
        {'id':1,'name':'All Environment'},
        {'id':2,'name':'Project1'},
        {'id':3,'name':'Project2'},
        {'id':4,'name':'Project3'},
        {'id':5,'name':'Project4'},
    ]

    const handleProject = (value) => {
        setSelectedProject(value);
    }
    const handleClearProject = () => {
        setSelectedProject('');
    };

    const handleChangePage = (newPage: any) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    const handleOpen = (event: any) => {
        setAnchorEl(event.currentTarget);
    };
    const handleSearchChange = (event: any) => {
        setSearchValue(event.target.value);
        // Add your search logic here if needed
    };
    const handleProjectChange = (event: any) => {
        setSelectedProject(event.target.value);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const open = Boolean(anchorEl);
    const id = open ? 'popup' : undefined;
    const openLinkDialog = () => {
        setOpenAddLink(true)
    };
    const closeLinkDialog = () => {
        setOpenAddLink(false)
    }
    return (
        <>

            <Stack spacing={2} direction={'row'} justifyContent={'space-between'}>
                <Stack spacing={2} direction={'row'}>
                    <Stack spacing={2}>
                    <Stack>
                        <Select
                            id="dropdown"
                            value={selectedProject}
                            onChange={(e) => handleProject(e.target.value)}
                            displayEmpty
                            sx={{
                                width: '250px',
                                '& fieldset': {
                                    borderColor: 'grey', // Change border color to light grey
                                },
                                '&:hover fieldset': {
                                    borderColor: '#f2f3f5', // Add hover effect
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#f2f3f5', // Add focus effect
                                },
                            }}
                        >
                            <MenuItem value="" disabled>
                                Filter by Project Name
                            </MenuItem>
                            {projectList.map((project:any) =>
                            <MenuItem value={project.id}>
                                <FormControlLabel
                                    control={<Checkbox />}
                                    label={project.name}
                                />
                            </MenuItem>
                            )}
                            {/* <MenuItem value="option2">
                                <FormControlLabel
                                    control={<Radio />}
                                    label="Project2"
                                />
                            </MenuItem>
                            <MenuItem value="option3">
                                <FormControlLabel
                                    control={<Radio />}
                                    label="Project3"
                                />
                            </MenuItem> */}
                        </Select>
                    </Stack>
                    <Box>
                        {selectedProject && (
                            <Box display="flex" alignItems="center" justifyContent={'space-between'}
                                sx={{ backgroundColor: '#d9f7ec', width: '60%', height: '40%', borderRadius: '15px', padding: '15px' }}>
                                <Typography>{projectList.find(project => project.id === selectedProject)?.name}</Typography>
                                <IconButton onClick={handleClearProject} size="small">
                                    <CloseIcon sx={{ fontSize: '15px' }} />
                                </IconButton>
                            </Box>
                        )}
                    </Box>
                    </Stack>
                </Stack>
                <Stack spacing={2} direction={'row'}>
                    <Stack>
                        <Typography fontWeight={'bold'} fontSize={16}></Typography>
                        <TextField
                            id="left-search"
                            //   label="Search By keywords"
                            placeholder='Search By keywords'
                            sx={{

                                width: '40ch',
                                borderRadius: '16px',
                                '& fieldset': {
                                    borderColor: 'gray', // Change border color to light grey
                                },
                            }}
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />

                    </Stack>
                    <Stack >
                        
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
                        >
                            <Button className='bg-dark h6'
                                sx={{ mx: 2, p: 1,mt:1, '&:hover': {
                                    backgroundColor: 'black', 
                                    color:'white'// Same color as normal state
                                  }, }}
                                component={Link}
                                to="/Designer/Codepipeline1"
                                variant="contained"
                            >
                                Create New Pipeline
                            </Button>
                        </motion.div>

                    </Stack>
                </Stack>
            </Stack>
            <TableContainer sx={{ py: 1, mt: 7 }}>
                <Table sx={{ border: '1px solid lightgrey' }} aria-label="simple table">
                    <TableHead sx={{ backgroundColor: 'lightgrey' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Project Name</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold', width: '20%' }}>Pipeline Name</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold', width: '15%' }}>Last Updated By</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold', width: '15%' }}>Last Updated On</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold', width: '15%' }}>Last Executed On</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold', width: '15%' }}></TableCell>

                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow
                                key={row.Project}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {row.Project}
                                </TableCell>
                                <TableCell align="left">{row.pipeline}</TableCell>
                                <TableCell align="left">{row.updatedby}</TableCell>
                                <TableCell align="left">{row.updatedon}</TableCell>
                                <TableCell align="left">{row.executedon}</TableCell>
                                <TableCell align="left"><IconButton onClick={handleOpen}>
                                    <MoreVertIcon />
                                </IconButton></TableCell>



                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

            </TableContainer>
            <Popover
                elevation={1}
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            // sx={{ width: 300 }}
            >
                <Button sx={{ my: 1, mx: 1, color: 'black' }} onClick={openLinkDialog}>
                    Edit
                </Button><br />
                <Button sx={{ mx: 1, color: 'black' }}>Clone</Button><br />
                <Button sx={{ mx: 1, color: 'black' }}>Disable</Button><br />

            </Popover>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </>


    );
}