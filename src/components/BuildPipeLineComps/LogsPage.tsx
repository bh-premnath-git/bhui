import React, { useState } from 'react';
import { Drawer, Box, Typography } from '@mui/material';

interface Log {
    timestamp: string;
    message: string;
    level: 'info' | 'error' | 'warning';
}

interface TerminalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    terminalLogs?: Log[];
    proplesLogs?: Log[];
    defaultHeight?: string;
    minHeight?: string;
}

export const Terminal: React.FC<TerminalProps> = ({
    isOpen,
    onClose,
    title = 'Logs',
    terminalLogs = [],
    proplesLogs = [],
    defaultHeight = '40%',
    minHeight = '40px'
}) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [activeTab, setActiveTab] = useState<'terminal' | 'proples'>('terminal');

    const handleMinimize = () => {
        setIsMinimized(true);
        setIsMaximized(false);
        const drawerPaper = document.querySelector('.MuiDrawer-paper') as HTMLElement;
        if (drawerPaper) {
            drawerPaper.style.height = minHeight;
        }
    };

    const handleMaximize = () => {
        setIsMinimized(false);
        setIsMaximized(!isMaximized);
        const drawerPaper = document.querySelector('.MuiDrawer-paper') as HTMLElement;
        if (drawerPaper) {
            drawerPaper.style.height = isMaximized ? defaultHeight : '100%';
        }
    };

    const handleRestore = () => {
        setIsMinimized(false);
        const drawerPaper = document.querySelector('.MuiDrawer-paper') as HTMLElement;
        if (drawerPaper) {
            drawerPaper.style.height = defaultHeight;
        }
    };

    return (
        <Drawer
            anchor="bottom"
            open={isOpen}
            onClose={onClose}
            PaperProps={{
                sx: {
                    height: defaultHeight,
                    bgcolor: '#ffffff',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                    boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.1)',
                    transition: 'height 0.3s ease',
                }
            }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Terminal Header */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        borderBottom: '1px solid #e0e0e0',
                        bgcolor: '#f5f5f5',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                    }}
                >
                    {/* Traffic Light Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: '#ff5f56',
                                border: '1px solid #e0443e',
                                cursor: 'pointer',
                                '&:hover': { opacity: 0.8 },
                            }}
                            onClick={onClose}
                        />
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: '#ffbd2e',
                                border: '1px solid #dea123',
                                cursor: 'pointer',
                                '&:hover': { opacity: 0.8 },
                            }}
                            onClick={isMinimized ? handleRestore : handleMinimize}
                        />
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: '#27c93f',
                                border: '1px solid #1aab29',
                                cursor: 'pointer',
                                '&:hover': { opacity: 0.8 },
                            }}
                            onClick={handleMaximize}
                        />
                    </Box>
                    <Typography 
                        sx={{ 
                            color: '#333',
                            fontSize: '13px',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
                            flex: 1,
                            textAlign: 'center'
                        }}
                    >
                        {title}
                    </Typography>
                </Box>

                {/* Tab Buttons */}
                <Box sx={{ 
                    display: isMinimized ? 'none' : 'flex',
                    borderBottom: '1px solid #e0e0e0',
                    bgcolor: '#f5f5f5',
                }}>
                    <Box
                        onClick={() => setActiveTab('terminal')}
                        sx={{
                            px: 3,
                            py: 1,
                            cursor: 'pointer',
                            borderBottom: activeTab === 'terminal' ? '2px solid #1976d2' : 'none',
                            color: activeTab === 'terminal' ? '#1976d2' : '#666',
                            '&:hover': { bgcolor: '#eee' }
                        }}
                    >
                        Terminal
                    </Box>
                    <Box
                        onClick={() => setActiveTab('proples')}
                        sx={{
                            px: 3,
                            py: 1,
                            cursor: 'pointer',
                            borderBottom: activeTab === 'proples' ? '2px solid #1976d2' : 'none',
                            color: activeTab === 'proples' ? '#1976d2' : '#666',
                            '&:hover': { bgcolor: '#eee' }
                        }}
                    >
                        Proplems
                    </Box>
                </Box>

                {/* Terminal Content */}
                <Box
                    sx={{
                        flex: 1,
                        overflow: 'auto',
                        p: 2,
                        fontFamily: 'SF Mono, Menlo, Monaco, Courier, monospace',
                        fontSize: '13px',
                        lineHeight: '20px',
                        color: '#333',
                        bgcolor: '#ffffff',
                        display: isMinimized ? 'none' : 'block',
                        '&::-webkit-scrollbar': {
                            width: '10px',
                        },
                        '&::-webkit-scrollbar-track': {
                            bgcolor: '#f5f5f5',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            bgcolor: '#ddd',
                            borderRadius: '5px',
                            border: '2px solid #ffffff',
                        },
                    }}
                >
                    {activeTab === 'terminal' ? (
                        terminalLogs.length > 0 ? (
                            terminalLogs.map((log, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        mb: 1,
                                        color: log.level === 'error' ? '#dc3545' :
                                               log.level === 'warning' ? '#ffc107' :
                                               '#28a745',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    <span style={{ color: '#666', marginRight: '8px' }}>{log.timestamp}</span>
                                    <span>{log.message}</span>
                                </Box>
                            ))
                        ) : (
                            <Box sx={{ color: '#666', fontStyle: 'italic' }}>
                                No terminal logs available...
                            </Box>
                        )
                    ) : (
                        proplesLogs.length > 0 ? (
                            proplesLogs.map((log, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        mb: 1,
                                        color: log.level === 'error' ? '#dc3545' :
                                               log.level === 'warning' ? '#ffc107' :
                                               '#28a745',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    <span style={{ color: '#666', marginRight: '8px' }}>{log.timestamp}</span>
                                    <span>{log.message}</span>
                                </Box>
                            ))
                        ) : (
                            <Box sx={{ color: '#666', fontStyle: 'italic' }}>
                                No proples logs available...
                            </Box>
                        )
                    )}
                </Box>
            </Box>
        </Drawer>
    );
};