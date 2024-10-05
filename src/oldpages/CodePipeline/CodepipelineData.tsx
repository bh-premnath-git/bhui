import { Button, Grid, IconButton, Stack, Typography } from "@mui/material";
import { PiPencilSimpleLineDuotone } from "react-icons/pi";
import { LiaShareAltSolid } from "react-icons/lia";
import CodePipelineSearchBar from "./CodePipelineSearchBar";
import CodePipelinePallet from "./CodePipelinePallet";
import CodePipelineTagBar from "./CodePipelineTagBar";
import { useState } from "react";



export default function CodePipelineData() {
    // const[expand,setExpand] = useState('');
    // const handleExpand = (card) =>{
    //     console.log('card',card);
    //     setExpand(card)
    // }
    const [expandleft, setExpandleft] = useState(8);
    const [expandright, setExpandright] = useState(8);
    const handleButtonClick = (value) => {
        setExpandleft(value);
        // alert(value)
        // setGridSize1(gridSize1 === 8 ? 6 : 8);

    };
    const handleButtonClick1 = (value1) => {
        setExpandright(value1);
        // alert(value1)
    };
    return (
        <>

            <Stack spacing={2} direction={"row"} justifyContent={'space-between'}>
                <Stack spacing={2} direction={'row'} >
                    <Stack>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '30px' }}>Untitled Job
                            <IconButton>
                                <PiPencilSimpleLineDuotone style={{ color: 'black', fontSize: '35px' }} />
                            </IconButton>
                        </Typography>
                    </Stack>
                </Stack>
                <Stack spacing={2} direction={'row'}>
                    <Stack>
                        <Button sx={{ backgroundColor: "black", color: 'white', '&:hover': { backgroundColor: 'black', color: 'white' } }}> Connect</Button>
                    </Stack>
                    <Stack>
                        <Button sx={{ backgroundColor: "black", color: 'white', '&:hover': { backgroundColor: 'black', color: 'white' } }}> Add Code Cell +</Button>

                    </Stack>
                    <Stack>
                        <Button sx={{ backgroundColor: "black", color: 'white', '&:hover': { backgroundColor: 'black', color: 'white' } }}> Add Text +</Button>

                    </Stack>
                    <Stack>
                        <Button sx={{ backgroundColor: "black", color: 'white', '&:hover': { backgroundColor: 'black', color: 'white' } }}> Run All</Button>

                    </Stack>
                    <Stack>
                        <Button sx={{ backgroundColor: "black", color: 'white', '&:hover': { backgroundColor: 'black', color: 'white' } }}> Save</Button>

                    </Stack>
                    <Stack>
                        <Button sx={{ backgroundColor: "black", color: 'white', height: '36px', '&:hover': { backgroundColor: 'black', color: 'white' } }}>Share
                            <IconButton> <LiaShareAltSolid style={{ color: 'white', fontSize: '25px' }} /></IconButton>
                        </Button>

                    </Stack>
                </Stack>
            </Stack>
            <Grid container xs={12}>
                <Grid item xs={expandleft ? 1 : 3}>
                    <CodePipelineSearchBar onClick={handleButtonClick} />
                </Grid>

                <Grid item xs={expandleft && expandright ? 10 : expandleft || expandright ? 8 : 6}>
                    <CodePipelinePallet />
                </Grid>

                <Grid item xs={expandright ? 1 : 3}>
                    <CodePipelineTagBar onClick={handleButtonClick1} />
                </Grid>
            </Grid>
        </>
    );
}