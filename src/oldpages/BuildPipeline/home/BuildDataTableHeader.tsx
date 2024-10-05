import { Button, InputAdornment, Stack, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

import React, { useState } from 'react'
import { debounce } from 'lodash';
import { Link } from 'react-router-dom';
import BuildPipeLineCreatePopup from '../components/popups/BuildPipeLineCreatePopup';

export default function BuildDataTableHeader() {
    const [searchValue, setSearchValue] = useState('');
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const searchProject = (event: any) => {
        const { value } = event.target;
        setSearchValue(value);
        debouncedSearchProject(value);
    };

    const debouncedSearchProject = debounce((value) => {
        // props.search(value);
    }, 1000);




    return (
        <>
            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} spacing={2}>
                <Stack>
                    <TextField className='my-1 '
                        value={searchValue}
                        onChange={searchProject}
                        id="left-search"
                        fullWidth
                        size='small'
                        placeholder='Search By keywords'
                        variant="outlined"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Stack>
                <Stack>
                    <Button className='bg-dark text-white fw-bold'
                        // component={Link}
                        sx={{ textTransform: 'none' }}
                        // to="/Admin Console/Manage Customer/Add Customer"
                        variant="contained"
                        startIcon={<AddIcon />} onClick={handleOpen}
                    >
                        Create New Pipline
                    </Button>
                </Stack>

            </Stack>
            <BuildPipeLineCreatePopup handleClose={handleClose} open={open} />
        </>
    )
}
