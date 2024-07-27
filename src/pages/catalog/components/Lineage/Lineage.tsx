import { Stack, Paper } from "@mui/material";
import About from "../About";
import FiltersDtl from "./filter";
import LineageDtl from "./LineageDtl";

export default function Lineage(props:any) {
    return (
        <>

            <Stack direction={'row'} spacing={1}>
                <Paper sx={{ width: '20%', overflow: 'hidden', borderRadius: '4px', border: '1px solid lightgrey' }} elevation={0}>
                    <Stack sx={{ p: '16px' }}>
                        <FiltersDtl />
                    </Stack>
                </Paper>
                <Paper sx={{ width: '60%' }} elevation={0}>
                    <Stack sx={{ p: '16px' }}>
                        <LineageDtl />
                    </Stack>
                </Paper>
                <Paper sx={{ width: '20%', overflow: 'hidden', borderRadius: '4px', border: '1px solid lightgrey' }} elevation={0}>
                    <Stack sx={{ mt: '4px' }}>
                        <About data={props.data} />

                    </Stack>
                </Paper>

            </Stack>
        </>
    )
}