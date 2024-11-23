import _ from 'lodash';
import { useLocation } from 'react-router-dom';
import { Stack } from '@mui/material';
import CatalogsHead from './CatalogsHead';



export default function Catalogs() {

	const location = useLocation();
	const catalogData = location.state;
	console.log(catalogData)

	return (
		<Stack className='' sx={{width:'100%'}}>
			<CatalogsHead data={catalogData} />
		</Stack>
	);


}

