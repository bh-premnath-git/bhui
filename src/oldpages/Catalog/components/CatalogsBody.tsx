import * as React from 'react';
import {
    Stack, LinearProgress, Typography, IconButton, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions, Button, Box, TextField, Chip, Divider, Popover
} from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import ShareIcon from '@mui/icons-material/Share';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import * as Yup from 'yup';
import About from './About';
import ApiService from '../../../Services/ApiServices';
import ShowAll from './Lineage/ShowAll';
import { LuCalendarDays } from "react-icons/lu";
import { BsChatDots } from "react-icons/bs";
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
interface Column {
    id: string;
    label: string;
    align: 'left' | 'right' | 'center';
    format?: (value: React.ReactNode) => React.ReactNode;
}

interface Row {
    [key: string]: React.ReactNode;
}

const validationSchema = Yup.object({
    tagKey: Yup.string().required('Tag Key is required'),
    tagValue: Yup.string().required('Tag Value is required'),
});


const columns: Column[] = [
    { id: 'field', label: 'Field', align: 'left' },
    { id: 'description', label: 'Description', align: 'left' },
    { id: 'tags', label: 'Tags', align: 'left' },
    { id: 'glossaryterms', label: 'Glossary Terms', align: 'center' },
    { id: 'edit', label: ' ', align: 'center', },

];



function createData(field: React.ReactNode, description: React.ReactNode, tags: React.ReactNode, glossaryterms: string, edit: React.ReactNode): Row {
    return { field, description, tags, glossaryterms, edit };
}



