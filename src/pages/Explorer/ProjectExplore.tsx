import { Accordion, AccordionDetails, AccordionSummary, Button, Divider, IconButton, InputAdornment, ListItemIcon, Menu, MenuItem, Popover, Stack, TextField, Typography } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import './ExploreProject.css';
import { useEffect, useState } from "react";
import { CiMenuKebab } from "react-icons/ci";
import ApiService from "../../services/ApiServices";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MdOutlineQueryBuilder } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import { IoMdArrowDropright } from "react-icons/io";



export default function ProjectExplorer({ onClick, savedQuery }) {
    console.log(savedQuery)
    const [anchorEl, setAnchorEl] = useState(null);
    const [openAddLink, setOpenAddLink] = useState(false);
    const [data, setData] = useState();
    const codesDtl: any = JSON.parse(localStorage.getItem('codesDtl') || '');


    const handleClose = () => {
        setAnchorEl(null);
    };
    const open = Boolean(anchorEl);
    const id = open ? 'right-popoverup' : undefined;
    const openLinkDialog = () => {
        setOpenAddLink(true)
    };
    const handleClick = (event) => {

        setAnchorEl(event.currentTarget);
    };
    const handleData = (query) => {
        console.log(query)
        setData(query)
    }
    const handleOptionSelect = (option) => {
        // Perform actions based on the selected option here
        console.log(`Selected option: ${option}`);
        handleClose(); // Close the popover after an option is selected
    };
    const doubleClick = () => {
        openLinkDialog()
        handleOptionSelect('Open')
    }
    const singleClick = () => {
        onClick(data)
        handleOptionSelect('Query Dataset')
    }


    const [dataSetList, setDataList]: any = useState();
    useEffect(() => {
        fetchProject('');
    }, [savedQuery]);

    const fetchProject = async (search: any) => {
        try {
            const params: any = {
                // relation_ship_owner: search
            };
            const result = await ApiService('8011', 'get', '/data_source/dataset_by_project/', null, params);
            console.log(result);
            if (result) {
                setDataList(result)
            } else {
                setDataList([])
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    function findValue(value: any) {
        if (Array.isArray(codesDtl)) {
            var filteredData: any = codesDtl.find(code => code.id.toString() === value.toString());
            return filteredData?.dtl_desc.toString()
        } else {
            console.error('codesDtl is not an array.');
            return ''

        }

    }

    return (
        <Stack sx={{ border: '1px solid #f2f3f5', p: 2, m: 'auto', width: '100%' }}>
            <Stack direction={'row'} >
                <TextField size="small" className="shadow-sm mff"
                    fullWidth
                    placeholder='Search By Keywords'
                    id="outlined-start-adornment"
                    
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}

                />

                <Stack sx={{  textAlign: 'end', }}>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
                    >
                        <Button sx={{ p:1,
                             backgroundColor: 'black',
                            '&:hover': {
                                backgroundColor: 'black', // Disable background color change on hover
                                color: 'white', // Disable text color change on hover
                            }
                        }}
                          
                            variant="contained"
                        >
                            <FaSearch className="my-1" />
                        </Button>
                    </motion.div>
                </Stack>
            </Stack>
            <Stack>
                <Accordion elevation={0}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: '#008cda' }} />}
                        aria-controls="saved-queries-content"
                        id="saved-queries-header"
                        sx={{
                            ...(savedQuery.length === 0 && { mt: 0, mb: 0, py: 0 }),
                        }}
                    >
                        <Typography variant='subtitle2' fontWeight={"bold"} className="mff" sx={{ color: '#008cda' }}>
                            <ArrowRightIcon sx={{ color: '#008cda' }} /> See Saved Queries
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails style={{margin:'-25px'}}>
                        {savedQuery.length === 0 ? (
                            <Typography variant="body2" color="textSecondary" className="mff">
                                No saved queries available.
                            </Typography>
                        ) : (
                            <ul className="mx-2">
                                {savedQuery?.map((item, index) => (
                                    <li key={index} className="text-dark m-1 mff"
                                        onClick={() => {
                                            handleData(item?.query)
                                            singleClick()
                                        }}>
                                        <IoMdArrowDropright className={index%2==0?'fs-2 text-success':"fs-2 text-secondary"} /> {item?.display_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </AccordionDetails>
                </Accordion>

                <Typography variant='subtitle2' className="mff"
                sx={{ color: 'grey', my: 2 ,marginTop:'0 !important'}}>
                    Showing all projects
                </Typography>
            </Stack>

            <Stack>
                {dataSetList?.length > 0 && (
                    <ul className="tree mmf">
                        {dataSetList?.map((item) => (
                            <li className="parent" key={item?.bh_project_id}>
                                <details open className="details">
                                    <summary><span className="label"></span>{item?.bh_project_name}</summary>
                                    <ul className="nested-list mff">
                                        <li className="nested-item mff"> <span
                                            className="label"></span>
                                            <span className=""></span>{findValue(item?.lake_zone_cd)}
                                            <ul className="nested-list">
                                                {item?.data_set_list?.map(data => (<li key={data?.data_src_id} className="nested-item mff"> <span
                                                    className="label"></span>
                                                    {data?.data_src_name} <span className="float-end"
                                                        onClick={(event) => { handleClick(event); handleData(data?.data_src_name) }}><CiMenuKebab />
                                                    </span>
                                                </li>))}

                                            </ul>
                                        </li>

                                    </ul>
                                </details>
                            </li>
                        ))}

                    </ul>)}
            </Stack>


            <Popover
                elevation={1}
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            // sx={{ width: 300 }}
            >
                <Button sx={{ my: 1, mx: 1, color: 'black' }} className="mff" onClick={doubleClick} >
                    Open
                </Button><br />
                <Divider sx={{ color: 'grey' }} />
                <Button sx={{ mx: 1, color: 'black' }} onClick={singleClick}>Query Dataset</Button><br />
                <Divider sx={{ color: 'grey' }} />
                <Button sx={{ mx: 1, color: 'black' }} onClick={() => handleOptionSelect('Share')}>Share</Button><br />
                <Divider sx={{ color: 'grey' }} />
                <Button sx={{ mx: 1, color: 'black' }} onClick={() => handleOptionSelect('Copy ID')} >Copy ID</Button><br />
                <Divider sx={{ color: 'grey' }} />
                <Button sx={{ mx: 1, color: 'black' }} onClick={() => handleOptionSelect('Delete')} >Delete</Button><br />
            </Popover>



        </Stack>

    )
}