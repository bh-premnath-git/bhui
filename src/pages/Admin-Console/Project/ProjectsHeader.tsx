import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChangeEvent, useState } from 'react';
import { InputAdornment, Stack, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from 'lodash';

/**
 * The projects header.
 */
function ProjectsHeader(props:any) {

	const { search } = props;
	const [searchValue, setSearchValue] = useState('');
	const debouncedSearchProject = debounce((value) => {
		props.search(value);
	}, 1000);

	const searchProject = (event:any) => {
		const { value } = event.target;
		setSearchValue(value);
		debouncedSearchProject(value);
	};


	return (

		<>
			<Stack direction={'row'} justifyContent={'space-between'}>
				<Stack>
					<TextField
						placeholder='Search By Keywords'
						id="outlined-start-adornment"
						sx={{
							m: 1,
							width: '35ch',
							'& fieldset': {
								borderColor: '#f2f3f5', // Change border color to light grey
							},
							'&:hover fieldset': {
								borderColor: '#f2f3f5', // Add hover effect
							},
							'&.Mui-focused fieldset': {
								borderColor: '#f2f3f5', // Add focus effect
							}
						}}
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
				</Stack>
				<Stack>
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
					>
						<Button className='fw-bold bg-dark text-white '
							component={Link}
							to="/Admin-Console/Projects/New"
							variant="contained"
							// startIcon={<SwombSvgIcon>heroicons-outline:plus</SwombSvgIcon>}
							// size="small"
							sx={{textTransform:'none'}}

						>
							Create New Project
						</Button>
					</motion.div>
				</Stack>
			</Stack>
		</>
	);
}

export default ProjectsHeader;