export default function CatalogsBody(props:any) {
	const [codesDtl, setCodesDtl] = useState([]);
    const {layoutList}=useSelector((state:RootState)=>state.catalogApi);
console.log(layoutList)
    const data = layoutList;
    console.log(data)
    const search=props.search;
    const [selectedRow, setSelectedRow] = useState<Row | null>(null);
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(2);
    const [open2, setOpen2]:any = useState(false);

  const handleClickOpen = () => {
    setOpen2(true);
  }
  console.log(props)
    const handleRowClick = (row: Row) => {
        setSelectedRow(row);
        setOpen(true);
    };

    const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event:any) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose1 = () => {
        setOpen2(false);
      };
      
  
    const handleClose = () => {
      setAnchorEl(null);
    };
  
    const open1 = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
  
 

    const [dataSourceList, setdataSourceList]:any = React.useState([]);
    React.useEffect(() => {
        getItem();
		console.log(data);
		const fetchDatasourceRegion = async () => {
			try {
               var params:any={
                data_src_lyt_id:data.data_src_id
                };
                if(search.length>0){
                    params.data_src_lyt_name=props.search;
                }
				const result = await ApiService('8011','get', '/data_source_layout/list_full/',null,params);
				console.log(result);
				setdataSourceList(result);
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};
		
		fetchDatasourceRegion();

		return () => {
		};
	}, []);

    const getItem = async () => {
		var value:any = await localStorage.getItem('codesDtl');
		setCodesDtl(JSON.parse(value))
		// console.log(value);
	};
   
	function findEnv(value:any) {
		// console.log(value)
		if (Array.isArray(codesDtl)) {
			var filteredData: any = codesDtl.find((code:any) => code.id.toString() === value?.toString());
			// console.log(filteredData)
			return filteredData?.dtl_desc.toString()
		} else {
			console.error('codesDtl is not an array.');
			return ''

		}

	}
    return (
        <>

            <Stack direction={'row'} spacing={1}>
                <Paper sx={{ width: '100%', overflow: 'hidden',borderRadius:'4px',border:'1px solid lightgrey' }} elevation={0}>
                  <Stack sx={{p:'16px'}}>
                    <Stack direction={'row'} justifyContent={'space-between'} >
                  <Typography variant='h6' fontWeight={'bold'}>{layoutList[0].data_src_lyt_name}</Typography>
                  <Typography color={'#008cda'} fontSize={'15px'} onClick={handleClickOpen} sx={{textDecoration: 'underline'}}>Show All</Typography>
                  <ShowAll open2={open2}  handleClose1={handleClose1} data={data} dataSourceList={layoutList}  />
                  </Stack>
                    <TableContainer sx={{ maxHeight: 800}}>
                        <Table stickyHeader aria-label="sticky table"  style={{border:'1px solid #f2f3f5'}} >
                            <TableHead >
                                <TableRow>
                                    {columns.map((column) => (

                                        <TableCell
                                            key={column.id}
                                            align={column.align}
                                            sx={{ backgroundColor: '#f2f2f8', color: 'black', fontSize: 'medium', fontWeight: "500"}}
                                        >
                                            {column.label}


                                        </TableCell>

                                    ))}

                                </TableRow>
                            </TableHead>
                            <TableBody >

                                {layoutList[0]?.layout_fields.map((row:any, index:any) => {
                                    return (
                                        <TableRow  className='pt-1 ' key={index} hover role="checkbox" tabIndex={-1} onClick={() => handleRowClick(row)} >

                                            <TableCell align="left" className='pt-1  my-2' style={{borderBottom:'1px solid #f2f3f5'}}>
                                                <Typography variant='body1' sx={{fontSize:'15px',py:'2px'}}>{row?.lyt_fld_name}</Typography>
                                                <Stack direction="row" spacing={2}>
                                                    <Typography variant='body2' sx={{ padding: '4px', background: '#f2f3f5', borderRadius: '2px' }}><LuCalendarDays /></Typography>
                                                    <Typography variant='body2' sx={{ padding: '4px', background: '#f2f3f5', borderRadius: '2px' }}><BsChatDots /></Typography>

                                                </Stack>
                                            </TableCell>
                                            <TableCell align="left" className='pt-1  my-2' style={{borderBottom:'1px solid #f2f3f5'}}>{row?.lyt_fld_desc} 
                                            </TableCell>
                                            <TableCell align="left" className='pt-1  my-2' style={{borderBottom:'1px solid #f2f3f5'}}>
                                                {
                                                    data.data_src_tags?.tagList?.map((tag:any) => (
                                                        <Typography variant='body2' sx={{
                                                            p: '5px', backgroundColor: 'aliceblue', borderRadius: '4px',width:'80%'
                                                        }}>{tag.tagKey} {'>>'} {tag.value}</Typography>
                                                    ))
                                                } 

                                            </TableCell>
                                            <TableCell align="center" className='pt-1  my-2' style={{borderBottom:'1px solid #f2f3f5'}}>Glossary Term 1</TableCell>
                                            <TableCell align="center" className='pt-1  my-2' style={{borderBottom:'1px solid #f2f3f5'}}><MoreVertIcon onClick={handleClick}/></TableCell>

                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 50, 100]}
                        component="div"
                        count={layoutList[0]?.layout_fields?.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />

                  </Stack>
                </Paper>
                <Paper sx={{ width: '25%', overflow: 'hidden',borderRadius:'4px' ,border:'1px solid lightgrey'}} elevation={0}>
                    <About/>
                </Paper>
                <Popover
					elevation={1}
					id={id}
					open={open1}
					anchorEl={anchorEl}
					onClose={handleClose}
					anchorOrigin={{
						vertical: 'top',
						horizontal: 'left',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
				// sx={{ width: 300 }}
				>
					<Button sx={{ my: 1, mx: 1 ,color:'black',textTransform: 'none'}}  >
						Edit Description
					</Button><br />
                    <Divider sx={{color:'black'}}/>
					<Button sx={{ mx: 1 ,color:'black',textTransform: 'none'}} >Add Tag</Button><br />
                    <Divider sx={{color:'black'}}/>
                    <Button sx={{ mx: 1 ,color:'black',textTransform: 'none'}} >Add Term</Button><br />

				</Popover>

            </Stack>
        </>
    );
}