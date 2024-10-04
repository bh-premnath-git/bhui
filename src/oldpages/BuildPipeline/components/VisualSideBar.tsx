import React, { useState } from 'react';
import { Fab, Stack, Typography, InputBase, IconButton, Box, Tab, Divider, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import FitbitIcon from '@mui/icons-material/Fitbit';
import { TiFlowSwitch } from "react-icons/ti";

// const VerticalDottedDivider = ({ height, color }) => (
//     <div
//         style={{
//             display: 'flex',
//             flexDirection: 'column',
//             justifyContent: 'space-between',
//             height: height || '100%',
//             marginRight: '5px', // Adjust as needed
//             borderRightWidth: 5 ,
//      }}
//     >
//         <div style={{ width: '7px', height: '7px', backgroundColor: color || 'grey', borderRadius: '50%' }} />
//         <div style={{ flex: 1 }} /> {/* This adds space */}
//         <div style={{ width: '7px', height: '7px', backgroundColor: color || 'grey', borderRadius: '50%' }} />
//     </div>
// );
export default () => {
    const onDragStart = (event: any, nodeType: any) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };
    const [value, setValue] = React.useState('1');

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    const [showContent, setShowContent] = useState(false);

    const toggleContent = () => {
        setShowContent(!showContent);
    };

    return (
        <>

            {showContent && (
                <Stack sx={{ backgroundColor: 'white' }} >

                    {/* <div className="description"> */}
                    < Stack direction={'row'} justifyContent={'space-between'}>
                        <Typography variant='subtitle1' sx={{ p: '8px' }}>Add Nodes</Typography>
                        <IconButton onClick={toggleContent}><CloseIcon /></IconButton>

                    </Stack>
                    <Stack direction={'row'} sx={{ border: 0.5, borderColor: '#ececec', borderRadius: 2, m: '8px' }}>
                        <IconButton type="button" aria-label="search">
                            <SearchIcon />
                        </IconButton>
                        <InputBase
                            sx={{ ml: 2, flex: 1, width: '400px' }}
                            placeholder="Search Source,Transform and Targets"
                            inputProps={{ 'aria-label': 'search google maps' }}
                        />
                    </Stack>
                    <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChange} aria-label="lab API tabs example">
                                <Tab label="Sources" value="1" />
                                <Tab label="Transforms" value="2" />
                                <Tab label="Targets" value="3" />
                            </TabList>
                        </Box>
                        <TabPanel value="1" >
                            <div className="dndnode " onDragStart={(event) => onDragStart(event, 'Oracle SQL')} draggable style={{ alignItems: 'center' }}>
                                <TiFlowSwitch style={{ fontSize: '25px', backgroundColor: 'lightgrey', borderRadius: '10px' }} />
                                <Divider  orientation="vertical" flexItem  sx={{height:"60px" ,color:"grey",ml:'10px',borderRightWidth: 3 }} />
                                <Stack>
                                    <Typography ml={2}>Accounts Data</Typography>
                                    <Typography ml={2} fontSize={'13px'} color={'grey'}>Loream Ipusum is simply Dummy Test of The <br></br>Printing and Typecasting Industry.Loream Ipusm</Typography>
                                </Stack>
                            </div>
                            <div className="dndnode" onDragStart={(event) => onDragStart(event, ' MicroSoft SQL Server')} draggable style={{ alignItems: 'center' }}>
                                <TiFlowSwitch style={{ fontSize: '25px', backgroundColor: 'lightgrey', borderRadius: '10px' }} />
                                <Divider  orientation="vertical" flexItem  sx={{height:"60px" ,color:"grey" ,ml:'10px',borderRightWidth: 3 }} />
                                <Stack>
                                    <Typography ml={2} py={1}> Leads Data</Typography>
                                    <Typography ml={2} fontSize={'13px'} color={'grey'}>Loream Ipusum is simply Dummy Test of The <br></br>Printing and Typecasting Industry.Loream Ipusm</Typography>
                                </Stack>
                            </div>
                            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'Snowflake')} draggable style={{ alignItems: 'center' }}>
                                <TiFlowSwitch style={{ fontSize: '25px', backgroundColor: 'lightgrey', borderRadius: '10px' }} />
                                <Divider  orientation="vertical" flexItem  sx={{height:"60px" ,color:"grey" ,ml:'10px',borderRightWidth: 3 }} />
                                <Stack>
                                    <Typography ml={2} py={1}>Departments Data</Typography>
                                    <Typography ml={2} fontSize={'13px'} color={'grey'}>Loream Ipusum is simply Dummy Test of The <br></br>Printing and Typecasting Industry.Loream Ipusm</Typography>
                                </Stack>
                            </div>
                            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'Azure SQL')} draggable style={{ alignItems: 'center' }}>
                                <TiFlowSwitch style={{ fontSize: '25px', backgroundColor: 'lightgrey', borderRadius: '10px' }} />
                                <Divider  orientation="vertical" flexItem  sx={{height:"60px" ,color:"grey" ,ml:'10px',borderRightWidth: 3 }} />
                                <Stack>
                                    <Typography ml={2} py={1}>Compaign Data</Typography>
                                    <Typography ml={2} fontSize={'13px'} color={'grey'}>Loream Ipusum is simply Dummy Test of The <br></br>Printing and Typecasting Industry.Loream Ipusm</Typography>

                                </Stack>

                            </div>
                            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'Amazon kines')} draggable style={{ alignItems: 'center' }}>
                                <TiFlowSwitch style={{ fontSize: '25px', backgroundColor: 'lightgrey', borderRadius: '10px' }} />
                                <Divider  orientation="vertical" flexItem  sx={{height:"60px" ,color:"grey" ,ml:'10px',borderRightWidth: 3 }} />
                                <Stack>
                                    <Typography ml={2} py={1}>Reference Data</Typography>
                                    <Typography ml={2} fontSize={'13px'} color={'grey'}>Loream Ipusum is simply Dummy Test of The <br></br>Printing and Typecasting Industry.Loream Ipusm</Typography>

                                </Stack>
                            </div>
                            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'Oracle SQL')} draggable style={{ alignItems: 'center' }}>
                                <TiFlowSwitch style={{ fontSize: '25px', backgroundColor: 'lightgrey', borderRadius: '10px' }} />
                                <Divider  orientation="vertical" flexItem  sx={{height:"60px" ,color:"grey" ,ml:'10px',borderRightWidth: 3 }} />
                                <Stack>
                                    <Typography ml={2} py={1}>People Data</Typography>
                                    <Typography ml={2} fontSize={'13px'} color={'grey'}>Loream Ipusum is simply Dummy Test of The <br></br>Printing and Typecasting Industry.Loream Ipusm</Typography>
                                </Stack>
                            </div>
                            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'Oracle SQL')} draggable style={{ alignItems: 'center' }}>
                                <TiFlowSwitch style={{ fontSize: '25px', backgroundColor: 'lightgrey', borderRadius: '10px' }} />
                                <Divider  orientation="vertical" flexItem  sx={{height:"60px" ,color:"grey" ,ml:'10px',borderRightWidth: 3 }} />
                                <Stack>
                                    <Typography ml={2} py={1}>Oracle SQL</Typography>
                                    <Typography ml={2} fontSize={'13px'} color={'grey'}>Loream Ipusum is simply Dummy Test of The <br></br>Printing and Typecasting Industry.Loream Ipusm</Typography>
                                </Stack>
                            </div>
                        </TabPanel>

                        <TabPanel value="2">


                        <div className="dndnode " onDragStart={(event) => onDragStart(event, 'Oracle SQL')} draggable style={{ alignItems: 'center' }}>
                                <TiFlowSwitch style={{ fontSize: '25px', backgroundColor: 'lightgrey', borderRadius: '10px' }} />
                                <Divider  orientation="vertical" flexItem  sx={{height:"60px" ,color:"grey" ,ml:'10px',borderRightWidth: 3 }} />
                                <Stack>
                                    <Typography ml={2}>Change Schema</Typography>
                                    <Typography ml={2} fontSize={'13px'} color={'grey'}>Loream Ipusum is simply Dummy Test of The <br></br>Printing and Typecasting Industry.Loream Ipusm</Typography>
                                </Stack>
                            </div>
                            <div className="dndnode" onDragStart={(event) => onDragStart(event, ' MicroSoft SQL Server')} draggable style={{ alignItems: 'center' }}>
                                <TiFlowSwitch style={{ fontSize: '25px', backgroundColor: 'lightgrey', borderRadius: '10px' }} />
                                <Divider  orientation="vertical" flexItem  sx={{height:"60px" ,color:"grey" ,ml:'10px',borderRightWidth: 3 }} />
                                <Stack>
                                    <Typography ml={2} py={1}>Join</Typography>
                                    <Typography ml={2} fontSize={'13px'} color={'grey'}>Loream Ipusum is simply Dummy Test of The <br></br>Printing and Typecasting Industry.Loream Ipusm</Typography>
                                </Stack>
                            </div>
                            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'Snowflake')} draggable style={{ alignItems: 'center' }}>
                                <TiFlowSwitch style={{ fontSize: '25px', backgroundColor: 'lightgrey', borderRadius: '10px' }} />
                                <Divider  orientation="vertical" flexItem  sx={{height:"60px" ,color:"grey",ml:'10px',borderRightWidth: 3 }} />
                                <Stack>
                                    <Typography ml={2} py={1}>SQL Query</Typography>
                                    <Typography ml={2} fontSize={'13px'} color={'grey'}>Loream Ipusum is simply Dummy Test of The <br></br>Printing and Typecasting Industry.Loream Ipusm</Typography>
                                </Stack>
                            </div>
                            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'Azure SQL')} draggable style={{ alignItems: 'center' }}>
                                <TiFlowSwitch style={{ fontSize: '25px', backgroundColor: 'lightgrey', borderRadius: '10px' }} />
                                <Divider  orientation="vertical" flexItem  sx={{height:"60px" ,color:"grey", ml:'10px',borderRightWidth: 3}} />
                                <Stack>
                                    <Typography ml={2} py={1}>Evaluate Data Quality</Typography>
                                    <Typography ml={2} fontSize={'13px'} color={'grey'}>Loream Ipusum is simply Dummy Test of The <br></br>Printing and Typecasting Industry.Loream Ipusm</Typography>

                                </Stack>

                            </div>
                            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'Amazon kines')} draggable style={{ alignItems: 'center' }}>
                                <TiFlowSwitch style={{ fontSize: '25px', backgroundColor: 'lightgrey', borderRadius: '10px' }} />
                                <Divider  orientation="vertical" flexItem  sx={{height:"60px" ,color:"grey" ,ml:'10px',borderRightWidth: 3 }} />
                                <Stack>
                                    <Typography ml={2} py={1}>Filter</Typography>
                                    <Typography ml={2} fontSize={'13px'} color={'grey'}>Loream Ipusum is simply Dummy Test of The <br></br>Printing and Typecasting Industry.Loream Ipusm</Typography>

                                </Stack>
                            </div>
                            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'Oracle SQL')} draggable style={{ alignItems: 'center' }}>
                                <TiFlowSwitch style={{ fontSize: '25px', backgroundColor: 'lightgrey', borderRadius: '10px' }} />
                                <Divider  orientation="vertical" flexItem  sx={{height:"60px" ,color:"grey", ml:'10px',borderRightWidth: 3 }} />
                                <Stack>
                                    <Typography ml={2} py={1}>Rename fields</Typography>
                                    <Typography ml={2} fontSize={'13px'} color={'grey'}>Loream Ipusum is simply Dummy Test of The <br></br>Printing and Typecasting Industry.Loream Ipusm</Typography>
                                </Stack>
                            </div>
                            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'Oracle SQL')} draggable style={{ alignItems: 'center' }}>
                                <TiFlowSwitch style={{ fontSize: '25px', backgroundColor: 'lightgrey', borderRadius: '10px' }} />
                                <Divider  orientation="vertical" flexItem  sx={{height:"60px" ,color:"gray", ml:'10px',borderRightWidth: 3 }} />
                                <Stack>
                                    <Typography ml={2} py={1}>Oracle SQL</Typography>
                                    <Typography ml={2} fontSize={'13px'} color={'grey'}>Loream Ipusum is simply Dummy Test of The <br></br>Printing and Typecasting Industry.Loream Ipusm</Typography>
                                </Stack>
                            </div>


                        </TabPanel>

                        <TabPanel value="3"></TabPanel>
                    </TabContext>

                </Stack>

            )}



            <Fab sx={{ color: 'white', backgroundColor: '#5ea2f8', position: 'absolute', ml: '80%', mt: '30%', "&:hover": { backgroundColor: '#5ea2f8' } }} aria-label="add" onClick={toggleContent} >
                <AddIcon />
            </Fab>



            {/* <Fab sx={{ color: 'white', backgroundColor: '#5ea2f8', mt: '500px' }} aria-label="add" onClick={toggleContent} >
                <AddIcon />
            </Fab> */}


        </>
    );
};
