import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { SyntheticEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import _ from 'lodash';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import * as React from 'react';
import { Box, Step, StepButton, StepContent, StepLabel, Stepper } from '@mui/material';
import UserDetailsStep from './UserDetailsStep';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
	name: yup
		.string()
		.required('You must enter a user name')
		.min(5, 'The user name must be at least 5 characters')
});

/**
 * The user page.
 */
function User() {
	// const dispatch = useAppDispatch();
	// const { data: user, status } = useAppSelector(selectUser);
	// const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const routeParams = useParams();
	const [tabValue, setTabValue] = useState(0);
	const [noUser, setNoUser] = useState(false);
	const methods = useForm({
		mode: 'onChange',
		defaultValues: {},
		resolver: yupResolver(schema)
	});
	const { reset, watch } = methods;
	const form = watch();


	const steps = [
		'Consumer Details',
		'Connection Details',
		'Alert Profile',
		'Tagging'
	];

	/**
	 * Tab Change
	 */
	function handleTabChange(event: SyntheticEvent, value: number) {
		setTabValue(value);
	}

	// if (status === 'loading') {
	// 	return <SwombLoading />;
	// }
	/**
	 * Show Message if the requested users is not exists
	 */
	if (noUser) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1, transition: { delay: 0.1 } }}
				className="flex flex-col flex-1 items-center justify-center h-full"
			>
				<Typography
					color="text.secondary"
					variant="h5"
				>
					There is no such user!
				</Typography>
				<Button
					className="mt-24"
					component={Link}
					variant="outlined"
					to="/Admin Console/Manage Data Platform Users"
					color="inherit"
				>
					Go to Users Page
				</Button>
			</motion.div>
		);
	}

	/**
	 * Wait while user data is loading and form is setted
	 */
	// if (_.isEmpty(form) || (user && routeParams.userId !== user.id && routeParams.userId !== 'new')) {
	// 	return <SwombLoading />;
	// }

	return (
		// <FormProvider {...methods}>
		// <SwombPageCarded 
		// 	// header={<UserHeader />}
		// 	content={
		// 		<>
		// 			<div className='m-36'>
		// 			<div className="mt-12 flex flex-col w-full border-1   p-10 sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 items-center justify-center space-x-16">
		// 				<Box sx={{ width: '65%', justifyContent: 'center', paddingTop: '30px', }}>
		// 				<UserDetailsStep />
		// 				</Box>
		// 			</div>
		// 			</div>

		// 		</>
		// 	}
		// 	scroll={isMobile ? 'normal' : 'content'}
		// />
		// </FormProvider>

		<>
			<div className='m-36'>
				<div className="m-auto">
					<Box sx={{ width: '65%', margin:'auto', paddingTop: '30px', }}>
						<UserDetailsStep />
					</Box>
				</div>
			</div>

		</>
	);
}

export default User;
