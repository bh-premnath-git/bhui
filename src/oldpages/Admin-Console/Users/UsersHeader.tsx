import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChangeEvent } from 'react';
import { InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from 'lodash';
import {  useState } from 'react';
import { Stack } from '@mui/system';
/**
 * The users header.
 */
function UsersHeader(props:any) {
	const [searchValue, setSearchValue] = useState('');
	const [projectList, setProjectList] = useState([]);
	const debouncedSearchProject = debounce((value) => {
		props.search(value);
	  }, 1000);

	

	const searchProject = (event:any) => {
		const { value } = event.target;
		setSearchValue(value);
		debouncedSearchProject(value);	
	  };


	return (
		<Stack direction={'row'} justifyContent={'space-between'} sx={{my:2}}>
			<div>
				<TextField
					// label="Search By Keywords"
					placeholder='Search By Keywords'
					id="outlined-start-adornment"
					className='shadow-sm'
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon />
							</InputAdornment>
						),
					}}
					value={searchValue}
					onChange={searchProject}
				/>
			</div>
			<div >
				
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
				>
					<Button className='bg-dark text-white myFont'
					 sx={{backgroundColor:'black',textTransform:'none',
						color:'white','& hover':{background:'black'}}}
						component={Link}
						to="/Admin Console/Manage Data Platform Users/Add User"
						variant="contained"
					>
						Add User
					</Button>
				</motion.div>
			</div>
			</Stack>
	);
}

export default UsersHeader;