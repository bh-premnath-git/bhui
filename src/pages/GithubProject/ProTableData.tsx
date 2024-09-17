import { MenuItem } from '@mui/material';
import CustomTable, { generateColumnsFromData } from '../../common/CustomTable';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Redux/store';
import { useNavigate } from 'react-router-dom';
import { setEditProjectData } from '../../Redux/ProjectSlice';

const ProTableData = () => {
    const { gitProjectList } = useSelector((state: RootState) => state.projectApi);
    const excludeKeys = ['tags', 'created_at', 'updated_at', 'bh_project_id', 'bh_github_token_url'];
    const columns: any = generateColumnsFromData(gitProjectList, excludeKeys);
    const navigate = useNavigate();
    const dispatch=useDispatch();
    const menuActions = (row, index) => [
        <MenuItem key={`edit-${index}`} onClick={() => handleEdit(index)}>Edit</MenuItem>,
        <MenuItem key={`status-${index}`} onClick={() => handleStatusChange(index)}>
            {row.status === 'Active' ? 'Disable' : 'Enable'}
        </MenuItem>,
    ];

    const handleStatusChange = (index) => {
        console.log(index)
    };
    const handleEdit=async (index)=>{
        await dispatch(setEditProjectData(gitProjectList[index]));
        navigate('/All Projects/New')
        console.log(gitProjectList[index])
    }

    return <CustomTable columns={columns} data={gitProjectList} menuActions={menuActions} />;
};

export default ProTableData;
