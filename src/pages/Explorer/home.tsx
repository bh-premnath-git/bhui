import { Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
// import 'ace-builds/src-noconflict/theme-sqlserver'; // Import the SQL Server theme
// import 'ace-builds/src-noconflict/ext-language_tools'; // Import language tools extension
// import 'ace-builds/src-noconflict/theme-github'; // Correct theme name
// import 'ace-builds/src-noconflict/mode-sql';

export default function Home1() {

    return (
        <Stack style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Welcome To Explorer!</Typography>
            <Typography variant="h6" >Get started with <span style={{ color: 'skyblue', textDecoration: 'underline' }}>Sample Data </span>or <span style={{ color: 'skyblue', textDecoration: 'underline' }}>Add your Own Data </span></Typography>
        </Stack>

    )
}