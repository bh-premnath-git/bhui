import { Box, IconButton, Input, InputAdornment, MenuItem, Popover, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography, tableCellClasses } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import React, { useState } from "react";
import Button from '@mui/material/Button';
import { motion } from 'framer-motion';
// import styled from "@emotion/styled";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Link } from 'react-router-dom';
import Divider from '@mui/material/Divider';
import { formatDate } from "../../utils/dateFormatter";
import DateDisplay from "../../components/DateDisplay";



function createData(Project:any, delivery:any, customer:any, endDate:any, tags:any) {
    return { Project, delivery, customer, endDate, tags };
}

const rows = [
    createData('Project Name1', 'Delivery Name1', 'Custemer Name1', '11/04/2024', <>
        <Stack direction={'row'} spacing={2}>
        <Box sx={{ bgcolor: '#d0f4e8', color: '#00c286', textAlign: 'center', width: '150px', borderRadius: '5px' }}>
           <span> <Typography>  Department {'>>'} Tech</Typography></span>
        </Box>
        <Box sx={{ bgcolor: '#d0f4e8', color: '#00c286', textAlign: 'center', width: '140px', borderRadius: '5px' }}>
         <span><Typography>  Region {'>>'} USA</Typography></span>
        </Box>
        
        </Stack>
        <Stack direction={'row'} spacing={2} sx={{mt:1}}>
        <Box sx={{ bgcolor: '#d0f4e8', color: '#00c286', textAlign: 'center', width: '150px', borderRadius: '5px' }}>
           <span> <Typography>  Department {'>>'} Tech</Typography></span>
        </Box>
        <Box sx={{ bgcolor: '#d0f4e8', color: '#00c286', textAlign: 'center', width: '140px', borderRadius: '5px' }}>
         <span><Typography>  Region {'>>'} USA</Typography></span>
        </Box>

        </Stack>


    </>),
    createData('Project Name1', 'Delivery Name1', 'Custemer Name1', '11/04/2024', <>
        <Stack direction={'row'} spacing={2}>
        <Box sx={{ bgcolor: '#d0f4e8', color: '#00c286', textAlign: 'center', width: '150px', borderRadius: '5px' }}>
           <span> <Typography>  Department {'>>'} Tech</Typography></span>
        </Box>
        <Box sx={{ bgcolor: '#d0f4e8', color: '#00c286', textAlign: 'center', width: '140px', borderRadius: '5px' }}>
         <span><Typography>  Region {'>>'} USA</Typography></span>
        </Box>
        
        </Stack>
        <Stack direction={'row'} spacing={2} sx={{mt:1}}>
        <Box sx={{ bgcolor: '#d0f4e8', color: '#00c286', textAlign: 'center', width: '150px', borderRadius: '5px' }}>
           <span> <Typography>  Department {'>>'} Tech</Typography></span>
        </Box>
        <Box sx={{ bgcolor: '#d0f4e8', color: '#00c286', textAlign: 'center', width: '140px', borderRadius: '5px' }}>
         <span><Typography>  Region {'>>'} USA</Typography></span>
        </Box>

        </Stack>
    </>),
    createData('Project Name1', 'Delivery Name1', 'Custemer Name1', '11/04/2024', <>
    <Stack direction={'row'} spacing={2}>
        <Box sx={{ bgcolor: '#d0f4e8', color: '#00c286', textAlign: 'center', width: '150px', borderRadius: '5px' }}>
           <span> <Typography>  Department {'>>'} Tech</Typography></span>
        </Box>
        <Box sx={{ bgcolor: '#d0f4e8', color: '#00c286', textAlign: 'center', width: '140px', borderRadius: '5px' }}>
         <span><Typography>  Region {'>>'} USA</Typography></span>
        </Box>
        
        </Stack>
        <Stack direction={'row'} spacing={2} sx={{mt:1}}>
        <Box sx={{ bgcolor: '#d0f4e8', color: '#00c286', textAlign: 'center', width: '150px', borderRadius: '5px' }}>
           <span> <Typography>  Department {'>>'} Tech</Typography></span>
        </Box>
        <Box sx={{ bgcolor: '#d0f4e8', color: '#00c286', textAlign: 'center', width: '140px', borderRadius: '5px' }}>
         <span><Typography>  Region {'>>'} USA</Typography></span>
        </Box>

        </Stack>
    </>),
    createData('Project Name1', 'Delivery Name1', 'Custemer Name1', '11/04/2024', <> 
    <Stack direction={'row'} spacing={2}>
        <Box sx={{ bgcolor: '#d0f4e8', color: '#00c286', textAlign: 'center', width: '150px', borderRadius: '5px' }}>
           <span> <Typography>  Department {'>>'} Tech</Typography></span>
        </Box>
        <Box sx={{ bgcolor: '#d0f4e8', color: '#00c286', textAlign: 'center', width: '140px', borderRadius: '5px' }}>
         <span><Typography>  Region {'>>'} USA</Typography></span>
        </Box>
        
        </Stack>
        <Stack direction={'row'} spacing={2} sx={{mt:1}}>
        <Box sx={{ bgcolor: '#d0f4e8', color: '#00c286', textAlign: 'center', width: '150px', borderRadius: '5px' }}>
           <span> <Typography>  Department {'>>'} Tech</Typography></span>
        </Box>
        <Box sx={{ bgcolor: '#d0f4e8', color: '#00c286', textAlign: 'center', width: '140px', borderRadius: '5px' }}>
         <span><Typography>  Region {'>>'} USA</Typography></span>
        </Box>

        </Stack>

    </>),
    createData('Project Name1', 'Delivery Name1', 'Custemer Name1', '11/04/2024', <> 
    <Stack direction={'row'} spacing={2}>
        <Box sx={{ bgcolor: '#d0f4e8', color: '#00c286', textAlign: 'center', width: '150px', borderRadius: '5px' }}>
           <span> <Typography>  Department {'>>'} Tech</Typography></span>
        </Box>
        <Box sx={{ bgcolor: '#d0f4e8', color: '#00c286', textAlign: 'center', width: '140px', borderRadius: '5px' }}>
         <span><Typography>  Region {'>>'} USA</Typography></span>
        </Box>
        
        </Stack>
        <Stack direction={'row'} spacing={2} sx={{mt:1}}>
        <Box sx={{ bgcolor: '#d0f4e8', color: '#00c286', textAlign: 'center', width: '150px', borderRadius: '5px' }}>
           <span> <Typography>  Department {'>>'} Tech</Typography></span>
        </Box>
        <Box sx={{ bgcolor: '#d0f4e8', color: '#00c286', textAlign: 'center', width: '140px', borderRadius: '5px' }}>
         <span><Typography>  Region {'>>'} USA</Typography></span>
        </Box>

        </Stack>


    </>),
];


