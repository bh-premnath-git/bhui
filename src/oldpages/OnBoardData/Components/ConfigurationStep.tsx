import * as React from "react";
import TextField from "@mui/material/TextField";
import { Controller, useFormContext, useForm } from "react-hook-form";
import {
	Box,
	Button,
	FormControl,
	FormControlLabel,
	Radio,
	RadioGroup,
	Typography,
	Stack,
	Select,
	SelectChangeEvent,
	OutlinedInput,
	MenuItem,
	Chip,
} from "@mui/material";
import * as yup from "yup";
import { green } from "@mui/material/colors";
import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import ApiService from "../../../Services/ApiServices";
import axios from "axios";

/**
 * The Consumer Details tab.
 */
const validationSchema = yup.object().shape({
	primaryKey: yup.array().of(yup.string().required()).min(1, "Primary Key is required"),
	// primaryKey: yup.string().required("Primary Key is required"),
	fileNamePattern: yup.string().required("File Name Pattern is required"),
	incomingFileFull: yup.string().required('Required'),
	buildHistory: yup.boolean().required('Required')
});

function ConfigurationStep(props: any) {
	console.log(props)
	const methods = useFormContext();
	// const { control, formState } = methods;

	// const { errors } = formState;
	const [horizontal, setHorizontal] = React.useState("left");

	const initialValues = {
		incomingFileFull: "", // Adding the initial value for the radio button
		buildHistory: false, //
		// ruleTypeCd: "", // Assuming this is your radio button value
		primaryKey: "",
		fileNamePattern: "",
	};
	const [isLoading, setIsLoading] = useState(false);
	const [multiSelects, setMultiSelects]: any = useState([]);
	const [multiSelectValues, setMultiSelectValues] = useState();
	const [multiSelectorUpdate, setMultiSelectorUpdate] = useState();



	useEffect(() => {

		fetchMultiselector();
		// fetchMultiselectorValues(data)


	}, []);

	const fetchMultiselector = async () => {
		const params = { 'data_src_id': props.sourceItem }
		console.log(params)

		try {
			setIsLoading(true)
			const result = await ApiService('8011', 'get', '/data_source_layout/list_full/', null, params);
			console.log(result);
			if (result != null && result?.length > 0) {
				setMultiSelects(result[0]?.layout_fields);
			}
			console.log(result)
			setIsLoading(false)

		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};

	console.log(props.sourceItem)

	const fetchMultiselectorValues = async (data) => {
		console.log(data)
		const body = {
			'data_src_id': props.sourceItem,
			'data_src_file_type': data.incomingFileFull,
			'data_src_is_history_required': data.buildHistory,
			'data_src_lyt_regex': data.fileNamePattern,
			'data_src_lyt_name': 'versie',
			'data_src_lyt_fmt_cd': 0,
			'data_src_lyt_cust_delimiter': '',
			'data_src_lyt_header': false,
			'data_src_lyt_encoding_cd': 0,
			'data_src_lyt_quote_chars_cd': 0,
			'data_src_lyt_escape_chars_cd': 0,
			'data_src_lyt_pk': true,
			'data_src_lyt_total_records': 0,
			'data_src_lyt_type_cd': 0,
			'data_src_lyt_is_mandatory': true,
			'data_src_n_rows_to_skip': 0,
			'data_src_file_path': '',
			'data_src_lyt_key': ''
		};
		console.log(body)
		try {
			// setIsLoading(true)
			const result = await ApiService('8011', 'post', '/data_source_layout/', body);
			console.log('Result:', result);
			setMultiSelectValues(result);

			console.log(result)
			// setIsLoading(false)

		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};
	console.log(multiSelectValues);

	console.log(multiSelects)
	const fetchMultiselectorUpdate = async (data) => {
		// console.log(data)
		try {
			const result = await ApiService('8011', 'put', '/layout_fields/bulk_pk/?is_pk=true',data.primaryKey);
			console.log(result);
			props.handleNext();
			} catch (error) {
			console.error('Error fetching data:', error);
		}
		
	};
	console.log(multiSelectValues)

	const handleSubmit = (values: any) => {
		const data = {
			...values,
			incomingFileFull: values.incomingFileFull === 'Yes' ? 'Full' : 'Incremental',
			buildHistory: values.buildHistory === 'Yes',
		};

		console.log('Is Incoming File A Full File?:', data.incomingFileFull);
		console.log('Do you want to build history?:', data.buildHistory);
		console.log('Form Values:', values);
		console.log('Data for fetchMultiselectorValues:', data);

		fetchMultiselectorValues(data);
		fetchMultiselectorUpdate(data)
	};
	const [personName, setPersonName] = React.useState<string[]>([]);
	const handleChange = (event: SelectChangeEvent<typeof personName>) => {
		const {
			target: { value },
		} = event;
		setPersonName(
			// On autofill we get a stringified value.
			typeof value === 'string' ? value.split(',') : value,
		);
	};


	return (
		<Box>
			<Formik
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={handleSubmit}
			>
				{({ handleSubmit, setFieldValue, values }) => (
					<Form onSubmit={handleSubmit}>
						<Stack>
							<Typography
								variant="subtitle1"
								display={"flex"}
								justifyContent={"center"}
							>
								Please select the checkboxes below to continue.
							</Typography>

							<Stack
								direction={"row"}
								display={"flex"}
								justifyContent={"center"}
								spacing={5}
								mt={5}
							>
								<Stack>
									<Typography variant="subtitle1" fontWeight={"bold"} pt={1}>
										Is Incoming File A Full File?
									</Typography>
								</Stack>
								<Stack>
									{/* <Controller
										name="ruleTypeCd"
										// control={control}
										render={({ field }) => ( */}
									<FormControl
										component="fieldset"
									// className="formControl"
									>
										<RadioGroup
											aria-label="Is Incoming File A Full File"
											name="incomingFileFull"
											value={values.incomingFileFull}
											onChange={(event) => setFieldValue("incomingFileFull", event.target.value)}
											row
										>
											{/* <br></br> */}
											<FormControlLabel
												key="Full"
												value="Full"
												control={
													<Radio
														sx={{
															"&.Mui-checked": {
																color: green[500],
															},
															"&:not(.Mui-checked)": {
																color: "black",
															},
														}}
													/>
												}
												label="Yes"
											></FormControlLabel>

											<FormControlLabel
												key="Incremental"
												value="Incremental"
												control={
													<Radio
														sx={{
															"&.Mui-checked": {
																color: green[500],
															},
															"&:not(.Mui-checked)": {
																color: "black",
															},
														}}
													/>
												}
												label="No"
											/>
										</RadioGroup>
										<Box sx={{ color: 'red' }}>
											<ErrorMessage name="incomingFileFull" component="div" />
										</Box>
									</FormControl>
									{/* )} */}
									{/* />  */}
								</Stack>
							</Stack>
							<Stack
								direction={"row"}
								display={"flex"}
								justifyContent={"center"}
								spacing={3}
							>
								<Typography variant="subtitle1" fontWeight={"bold"} pt={1}>
									do you want to build history?
								</Typography>
								{/* <Controller
									name="ruleTypeCd"
									// control={control}
									render={({ field }) => ( */}
								<FormControl
									component="fieldset"
								// className="formControl"
								>
									<RadioGroup
										aria-label="Do you want to build history"
										name="buildHistory"
										value={values.buildHistory}
										onChange={(event) => setFieldValue("buildHistory", event.target.value)}
										row
									>
										<br></br>
										<FormControlLabel
											key='True'
											value={true.toString()}
											control={
												<Radio
													sx={{
														"&.Mui-checked": {
															color: green[500],
														},
														"&:not(.Mui-checked)": {
															color: "black",
														},
													}}
												/>
											}
											label="Yes"
										></FormControlLabel>

										<FormControlLabel
											key="False"
											value={false.toString()}
											control={
												<Radio
													sx={{
														"&.Mui-checked": {
															color: green[500],
														},
														"&:not(.Mui-checked)": {
															color: "black",
														},
													}}
												/>
											}
											label="No"
										/>
									</RadioGroup>
									<Box sx={{ color: 'red' }}>
										<ErrorMessage name="buildHistory" component="div" />
									</Box>
								</FormControl>
								{/* )} */}
								{/* />  */}
							</Stack>
							<Stack alignItems={'center'}>
								<Stack mt={4}>
									<Stack>
										<Typography variant="subtitle1">
											Primary Key<span style={{ color: "red" }}>*</span>
										</Typography>
									</Stack>
									<Stack mt={1}>
										<FormControl sx={{ width: 400 }}>
											<Field
												name="primaryKey"
												render={({ field }) => (
													<Select
														{...field}
														multiple
														value={Array.isArray(field.value) ? field.value : []}
														onChange={(event) => setFieldValue("primaryKey", event.target.value)}
														input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
														renderValue={(selected: any) => (
															<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
																{selected.map((value: string) => (
																	<Chip key={value} label={multiSelects.find(item => item?.lyt_fld_id === value)?.lyt_fld_name} />
																))}
															</Box>
														)}
													>
														{multiSelects?.map((field: any, index: number) => (
															<MenuItem key={index} value={field?.lyt_fld_id}>
																{field?.lyt_fld_name}
															</MenuItem>
														))}
													</Select>
												)}
											/>
											<Box sx={{ color: 'red' }}>
												<ErrorMessage name="primaryKey" component="div" />
											</Box>
										</FormControl>
									</Stack>
								</Stack>
								<Stack mt={4}>
									<Stack>
										<Typography variant="subtitle1">
											File Name Pattern<span style={{ color: "red" }}>*</span>
										</Typography>
									</Stack>
									<Stack mt={1}>
										{/* <TextField
											placeholder="Enter File Name Pattern"
											variant="outlined"
											autoComplete="off"
											sx={{ width: "370px" }}
										/> */}
										<Field
											name="fileNamePattern"
											as={TextField}
											placeholder="Enter File Name Pattern"
											variant="outlined"
											autoComplete="off"
											sx={{ width: "400px" }}
										/>
										<Box sx={{ color: 'red' }}>
											<ErrorMessage name="fileNamePattern" component="div" />
										</Box>
										<Stack mt={4}>
											<Button className="bg-dark text-white" type="submit">Next</Button>
										</Stack>
									</Stack>
								</Stack>
							</Stack>
						</Stack>
					</Form>
				)}
			</Formik>
		</Box>
	);
}

export default ConfigurationStep;