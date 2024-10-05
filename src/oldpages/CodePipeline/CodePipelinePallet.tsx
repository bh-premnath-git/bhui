import { Card, Paper, TextareaAutosize, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";


export default function CodePipelinePallet() {
    return (
        <>
            <Stack>
                <Typography sx={{fontWeight:'bold'}}>Code Pallet</Typography>

                <Box sx={{ flexGrow: 1 ,py:2}}>
                   
                    <Card sx={{padding:3,borderRadius:'4px',width:'100%'}}>
                    <TextareaAutosize
                                aria-label="empty textarea"
                                placeholder="Start Typing Your Code Here"
                                style={{ width: '100%' ,borderColor:'none'}}
                                minRows={18} // Set the minimum number of rows to 2

                            />

                  </Card>
                </Box>  
            </Stack>


        </>


    );


}