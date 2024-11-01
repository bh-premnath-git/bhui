import {
    Box, Button, ButtonGroup, Container, Paper, Grid, Stack, Typography, Modal,
    Dialog, DialogActions, DialogContent, TextField, IconButton, Popover,
} from "@mui/material";
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import ClearIcon from "@mui/icons-material/Clear";
import BorderColorIcon from '@mui/icons-material/BorderColor';
import React, { useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
import SchemaTable from "./SchemaTable";
import OnboardTaggingStep from "./OnboardTaggingStep";
import PreviewTable from "./PreviewTable";

export default function OrderPopUp({ isOpen, onClose}:any) {
    const [selected, setSelected] = React.useState(0);
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const handleClick1 = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose2 = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;


    const handleClick = (index:any) => {
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
                        maxWidth: 600
                    }}
                >
                    <Stack direction={"row"} justifyContent={"space-between"} color={"black"}>
                        <Typography className="myHeadFont" fontWeight={"bold"}>Orders</Typography>
                        <ClearIcon onClick={handleClose} style={{ cursor: 'pointer' }} />
                    </Stack>
                    <Stack my={2} direction={"row"} justifyContent={"space-between"}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <ButtonGroup variant="text" aria-label="Basic button group" sx={{ backgroundColor: 'lightgray' }}>
                                {['Schema', 'Tag', 'Preview'].map((label, index) => (
                                    <Button className="myFont"
                                        key={label}
                                        onClick={() => handleClick(index)}
                                        sx={{
                                            backgroundColor: selected === index ? 'black' : '#DBDBDB',
                                            color: selected === index ? 'white' : 'black',
                                            textTransform: 'none', px: 4,
                                            '&:hover': {
                                                backgroundColor: selected === index ? 'black' : '#DBDBDB',
                                                color: selected === index ? 'white' : 'black',
                                            },
                                        }}
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        </Box>
                        {/* <Button
                            className="mmf"
                            variant="contained"
                            sx={{
                                backgroundColor: 'black',
                                textTransform: 'none',
                                px: 1,
                                transition: 'background 0.3s ease',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, violet, blue, purple, lightcoral)',
                                    boxShadow: 'none',
                                },
                            }}
                            onClick={handleClick1}
                        >
                            <BorderColorIcon sx={{ mx: 1 }} />
                            Generate Description
                        </Button> */}

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
                            <Stack sx={{ background: 'linear-gradient(45deg, violet, blue, purple, lightcoral)', color: 'white' }}> <Typography sx={{ p: 2 }}>How Can I Help You Today?</Typography></Stack>
                            <Stack m={2}>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="search"
                                    // label="Search"
                                    type="search"
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Search By Keywords"
                                    InputProps={{
                                        startAdornment: (
                                            <IconButton edge="end" aria-label="search" sx={{ mr: 1 }}>
                                                <SearchIcon />
                                            </IconButton>
                                        ),
                                    }}
                                />
                            </Stack>
                        </Popover>
                    </Stack>
                    <Stack sx={{ marginTop: 2 }}>
                        {selected === 0 && <SchemaTable />}
                        {selected === 1 && <OnboardTaggingStep />}
                        {selected === 2 && <PreviewTable />}
                    </Stack>
                </Container>
            </Modal>
        </>
    );
}