export default function PublishDataTable() {
    const [selectedtag, setSelectedTag] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [openAddLink, setOpenAddLink] = useState(false);

	const handleChangePage = (newPage:any) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event:any) => {
		setRowsPerPage(+event.target.value);
		setPage(0);
	};
    const handleOpen = (event:any) => {
		setAnchorEl(event.currentTarget);
	};
    const handleSearchChange = (event:any) => {
        setSearchValue(event.target.value);
        // Add your search logic here if needed
    };
    const handleClose = () => {
		setAnchorEl(null);
	};
    const open = Boolean(anchorEl);
	const id = open ? 'popup' : undefined;
	const openLinkDialog = () => {
		setOpenAddLink(true)
	};
   
    return (

        <Stack sx={{ my: 2 }}>
            
					<div className="d-flex justify-content-between mt-5">

						<Stack>
                        <TextField
                            sx={{
                                width: '235px', '& fieldset': {
                                    borderColor: 'grey', // Change border color to light grey
                                },
                                '&:hover fieldset': {
                                    borderColor: '#f2f3f5', // Add hover effect
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#f2f3f5', // Add focus effect
                                },
                                
                            }}
                            value={searchValue}
                            placeholder='Search By Keywords'
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton aria-label="search">
                                            <SearchIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
						</Stack>
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
						>
							<Button sx={{
                                backgroundColor: 'black',
                                '&:hover': {
                                    backgroundColor: 'black', 
                                    color:'white'// Keep the same background color on hover to disable the effect
                                },
                            }}
                                variant="contained"
                            >
                                Publish Data
                            </Button>
						</motion.div>
						{/* </div> */}
					</div>
            <TableContainer sx={{ py: 3 }}>
                <Table sx={{ border: '1px solid lightgrey' }} aria-label="simple table">
                    <TableHead sx={{ backgroundColor: 'lightgrey' }}>
                        <TableRow >
                            <TableCell sx={{ fontWeight: 'bold' }}>Project Name</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Delivery Name</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Customer Name</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Tags</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}></TableCell>


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
                                <TableCell align="left">{row.delivery}</TableCell>
                                <TableCell align="left">{row.customer}</TableCell>
                                <TableCell align="left"><DateDisplay dateString={row.endDate} /></TableCell>
                                <TableCell align="left">{row.tags}</TableCell>
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
					<Button sx={{ my: 1, mx: 1,color:'black' }} onClick={openLinkDialog}>
						Edit
					</Button><br />
                    <Divider sx={{color:'grey'}}/>
					<Button sx={{ mx: 1,color:'black' }}>Clone</Button><br />
                    <Divider sx={{color:'grey'}}/>
                    <Button sx={{ mx: 1,color:'black' }}>Disable</Button><br />

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
        </Stack>


    );
}