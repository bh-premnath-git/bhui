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
					to="/All Environment"
					size="small"
					sx={{textTransform:'none'}}
				>
					View All Environment
				</Button>
			</motion.div>
		</div>
	);
}

export default ProjectHeader;
