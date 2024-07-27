import _ from 'lodash';
import CatalogsHead from './CatalogsHead';
import { useLocation } from 'react-router-dom';
import { Stack } from '@mui/material';



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

