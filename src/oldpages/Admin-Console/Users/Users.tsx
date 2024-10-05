import UsersHeader from './UsersHeader';
import UsersTable from './UsersTable';
import { useEffect, useState } from 'react';
import { Button, Stack } from '@mui/material';
import ApiService from '../../../Services/ApiServices';

import { Link } from 'react-router-dom';

/**
 * The users page.
 */
function Users() {
	const [userList, setUserList] = useState([]);
	useEffect(() => {
		fetchUser();
		// alert('lo');
		console.log(userList)
	}, []);


	const fetchUser = async () => {
		try {
			// alert('hi');
			const params: any = {
				offset: 0,
				limit: 10,
			};
			const result = await ApiService('8011', 'get', '/bh_user/list/', null, params);
			console.log(result);
			setUserList(result)
			// alert(JSON.stringify(result));
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};
	const searchProject = async (search: any) => {
		console.log('Parent function called' + search);
		try {
			const params: any = {
				bh_user_first_name: search,
			};
			const result = await ApiService('8011', 'get', '/bh_user/search/', null, params);
			console.log(result);
			setUserList(result);
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};

	return (
		<>
			<Stack >
				{/* <UsersHeader search={searchProject} /> */}
				<div >
					{/* <UsersTable /> */}
					{userList.length > 0 ? (
						<>
							<UsersHeader search={searchProject} />
							<UsersTable data={userList} />
						</>
					) : userList.length == 0 ? (
						<>
							<div style={{ textAlign: 'center', marginTop: '10%' }}>
								<img src="/assets/userlanding/Layer 34.png" width={'10%'} />

							</div>
							<div style={{ textAlign: 'center', marginTop: '2%', fontSize: '16px',fontWeight:'bold' }}>
								No User Available
								<Stack direction={'row'} margin={'auto'} spacing={3} justifyContent="center" mt={3}>
									<Button className='bg-dark text-white fw-bold'
									sx={{ padding: '10px', 
										backgroundColor: 'black', 
										color: 'white',
										textTransform:'none', '& hover': { background: 'black' } }}
										component={Link}
										to="/Admin Console/Manage Data Platform Users/Add User"
										variant="contained"
										size="small"
									>
										Add Project Team
									</Button>
									<Button className='bg-dark text-white fw-bold'
									sx={{ padding: '10px', 
										backgroundColor: 'black',
										 color: 'white',
										 textTransform:'none',
										  '& hover': { background: 'black' }, width: '180px' }}
										component={Link}
										to="/Admin Console/Manage Data Platform Users/Add User"
										variant="contained"
										size="small"
									>
										Add User
									</Button>
								</Stack>
							</div>
						</>
					) : (
						<p>Loading...</p>
					)}

				</div>
			</Stack>
			{/* <SwombPageCarded
			header={<UsersHeader search={searchProject} />}
			content={
				<div style={{ paddingLeft: '50px', paddingRight: '50px', paddingTop: '0' }}>
					{userList.length > 0 ? (
						<UsersTable data={userList} />
					) : userList.length == 0 ? (
						<>
							<div style={{ textAlign: 'center', marginLeft: '46%', marginTop: '20%' }}>
								<img src="assets/images/userlanding/Layer 34.png" width={'15%'} />

							</div>
							<div style={{ textAlign: 'center', marginTop: '2%', fontSize: '16px' }}>
								No Project Available


							</div>
						
						</>

					) : (
						<p>Loading...</p>
					)}

				</div>
			}

			scroll={isMobile ? 'normal' : 'content'}
		/> */}
		</>
	);
}

export default Users;