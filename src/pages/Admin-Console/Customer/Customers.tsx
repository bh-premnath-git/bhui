import { Button, Stack } from '@mui/material';
import ApiService from '../../../services/ApiServices';
import CustomersHeader from './CustomersHeader';
import CustomersTable from './CustomersTable';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * The customers page.
 */
function Customers() {
	const [manageCustomerList, setManageCustomerList] = useState([]);

	useEffect(() => {
		fetchManageCustomer('');
	}, []);

	const fetchManageCustomer = async (search: any) => {
		try {
			const params: any = {
				relation_ship_owner: search
			}; 
			const result = await ApiService('8011', 'get', '/customer/search', null, params);
			console.log(result);
			setManageCustomerList(result)
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};

	return (
		<div style={{ paddingLeft: '50px', paddingRight: '50px', paddingTop: '0',marginTop:'100px' }}>
			{manageCustomerList.length > 0 ?(
				<>
				<CustomersHeader />
				<CustomersTable data={manageCustomerList} />
				</>
			
			):manageCustomerList.length == 0?(
				<>
				<div style={{ textAlign: 'center', marginTop: '20%' }}>
								<img src="/assets/userlanding/Layer 34.png" width={'10%'} />

							</div>
							<div style={{ textAlign: 'center', marginTop: '2%', fontSize: '16px',fontWeight:'bold' }}>
								No Customers are Onboarded <br></br>
								
									<Button className='bg-dark text-white' 
									sx={{ padding: '10px',
										 backgroundColor: 'black',
										  color: 'white',
										  textTransform:'none',
										  marginTop:'27px', 
										'& hover': { background: 'black' } }}
										component={Link}
										to="/Admin Console/Manage Customer/Add Customer"
										variant="contained"
									>
										Add Customer
									</Button>
							</div>
				</>
			): (
				<p>Loading...</p>
				)}
			
			{/* <CustomersHeader />
			 <CustomersTable data={manageCustomerList} /> */}
		</div>
	);
}

export default Customers;