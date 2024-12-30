import {
    Box, Button, ButtonGroup, Container, Paper, Grid, Stack, Typography, Modal,
    Dialog, DialogActions, DialogContent, TextField, IconButton, Popover,
} from "@mui/material";
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import ClearIcon from "@mui/icons-material/Clear";
import BorderColorIcon from '@mui/icons-material/BorderColor';
import React, { useState, useEffect } from "react";
import SearchIcon from '@mui/icons-material/Search';
import SchemaTable from "./SchemaTable";
import OnboardTaggingStep from "./OnboardTaggingStep";
import PreviewTable from "./PreviewTable";
import { ReaderOptionsForm } from "./ReaderOptionsForm";
import { ApiService } from "@/services/apiServices";

export default function OrderPopUp({ isOpen, onClose, source }: any) {
    const [selected, setSelected] = React.useState(0);
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const [initialData, setInitialData] = useState(null);
    const handleClick1 = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose2 = () => {
        setAnchorEl(null);
    };
    useEffect(() => {
        const fetchSchema = async () => {
            if (source?.connection_config_id) {
                try {
                    const params = {
                        id: source.connection_config_id,
                        offset: 0,
                        limit: 10,
                        order_desc: false
                    };

                    const response = await ApiService(
                        '8011',
                        'get',
                        '/connection_registry/connection_config/list/',
                        null,
                        params,
                        { 'accept': 'application/json' }
                    );
                    if (response && response.length > 0) {
                        // console.log(source.connection_config_id);
                        // console.log(response[0]?.custom_metadata)
                        let initialData = response[0]?.custom_metadata;
                        initialData.sourceId = source.connection_config_id;
                        console.log(initialData)
                        setInitialData(initialData);
                    } else {
                        alert()
                    }
                } catch (error) {
                    console.error('Error fetching schema:', error);
                }
            } else {
                if (source?.data_src_id) {
                    setInitialData({ sourceId: source?.data_src_id })
                }
            }
        };

        fetchSchema();
    }, [source]);
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;


    const handleClick = (index: any) => {
        setSelected(index);
        switch (index) {
            case 0:
                handleSchemaClick();
                break;
            case 1:
                handleTagClick();
                break;
            case 2:
                handlePreviewClick();
                break;
            default:
                break;
        }
    };
    const handleSchemaClick = () => {
        console.log("Schema button clicked");
        // Add your logic for the Schema button here
    };

    const handleTagClick = () => {
        console.log("Tag button clicked");
        // Add your logic for the Tag button here
    };

    const handlePreviewClick = () => {
        console.log("Preview button clicked");
        // Add your logic for the Preview button here
    };
    const handleClose = () => {
        onClose();
    };

    return (
        <>
            <Modal
                open={isOpen}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Container
                    sx={{
                        backgroundColor: 'white',
                        padding: 3,
                        borderRadius: 1,
                        boxShadow: 24,
                        outline: 'none',
                        width: '1000px',
                        height: '800px',
                        maxWidth: 'none',
                        overflow: 'auto'
                    }}
                >
                    <div className="flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-center text-black">
                            <Typography className="font-bold">Orders</Typography>
                            <ClearIcon onClick={handleClose} className="cursor-pointer" />
                        </div>

                        <div className="flex justify-between items-center mt-2">
                            <div className="flex">
                                {['Reader Options', 'Schema', 'Tag', 'Preview'].map((label, index) => (
                                    <button
                                        key={label}
                                        onClick={() => handleClick(index)}
                                        className={`
                    px-6 py-2 text-sm font-medium
                    ${selected === index
                                                ? 'bg-black text-white border-b-2 border-black rounded'
                                                : 'text-gray-600 border-b-2 border-transparent hover:border-gray-300'
                                            }
                    transition-all duration-200
                `}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Popover */}
                            <Popover
                                id={id}
                                open={open}
                                anchorEl={anchorEl}
                                onClose={handleClose2}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                            >
                                <div className="flex flex-col">
                                    <div className="bg-gradient-to-r from-violet-500 via-blue-500 via-purple-500 to-pink-300 text-white">
                                        <p className="p-4">How Can I Help You Today?</p>
                                    </div>
                                    <div className="m-4">
                                        <div className="relative">
                                            <input
                                                autoFocus
                                                type="search"
                                                id="search"
                                                placeholder="Search By Keywords"
                                                className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </Popover>
                        </div>

                        {/* Content Section */}
                        <div className="">
                            {selected === 0 && <ReaderOptionsForm onSubmit={() => { }} onClose={onClose} initialData={initialData} />}
                            {selected === 1 && <SchemaTable initialData={initialData} />}
                            {selected === 2 && <OnboardTaggingStep />}
                            {selected === 3 && <PreviewTable />}
                            {/* {selected === 4 && <PreviewTable />} */}
                        </div>
                    </div>
                </Container>
            </Modal >
        </>
    );
}