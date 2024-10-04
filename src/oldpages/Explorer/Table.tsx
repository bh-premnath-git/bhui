import { Paper, TableBody, TableCell, TableContainer, TableHead, TableRow ,Table as MuiTable, Stack, TablePagination} from "@mui/material";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import React, { useState } from "react";
import { Typography } from "antd";
import { BsBoxArrowInDown } from "react-icons/bs";



export default function Table(){
  const headers = ['Column1', 'Column2', 'Column3', 'Column4'];
  const data = [
    { id: 1, values: ['lorem Ipsum', 'lorem Ipsum', 'lorem Ipsum', 'lorem Ipsum'] },
    { id: 2, values: ['lorem Ipsum', 'lorem Ipsum', 'lorem Ipsum', 'lorem Ipsum'] },
    { id: 3, values: ['lorem Ipsum', 'lorem Ipsum', 'lorem Ipsum', 'lorem Ipsum'] },
    { id: 4, values: ['lorem Ipsum', 'lorem Ipsum', 'lorem Ipsum', 'lorem Ipsum'] },
    { id: 5, values: ['lorem Ipsum', 'lorem Ipsum', 'lorem Ipsum', 'lorem Ipsum'] },
    { id: 6, values: ['lorem Ipsum', 'lorem Ipsum', 'lorem Ipsum', 'lorem Ipsum'] },
    { id: 7, values: ['lorem Ipsum', 'lorem Ipsum', 'lorem Ipsum', 'lorem Ipsum'] },
];
const [page, setPage]:any = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(+event.target.value);
		setPage(0);
	};
  


  return (
    <>
    <Stack justifyContent={'space-between'} direction={'row'}>
    <Typography style={{paddingTop:'20px',fontWeight:"bold"}}>Query Results</Typography>
    <Stack direction={'row'}>
    <BsBoxArrowInDown style={{ color: '#008cda', marginRight: '8px',marginTop:'20px',fontSize:'20px' }} />
    <Typography style={{paddingTop:'20px',fontWeight:"bold",color:'#008cda'}}>Export As</Typography>
    </Stack>
    </Stack>
    <TableContainer component={Paper}>
      <MuiTable>
        <TableHead sx={{backgroundColor:'lightgray'}}>
          <TableRow>
            {headers.map((header, index) => (
              <TableCell key={index}>
                <CalendarTodayIcon /> {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              {row.values.map((value, index) => (
                <TableCell key={index}>{value}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </MuiTable>
    </TableContainer>
    <TablePagination
					rowsPerPageOptions={[10, 25, 100]}
					component="div"
					count={data.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
    </>


    );
}