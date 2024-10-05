import { Paper, Stack } from "@mui/material";
import About from "../About";
import PropertiesTable from "./PropertiesTable";

export default function Properties(props:any) {
    return (
        <>

            <Stack direction={'row'} spacing={1}>
                    {/* <Stack sx={{ p: '16px' }}> */}
                        <PropertiesTable />
                    {/* </Stack> */}

                <Paper sx={{ width: '25%', overflow: 'hidden', borderRadius: '4px', border: '1px solid lightgrey' }} elevation={0}>
                    <Stack sx={{ mt: '4px' }}>
                        <About data={props.data} />
                    </Stack>
                </Paper>

            </Stack>
        </>
    )
}