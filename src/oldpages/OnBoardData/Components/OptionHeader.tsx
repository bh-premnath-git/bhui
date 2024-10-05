import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import { Stack, Typography } from '@mui/material';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import ViewWeekOutlinedIcon from '@mui/icons-material/ViewWeekOutlined';
import InsertInvitationOutlinedIcon from '@mui/icons-material/InsertInvitationOutlined';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';

export default function OptionHeader() {
    return (
        <Stack direction={'row'} sx={{ background: '#f9f9f9', px: 1, py: '14px',borderRadius:'4px' }}>
            <Stack direction={'row'} sx={{ borderRight: '1px solid lightgrey',color:'grey' }}>
                <Stack sx={{ textAlign: 'center', m: 'auto', px: 1,
                    '&:hover':{
                        backgroundColor:'#f2f2f8',
                        borderRadius:'5px'
                    }
                 }}>
                    <UndoIcon />
                    <Typography variant="body1">Undo </Typography>
                </Stack>
                <Stack sx={{ textAlign: 'center', m: 'auto', px: 1,
                    '&:hover':{
                        backgroundColor:'#f2f2f8',
                        borderRadius:'5px'
                    }
                 }}>
                    <RedoIcon />
                    <Typography variant="body1">Redo </Typography>
                </Stack>
            </Stack>
            <Stack direction={'row'} sx={{ borderRight: '1px solid lightgrey',color:'grey' }}>
                <Stack sx={{ textAlign: 'center', m: 'auto', px: 2,
                    '&:hover':{
                        backgroundColor:'#f2f2f8',
                        borderRadius:'5px'
                    }
                 }}>
                    <FilterAltOutlinedIcon />
                    <Typography variant="body1">Filter </Typography>
                </Stack>
                <Stack sx={{ textAlign: 'center', m: 'auto', px: 2,
                    '&:hover':{
                        backgroundColor:'#f2f2f8',
                        borderRadius:'5px'
                    }
                 }}>
                    <SwapVertIcon />
                    <Typography variant="body1">Sort </Typography>
                </Stack>
                <Stack sx={{ textAlign: 'center', m: 'auto', px: 2,
                    '&:hover':{
                        backgroundColor:'#f2f2f8',
                        borderRadius:'5px'
                    }
                 }}>
                    <ViewWeekOutlinedIcon sx={{mx:2}} />
                    <Typography variant="body1">Column </Typography>
                </Stack>
            </Stack>

            <Stack direction={'row'} sx={{ borderRight: '1px solid lightgrey',color:'grey' }}>
                <Stack sx={{ textAlign: 'center', m: 'auto', px: 2,
                    '&:hover':{
                        backgroundColor:'#f2f2f8',
                        borderRadius:'5px'
                    }
                 }} >
                    <CalendarTodayRoundedIcon sx={{mx:1}}/>
                    <Typography variant="body1">Format </Typography>
                </Stack>
                <Stack sx={{ textAlign: 'center', m: 'auto', px: 2,
                    '&:hover':{
                        backgroundColor:'#f2f2f8',
                        borderRadius:'5px'
                    }
                 }}>
                    <DateRangeOutlinedIcon sx={{mx:1}}/>
                    <Typography variant="body1">Clean </Typography>
                </Stack>
                <Stack sx={{ textAlign: 'center', m: 'auto', px: 2 ,
                    '&:hover':{
                        backgroundColor:'#f2f2f8',
                        borderRadius:'5px'
                    }
                }}>
                    <InsertInvitationOutlinedIcon sx={{mx:1}}/>
                    <Typography variant="body1">Extract </Typography>
                </Stack>
            </Stack>

            <Stack direction={'row'} sx={{ borderRight: '1px solid lightgrey',color:'grey' }}>
                <Stack sx={{ textAlign: 'center', m: 'auto', px: 2,
                    '&:hover':{
                        backgroundColor:'#f2f2f8',
                        borderRadius:'5px'
                    }
                 }} >
                    <CalendarTodayRoundedIcon sx={{mx:2}} />
                    <Typography variant="body1">Missing </Typography>
                </Stack>
                <Stack sx={{ textAlign: 'center', m: 'auto', px: 2,
                    '&:hover':{
                        backgroundColor:'#f2f2f8',
                        borderRadius:'5px'
                    }
                 }}>
                    <CalendarTodayRoundedIcon sx={{mx:2}}/>
                    <Typography variant="body1">Invalid </Typography>
                </Stack>
                <Stack sx={{ textAlign: 'center', m: 'auto', px: 2,
                    '&:hover':{
                        backgroundColor:'#f2f2f8',
                        borderRadius:'5px'
                    }
                 }}>
                    <CalendarTodayRoundedIcon  sx={{mx:3}}/>
                    <Typography variant="body1">Duplicates </Typography>
                </Stack>
                <Stack sx={{ textAlign: 'center', m: 'auto', px: 2 ,
                    '&:hover':{
                        backgroundColor:'#f2f2f8',
                        borderRadius:'5px'
                    }
                }}>
                    <CalendarTodayRoundedIcon sx={{mx:1}}/>
                    <Typography variant="body1">Outliers </Typography>
                </Stack>
            </Stack>

            <Stack direction={'row'} sx={{ borderRight: '1px solid lightgrey',color:'grey' }}>
                <Stack sx={{ textAlign: 'center', m: 'auto', px: 2,
                    '&:hover':{
                        backgroundColor:'#f2f2f8',
                        borderRadius:'5px'
                    }
                 }} >
                    <CalendarTodayRoundedIcon />
                    <Typography variant="body1">Split </Typography>
                </Stack>
                <Stack sx={{ textAlign: 'center', m: 'auto', px: 2,
                    '&:hover':{
                        backgroundColor:'#f2f2f8',
                        borderRadius:'5px'
                    }
                 }}>
                    <CalendarTodayRoundedIcon sx={{mx:1}}/>
                    <Typography variant="body1">Merge </Typography>
                </Stack>
                <Stack sx={{ textAlign: 'center', m: 'auto', px: 2,
                    '&:hover':{
                        backgroundColor:'#f2f2f8',
                        borderRadius:'5px'
                    }
                 }}>
                    <CalendarTodayRoundedIcon />
                    <Typography variant="body1">Create </Typography>
                </Stack>
            </Stack>
            <Stack direction={'row'} sx={{ borderRight: '1px solid lightgrey',color:'grey' }}>
                <Stack sx={{ textAlign: 'center', m: 'auto', px: 2,
                    '&:hover':{
                        backgroundColor:'#f2f2f8',
                        borderRadius:'5px'
                    }
                 }}>
                    <CalendarTodayRoundedIcon sx={{mx:2}}/>
                    <Typography variant="body1">Functions </Typography>
                </Stack>
                <Stack sx={{ textAlign: 'center', m: 'auto', px: 2 ,
                    '&:hover':{
                        backgroundColor:'#f2f2f8',
                        borderRadius:'5px'
                    }
                }}>
                    <CalendarTodayRoundedIcon sx={{mx:3}} />
                    <Typography variant="body1">Conditions </Typography>
                </Stack>
            </Stack>
            <Stack direction={'row'} sx={{color:'grey'}}>
                <Stack sx={{ textAlign: 'center', m: 'auto', px: 2,
                    '&:hover':{
                        backgroundColor:'#f2f2f8',
                        borderRadius:'5px'
                    }
                 }}>
                    <CalendarTodayRoundedIcon sx={{mx:1}}/>
                    <Typography variant="body1">Unnest </Typography>
                </Stack>
                <Stack sx={{ textAlign: 'center', m: 'auto', px: 2,
                    '&:hover':{
                        backgroundColor:'#f2f2f8',
                        borderRadius:'5px'
                    }
                 }}>
                    <CalendarTodayRoundedIcon />
                    <Typography variant="body1">Pivot </Typography>
                </Stack>
            </Stack>

        </Stack>
    )
}