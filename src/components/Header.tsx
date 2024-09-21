
import Breadcrumbs from './Breadcrumbs';
import React, { useEffect, useState } from 'react';
import { Route, useLocation } from 'react-router-dom';
// import { Button, Divider, Popover } from '@mu/material';
// import jwtDecode from 'jwt-decode';
import { jwtDecode } from "jwt-decode";
import Keycloak from 'keycloak-js';
import { httpClient } from '../configration/HttpClient';
import { Button, Divider, Popover } from '@mui/material';
import BuildPipeLineHeader from '../pages/BuildPipeline/BuildPipeLineHeader';
import FlowHeader from '../pages/ManageFlow/FlowHeader';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../Redux/store';

const Header: any = ({ onLogout, step }) => {
    const location = useLocation();
    // const navigate = useNavigate();

    const { pathname } = location;
    const [anchorEl, setAnchorEl] = useState(null);
    const [openAddLink, setOpenAddLink] = useState(false);
    const [tokenData, setTokenData]: any = useState();
    
    const handleClose1 = () => {
        setAnchorEl(null);
    };
    const open = Boolean(anchorEl);
    const id = open ? 'left-popoverup' : undefined;
    const openLinkDialog1 = async () => {
        onLogout();
        // await sessionStorage.removeItem('token');
        // await sessionStorage.removeItem('authenticated');
        // setOpenAddLink(true)
        // window.location.reload();
    };


    const handleOpen1 = (event: any) => {
        setAnchorEl(event.currentTarget);
    };
    useEffect(() => {
        const fetchData = async () => {
            var token: any = sessionStorage.getItem('token');
            const decoded = jwtDecode(token);
            setTokenData(decoded);
            console.log(decoded)
        };

        fetchData();
    }, []);



    // Define an array of paths where the Header should be hidden
    const pathsToHideHeader = ['/'];

    // Check if the current path is in the array of paths to hide the Header
    const hideHeader = pathsToHideHeader.includes(pathname);

    if (hideHeader) {
        return null; // Return null if the Header should be hidden
    } else if (pathname === "/Designer/Build-Data-Pipe-Line") {
        console.log(pathname)
        return (
            <>
                <BuildPipeLineHeader />
            </>
        )
    }else if (pathname === '/Designer/FlowPlayGround') {
        return (
            <>
                <FlowHeader />
            </>
        )
    } else {
        return (
            <div className='header d-flex justify-content-between'>
                <div className=" d-flex p-2">
                    <img src="/assets/logo/logo.png" alt="" width={50} />
                    <Breadcrumbs currentStep={step} />
                </div>
                <div className='d-flex p-2 mx-4' onClick={handleOpen1} >
                    <img className='rounded-circle' src="/assets/logo/logo.png" alt="" width={35} height={35} />

                    <div>
                        <div className="myHeadFont px-2">{tokenData?.email}</div>
                        <div className="text-secondary myFont px-2">{tokenData?.name}</div>
                    </div>
                </div>
                <Popover
                    elevation={1}
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose1}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                // sx={{ width: 300 }}
                >
                    <Button className='mmf' sx={{ mx: 1, color: 'black', textTransform: 'none' }} onClick={openLinkDialog1} >LogOut</Button><br />
                    <Divider style={{ color: 'grey' }} />
                    <Button className='mmf' sx={{ mx: 1, color: 'black', textTransform: 'none' }}>Edit Profile</Button><br />
                </Popover>

            </div>

        );
    }


};

export default Header;