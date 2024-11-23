import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Drawer, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { IoClose, IoFilterSharp } from 'react-icons/io5'
import { FiFilter } from 'react-icons/fi';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { FaSearch } from 'react-icons/fa';
import CustomTable, { generateColumnsFromData } from '@/common/CustomTable';
import LogsPage from './LogsPage';
import AddFilterPopUp from './AddFilterPopUp';
import AddSortPopUp from './AddSortPopUp';
import { FlexibleTable } from '../Tabel';
import { downloadCSV } from '@/lib/utils';
export default function PipeLinePopUp({ open, handleClose,transformData }:any) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [isFullScreen, setIsFullScreen] = React.useState(false);
    const [openFilter, setOpenFilter] = React.useState(false);
    const [openSort, setOpenSort] = React.useState(false);

    const handleFilterOpen = () => {
        setOpenFilter(true);
    };

    const handleFilterClose = () => {
        setOpenFilter(false);
    };

    const handleSortOpen = () => {
        setOpenSort(true);
    };

    const handleSortClose = () => {
        setOpenSort(false);
    };
    useEffect(() => {
        console.log(transformData)
    }, [transformData]);
    

    
    const columns: any = generateColumnsFromData(transformData, ['']);

    const handleClick = () => {
        // toggleDrawer(true)
        setIsExpanded(!isExpanded);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth='xl'
        >

            {!isExpanded && (<>
                <DialogTitle id="alert-dialog-title" sx={{ pb: 0 }}>
                    <Stack direction={'row'} justifyContent={'space-between'}>
                        <Stack>Test_pipeline 1 (out)</Stack>
                        <Stack onClick={handleClose}><IoClose /></Stack>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{
                    position: 'relative'
                }}>
                    <DialogContentText id="alert-dialog-description">
                        <Stack direction={'row'} justifyContent={'space-between'} sx={{ mb: 1 }}>
                            <Stack direction={'row'} spacing={2} >
                                <Stack onClick={handleFilterOpen} sx={{ my: 2, fontWeight: 600 }} color={'black'} direction={'row'} spacing={2} alignItems={'center'}><FiFilter className='mx-2' size={18} color='black' /> Filter</Stack>
                                <Stack onClick={handleSortOpen} sx={{ my: 2, fontWeight: 600 }} color={'black'} direction={'row'} spacing={2} alignItems={'center'}><IoFilterSharp className='mx-2' size={18} color='black' /> Sort</Stack>
                            </Stack>
                            <div className="dropdown" onClick={()=>downloadCSV(transformData)}>
                                <img src="/assets/buildPipeline/downArrow.png" alt="" />
                            </div>
                        </Stack>
                        <Stack style={{ minWidth: '1200px' }}>
                            <CustomTable columns={columns} data={transformData} />
                            {/* <FlexibleTable columns={transformedData} data={data} isAction={false} isSearch={false} /> */}
                        </Stack>
                    </DialogContentText>
                </DialogContent>
                {/* <DialogActions>
                    <>
                        <Button
                            onClick={handleClick}
                            endIcon={!isExpanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                            sx={{
                                textTransform: 'none',
                                border: '1px solid gray',
                                color: 'black',
                                '&:hover': {
                                    backgroundColor: 'black',
                                    color: 'white',
                                    border: '1px solid gray',
                                },
                            }}
                        >
                            Data Preview
                        </Button>

                    </>
                </DialogActions> */}
            </>)} 

            <AddFilterPopUp handleFilterClose={handleFilterClose} openFilter={openFilter} />
            <AddSortPopUp handleSortClose={handleSortClose} openSort={openSort} />

            {isExpanded && (<>
                <Stack style={{ minWidth: '1200px' }} sx={{ p: 2 }}>
                    <Stack direction={'row'} justifyContent={'space-between'}>
                        <Stack sx={{ fontWeight: 600 }}>Pipeline Name : Test_pipeline 1 (out)</Stack>
                        <Stack direction={'row'} spacing={2} alignContent={'center'} alignItems={'center'}>
                            <TextField
                                size={'small'}
                                type={'text'}
                                placeholder={'Search By Keywords'}
                                variant="outlined"
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FaSearch />
                                        </InputAdornment>
                                    ),
                                }}

                            />
                            <div className="dropdown">
                                <img className="dropdown-toggle" src="/assets/buildPipeline/downArrow.png" alt=""
                                    width={30} />
                                
                            </div>
                            <Stack onClick={handleClose}><IoClose /></Stack>
                        </Stack>
                    </Stack>
                    <Stack sx={{ fontWeight: 600 }}>Showing All Logs</Stack>

                    <LogsPage drawerHeight={'90%'} />
                </Stack>
            </>)}


        </Dialog>)
}
