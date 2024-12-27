import {
	Box,
	Button,
	Typography,
	Stack,
	TextField,
	Paper,
    TextareaAutosize,
} from "@mui/material";
import * as yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { debounce,  } from 'lodash';
import { useEffect, useState } from 'react';
// import SwombLoading from "../portal/SwombLoading";

/**
 * The Meta-Data app.
 */
const validationSchema = yup.object().shape({
	data_src_name: yup.string().required("Source Name is required"),
	source_file_path: yup.string().required("Source Path is required"),
});

function MonitorStep(props:any) {

	// useEffect(() => {
	// 	fetchProject();

	// });
	// const[result]=props;
	const [sourceList, setSourceList] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [initialValue, setInitialValue] = useState({
		data_src_name: "",
		source_file_path: ""
		// path:"",
	});

	const hu = props.fetchPathRegion;

	// useEffect(() => {
	// 	console.log(props)
	// });


	// const initialValues = {
	// 	data_src_name: "",
	// };


	const handleSubmit = (value:any) => {
		props.path(value);
		// Handle form submission
	};
	const [sourceValue, setSourceValue] = useState('');
	const debouncedSearchProject = debounce((value) => {
		props.search(value);
	}, 1000);

	const validateSourceName = (event:any) => {
		const { value } = event.target;
		// var updatedObject = { ...initialValue, data_src_name: value };
		setInitialValue(prevState => ({
			...prevState,
			data_src_name: value // Assuming value is the new value for data_src_name
		}));
		setSourceValue(value);
		debouncedSearchProject(value);
	};
	const validatePathName = (event:any) => {
		const { value } = event.target;
		// var updatedObject = { ...initialValue, data_src_name: value };
		setInitialValue(prevState => ({
			...prevState,
			source_file_path: value // Assuming value is the new value for data_src_name
		}));
		
	};


	return (
		<>
			<Paper sx={{ p: 4, borderRadius: '4px', border: '1px solid #f2f3f5' }} elevation={0}>
				<Formik
					initialValues={initialValue}
					validationSchema={validationSchema}
					enableReinitialize={true}
					onSubmit={handleSubmit} // Pass handleSubmit function from props
				>
					{({ isValid, isSubmitting }) => (
						<Form>

							{<Stack sx={{ margin: 'auto', width: '30%' }}>
								<Typography variant="subtitle1" fontSize={15} textAlign={'left'}>
									Monitor Name
								</Typography>
								<Field
									name="data_src_name"
									type='text'
									placeholder="Enter Monitor Name"
									variant="outlined"
									required
									as={TextField}
									value={sourceValue}
									onChange={validateSourceName}

									sx={{
										my: 1,
										width: '50ch',
										borderRadius: '16px',
										'& fieldset': {
											borderColor: '#f2f3f5', // Change border color to light grey
										},

									}}
								/>

								{props.isSourceExists && (
									<Box mt={1} sx={{ color: "red" }}>
										Source already exists.
									</Box>
								)}
								<Box mt={1} sx={{ color: "red" }}>
									<ErrorMessage name="data_src_name" component="div" />
								</Box>
								<Typography variant="subtitle1" fontSize={15} textAlign={'left'}>
                                    Description
								</Typography>
								 <TextareaAutosize
                                aria-label="empty textarea"
                                placeholder="Type Your Description Here"
                                style={{ width: '100%' ,borderColor:'none'}}
                                minRows={4} 
                                /> 
								
								<br />
								<br />
							
							</Stack>}

						</Form>
					)}
				</Formik>

			</Paper>

		</>
	);
}

export default MonitorStep;