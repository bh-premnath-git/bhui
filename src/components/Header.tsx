import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { Avatar, Button, Popover, Divider } from '@mui/material';
import BuildPipeLineHeader from '../pages/BuildPipeline/BuildPipeLineHeader';
import FlowHeader from '../pages/ManageFlow/FlowHeader';
import Breadcrumbs from './Breadcrumbs';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface HeaderProps {
  onLogout: () => void;
  step: any;
}

const Header: React.FC<HeaderProps> = ({ onLogout, step }) => {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [tokenData, setTokenData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        setTokenData(decoded);
      }
    };
    fetchData();
  }, []);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openLinkDialog = () => {
    onLogout();
    handleClose();
  };

  const pathsToHideHeader = ['/'];
  const hideHeader = pathsToHideHeader.includes(location.pathname);

  if (hideHeader) return null;
  if (location.pathname === "/Designer/Build-Data-Pipe-Line") return <BuildPipeLineHeader />;
  if (location.pathname === '/Designer/FlowPlayGround') return <FlowHeader />;
  return (
    <header className="flex items-center justify-between px-6 py-1 bg-white shadow-sm">
      <div className="flex items-center space-x-4">
        <img src="/assets/logo/fixLogo.svg" alt="Logo" className="w-12 h-12" />
        <Breadcrumbs currentStep={step} />
      </div>
      <Button
        onClick={handleOpen}
        style={{ 
          color: 'black', 
          textTransform: 'none',
          backgroundColor: 'transparent'
        }}
        endIcon={<ArrowDropDownIcon />}
      >
        <Avatar
          src="/assets/logo/logo.png"
          alt={tokenData?.name}
          style={{ marginRight: '8px', width: '35px', height: '35px' }}
          className="rounded-circle"
        />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium myHeadFont">{tokenData?.email || 'User'}</span>
          <span className="text-xs text-secondary myFont">{tokenData?.name || 'Admin'}</span>
        </div>
      </Button>
      <Popover
        id={Boolean(anchorEl) ? 'user-popover' : undefined}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Button className='mmf' sx={{ mx: 1, color: 'black', textTransform: 'none' }} onClick={openLinkDialog}>LogOut</Button>
        <Divider style={{ color: 'grey' }} />
        <Button className='mmf' sx={{ mx: 1, color: 'black', textTransform: 'none' }} onClick={handleClose}>Edit Profile</Button>
      </Popover>
    </header>
  );
};

export default Header;
