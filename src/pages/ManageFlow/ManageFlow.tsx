import React, { useEffect, useRef, useState } from 'react';
import CustomTable, { generateColumnsFromData } from '../../common/CustomTable';
import ManageFlowHeader from './ManageFlowHeader';
import { Typography, Box, Button } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../Redux/hooks';
import { listFlows, getEnvironmentList, getFlowProjectList } from '../../Redux/FlowSlice';
import Modal from '../../components/ModalWithPortal'; // Import the Modal component
import CreateFlowForm from '../../components/CreateFlowForm/CreateFlowForm'; // Import the CreateFlowForm component

// Combine both ManageFlow and NoFlowsComponent into one component
function ManageFlow() {
    const dispatch = useAppDispatch();

    // Modal state management
    const [isModalOpen, setIsModalOpen] = useState(false);
    const flows = useAppSelector((state) => state.flowApi.flows);
    const loading = useAppSelector((state) => state.flowApi.loading);
    const error = useAppSelector((state) => state.flowApi.error);

    const keysToExclude = [
        'schedule_intervals',
        'json_config',
        'recipent_emails',
        'bh_env_provider',
        'id',
        'flow_id',
        'notes',
        'job',
        'git_branch',
        'tags',
        'bh_project_id',
        'flow_class',
        'flow_name',
        'metadata_flow',
        'last_executed'
    ] as const;

    // Use a ref to ensure the action is only dispatched once
    const hasFetchedFlows = useRef(false);

    useEffect(() => {
        if (!hasFetchedFlows.current) {
            dispatch(listFlows());
            dispatch(getEnvironmentList());
            dispatch(getFlowProjectList({}));
            hasFetchedFlows.current = true;
        }
    }, [dispatch]);

    // Function to handle modal open
    const handleCreateNewFlow = () => {
        setIsModalOpen(true);
    };

    // Function to handle modal close
    const closeModal = () => {
        setIsModalOpen(false);
    };

    const processedFlows = flows.map((flow) => excludeKeys(flow, keysToExclude));
    const columns = generateColumnsFromData(processedFlows);

    const modifiedData = processedFlows.map((row) => ({
        ...row,
        Action: (
            <Typography
                style={{
                    color: row.Action === 'Disabled' ? 'gray' : 'inherit',
                }}
            >
                {row.Action}
            </Typography>
        ),
    }));

    const tableStyles = {
        headerCell: {
            fontSize: '18px',
            fontWeight: 'bold',
        },
    };

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="60vh"
            >
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Typography color="error" sx={{ mt: 4, textAlign: 'center' }}>
                Error: {error}
            </Typography>
        );
    }

    return (
        <>
            {flows.length > 0 ? (
                <>
                    <ManageFlowHeader />
                    <CustomTable
                        className="mt-4"
                        columns={columns}
                        data={modifiedData}
                        headerCellStyle={tableStyles.headerCell}
                        metaData={flows}
                    />
                </>
            ) : (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ mt: 4 }}
                >
                    <img
                        src="/assets/userlanding/Layer34.svg"
                        alt="No flows"
                        style={{ width: '5%' }}
                    />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        No Flows Available
                    </Typography>
                    <Button
                        sx={{
                            mt: 2,
                            px: 3,
                            py: 1,
                            backgroundColor: 'black',
                            color: 'white',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: 'white',
                                color: 'black',
                                border: '1px solid black',
                            },
                        }}
                        onClick={handleCreateNewFlow} // Trigger the modal open function
                        variant="contained"
                        size="small"
                    >
                        Create New Flow
                    </Button>
                </Box>
            )}

            {/* Modal for creating a new flow */}
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <CreateFlowForm onClose={closeModal} />
            </Modal>
        </>
    );
}

export default ManageFlow;

// Utility function to exclude specific keys from an object
type InputObject = Record<string, any>;

function excludeKeys<T extends InputObject, K extends keyof T>(
    obj: T,
    keysToExclude: readonly K[]
): Omit<T, K> {
    const result = {} as T;

    for (const key in obj) {
        if (
            Object.prototype.hasOwnProperty.call(obj, key) &&
            !keysToExclude.includes(key as unknown as K)
        ) {
            result[key] = obj[key];
        }
    }

    return result as Omit<T, K>;
}
