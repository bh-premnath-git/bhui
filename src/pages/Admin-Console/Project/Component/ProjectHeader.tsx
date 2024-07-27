import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import _ from 'lodash';

/**
 * The project header.
 */
function ProjectHeader() {

	return (
		<div className="d-flex  justify-content-between ">
			<div className="">
				{/* <motion.div
					initial={{ x: 20, opacity: 0 }}
					animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
				>
					<Typography
						className="flex items-center sm:mb-12"
						component={Link}
						role="button"
						to="/Admin-Console/Projects"
						color="inherit"
					>
						<SwombSvgIcon size={20}>
							{theme.direction === 'ltr'
								? 'heroicons-outline:arrow-sm-left'
								: 'heroicons-outline:arrow-sm-right'}
						</SwombSvgIcon>
						<span className="flex mx-4 font-medium">All Projects</span>
					</Typography>
				</motion.div> */}

				<div className="flex items-center max-w-full">
					<motion.div
						className="flex flex-col items-center sm:items-start min-w-0 mx-8 sm:mx-16"
						initial={{ x: -20 }}
						animate={{ x: 0, transition: { delay: 0.3 } }}
					>
						<Typography className="text-14 sm:text-20 truncate font-semibold">
							{'Project & Lake Setup Details'}
						</Typography>
					</motion.div>
				</div>
			</div>
			<motion.div
				className="flex"
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
			>
				<Button
					className="whitespace-nowrap mx-4 py-2 bg-dark text-white" 
					variant="contained"
					component={Link}
					to="/All Projects"
					size="small"
					sx={{textTransform:'none'}}
				>
					View All Projects
				</Button>
			</motion.div>
		</div>
	);
}

export default ProjectHeader;
