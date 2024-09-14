import { Stack, Typography } from "@mui/material";
import TextArea from "antd/es/input/TextArea";

export default function Codepage() {
    return (
        <>
            <div style={{ position: 'relative', height: '4vh' }}>
                <Stack
                    direction="row"
                    spacing={2}
                    style={{ position: 'absolute', top: 1, right: 30 }}
                >
                    <Typography sx={{textDecoration:'underline',color:'#02CCFE',fontWeight:'bold'}}>Edit Script</Typography>
                </Stack>
            </div>
            <TextArea
                rows={32}
                style={{ border: 'none', outline: 'none',width:'99%' }}

            />


        </>
    );
}