import AlertHeader from './AlertHeader';
import AlertTableHead from './AlertTableHead';
import AlertTableDtl from './AlertTableBody';
import { Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import ApiService from '../../services/ApiServices';
import { removeDuplicates } from '../../utils/removeDuplicates';

function Alerts() {
	const [isLoading, setIsLoading] = useState(false);
	const [jobDetailList, setjobDetailList] = useState([]);
	const [filterOption, setFilterOption] = useState({});
	const [statusList, setStatusList] = useState();

	useEffect(() => {
		fetchJobDetails({});
		fetchData();
	}, []);

	const fetchJobDetails = async (params) => {
		try {
			setIsLoading(true);
			const result = await ApiService('8004', 'get', '/alert/search/alerts',null,params);
			console.log(result);
			if(Object.keys(filterOption).length === 0){
				var data = {
					projectData: removeDuplicates(result, 'project_name'),
					pipeLineData: removeDuplicates(result, 'source_name'),
				}
				setFilterOption(data);
			console.log(data)

			}
			setjobDetailList(result);
		} catch (error) {
			console.error('Error fetching data:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchData = async () => {
		try {
			const result = await ApiService('8011', 'get', '/codes_hdr/29');
			console.log(result.codes_dtl);
			var newFilterOption:any = { ...filterOption }
			newFilterOption.statusList = result.codes_dtl
			setStatusList(result.codes_dtl);
			// setFilterOption(newFilterOption);
			// console.log(newFilterOption)
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};

	return (
		<>
			<Stack >
				<Stack >

					<AlertHeader />
					<AlertTableHead filterOption={filterOption} status={statusList} fetchJobDetails={fetchJobDetails}/>
					<AlertTableDtl jobDetailList={jobDetailList} />
				</Stack>
			</Stack>
		</>
	);
}

export default Alerts;