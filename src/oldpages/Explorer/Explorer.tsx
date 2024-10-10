import {

  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Tabs,
  Tab,
  DialogContentText,
  Tooltip,
} from "@mui/material";
import { SetStateAction, useEffect, useState } from 'react';
import ProjectExplorer from "./ProjectExplore";
import Home1 from "./home";
import { Editor } from "@monaco-editor/react";
import {ApiService} from '@/services/apiServices';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Field, Form, Formik } from "formik";
import * as Yup from 'yup';
import { PiExportDuotone } from "react-icons/pi";
import CloseIcon from '@mui/icons-material/Close';


interface TabType {
  label: string;
  query: string;
}
const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
});
const CustomTooltip = ({ children }:any) => (
  <Tooltip
    title={
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" color="inherit" sx={{ fontSize: '16px' }}>Add a new query</Typography>
        </Box>
      </Box>
    }
    componentsProps={{
      tooltip: {
        sx: {
          backgroundColor: '#D9F7FF',
          color: 'rgba(0, 0, 0, 0.87)',
          boxShadow: 1,
          fontSize: 11,
        },
      },
    }}
  >
    {children}
  </Tooltip>
);
function Explorer() {
  const [showAnotherPage, setShowAnotherPage] = useState(false);
  const [value, setValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState([]);
  const [columns, setColumn] = useState([]);
  const [savedQuery, setSavedQuery] = useState([]);
  const [rows, setRow] = useState([]);
  const [tabs, setTabs] = useState<TabType[]>([{ label: 'Home', query: '' }]);
  const [index, setIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [open, setOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showExportButton, setShowExportButton] = useState(false);


  const handleClickOpen = () => {
    setIsOpen(true);
  };
  useEffect(() => {
    setValue(0);
    getSavedQuery();
  }, []);

  // useEffect(() => {

  // }, [savedQuery])
  const handleClose = () => {
    setIsOpen(false);
  };
  const handleChangePage = (event: any, newPage: SetStateAction<number>) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: { target: { value: string | number; }; }) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const handleButtonClick = () => {
    setShowAnotherPage(true);
  };

  const handleCombinedClick = (query: any) => {
    handleAddQuery(query);
    handleButtonClick();
  };

  const [showTable, setShowTable] = useState(false);

  const handleRunTabClick = () => {
    setShowTable(true);
  };

  const handleEditorChange = (index: number, value: string | undefined) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab, i) =>
        i === index ? { ...tab, query: value || '' } : tab
      )
    );
  };

  const handleEditorDidMount = (_editor: any, monaco: any) => {
    console.log("Editor mounted!");
  };

  const handleClick = async () => {
    console.log(value);
    console.log(tabs[value].query)
    setIsLoading(true);
    // const currentTab = tabs[value];
    const body = { query: tabs[value].query };

    try {
      const result = await ApiService('8011', 'post', `aws/athena_query`, body);
      console.log(result)
      if (result) {
        setColumn(result?.columns);
        setRow(result?.rows);
        setShowExportButton(result?.rows.length > 0);
      } else {
        setColumn([]);
        setRow([]);
        setShowExportButton(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setColumn([]);
      setRow([]);
      setShowExportButton(false);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSaveClick = async (name: string) => {
    console.log(name)
    console.log(tabs[value].query)
    var body = {
      'query': tabs[value].query,
      'is_validated': true,
      'display_name': name,
      'publish_id': null,
      'is_save': true
    }
    console.log(body)
    try {
      const result = await ApiService('8011', 'post', `publish_data/publish_query_details`, body);
      console.log(result)
      if (result) {
        return true;
      } else {
        return false
      }
    } catch (error) {
      console.error("Error fetching data:", error);

    } finally {
      setIsLoading(false);
    }

  }

  async function getSavedQuery() {
    var params = {
      is_save: 'true',
      offset:0,
      limit:5,
      order_by:'created_at',
      order_desc:true
    }
    console.log(params)
    try {
      const result = await ApiService('8011', 'get', `publish_data/publish_query_details/list/`, null, params);
      console.log(result)
      if (result) {
        setSavedQuery(result)
      } else {
      }
    } catch (error) {
      console.error("Error fetching data:", error);

    } finally {
      setIsLoading(false);
    }

  }



  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const handleRowClick = (_row: any) => {
    setOpen(true);
  };
  const handleAddQuery = (query: any) => {
    const newTabIndex = tabs.length;
    setIndex(newTabIndex);
    setTabs([
      ...tabs,
      {
        label: `Query ${newTabIndex}`,
        query: `${typeof (query) === 'string' ? query : ''}`,
      },
    ]);
    setValue(newTabIndex);
  };

  const handleDownload = () => {
    // Convert columns and rows to CSV format
    const csvContent = [
      columns.join(','), // Join columns as the first row
      ...rows.map(row => columns.map((_, i) => row[i]).join(',')) // Join each row with commas
    ].join('\n'); // Join all rows with new line

    // Create a Blob from the CSV string
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create a link element
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'data.csv');
    link.style.visibility = 'hidden';

    // Append the link to the body
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Remove the link from the document
    document.body.removeChild(link);
  };
  const handleRemoveTab = (index: number) => {
    setTabs((prevTabs) => {
      const newTabs = prevTabs.filter((_, i) => i !== index);
      if (newTabs.length === 0) {
        setValue(0); // Set the active tab to "Home"
        return [{ label: 'Home', query: '' }];
      }
      if (index === value) {
        setValue(Math.max(0, value - 1)); // Adjust the active tab index if the removed tab is the currently active one
      }
      return newTabs;
    });
  };

  return (
    <>
      <Stack>
        <Grid container spacing={2}>
          <Grid item xs={3} >
            <ProjectExplorer onClick={handleCombinedClick} savedQuery={savedQuery} />
          </Grid>
          <Grid item xs={9} >
            <div>
              <Stack direction="row" >
                <Stack direction="row" sx={{maxWidth:'80%'}}>
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="dynamic tabs"
                    TabIndicatorProps={{
                      style: {
                        backgroundColor: '#008cda',
                        height: 5,
                        width: '30px',
                        marginLeft: '33px',
                        borderRadius: '10px 10px 0px 0px',
                        color: '#008cda',

                      },
                    }}
                  >
                    {tabs.map((tab, index) => (
                      <Tab
                        key={index}
                        label={
                          <div className="mmf"
                          style={{ display: 'flex', alignItems: 'center', textTransform: 'capitalize', fontWeight: 'bold' }}>
                            {tab.label}
                            {tab.label.startsWith("Query") && (
                              <IconButton
                                size="small"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleRemoveTab(index);
                                }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            )}
                          </div>
                        }
                        {...a11yProps(index)}
                      />
                    ))}
                  </Tabs>
                  <Stack className="m-auto">
                    <CustomTooltip title="Add a new query">
                      <Button
                        variant="text"
                        sx={{ fontWeight: 'bold', textTransform: 'capitalize',  }}
                        onClick={handleAddQuery}
                      >
                        <AddCircleIcon style={{ fontWeight: 'bold', fontSize: '20px' }} />
                      </Button>
                    </CustomTooltip>
                  </Stack>
                </Stack>
                <Stack direction="row">
                  <Stack className="m-auto mmf">
                    <Button variant="text" sx={{ fontWeight: 'bold', textTransform: 'capitalize', }} onClick={handleClick}>
                      <img src="/assets/explore/play-circle.png" alt="play" width={18} className="mx-1" />
                      Run
                    </Button>
                  </Stack>
                  <Stack className="m-auto mmf">
                    <Button variant="text" sx={{ fontWeight: 'bold', textTransform: 'none',  }} onClick={handleClickOpen}>
                      <img src="/assets/explore/save.png" alt="save" width={18} className="mx-1" />
                      Save
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
              {tabs.map((tab, index) => (
                <TabPanel key={index} value={value} index={index}>
                  {index === 0 ? (<Home1 />) : (<><Editor
                    className="border-0 mmf"
                    height="20vh"
                    defaultLanguage="sql"
                    value={tab.query}
                    onMount={handleEditorDidMount}
                    onChange={(value) => handleEditorChange(index, value)}
                  />
                    {index !== 0 && (
                      <Stack>
                        <br></br>
                        <Stack direction={'row'} justifyContent={'space-between'} className="m-2 mmf">
                          <Typography variant='subtitle2' fontWeight={'bold'} mt={2}>Preview Data</Typography>
                          {showExportButton && (
                            <Button variant="contained" className="bg-dark" sx={{ textTransform: 'none' }} onClick={handleDownload}>
                              <PiExportDuotone className="mx-2 h5" /> Export
                            </Button>
                          )}
                        </Stack>

                        {!isLoading ? (<Stack>
                          {columns?.length == 0 ? (
                            <Box sx={{ backgroundColor: '#F6F6F6', minHeight: '450px', mt: 4 }}>
                              <Typography variant='body1' className='mmf fs-3' textAlign={'center'} m={20} >
                                No data preview available at the moment.Add and run a query to <br />view data output
                              </Typography>
                            </Box>

                          ) : (
                            <Box>
                              <TableContainer sx={{ maxHeight: 390 }}>
                                <Table stickyHeader aria-label="sticky table"  >
                                  <TableHead>
                                    <TableRow>
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
                                    {rows
                                      .map((row: any, index) => {
                                        return (
                                          <TableRow key={index} hover role="checkbox" tabIndex={-1} onClick={() => handleRowClick(row)} >
                                            {columns.map((column: any, j: number) => {
                                              return (
                                                <TableCell key={j} sx={{ borderBottom: '1px solid #E9EAEF' }}>
                                                  {/* <TextWithIcon text={row[j]}></TextWithIcon> */}
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
                                        );
                                      })}
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

                    )}
                  </>)}
                </TabPanel>
              ))}
            </div>

          </Grid>
        </Grid>
      </Stack>

      <Dialog open={isOpen} onClose={handleClose}>
        <DialogTitle className="h1 fw-bold">Save Query</DialogTitle>
        <DialogContent>
          <DialogContentText className="bg-light p-2 rounded">
            Saved queries store query text and dialect settings only. Once a query is saved, all other settings are reset to defaults.
          </DialogContentText>
          <Formik
            initialValues={{ name: new Date() }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
              console.log('Form Data:', values);
              var result: any = await handleSaveClick(values?.name.toString());
              if (result) {
                getSavedQuery();
                handleClose();
              }
            }}
          >
            {({ errors, touched }) => (
              <Form>
                <Field
                  as={TextField}
                  autoFocus
                  margin="dense"
                  name="name"
                  label="Name"
                  type="text"
                  fullWidth
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                />
                <br></br>
                <DialogActions sx={{ my: 2 }}>
                  <br></br>
                  <Button variant="contained" onClick={handleClose} className="bg-secondary" sx={{ textTransform: 'none' }}>
                    Cancel
                  </Button>

                  <Button type="submit" variant="contained" className="bg-dark" sx={{ textTransform: 'none' }} >
                    Save
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

    </>
  );
}

function TabPanel(props: { [x: string]: any; children: any; value: any; index: any; }) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

export default Explorer;