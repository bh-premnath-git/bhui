import { Box, Button, Typography, Stack } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useRef, useState } from 'react';
import TablePagination from '@mui/material/TablePagination';
import { useNavigate, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {ApiService} from '@/services/apiServices';
import TextWithIcon from '../../oldcomponents/text-counter';




function RunquaryDetails() {
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [query, setQuery]: any = useState();
    const navigate = useNavigate();
    const [columns, setColumn] = useState([]);
    const [rows, setRow] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const handleRowClick = (row) => {
        setOpen(true);
    };

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    const handleClick = async () => {
        setIsLoading(true);
        setQuery(value)
        var body = { query: value };

        try {
            var result = await ApiService('8011', 'post', `aws/athena_query`, body);
            if (result) {
                setColumn(result?.columns);
                setRow(result?.rows);
            } else {
                setColumn([]);
                setRow([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setColumn([]);
            setRow([]);
        } finally {
            setIsLoading(false);
        }
    };
    const handleEditorChange = (value: string | '') => {
        setValue(value);
        console.log("Editor value changed:", value);
    };

    const navigateTarget = async (step) => {
        var body = {
            query: query, is_validated: true, publish_id: location.state, is_saved: false
            , display_name: ''
        }
        var result = await ApiService('8011', 'post', `publish_data/publish_query_details`, body);
        if (result) {
            navigate('/Designer/targetsteps', { state: { 'step': step, 'id': location.state } });
        }
    };

    const [value, setValue] = useState('');

    const handleChange = (content, delta, source, editor) => {
        setValue(content);
    };
    const editorRef = useRef(null);

    const handleEditorDidMount: any = (editor, monaco) => {
        console.log("Editor mounted!");

    };

    console.log(location.state)

    return (

        <Stack m={5}>
            <Stack direction={'row'} justifyContent={'space-between'} display={'flex'}>
                <Typography variant='h5' className='headBlock' sx={{ fontFamily: 'Inter !important' }}>Add Custom Query</Typography>

                <Button variant='contained' sx={{
                    color: 'white', backgroundColor: 'black', width: '150px',

                    textTransform: 'none', '&:hover': {
                        backgroundColor: 'black',
                    },
                    fontFamily: 'Inter !important'
                }} onClick={handleClick} >

                    Run Query

                </Button>
            </Stack>


            <Typography variant='subtitle1' className='title myFont'>To edit the code,just click the cell and start editing</Typography>
            <Stack mt={2}>
                <div className='shadow-sm' style={{ borderTop: '1px solid #F1F2F5' }}>
                    <Editor className='border-0'
                        height="20vh"
                        defaultLanguage="sql"
                        defaultValue="select * from "
                        onMount={handleEditorDidMount}
                        onChange={(value: any) => handleEditorChange(value)}

                    />
                </div>

            </Stack>
            <Typography variant='subtitle2' fontWeight={'bold'} mt={2} sx={{ fontFamily: 'Inter !important' }}>Preview Data</Typography>
            {!isLoading ? (<Stack>
                {columns?.length == 0 ? (
                    <Box sx={{ backgroundColor: '#F6F6F6', minHeight: '450px', mt: 4 }}>
                        <Typography variant='body1' textAlign={'center'} m={20} fontFamily={'Inter !important'}>
                            No data preview available at the moment.Add and run a query to <br />view data output
                        </Typography>
                        <div className="m-auto text-center">
                            <Button variant='contained' sx={{
                                color: 'white', backgroundColor: 'black',
                                width: '150px',
                                textTransform: 'none', '&:hover': {
                                    backgroundColor: 'black',
                                }
                            }} onClick={() => navigateTarget(1)} >
                                Back
                            </Button>
                        </div>
                    </Box>

                ) : (
                    <Box>
                        <TableContainer sx={{ maxHeight: 390 }}>
                            <Table stickyHeader aria-label="sticky table"  >
                                <TableHead  >
                                    <TableRow  >
                                        {columns.map((column: any, index) => (
                                            <TableCell
                                                key={index}
                                                sx={{ backgroundColor: '#f9f9f9', color: 'black', fontSize: 'large', fontWeight: "bold" }}
                                            >
                                                {column}
                                            </TableCell>

                                        ))}

                                    </TableRow>
                                </TableHead>
                                {rows.length > 0 ? (<TableBody>
                                    {/* {rows
                                        .map((row, index) => {
                                            return (
                                                <TableRow key={index} hover role="checkbox" tabIndex={-1} onClick={() => handleRowClick(row)} >
                                                    {columns.map((column: any, j: number) => {
                                                        return (
                                                            <TableCell key={j} sx={{ borderBottom: '1px solid #E9EAEF' }}>
                                                                {row[j]}
                                                            </TableCell>
                                                        );
                                                    })}
                                                </TableRow>
                                            );
                                        })} */}

                                    {rows.map((row: any, index) => (
                                        <TableRow key={index} hover role="checkbox" tabIndex={-1} onClick={() => handleRowClick(row)}>
                                            {columns.map((column: any, j: number) => {
                                                return (
                                                    <TableCell key={j} sx={{ borderBottom: '1px solid #E9EAEF' }}>
                                                        {row[j] && row[j]?.length > 100 ? (
                                                            <span className="ellipsis" title={row[j]}>
                                                                {row[j]?.slice(0, 100)}...
                                                            </span>
                                                        ) : (
                                                            row[j]
                                                        )}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>) : (
                                    <TableBody className='w-100'>
                                    </TableBody>
                                )}
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 100]}
                            component="div"
                            count={rows.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}

                        />
                        <Stack direction={'row'} spacing={2} ml={78} >
                            <Box >
                                <Button variant="outlined" sx={{
                                    color: 'Black', width: '180px',

                                    textTransform: 'none',


                                }} onClick={() => navigateTarget(1)}>Back
                                </Button>
                            </Box>
                            <Box >
                                <Button variant="contained" sx={{
                                    color: 'white', backgroundColor: 'black', width: '180px',
                                    textTransform: 'none', '&:hover': {
                                        backgroundColor: 'black',
                                    },
                                }} onClick={() => navigateTarget(2)}>Next
                                </Button>
                            </Box>
                        </Stack>

                    </Box>
                )}
            </Stack>) : <Stack className='my-4'>
                <br></br>
                <br></br>
                <Stack className='m-auto'>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </Stack>
            </Stack>}


        </Stack>

    );
}

export default RunquaryDetails;