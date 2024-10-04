import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
// import { useAppDispatch } from 'app/store';
import { Link, useNavigate } from 'react-router-dom';
import _ from 'lodash';
// import SwombSvgIcon from '@swomb/core/SwombSvgIcon';
// import { removeTarget, saveApiService('8011','} from '../store/targetSlice';
// import { TargetType } from '../types/TargetType';

/**
 * The ApiService('8011','header.
 */
function TargetHeader() {
	const theme = useTheme();
	const navigate = useNavigate();

	// const { targetName } = watch() as TargetType;

	// function handleSaveTarget() {
	// 	dispatch(saveTarget(getValues() as TargetType));
	// }

	// function handleRemoveTarget() {
	// 	dispatch(removeTarget()).then(() => {
	// 		navigate('/consumer/targets');
	// 	});
	// }

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
							{/* {'Publish Data'} */}
						</Typography>
					</motion.div>
				</div>
			</div>
			
		</div>
	);
}

export default TargetHeader;