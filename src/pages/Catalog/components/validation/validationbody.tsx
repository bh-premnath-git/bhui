import { Avatar, Chip, Grid, Stack, Typography, Card, Paper, Box } from "@mui/material";
import { useState } from "react";
import * as React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { Link } from "react-router-dom";
import FileCopyIcon from '@mui/icons-material/FileCopy';
import About from "../About";


export default function ValidationDtl(props) {

    return (
        <>
            <Stack direction={'row'} spacing={2} height={'77vh'}>

                <Card sx={{ width: '100%', borderRadius: '1px', border: '1px solid lightgrey' }} elevation={0}>

                    <ButtonGroup variant="contained" aria-label="Basic button group" sx={{ ml: 4, mt: 4 }}>
                        <Button sx={{ bgcolor: '#e0e2e2', color: 'black' }}>Assertions(0)</Button>
                        <Button>Tests(4)</Button>
                    </ButtonGroup>
                    <Typography variant="h6" mt={4} ml={4}>
                        Test Results
                    </Typography>

                    <Stack width={'100%'} mx={2} my={2}>
                        <Stack direction={'row'} sx={{ borderBottom: 1, borderColor: '#f2f3f5' }}>
                            <Grid item xs={8} sx={{ width: '65%', mx: 2 }}>
                                <Typography variant="subtitle1">
                                    Dataset Has A Classification Glossary Term
                                </Typography>
                                <Typography sx={{ color: '#949494' }}>
                                    <span style={{ color: '#535353' }}>Data Governance | </span>  All Datasets Should Have A Glossary Term Under Classification Node
                                </Typography>
                            </Grid>
                            <Grid item xs={2} sx={{ borderLeft: 1, borderRight: 1, width: '15%', borderColor: '#f2f3f5', my: 1 }}>
                                <Box sx={{ bgcolor: '#fadce1', color: '#dd181d', textAlign: 'center', mx: 6,p:'7px', borderRadius: '5px' }}>
                                    <span style={{ fontSize: '14px' }}>Failling</span>
                                </Box>
                            </Grid>

                            <Grid item xs={2} sx={{ width: '20%' }}>
                                <Link to={''} style={{ color: '#009ad8', }}>
                                    <Stack direction={'row'} mx={6} my={2}>
                                        <FileCopyIcon />
                                        Copy URN
                                    </Stack>
                                </Link>
                            </Grid>

                        </Stack>
                        <Stack direction={'row'} my={1} sx={{ borderBottom: 1, borderColor: '#f2f3f5' }}>
                            <Grid item xs={8} sx={{ width: '65%', mx: 2 }}>
                                <Typography variant="subtitle1">
                                    Dataset Has A Description
                                </Typography>
                                <Typography sx={{ color: '#949494' }}>
                                    <span style={{ color: '#535353' }}>  Metadata Completeness |</span>  All Datasets Should Have A Description
                                </Typography>
                            </Grid>
                            <Grid item xs={2} sx={{ borderLeft: 1, borderRight: 1, width: '15%', borderColor: '#f2f3f5', my: 1 }}>
                            <Box sx={{ bgcolor: '#d0f4e8', color: '#00af55', textAlign: 'center', mx: 6,p:'6px', borderRadius: '5px' }}>
                                    <span style={{ fontSize: '14px' }}>Passing</span>
                                </Box>
                            </Grid>
                            <Grid item xs={2} sx={{ width: '20%' }}>
                                <Link to={''} style={{ color: '#009ad8', }}>
                                    <Stack direction={'row'} mx={6} my={2}>
                                        <FileCopyIcon />
                                        Copy URN
                                    </Stack>
                                </Link>
                            </Grid>
                        </Stack>
                        <Stack direction={'row'} my={1} sx={{ borderBottom: 1, borderColor: '#f2f3f5' }}>
                            <Grid item xs={8} sx={{ width: '65%', mx: 2 }}>
                                <Typography variant="subtitle1">
                                    Dataset Has A Description
                                </Typography>
                                <Typography sx={{ color: '#949494' }}>
                                    <span style={{ color: '#535353' }}>  Metadata Completeness |</span>  All Datasets Should Have A Description
                                </Typography>
                            </Grid>
                            <Grid item xs={2} sx={{ borderLeft: 1, borderRight: 1, width: '15%', borderColor: '#f2f3f5', my: 1 }}>
                            <Box sx={{ bgcolor: '#d0f4e8', color: '#00af55', textAlign: 'center', mx: 6,p:'6px', borderRadius: '5px' }}>
                                    <span style={{ fontSize: '14px' }}>Passing</span>
                                </Box>
                            </Grid>
                            <Grid item xs={2} sx={{ width: '20%' }}>
                                <Link to={''} style={{ color: '#009ad8', }}>
                                    <Stack direction={'row'} mx={6} my={2}>
                                        <FileCopyIcon />
                                        Copy URN
                                    </Stack>
                                </Link>
                            </Grid>
                        </Stack>
                        <Stack direction={'row'} my={1} sx={{ borderBottom: 1, borderColor: '#f2f3f5' }}>
                            <Grid item xs={8} sx={{ width: '65%', mx: 2 }}>
                                <Typography variant="subtitle1">
                                    Dataset Has A Description
                                </Typography>
                                <Typography sx={{ color: '#949494' }}>
                                    <span style={{ color: '#535353' }}>  Metadata Completeness |</span>  All Datasets Or Therir Domains Should Have At Least One Owner
                                </Typography>
                            </Grid>
                            <Grid item xs={2} sx={{ borderLeft: 1, borderRight: 1, width: '15%', borderColor: '#f2f3f5', my: 1 }}>
                                <Box sx={{ bgcolor: '#d0f4e8', color: '#00af55', textAlign: 'center', mx: 6,p:'6px', borderRadius: '5px' }}>
                                    <span style={{ fontSize: '14px' }}>Passing</span>
                                </Box>
                            </Grid>
                            <Grid item xs={2} sx={{ width: '20%' }}>
                                <Link to={''} style={{ color: '#009ad8', }}>
                                    <Stack direction={'row'} mx={6} my={2}>
                                        <FileCopyIcon />
                                        Copy URN
                                    </Stack>
                                </Link>
                            </Grid>
                        </Stack>
                    </Stack>
                </Card>

                <Paper sx={{ width: '25%', overflow: 'hidden', borderRadius: '4px', border: '1px solid lightgrey' }} elevation={0}>
                    <Stack sx={{ mt: '4px' }}>
                        <About data={props.data} />
                    </Stack>
                </Paper>

            </Stack>


        </>
    )
}