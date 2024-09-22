import React from 'react'
import CustomTable, { generateColumnsFromData } from '../../common/CustomTable'
import ManageFlowHeader from './ManageFlowHeader';
import { Typography } from '@mui/material';


function ManageFlow() {
    const manageFlowDataList = [
        { Name: 'Customers Daily', Schedule: "Daily 8 Am", Environment: "Development", Project: "Ingestion", CreatedBy: "JohnDoe", LastUpdatedOn: "5/8/2024", lastExecutedOn: "10/8/2024", Action: "Disabled" },
        { Name: 'Customers Daily', Schedule: "Daily 8 Am", Environment: "Development", Project: "Ingestion", CreatedBy: "JohnDoe", LastUpdatedOn: "5/8/2024", lastExecutedOn: "10/8/2024", Action: "Disabled" },
        { Name: 'Customers Daily', Schedule: "Daily 8 Am", Environment: "Development", Project: "Ingestion", CreatedBy: "JohnDoe", LastUpdatedOn: "5/8/2024", lastExecutedOn: "10/8/2024", Action: "Disabled" },
        { Name: 'Customers Daily', Schedule: "Daily 8 Am", Environment: "Development", Project: "Ingestion", CreatedBy: "JohnDoe", LastUpdatedOn: "5/8/2024", lastExecutedOn: "10/8/2024", Action: "Disabled" },
        { Name: 'Customers Daily', Schedule: "Daily 8 Am", Environment: "Development", Project: "Ingestion", CreatedBy: "JohnDoe", LastUpdatedOn: "5/8/2024", lastExecutedOn: "10/8/2024", Action: "Disabled" },
        { Name: 'Customers Daily', Schedule: "Daily 8 Am", Environment: "Development", Project: "Ingestion", CreatedBy: "JohnDoe", LastUpdatedOn: "5/8/2024", lastExecutedOn: "10/8/2024", Action: "Disabled" },
        { Name: 'Customers Daily', Schedule: "Daily 8 Am", Environment: "Development", Project: "Ingestion", CreatedBy: "JohnDoe", LastUpdatedOn: "5/8/2024", lastExecutedOn: "10/8/2024", Action: "Disabled" },
    ]

    const columns = generateColumnsFromData(manageFlowDataList);

    const modifiedData = manageFlowDataList.map((row) => ({
        ...row,
        Action: (
            <Typography style={{ color: row.Action === 'Disabled' ? 'gray' : 'inherit' }}>
                {row.Action}
            </Typography>
        )
    }));
    const tableStyles = {
        headerCell: {
            fontSize: '18px',
            fontWeight: 'bold',
        },
    };
    return (
        <>
            <ManageFlowHeader />
            <CustomTable className='mt-4' columns={columns} data={modifiedData} headerCellStyle={tableStyles.headerCell} />
        </>
    )
}

export default ManageFlow;