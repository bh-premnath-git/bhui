import { motion } from 'framer-motion';
import { Stack, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import LandingContent from './LandingContent';
import LocalStorageService from '../../services/local-storage-service';
import React, { useEffect, useState } from 'react';
import ApiService from '../../services/ApiServices';

const Landing = () => {
	const [roles, setRoles] = useState([]);
	useEffect(() => {

		const fetchProjectRoles = async () => {
			var params = { offset: 0, limit: 200 }
			try {
				const result = await ApiService('8011', 'get', '/codes_hdr/codes_dtl/', null, params);
				// alert('hi')
				console.log(result)
				LocalStorageService.setItem('codesDtl', result);
				setRoles(result.dtl_desc);

			}
			catch (error) {
				console.error('Error fetching projects roles', error);

			}
		}
		const fetchAddnewProject = async () => {

			try {
				const result = await ApiService('8011', 'get', '/platform_region/search/');
				console.log(result)
				LocalStorageService.setItem('platformRegion', result);
				setRoles(result.description);

			}
			catch (error) {
				console.error('Error fetching projects roles', error);

			}
		}
		fetchProjectRoles();
		fetchAddnewProject();
	}, [])

	return (
		<>
			<div className="p-10 items-center justify-center ">
				<Box
					className="relative overflow-hidden flex shrink-0 items-center justify-center md:p-4"
				>
					<div className="flex flex-col items-center justify-center  mx-auto w-full">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1, transition: { delay: 0 } }}
						>
							<Typography className="text-center fs-1 mmf" variant='h5' sx={{ fontWeight: 'bold' }}>
								Welcome to the BigHammer.ai platform!
							</Typography>
						</motion.div>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1, transition: { delay: 0.3 } }}
						>
							<Typography
								color="inherit"
								className="text-secondary  text-center my-2 fs-2 mmf" variant='h6'
							>
								One Stop for all your data, anytime, anywhere.
							</Typography>
						</motion.div>
					</div>
				</Box>
			</div>

			<div className="p-10">
				<LandingContent />
				<div className="p-10 items-center justify-center">
					<Box
						className="relative overflow-hidden flex shrink-0 items-center justify-center px-16 py-16 md:p-4"
					>
						<div className="flex flex-col items-center justify-center  mx-auto w-full">
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1, transition: { delay: 0 } }}
							>
								<Typography className="text-center mmf fs-2" sx={{ fontWeight: 'bold', fontSize: '20px' }} variant='body1'>
									Learn how to use the BigHammer.ai platform
								</Typography>
							</motion.div>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1, transition: { delay: 0.3 } }}
							>
								<Typography
									color="inherit"
									className="text-center fs-3 mmf"
								>
									Check out the resources on how to use the platform to its fullest.
								</Typography>
								<div className="text-center p-0">
									<Button sx={{ backgroundColor: '#000',textTransform:'none' }}
										component={Link}
										variant="contained"
										className="mt-4 px-4 py-2 fs-3 mmf"
										aria-label="Sign in"
										to={`/apps/help-center`}
										size="small"
										
									>
										Know More
									</Button>
								</div>
							</motion.div>
						</div>
					</Box>
				</div>
			</div>
		</>

	);
};

export default Landing;
