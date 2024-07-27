import Button from '@mui/material/Button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Grid, InputAdornment, TextField, Stack, Typography, Autocomplete, Select, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';


interface JobDetail {
	data_src_name: string;
	// Add other properties as needed
  }
  
  interface SelectedValue {
	data_src_name: string | null;
  }
  
  interface OnBoardHeaderProps {
	data: JobDetail[];
	onSearch: (value: SelectedValue, selectedRow: JobDetail | null) => void;
  }
function OnBoardHeader(props: OnBoardHeaderProps) {
	const jobDetailList = props.data;
	console.log('jobDetailList:',jobDetailList	);
	const [selectedValue, setSelectedValue] = useState<SelectedValue>({ data_src_name: null });

	const updateSelectedValue = (field: keyof SelectedValue, value: string | null) => {
		setSelectedValue(prevState => ({
		  ...prevState,
		  [field]: value,
		}));
	  };
	  const handleSearch = () => {
		const selectedRow = jobDetailList.find(job => job.data_src_name === selectedValue.data_src_name) || null;
		props.onSearch(selectedValue, selectedRow); // Pass the selected value and row to the parent component
	};
	return (
		<>
			<Stack spacing={2} direction={'row'} justifyContent={'space-between'}>
				<Stack spacing={2} direction={'row'}>
					<Stack>
						<Typography  fontWeight={'bold'} fontSize={16} my={1} >Project</Typography>
						<Autocomplete
							disablePortal
							id="combo-box-demo"
							options={[]}
							sx={{
								width: '40ch',
								borderRadius: '16px',
								'& fieldset': {
									borderColor: '#f2f3f5', // Change border color to light grey
								},
							}}
							renderInput={(params) => <TextField {...params} placeholder='Select Project' />}
						/>
					</Stack>
					<Stack>
						<Typography fontWeight={'bold'} fontSize={16} my={1} >Source Name</Typography>
						<Select
							
							id="combo-box-demo"
							displayEmpty
							value={selectedValue.data_src_name || ''}
							onChange={(e) => updateSelectedValue('data_src_name', e.target.value)}
							sx={{
								width: '40ch',
								'& fieldset': {
									borderColor: '#f2f3f5', // Change border color to light grey
								},
							}}  placeholder='Select Source Name' >
								<MenuItem value="" disabled>
								Select Source Name
							</MenuItem>
						{jobDetailList.map((job: any) =>

								<MenuItem value={job?.data_src_name}>{job?.data_src_name}</MenuItem>

							)}
					</Select>
					</Stack>
				</Stack>
				<Stack spacing={2} direction={'row'}>
					<Stack>
						<Typography fontWeight={'bold'} fontSize={16} my={1}></Typography>
						<TextField
							id="left-search"
							//   label="Search By keywords"
							placeholder='Search By keywords'
							sx={{
								mt: 3,
								width: '40ch',
								borderRadius: '16px',
								'& fieldset': {
									borderColor: '#f2f3f5', // Change border color to light grey
								},
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

					</Stack>
					<Stack>
						<Typography fontWeight="bold" sx={{ mt: 2 }} fontSize={16} my={1} />
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
						>
							<Button
								className="bg-dark h6 text-white fw-bold"
								// className='custom-typography'
								sx={{
									mx: 2,
									p: 1,
									my: 3,
									backgroundColor: '#000',
									color: 'white',
									whiteSpace: 'nowrap',  // Ensure the text does not break into multiple lines
									textTransform: 'none', // Preserve the button text casing
								}}
								component={Link}
								to="/Designer/Onboard-Data"
								variant="contained"
							>
								Onboard New Data
							</Button>
						</motion.div>
					</Stack>
					<Stack>
						<Typography fontWeight="bold" sx={{ mt: 2 }} fontSize={16} my={1} />
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
						>
							<Button
								className="bg-dark h6 text-white "
								
								sx={{
									mx: 2,
									p: 1,
									my: 3,
									backgroundColor: '#000',
									color: 'white',
									whiteSpace: 'nowrap',  // Ensure the text does not break into multiple lines
									textTransform: 'none', // Preserve the button text casing
								}}
								
								variant="contained"
								onClick={() => handleSearch()}
							>
								Search
							</Button>
						</motion.div>
					</Stack>
				</Stack>
			</Stack>

		</>

	);
}

export default OnBoardHeader;