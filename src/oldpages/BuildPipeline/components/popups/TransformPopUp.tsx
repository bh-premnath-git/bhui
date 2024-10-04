import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, IconButton, MenuItem, OutlinedInput, Select, SelectChangeEvent, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { IoAddCircleOutline } from "react-icons/io5";
import { GoTrash } from "react-icons/go";
import Footer from "../Footer";


export default function TransformPopUp({isOpen,onClose,nodeData}) {
    const [occurance, setOccurance] = useState('');
    const [occurance1, setOccurance1] = useState('');
    const [occurance2, setOccurance2] = useState('');
    const [occurance3, setOccurance3] = useState('');

    const handleChange = (event: SelectChangeEvent) => {
        setOccurance(event.target.value as string);
    };
    const handleChange1 = (event: SelectChangeEvent) => {
        setOccurance1(event.target.value as string);
    };
    const handleChange2 = (event: SelectChangeEvent) => {
        setOccurance2(event.target.value as string);
    };
    const handleChange3 = (event: SelectChangeEvent) => {
        setOccurance3(event.target.value as string);
    };



    const handleClickOpen = () => {
        // setOpen(true);
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <div>
            
            <Dialog
                open={isOpen}
                onClose={handleClose}
                sx={{
                    '& .MuiDialog-paper': {
                        minWidth: '54%',
                        height: '55%',
                    },
                }}
            >
                <DialogTitle>
                    <h6>Transform1</h6>
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'black',
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Stack>
                        <Stack direction={'row'} spacing={2}>
                            <Stack>
                                <Typography>Operation<span style={{ color: 'red' }}>*</span></Typography>
                                <Select
                                    fullWidth
                                    value={occurance}
                                    onChange={handleChange}
                                    displayEmpty
                                    input={<OutlinedInput />}
                                    sx={{
                                        width: '280px', 
                                        height: '40px', 
                                        '& .MuiSelect-select': {
                                            height: '40px', 
                                            display: 'flex',
                                            alignItems: 'center',
                                            paddingTop: '0px', 
                                            paddingBottom: '0px',
                                            color: 'gray', 
                                        },
                                        '& .MuiOutlinedInput-root': {
                                            height: '40px',
                                            '& .MuiInputBase-input': {
                                                height: '100%',
                                                color: 'gray', 
                                            },
                                            '& fieldset': {
                                                borderColor: 'gray', 
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'gray', 
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'gray', 
                                            },
                                        },
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                maxHeight: 200, 
                                                width: '280px', 
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem
                                        value=''
                                        disabled
                                        sx={{
                                            color: 'gray', 
                                        }}
                                    >
                                        Select Operation
                                    </MenuItem>
                                    <MenuItem value={20}>Daily</MenuItem>
                                    <MenuItem value={30}>Weekly</MenuItem>
                                    <MenuItem value={40}>Monthly</MenuItem>
                                    <MenuItem value={50}>Yearly</MenuItem>
                                </Select>

                            </Stack>
                            <Stack>
                                <Typography>Old Column Name<span style={{ color: 'red' }}>*</span></Typography>
                                <Select
                                    fullWidth
                                    value={occurance1}
                                    onChange={handleChange1}
                                    displayEmpty
                                    input={<OutlinedInput />}
                                    sx={{
                                        width: '280px', 
                                        height: '40px', 
                                        '& .MuiSelect-select': {
                                            height: '40px', 
                                            display: 'flex',
                                            alignItems: 'center',
                                            paddingTop: '0px', 
                                            paddingBottom: '0px',
                                            color: 'gray', 
                                        },
                                        '& .MuiOutlinedInput-root': {
                                            height: '40px', 
                                            '& .MuiInputBase-input': {
                                                height: '100%',
                                                color: 'gray', 
                                            },
                                            '& fieldset': {
                                                borderColor: 'gray', 
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'gray', 
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'gray', 
                                            },
                                        },
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                maxHeight: 200,
                                                width: '280px', 
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem
                                        value=''
                                        disabled
                                        sx={{
                                            color: 'gray', 
                                        }}
                                    >
                                       Select Old Column
                                    </MenuItem>
                                    <MenuItem value={20}>Daily</MenuItem>
                                    <MenuItem value={30}>Weekly</MenuItem>
                                    <MenuItem value={40}>Monthly</MenuItem>
                                    <MenuItem value={50}>Yearly</MenuItem>
                                </Select>

                            </Stack>
                            <Stack>
                                <Typography>New Column Name<span style={{ color: 'red' }}>*</span></Typography>
                                <TextField
                                    sx={{
                                        width: '280px',
                                        '& .MuiInputBase-input': {
                                            height: '7px',
                                        },
                                    }}
                                />

                            </Stack>
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="center"
                                sx={{ height: '100px', mt: 2 }}
                            >
                                <IoAddCircleOutline size={25} color="green" />
                            </Stack>
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="center"
                                sx={{ height: '100px', mt: 2 }}
                            >
                                <GoTrash size={20} color="red" />

                            </Stack>
                        </Stack>
                        <Stack direction={'row'} spacing={2}>
                            <Stack>
                                <Typography>Operation<span style={{ color: 'red' }}>*</span></Typography>
                                <Select
                                    fullWidth
                                    value={occurance2}
                                    onChange={handleChange2}
                                    displayEmpty
                                    input={<OutlinedInput />}
                                    sx={{
                                        width: '280px', 
                                        height: '40px', 
                                        '& .MuiSelect-select': {
                                            height: '40px', 
                                            display: 'flex',
                                            alignItems: 'center',
                                            paddingTop: '0px', 
                                            paddingBottom: '0px',
                                            color: 'gray', 
                                        },
                                        '& .MuiOutlinedInput-root': {
                                            height: '40px',
                                            '& .MuiInputBase-input': {
                                                height: '100%',
                                                color: 'gray', 
                                            },
                                            '& fieldset': {
                                                borderColor: 'gray', 
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'gray', 
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'gray',
                                            },
                                        },
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                maxHeight: 200, 
                                                width: '280px', 
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem
                                        value=''
                                        disabled
                                        sx={{
                                            color: 'gray', 
                                        }}
                                    >
                                        Select Operation
                                    </MenuItem>
                                    <MenuItem value={20}>Daily</MenuItem>
                                    <MenuItem value={30}>Weekly</MenuItem>
                                    <MenuItem value={40}>Monthly</MenuItem>
                                    <MenuItem value={50}>Yearly</MenuItem>
                                </Select>

                            </Stack>
                            <Stack>
                                <Typography>New Column<span style={{ color: 'red' }}>*</span></Typography>
                                <TextField
                                    sx={{
                                        width: '280px',
                                        '& .MuiInputBase-input': {
                                            height: '7px',
                                        },
                                    }}
                                />

                            </Stack>
                            <Stack>
                                <Typography>Expression<span style={{ color: 'red' }}>*</span></Typography>
                                <TextField
                                    sx={{
                                        width: '280px',
                                        '& .MuiInputBase-input': {
                                            height: '7px',
                                        },
                                    }}
                                />

                            </Stack>
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="center"
                                sx={{ height: '100px' }}
                            >
                                <IoAddCircleOutline size={25} color="green" />
                            </Stack>
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="center"
                                sx={{ height: '100px' }}
                            >
                                <GoTrash size={20} color="red" />

                            </Stack>
                        </Stack>
                        <Stack direction={'row'} spacing={2}>
                            <Stack>
                                <Typography>Operation<span style={{ color: 'red' }}>*</span></Typography>
                                <Select
                                    fullWidth
                                    value={occurance3}
                                    onChange={handleChange3}
                                    displayEmpty
                                    input={<OutlinedInput />}
                                    sx={{
                                        width: '280px', 
                                        '& .MuiSelect-select': {
                                            height: '40px', 
                                            display: 'flex',
                                            alignItems: 'center',
                                            paddingTop: '0px', 
                                            paddingBottom: '0px',
                                            color: 'gray', 
                                        },
                                        '& .MuiOutlinedInput-root': {
                                            height: '40px', 
                                            '& .MuiInputBase-input': {
                                                height: '100%',
                                                color: 'gray', 
                                            },
                                            '& fieldset': {
                                                borderColor: 'gray', 
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'gray', 
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'gray',
                                            },
                                        },
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                maxHeight: 200, 
                                                width: '280px', 
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem
                                        value=''
                                        disabled
                                        sx={{
                                            color: 'gray', 
                                        }}
                                    >
                                        Select Operation
                                    </MenuItem>
                                    <MenuItem value={20}>Daily</MenuItem>
                                    <MenuItem value={30}>Weekly</MenuItem>
                                    <MenuItem value={40}>Monthly</MenuItem>
                                    <MenuItem value={50}>Yearly</MenuItem>
                                </Select>
                            </Stack>
                            <Stack>
                                <Typography>New Column<span style={{ color: 'red' }}>*</span></Typography>
                                <TextField
                                    sx={{
                                        width: '280px',
                                        '& .MuiInputBase-input': {
                                            height: '7px',
                                        },
                                    }}
                                />

                            </Stack>
                            <Stack>
                                <Typography>Expression<span style={{ color: 'red' }}>*</span></Typography>
                                <TextField
                                    sx={{
                                        width: '280px',
                                        '& .MuiInputBase-input': {
                                            height: '7px',
                                        },
                                    }}
                                />

                            </Stack>
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="center"
                                sx={{ height: '100px' }}
                            >
                                <IoAddCircleOutline size={25} color="green" />
                            </Stack>
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="center"
                                sx={{ height: '100px' }}
                            >
                                <GoTrash size={20} color="red" />

                            </Stack>
                        </Stack>


                    </Stack>

                </DialogContent>
                <DialogActions

                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '25px',
                        
                    }}
                >
                    <Stack direction={'row'} spacing={2}>
                        <Button onClick={handleClose} sx={{
                            color: 'black', border: '1px solid black', width: '190px', textTransform: 'none', '&:hover': {
                                backgroundColor: 'transparent',
                                border: '1px solid black',

                            },
                        }}>
                            Close
                        </Button>
                        <Button sx={{
                            color: 'white', backgroundColor: 'black', width: '190px', textTransform: 'none', '&:hover': {
                                backgroundColor: 'black',

                            }, height: '43px'
                        }}>
                            Save
                        </Button>
                    </Stack>
                </DialogActions>
            </Dialog>
        </div>
    );
}