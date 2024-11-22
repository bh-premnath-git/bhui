import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import {ApiService} from '@/services/apiServices';
import CatalogHead from '../components/Catalog/CatalogHead';
import CatalogTableBody from '../components/Catalog/CatalogTableBody';
import { Stack } from '@mui/material';

interface DataSource {
	data_src_name: any;
	// Add other properties as needed
}

interface SelectedOption {
	data_src_name: string | null;
}
function Catalog() {
	const [dataSourceList, setDataSourceList] = useState([]);
	const [searchDataList, setSearchDataList] = useState([]);
	const [selectedTag, setSelectedTag] = useState<SelectedOption>({data_src_name:null});
	// const [selectedRow, setSelectedRow] = useState<DataSource| null>(null);
	


	useEffect(() => {
		fetchDataSource();
	}, []);


	const fetchDataSource = async () => {
		try {
			const params: any = {
				offset: 0,
				limit: 10,
			};
			console.log(params)
			console.log(selectedTag)
			const result = await ApiService('8011', 'get', '/data_source/list/', null, params);
			console.log(result);
			setDataSourceList(result);
			setSearchDataList(result)
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};

	const searchDataSource = async (search: any) => {
		console.log('Parent function called' + JSON.stringify(search));
		try {
			setDataSourceList([])
			var params: any = {"data_src_name":search?.data_src_name}
			console.log(params)
			
			// if (search) {
			// 	params.data_src_name = search
			// }

			const result = await ApiService('8011', 'get', '/data_source/list/', null, params);
			console.log(result);
			setDataSourceList(result)
			
		} catch (error) {
			console.error('Error fetching data:', error);
		}

	};
	const handleSearchData = (value:SelectedOption) => {
		searchDataSource(value)
        setSelectedTag(value);
        console.log(value)
       
    };
return (
		<Stack sx={{ width: '100%' }}>

			<CatalogHead search={searchDataSource} dataSourceList={dataSourceList} searchDataList={searchDataList} onSearch={handleSearchData}/>
			{dataSourceList.length > 0 ? <CatalogTableBody data={dataSourceList}  selectedTag={selectedTag}
				className='' /> : <>
				<div style={{ textAlign: 'center', marginTop: '10%' }}>
					<img src="/assets/userlanding/Layer 34.png" width={'5%'} />

				</div>
				<div style={{ textAlign: 'center', marginTop: '2%', fontSize: '16px', marginBottom: '10%' }}>
					No Catalog Available


				</div>
			</>}

		</Stack>
	);


}

export default Catalog;
