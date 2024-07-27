import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import _ from 'lodash';

/**
 * The customer header.
 */
function CustomerHeader() {
	const methods = useFormContext();
	const { formState, watch, getValues } = methods;

	const theme = useTheme();
	const navigate = useNavigate();



	return (
		<div className="flex flex-col sm:flex-row flex-1 w-full items-center justify-between space-y-8 sm:space-y-0 py-16 px-12 md:px-16">
			<div className="flex flex-col items-center sm:items-start space-y-8 sm:space-y-0 w-full sm:max-w-full min-w-0">
				<div className="flex items-center max-w-full">
					<motion.div
						className="flex flex-col items-center sm:items-start min-w-0 mx-8 sm:mx-16"
						initial={{ x: -20 }}
						animate={{ x: 0, transition: { delay: 0.3 } }}
					>
						<Typography className="text-14 sm:text-20 truncate font-semibold">
							{'Consumer Details'}
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
					className="whitespace-nowrap mx-4"
					variant="contained"
					color="secondary"
					component={Link}
					to="/Admin-Console/Customers"
					size="small"
				>
					Add
				</Button>
			</motion.div>
		</div>
	);
}

export default CustomerHeader;
