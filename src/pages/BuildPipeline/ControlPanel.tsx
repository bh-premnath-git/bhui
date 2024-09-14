import React from "react";
import { Tooltip, IconButton, Snackbar, Alert } from "@mui/material";
import { CiPlay1, CiPause1 } from "react-icons/ci";
import CloseIcon from "@mui/icons-material/Close";
import PlayPopUp from "./components/popups/PlayPopUp"; // Adjust this import path accordingly

interface ControlPanelProps {
    isButtonClicked: boolean;
    handleButtonClick: () => void;
    isPopupOpen: boolean;
    closePopup: () => void;
    open1: boolean;
    handleClose1: () => void;
    handleClose1Icon: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
    isButtonClicked,
    handleButtonClick,
    isPopupOpen,
    closePopup,
    open1,
    handleClose1,
    handleClose1Icon,
}) => {
    return (
        <div style={{  display: 'flex', gap: '15px', zIndex: 1000 }}>
            <Tooltip title="Run" placement="bottom">
                <IconButton
                    style={{
                        border: '1px solid gray',
                        borderRadius: '7px',
                        backgroundColor: isButtonClicked ? 'black' : 'transparent',
                    }}
                    onClick={handleButtonClick}
                >
                    <CiPlay1 size={20} style={{ color: isButtonClicked ? 'white' : 'black' }} />
                </IconButton>
            </Tooltip>
            <PlayPopUp isOpen={isPopupOpen} onClose={closePopup} />
            <Snackbar
                open={open1}
                onClose={handleClose1}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity="success"
                    sx={{ width: '100%', backgroundColor: "green", color: 'white', fontWeight: 'bold' }}
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={handleClose1Icon}
                        >
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                    }
                >
                    Job Succeeded
                </Alert>
            </Snackbar>

            <Tooltip title="Pause" placement="bottom">
                <IconButton style={{ border: '1px solid gray', borderRadius: '7px' }}>
                    <CiPause1 size={20} color="gray" />
                </IconButton>
            </Tooltip>
        </div>
    );
};

export default ControlPanel;
