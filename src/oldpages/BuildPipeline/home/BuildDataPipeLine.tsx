import React from 'react'
import BuildDataTableHeader from './BuildDataTableHeader'
import CustomTable, { Column, generateColumnsFromData } from '../../../common/CustomTable'
import { MenuItem, Stack } from '@mui/material'
import { Margin } from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { getGitProject } from '../../../redux/ProjectSlice'
import { RootState } from '../../../redux/store'
import { getAllPipeline } from '../../../redux/BuildPipeLineSlice'
// import { buildPipeLineColumn } from '../staticData'

export default function BuildDataPipeLine() {
    const dispatch = useDispatch();
    const { param,gitProjectList } = useSelector((state: RootState) => state.projectApi);
    const { pipelineList } = useSelector((state: RootState) => state.buildPipeLineApi);

    React.useEffect(() => {
        dispatch(getAllPipeline({ offset: 0, limit: 100, order_desc: false }));
        dispatch(getGitProject(param));
    }, [dispatch])

    const buildPipelineDataList = pipelineList;
    const excludeKeys = ['tags','pipeline_id',];

    const columns = generateColumnsFromData(buildPipelineDataList,excludeKeys,['bh_project_id','pipeline_name','created_by','created_at','updated_at']);
    const menuActions = (row, index) => [
        <MenuItem key={`edit-${index}`} onClick={() => handleEdit(index)}>Edit</MenuItem>,
        <MenuItem key={`clone-${index}`} onClick={() => handleClone(index)}>Clone</MenuItem>,
        <MenuItem key={`status-${index}`} onClick={() => handleStatusChange(index)}>
            {row.status === 'Active' ? 'Disable' : 'Enable'}
        </MenuItem>,
    ];
    function handleEdit(index) {

    }
    function handleStatusChange(index) {

    }
    function handleClone(index) {

    }

 const buildPipeLineColumn: Column[] = [
    { key: 'bh_project_id', label: 'BH Project ', format: (value: string) => gitProjectList?.find(item => item?.bh_project_id == value)?.bh_project_name },
    { key: 'pipeline_name', label: 'Pipeline Name' },
    { key: 'git_branch', label: 'Git Branch' },
    { key: 'updated_by', label: 'Last Updated By' },
    { key: 'updated_at', label: 'Last Updated On', format: (value: string) => new Date(value).toLocaleString() },
    { key: 'created_at', label: 'Last Executed On', format: (value: string) => new Date(value).toLocaleString() },
];
    return (
        <div>
            <BuildDataTableHeader />
            <CustomTable className='mt-4' columns={buildPipeLineColumn} data={buildPipelineDataList} menuActions={menuActions} />
        </div>
    )
}
