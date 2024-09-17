import { useEffect, useState } from 'react';
// import OnBoardHeader from '.Header';
// import OnboardTables from '.Tables';
import { Stack } from '@mui/material';
import ApiService from '../../Services/ApiServices';
import OnBoardHeader from './OnboardHeader';
import OnBoardTables from './OnboardTables';

interface JobDetail {
	data_src_name: any;
	// Add other properties as needed
}

interface SelectedValue {
	data_src_name: string | null;
}
function OnboardAllData() {
	const [isLoading, setIsLoading] = useState(false);
	const [jobDetailList, setJobDetailList]:any = useState([]);
	const [searchList, setSearchList]:any = useState([]);

	const [selectedValue, setSelectedValue] = useState<SelectedValue>({ data_src_name: null });
	const [selectedRow, setSelectedRow] = useState<JobDetail | null>(null);

    const handleSearch = (value: SelectedValue, selectedRow: JobDetail | null) => {
        setSelectedValue(value);
		console.log(value)
        setSelectedRow(selectedRow);
    };



	useEffect(() => {

		fetchJobDetails();


	}, [selectedRow]);

	const fetchJobDetails = async () => {
		setIsLoading(true);
		const params = {...selectedValue}
		// alert(JSON.stringify(params))
		console.log(selectedValue)
		console.log(params)
		try {

			setIsLoading(true)
			const result = await ApiService('8011', 'get', '/data_source/list/',null,params);
			console.log(result);
			setJobDetailList(result)
			if(!params.data_src_name){
				setSearchList(result)
			}
			setIsLoading(false)

		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};
	// const handleSearch = (value: SelectedValue) => {
	// 	setSelectedValue(value);
	// };




	return (
		<>

			<div>
				<Stack className='' sx={{ width: '100%', textAlign: 'start' }}>
					<OnBoardHeader data={searchList} onSearch={handleSearch} />
					<OnBoardTables data={jobDetailList} selectedRow={selectedRow} />
				</Stack>
			</div>
		</>
	);
}

export default OnboardAllData;