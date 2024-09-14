import React from 'react'
import BuildDataTableHeader from './BuildDataTableHeader'
import CustomTable, { generateColumnsFromData } from '../../../common/CustomTable'
import { MenuItem, Stack } from '@mui/material'
import { Margin } from '@mui/icons-material'

export default function BuildDataPipeLine() {
    const buildPipelineDataList = [
        { id: 1, projectName: 'project 1', pipeLineName: 'Pipeline Name 1', lastUpdatedBy: 'John Doe', LastExecutedOn: '15/06/2023 12:56:20' },
        { id: 2, projectName: 'project 1', pipeLineName: 'Pipeline Name 1', lastUpdatedBy: 'John Doe', LastExecutedOn: '15/06/2023 12:56:20' },
        { id: 3, projectName: 'project 1', pipeLineName: 'Pipeline Name 1', lastUpdatedBy: 'John Doe', LastExecutedOn: '15/06/2023 12:56:20' },
        { id: 4, projectName: 'project 1', pipeLineName: 'Pipeline Name 1', lastUpdatedBy: 'John Doe', LastExecutedOn: '15/06/2023 12:56:20' },
        { id: 5, projectName: 'project 1', pipeLineName: 'Pipeline Name 1', lastUpdatedBy: 'John Doe', LastExecutedOn: '15/06/2023 12:56:20' },
        { id: 6, projectName: 'project 1', pipeLineName: 'Pipeline Name 1', lastUpdatedBy: 'John Doe', LastExecutedOn: '15/06/2023 12:56:20' }
    ]
    const columns = generateColumnsFromData(buildPipelineDataList);
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
    return (
        <div>
            <BuildDataTableHeader />
            <CustomTable className='mt-4' columns={columns} data={buildPipelineDataList} menuActions={menuActions} />
        </div>
    )
}
