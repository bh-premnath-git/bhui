import Button from '@mui/material/Button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Grid, InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from 'lodash';
import AddIcon from '@mui/icons-material/Add';

/**
 * The customers header.
 */
function CustomersHeader(props:any) {
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

		<Grid container spacing={2} style={{ margin: '1%' }}>
			<Grid item style={{ marginBottom: '1%' }}>
				<TextField
					value={searchValue}
					onChange={searchProject}
					id="left-search"
					//   label="Search By keywords"
					placeholder='Search By keywords'
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

					variant="outlined"
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon />
							</InputAdornment>
						),
					}}
				/>
			</Grid>
			<Grid item xs={12} sm container justifyContent="flex-end" style={{ marginBottom: '1%' }}>
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
				>
					<Button className='bg-dark text-white fw-bold'
						component={Link}
						sx={{textTransform:'none'}}
						to="/Admin Console/Manage Customer/Add Customer"
						variant="contained"
						startIcon={<AddIcon />}
					>
						Add Customer
					</Button>
				</motion.div>
			</Grid>
		</Grid>
	);
}

export default CustomersHeader;
