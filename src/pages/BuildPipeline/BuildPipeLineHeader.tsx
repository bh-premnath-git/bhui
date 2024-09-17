import { Button, ButtonGroup, FormControl, FormControlLabel, FormLabel, InputAdornment, Radio, RadioGroup, Stack, Switch, TextField, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import React, { useState } from 'react';
import { RiArrowLeftSLine } from "react-icons/ri";
// import '../HeaderBig.css'
import { IoMdSettings } from "react-icons/io";
import { BsFillPencilFill } from 'react-icons/bs';
import { GoDotFill } from "react-icons/go";
import { FiCornerDownLeft } from 'react-icons/fi';
import SchedulePipline from './components/SchedulePipline';
import ConfigDailog from './components/ConfigDailog';
import { useNavigate } from 'react-router-dom';
import Codepage from './components/CodePage';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Redux/store';
import { toggle } from '../../Redux/ToggleSlice';
import CreateCluster from './CreateCluster';
import CommonDialog from '../../components/common-dialoge';

function BuildPipeLineHeader() {
    const [arrow, setArrow] = useState(false)
    const handleArrow = () => {
        setArrow(!arrow)
    }
    const [open, setOpen] = useState(false)
    const handleClose = () => {
        setOpen(false)
    }
    const [openConfig, setOpenConfig] = useState(false);
    const handleConfig = () => {
        setOpenConfig(false)
    }
    const isToggled = useSelector((state: RootState) => state.toggle.isToggled);
    const dispatch = useDispatch();
    const [cluster, setCluster] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openSuccess, setOpenSuccess] = useState(false);
    function closeDialog() {
        setOpenSuccess(false)
        setOpenDialog(!openDialog)
    }
    return (
        <div className='d-flex flex-row align-items-center border-bottom py-2 bg-light' style={{ position: 'relative' }}>
            <div className="mx-4">
                <img src="/assets/logo/logo.png" alt="" width={50} />

            </div>
            <RiArrowLeftSLine className='border rounded px-2' style={{ height: '40px', width: '40px' }} />
            <Tooltip title={'Saved 15s ago'} placement='bottom'>
                <img src="/assets/buildPipeline/image.png" alt="" className='mx-3' style={{ height: '35px', width: '35px' }} data-bs-toggle="popover" data-bs-trigger="hover focus" data-bs-content="Disabled popover" />
            </Tooltip>


            <TextField className='my-1 bg-white rounded'
                // value={searchValue}
                // onChange={searchProject}
                id="left-search"

                size='small'
                placeholder='  Text pipeline'
                variant="outlined"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="end" >
                            {!arrow ? <BsFillPencilFill onClick={handleArrow} /> : <FiCornerDownLeft onClick={handleArrow} />}
                        </InputAdornment>
                    ),
                }}
            />
            <div className="dropdown px-2 " style={{ paddingTop: '0px' }}>
                <button className="btn btn-dark dropdown-toggle mx-1 mt-0" style={{ paddingTop: '7px', paddingBottom: '7px' }}
                    onClick={() => setOpenDialog(!openDialog)}>
                    Assign Cluster
                </button>

                <ul style={{ width: '400px', height: '522px', paddingLeft: '30px', paddingTop: '35px', position: 'absolute', zIndex: 0 }}>
                    {openDialog && (
                        <div className="shadow p-2" style={{ borderRadius: '8px', background: 'white' }}>
                            {!cluster ? (<div>
                                <h5 className='fw-bold fs-6'>Active Clustres Created by me</h5>
                                <li className='d-flex'><a className="dropdown-item fs-6 " href="#" >Clusters Type 1</a> <GoDotFill style={{ alignSelf: 'center' }} className='text-success me-4' /></li>
                                <li className='d-flex'><a className="dropdown-item fs-6 " href="#">Clusters Type 2</a><GoDotFill style={{ alignSelf: 'center' }} className='text-success me-4' /> </li>
                                <li className='d-flex'><a className="dropdown-item fs-6" href="#">Clusters Type 3</a><GoDotFill style={{ alignSelf: 'center' }} className='text-success me-4' /></li>
                                <li className='d-flex'><a className="dropdown-item fs-6" href="#">Clusters Type 4</a><GoDotFill style={{ alignSelf: 'center' }} className='text-success me-4' /></li>
                                <li className='d-flex'><a className="dropdown-item fs-6" href="#">Clusters Type 5</a><GoDotFill style={{ alignSelf: 'center' }} className='text-success me-4' /></li>
                                <li className='d-flex'><a className="dropdown-item fs-6  pb-4" href="#">Clusters Type 6</a><GoDotFill style={{ alignSelf: 'center' }} className='text-success me-4' /></li>
                                <h4 className='mx-1 my-2 fw-bold pt-2 fs-6 border-top'>Add New Cluster</h4>
                                <div >
                                    <FormControl className='mx-3'>
                                        <RadioGroup
                                            aria-labelledby="demo-radio-buttons-group-label"
                                            defaultValue="female"
                                            name="radio-buttons-group"
                                        >
                                            <div className='d-flex'>

                                                <FormControlLabel value="Small" control={<Radio color='success' />} label="Small" /> <p className='mb-0 mt-2 me-3'>8GB</p> <input type="email" className="form-control ms-3" style={{ width: '180px', height: '35px' }} id="exampleFormControlInput1" placeholder="Add Cluster Name"></input>
                                            </div>
                                            <div className='d-flex'>

                                                <FormControlLabel value="Medium" control={<Radio color='success' />} label="Medium" /> <p className='mb-0 mt-2 me-2'>24GB</p>  <input type="email" className="form-control" style={{ width: '180px', height: '35px' }} id="exampleFormControlInput1" placeholder="Add Cluster Name"></input>
                                            </div>
                                            <div className='d-flex'>

                                                <FormControlLabel value="Large" control={<Radio color='success' />} label="Large" /> <p className='mb-0 mt-2 me-2'>48GB</p>  <input type="email" className="form-control ms-3" style={{ width: '180px', height: '35px' }} id="exampleFormControlInput1" placeholder="Add Cluster Name"></input>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                </div>
                                <div className="d-flex justify-content-center">
                                    <button className="btn btn-dark" onClick={() => setCluster(!cluster)}>Add</button>
                                </div>
                            </div>) : (<>
                                <CreateCluster close={() => setOpenSuccess(true)} />
                                <CommonDialog open={openSuccess} onClose={closeDialog}
                                    imageUrl='/assets/buildPipeline/Success.png'
                                    title='Your cluster has been successfully attached' />
                            </>)}
                        </div>
                    )}

                </ul>
                <div>
                </div>
            </div>
            {/* <ButtonGroup variant="text" aria-label="Basic button group"
                className='mx-3 bg-white rounded border' style={{ height: '40px' }}>
                <Button className='custom-hover-button border-end btn btn-outline-dark' sx={{
                    backgroundColor: '#fff', color: 'black',
                    '&:hover': {
                        backgroundColor: '#000',
                        color: '#fff'
                    }
                }} style={{ textTransform: 'none' }} onClick={() => { setOpenConfig(true) }}>Config</Button>
                <Button className='custom-hover-button ' style={{ textTransform: 'none' }} sx={{
                    backgroundColor: '#fff', color: 'black',
                    '&:hover': {
                        backgroundColor: '#000',
                        color: '#fff'
                    }
                }}
                    onClick={() => { setOpen(true) }}>Schedule</Button>
            </ButtonGroup> */}
            <div className='bg-white text-center rounded' style={{ width: '30px', height: '30px' }}>
                <IoMdSettings />

            </div>
            <div className="float-end px-4" style={{ marginLeft: 'auto' }}>
                <Stack direction={'row'} spacing={2} alignContent={'center'} alignItems={'center'}> 
                    Visual
                    <Switch color='success' onChange={() => dispatch(toggle())} checked={isToggled} />
                    Code
                </Stack>
            </div>

            {/* <div className="form-check form-switch" style={{ marginLeft: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label className="form-check-label" style={{ marginRight: '50px' }}>
                        Visual
                    </label>
                    <input className="form-check-input inswitch bg-success" type="checkbox" role="button" id="flexSwitchCheckChecked"
                        onChange={() => dispatch(toggle())}
                        checked={isToggled} style={{ height: '30px', width: '45px' }} />
                    <label className="form-check-label mx-1" >
                        Code
                    </label>
                </div>
            </div> */}
            {open && (
                <SchedulePipline handleClose={handleClose} open={open} />
            )}
            {openConfig && (
                <ConfigDailog handleCloseConfig={handleConfig} openConfig={openConfig} />
            )
            }
        </div>
    );
}

export default BuildPipeLineHeader;