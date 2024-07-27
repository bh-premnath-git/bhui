import ProjectsHeader from './ProjectsHeader';
import ProjectsTable from './ProjectsTable';
import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ApiService from '../../../services/ApiServices';



function Projects() {
	const [projectList, setProjectList] = useState([]);
	const [codesDtl, setCodesDtl] = useState([]);
	const [platformRegion, setPlatformRegion] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		getItem();
		fetchProject();
		getPlatformRegion();
		console.log(projectList);

	}, [codesDtl != null]);
	const getItem = async () => {
		var value: any = await localStorage.getItem('codesDtl');
		setCodesDtl(value)
		console.log(value);
	};
	const getPlatformRegion = async () => {
		var value: any = await localStorage.getItem('platformRegion');
		setPlatformRegion(value)
		console.log(value);


	};

	const fetchProject = async () => {
		try {
			setIsLoading(true)
			const result = await ApiService('8011', 'get', '/bh_project/search/');
			console.log(result);
			setProjectList(result)
			setIsLoading(false)

		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};
	const searchProject = async (search: any) => {
		console.log('Parent function called' + search);
		try {
			const params: any = {
				bh_project_name: search,
			};
			setIsLoading(true)
			const result = await ApiService('8011','', '/bh_project/search/', null, params);
			console.log(result);
			setProjectList(result)
			setIsLoading(false)
		} catch (error) {
			console.error('Error fetching data:', error);
		}

	};


	return (
		<>

			<div className='m-32' style={{ marginTop: '100px' }}>
				<ProjectsHeader search={searchProject} />
				<br></br>
				{projectList.length > 0 ? (
					<ProjectsTable data={{ 'project': projectList, 'codesDtl': codesDtl, 'platformRegion': platformRegion }} />
				) : (projectList.length == 0 && !isLoading) ? (
					<>
						<div style={{ textAlign: 'center', marginLeft: '46%', marginTop: '20%' }}>
							<img src="assets/images/userlanding/Layer 34.png" width={'15%'} />

						</div>
						<div style={{ textAlign: 'center', marginTop: '2%', fontSize: '16px' }}>
							No Project Available


						</div>
						<div style={{ textAlign: 'center', marginTop: '2%', fontSize: '16px' }}>
							<Button className='px-12 py-2 bg-dark'
							sx={{textTransform:'none'}}
								component={Link}
								to="/Admin-Console/Projects/New"
								variant="contained"
								// startIcon={<SwombSvgIcon>heroicons-outline:plus</SwombSvgIcon>}
								size="small"
							>
								Create New Project
							</Button>
						</div>
					</>

				) : (
					<p>Loading...</p>
				)}

			</div>


		</>
	);
}

export default Projects;