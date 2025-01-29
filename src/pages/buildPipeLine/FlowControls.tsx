import React, { useState } from 'react';
import {
    BiZoomIn,
    BiZoomOut
} from "react-icons/bi";
import {
    MdOutlineCenterFocusStrong,
    MdOutlineSkipNext,
    MdOutlineStop,
    MdSettings,
    MdTerminal,
    MdAlignHorizontalCenter,
    MdAlignVerticalCenter
} from "react-icons/md";
import { HiOutlinePlay } from 'react-icons/hi';
import { CircularProgress, Drawer, Box, Typography } from '@mui/material';
import { Terminal } from '@/components/BuildPipeLineComps/LogsPage';
// import SettingsModal from '@/components/CustomToolbar/SettingsModal';

// Add new interface for logs
interface Log {
    timestamp: string;
    message: string;
    level: 'info' | 'error' | 'warning';
}

interface FlowControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onCenter: () => void;
    handleRunClick: () => void;
    onStop: () => void;
    onNext: () => void;
    isPipelineRunning: boolean;
    isLoading: boolean;
    pipelineConfig: any;
    logs?: Log[]; // Add this prop to receive logs
    onAlignHorizontal: () => void;
    onAlignVertical: () => void;
}

export const FlowControls: React.FC<FlowControlsProps> = ({
    onZoomIn,
    onZoomOut,
    onCenter,
    handleRunClick,
    onStop,
    onNext,
    isPipelineRunning,
    isLoading,
    pipelineConfig,
    logs = [], // Default to empty array
    onAlignHorizontal,
    onAlignVertical
}) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isLogsOpen, setIsLogsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);

    const handleSettingsClick = () => {
        setIsSettingsOpen(true);
    };

    const handleCloseSettings = () => {
        setIsSettingsOpen(false);
    };

    const handleLogsClick = () => {
        setIsLogsOpen(true);
    };

    const handleCloseLogs = () => {
        setIsLogsOpen(false);
    };

    const handleMinimize = () => {
        setIsMinimized(true);
        setIsMaximized(false);
        // Animate to a smaller height
        const drawerPaper = document.querySelector('.MuiDrawer-paper') as HTMLElement;
        if (drawerPaper) {
            drawerPaper.style.height = '40px';
        }
    };

    const handleMaximize = () => {
        setIsMinimized(false);
        setIsMaximized(!isMaximized);
        // Toggle between full screen and default height
        const drawerPaper = document.querySelector('.MuiDrawer-paper') as HTMLElement;
        if (drawerPaper) {
            drawerPaper.style.height = isMaximized ? '40%' : '100%';
        }
    };

    const handleRestore = () => {
        setIsMinimized(false);
        const drawerPaper = document.querySelector('.MuiDrawer-paper') as HTMLElement;
        if (drawerPaper) {
            drawerPaper.style.height = '40%';
        }
    };

    const actions = [
        { key: 'zoom-in', icon: BiZoomIn, handler: onZoomIn },
        { key: 'zoom-out', icon: BiZoomOut, handler: onZoomOut },
        { key: 'center', icon: MdOutlineCenterFocusStrong, handler: onCenter },
        { key: 'align-horizontal', icon: MdAlignHorizontalCenter, handler: onAlignHorizontal },
        { key: 'align-vertical', icon: MdAlignVerticalCenter, handler: onAlignVertical },
        { key: 'run', icon: HiOutlinePlay, handler: handleRunClick },
        { key: 'stop', icon: MdOutlineStop, handler: onStop },
        { key: 'next', icon: MdOutlineSkipNext, handler: onNext },
        { key: 'logs', icon: MdTerminal, handler: handleLogsClick },
    ];

    return (
        <>
            <div className="flex items-center bg-white rounded-xl shadow-lg border border-gray-100 p-1.5 gap-1">
                {actions.map((action, index) => (
                    <React.Fragment key={action.key}>
                        {index > 0 && <div className="w-px h-6 bg-gray-200" />}
                        <button
                            onClick={action.handler}
                            className="group relative flex items-center justify-center w-8 h-8 rounded-lg
                                     hover:bg-gray-900 active:bg-gray-800 
                                     transition-all duration-200 ease-in-out"
                            title={action.key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            disabled={action.key === 'run' && isLoading || action.key === 'next' && !isPipelineRunning}
                        >
                            <span className="absolute -top-10 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100">
                                {action.key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                <span className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 rotate-45 w-2 h-2 bg-gray-800" />
                            </span>
                            <span className="text-gray-700 group-hover:text-white transition-colors">
                                <action.icon
                                    size={20}
                                    className={action.key === 'stop' && isPipelineRunning ? 'text-red-500' : ''}
                                />
                            </span>
                        </button>
                    </React.Fragment>
                ))}
            </div>
            <Terminal
                isOpen={isLogsOpen}
                onClose={handleCloseLogs}
                title="Pipeline Logs"
                logs={logs}
            />
        </>
    );
};