import React from 'react';

import AceEditor from "react-ace";
// import "ace-builds/src-noconflict/mode-sql";
// import "ace-builds/src-noconflict/theme-github";
import { CardContent, Stack, Typography ,Card} from '@mui/material';


const QueryDatasetComponent = () => {
    return (
   
    <Stack mt={4}>
    <Card sx={{height:'30vh',border:'1px solid lightgray'}} elevation={0}>
        <CardContent >
            <Typography sx={{marginLeft:'15px'}}>
                <span style={{color:'green'}}>SELECT</span><br />
                    
                <span style={{paddingLeft:'2%'}}>*</span><br />
                    <span style={{color:'green'}}>FROM</span><br />
                    <span style={{paddingLeft:'4%'}}>'Categories'</span><br/>
                    <span style={{color:'green'}}>LIMIT</span><br />
                    <span style={{color:'blue',paddingLeft:'2%'}}>10</span>
                    
            </Typography>
        </CardContent>
    </Card>
</Stack>
    );
};

export default QueryDatasetComponent;