import { Box, Button, IconButton, InputAdornment, Paper, Stack, TextField, Typography } from "@mui/material";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useState } from 'react';
import '../Explorer/ExploreProject.css';
import { ArrowRightIcon } from '@mui/x-date-pickers';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';


export default function CodePipelineSearchBar({ onClick }) {
    const [open, setOpen] = useState(false);

    const handleToggle = () => {
        setOpen(!open);
        onClick(open);
        console.log(open);


    };
    const dataSetList = [
        { 'id': 1, 'projectName': 'project 1', 'dataset': [{ 'datasetId': 1, 'name': 'Dataset 1' }, { 'datasetId': 2, 'name': 'Dataset 2' }, { 'datasetId': 3, 'name': 'Dataset 3' }] },
        { 'id': 2, 'projectName': 'project 2', 'dataset': [{ 'datasetId': 1, 'name': 'Dataset 1' }, { 'datasetId': 2, 'name': 'Dataset 2' }, { 'datasetId': 3, 'name': 'Dataset 3' }] },
        { 'id': 3, 'projectName': 'project 3', 'dataset': [{ 'datasetId': 1, 'name': 'Dataset 1' }, { 'datasetId': 2, 'name': 'Dataset 2' }, { 'datasetId': 3, 'name': 'Dataset 3' }] },
        { 'id': 4, 'projectName': 'project 4', 'dataset': [{ 'datasetId': 1, 'name': 'Dataset 1' }, { 'datasetId': 2, 'name': 'Dataset 2' }, { 'datasetId': 3, 'name': 'Dataset 3' }] },
    ];


    return (
        <>
            <Stack direction={'row'}>
                <Box sx={{ width: open ? '240px' : '75px', transition: 'width 0.2s', border: '1px solid lightgray', borderRadius: '5px', minHeight: '75vh', textAlign: 'center' }}>
                    {open ? (
                        <>
                            <Stack sx={{ border: '1px solid #f2f3f5', p: 2, m: 'auto' }}>
                                <TextField
                                    fullWidth
                                    // label="Search By Keywords"
                                    placeholder='Search By Keywords'
                                    id="outlined-start-adornment"
                                    sx={{
                                        '& fieldset': {
                                            borderColor: '#f2f3f5', // Change border color to light grey
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#f2f3f5', // Add hover effect
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#f2f3f5', // Add focus effect
                                        }
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}

                                />

                                <Stack justifyContent={'end'} sx={{ my: 1, textAlign: 'end' }}>
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
                                    >

                                    </motion.div>
                                </Stack>
                                <Stack>
                                    <Typography sx={{ color: 'gray', fontSize: "13px", textAlign: "start" }}>
                                        Drag and drop a dataset from any <br></br>
                                        project to the code pallet and <br></br>start typing your code
                                    </Typography>

                                    <Typography variant='subtitle2' sx={{ color: 'black', my: 2, marginRight: '5%', fontWeight: 'bold', fontSize: '20px', textAlign: "start" }}>
                                        Silver Zone Lake
                                    </Typography>
                                </Stack>
                                <Stack>
                                    <ul className="lists">
                                        {dataSetList.map(item => (
                                            <li key={item.id}>
                                                <p className="head">{item.projectName}</p>
                                                <ul className="lists">
                                                    {item.dataset.map(data => (
                                                        <li key={data.datasetId} className="data-set-list">
                                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                                <Stack direction="row" alignItems="center" flexGrow={1}>
                                                                    <div className="dot1"></div>
                                                                    <p>{data.name}</p>


                                                                </Stack>

                                                            </Stack>
                                                        </li>
                                                    ))}
                                                    <br />
                                                </ul>
                                            </li>
                                        ))}
                                    </ul>
                                </Stack>

                            </Stack>

                        </>
                    ) : (

                        <IconButton sx={{ border: '1px solid lightgray', borderRadius: '5px', my: 3 }}>
                            <SearchIcon />

                        </IconButton>

                    )}
                </Box>
                <Stack onClick={handleToggle} >

                    {open ? (
                        <ChevronLeftIcon sx={{ border: '1px solid lightgray' }} />
                    ) : (
                        <ChevronRightIcon sx={{ border: '1px solid lightgray' }} />
                    )}
                </Stack>
            </Stack>

        </>


    );
}