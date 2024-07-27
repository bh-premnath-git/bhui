import { Box, Stack } from "@mui/system";
import { useState } from "react";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Divider, IconButton, Paper, Typography } from "@mui/material";
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddCircleIcon from '@mui/icons-material/AddCircle';




export default function CodePipelineTagBar({onClick}) {
    const [open1, setOpen1] = useState(false);

    const handleToggle1 = () => {
        setOpen1(!open1);
        onClick(open1);
        console.log(open1);
       
   };
    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Stack direction={'row'}>
                    <Stack onClick={handleToggle1}>
                        {open1 ? (
                            <ChevronLeftIcon sx={{ border: '1px solid lightgray'}} />
                        ) : (
                            <ChevronRightIcon sx={{ border: '1px solid lightgray' }} />
                        )}
                    </Stack>
                    <Box sx={{ width: open1 ? '300px' : '75px', transition: 'width 0.2s',border:'1px solid lightgray',borderRadius:'5px' ,minHeight:'75vh',textAlign:'center'}}>
                        {open1 ?(
                        <>
                        <Typography sx={{fontWeight:'bold',marginRight:'80%'}}>Tags</Typography>
                        <Stack direction={'row'} sx={{py:2}}>
                        <IconButton sx={{color:'green'}}>
                            <AddCircleIcon />
                        <Typography sx={{color:'green',fontWeight:'bold'}}>ADD TAGS</Typography>

                        </IconButton>
                        </Stack>
                        <Divider />
                        <Typography sx={{fontWeight:'bold',marginRight:'80%',px:1}}>Schedule</Typography>
                        <Stack direction={'row'} sx={{py:2}}>
                        <IconButton sx={{color:'green'}}>
                            <AddCircleIcon />
                        <Typography sx={{color:'green',fontWeight:'bold'}}>ADD Schedule</Typography>

                        </IconButton>
                        </Stack>
                        <Divider />
                        <Typography sx={{fontWeight:'bold',marginRight:'80%',px:1}}>Alerts</Typography>
                        <Stack direction={'row'} sx={{py:2}}>
                        <IconButton sx={{color:'green'}}>
                            <AddCircleIcon />
                        <Typography sx={{color:'green',fontWeight:'bold'}}>ADD Alerts</Typography>

                        </IconButton>
                        </Stack>
                        <Divider />

                       </>
                        ):(
                    <>

                       <IconButton sx={{py:3}}>
                          <LocalOfferIcon />

                       </IconButton>
                       <Divider />
                       <IconButton sx={{py:3}}>
                          <CalendarMonthIcon />

                       </IconButton>
                       <Divider />
                       <IconButton sx={{py:3}}>
                          <WarningAmberIcon />

                       </IconButton>
                       <Divider />
                        </>
                        )}
                    </Box>
                </Stack>
            </Box>

        </>


    );
}