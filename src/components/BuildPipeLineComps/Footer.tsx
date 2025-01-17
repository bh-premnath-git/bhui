// Footer.tsx
import React, { useState, useCallback } from 'react';
import { Box, Divider, IconButton, Stack, Button, Tooltip, Tabs, Tab, Typography, Drawer, TextField, InputAdornment } from '@mui/material';
import { PiAlignCenterHorizontalLight } from 'react-icons/pi';
import { CiZoomIn, CiZoomOut } from 'react-icons/ci';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { IoFilterSharp, IoPlay, IoStop } from "react-icons/io5";
import PipelineDrawer from './PipeLineDrawer';
import { VscDebugCoverage, VscDebugReverseContinue } from 'react-icons/vsc';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { COLORS } from '@/Utils/constants';
import schemaValidation from '@/pages/buildPipeLine/json_schema_validators.json';
import { getTransformationCount, setIsDebug, setIsRun, startPipeLine, stopPipeLine } from '@/redux/BuildPipeLineSlice';
import { LuZoomIn, LuZoomOut } from 'react-icons/lu';
import { FaAutoprefixer } from 'react-icons/fa';
import { useReactFlow } from 'reactflow';

export default function Footer({ com, handleZoomIn, handleZoomOut, handleFitView, showToast, formStates, pipelineDtl }: any) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [open, setOpen] = useState(false);
    const [drawerHeight, setDrawerHeight]: any = useState('60%');
    const [selectedTab, setSelectedTab] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [selectedFormState, setSelectedFormState] = useState<any>(null);
    const [runDialogOpen, setRunDialogOpen] = useState(false);
    const { isRun, isDebug, nodesList }: any = useSelector((state: RootState) => state.buildPipeLineApi);
    const dispatch = useDispatch();
    const reactFlowInstance = useReactFlow();
    const toggleDrawer = (newState: boolean) => () => {
        setOpen(newState);
    };

    const expandDrawer = () => {
        setIsFullScreen(prevState => !prevState);
        setDrawerHeight((prevState: any) => (prevState === '60%' ? '99%' : '60%'));

    };
    const handleClick = () => {
        toggleDrawer(true)
        setIsExpanded(!isExpanded);
    };
    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setSelectedTab(newValue);
    };
    const handleButtonClick = async (process: string) => {
        if (process === 'start') {
            // setIsButtonClicked(true);
            // setIsPopupOpen(true);

            try {
                const response = await dispatch(startPipeLine({
                    pipeline_name: `${pipelineDtl?.pipeline_name || "sample_pipeline"}`,
                    pipeline_json: JSON.stringify(schemaValidation.module),
                    mode: "DEFAULT"
                })).unwrap();

                if (response) {
                    // Call getTransformationCount only if startPipeLine was successful
                    // var result = await dispatch(getTransformationCount({ pipeline_name: 'sample' })).unwrap();
                    // console.log(result.payload);
                    dispatch(setIsRun(true));

                    showToast(response.message, { color: COLORS.green });
                } else {
                    showToast('Sample Pipeline Failed to Start', { color: COLORS.red });
                }
            } catch (error) {
                showToast(`${pipelineDtl?.pipeline_name || "sample_pipeline"} Pipeline Failed to Start`, { color: COLORS.red });
                console.error('Error starting pipeline:', error);
            }
        } else if (process === 'stop') {
            try {

                const response = await dispatch(stopPipeLine({ pipeline_name: "sample" }))
                if (response?.payload?.message) {
                    dispatch(setIsRun(false));
                    showToast(response?.payload?.message, { color: COLORS.red });
                }
            } catch (error) {
                showToast(`${pipelineDtl?.pipeline_name || "sample_pipeline"} Pipeline Failed to Stop`, { color: COLORS.red });
                console.error('Error starting pipeline:', error);
            }
        } else {
            dispatch(setIsDebug(!isDebug));
            const nodes = JSON.parse(nodesList || '[]');
            const checkedDisplayNames = await nodes?.filter((node: any) => node.data.isCheck).map((node: any) => node.data.display);
            console.log(checkedDisplayNames)
            try {
                let checkPoint = checkedDisplayNames.join(',');
                console.log(checkPoint)
                const response = await dispatch(startPipeLine({
                    pipeline_name: `${pipelineDtl?.pipeline_name || "sample_pipeline"}`,
                    pipeline_json: JSON.stringify(schemaValidation.module),
                    mode: "DEBUG",
                    checkpoints: checkPoint
                })).unwrap();
                console.log(response)
                if (response?.message) {
                    var result = await dispatch(getTransformationCount({ pipeline_name: `${pipelineDtl?.pipeline_name || "sample_pipeline"}` })).unwrap();
                    console.log(result.payload);
                }
            } catch (error) {

            }
        }


    };

    const handlePipelineRun = useCallback(() => {
        const allNodes = reactFlowInstance.getNodes();
        const edges = reactFlowInstance.getEdges();

        // Get all connected nodes in the pipeline
        const getAllConnectedNodes = (): string[] => {
            const visited = new Set<string>();
            const ordered: string[] = [];

            const visit = (currentId: string) => {
                if (visited.has(currentId)) return;
                visited.add(currentId);

                // Get both incoming and outgoing edges
                const connectedEdges = edges.filter(edge =>
                    edge.target === currentId || edge.source === currentId
                );

                for (const edge of connectedEdges) {
                    if (edge.source !== currentId) visit(edge.source);
                    if (edge.target !== currentId) visit(edge.target);
                }
                ordered.push(currentId);
            };

            // Start from any source node
            const sourceNode = allNodes.find(node => node.data.label.toLowerCase().includes("source"));
            if (sourceNode) {
                visit(sourceNode.id);
            }
            return ordered;
        };

        const pipelineNodeIds = getAllConnectedNodes();

        // Create pipeline configuration
        const pipelineConfig = {
            mode: "DEBUG",
            name: `${pipelineDtl?.pipeline_name || "sample_pipeline"}`,
            description: "Complete pipeline",
            transformations: pipelineNodeIds
                .map(nodeId => {
                    const node = allNodes.find(n => n.id === nodeId);
                    if (!node) return null;

                    // Handle Source nodes
                    if (node.data.source) {
                        return {
                            name: node.data.source?.data_src_desc ?? "read_input_data",
                            dependent_on: [],
                            transformation: "Reader",
                            file_path: `${node.data.source.file_path_prefix}/${node.data.source.file_name}`,
                            read_options: {
                                header: true
                            }
                        };
                    }

                    if (!formStates[nodeId]) return null;

                    const moduleName = node.data.label.split(' ')[0].toLowerCase();
                    const incomingEdges = edges.filter(edge => edge.target === nodeId);
                    const dependentOn = incomingEdges.map(edge => {
                        const sourceNode = allNodes.find(n => n.id === edge.source);
                        const sourceLabel = sourceNode?.data?.label || '';
                        return sourceLabel.toLowerCase().includes("source") ?
                            "read_input_data" :
                            `${sourceLabel.split(' ')[0].toLowerCase()}_transformation`;
                    });

                    return {
                        name: `${moduleName}_transformation`,
                        dependent_on: dependentOn.length > 0 ? dependentOn : ['read_input_data'],
                        transformation: node.data.label,
                        ...formStates[nodeId]
                    };
                })
                .filter(Boolean)
        };

        console.log('Complete Pipeline Configuration:', pipelineConfig);
        setSelectedFormState(pipelineConfig);
        setRunDialogOpen(true);
    }, [reactFlowInstance, formStates]);

    return (
        <>
            <Stack
                direction="row"
                spacing={3}
                sx={{
                    justifyContent: 'flex-end',
                    pr: 6,


                }}
            >
                <Stack>
                    {com}
                </Stack>
                <Tooltip title="Run Pipeline" placement="bottom">
                    <IconButton onClick={handlePipelineRun} className='shadow-sm rounded'>
                        <IoPlay size={20} color={"black"} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Run" placement="bottom">
                    <IconButton onClick={() => handleButtonClick('start')} className='shadow-sm rounded'>
                        <IoPlay size={20} style={{ color: 'black' }} />
                    </IconButton>
                </Tooltip>
                {/* <PlayPopUp isOpen={isPopupOpen} onClose={closePopup} /> */}


                <Tooltip title="Pause" placement="bottom">
                    <IconButton onClick={() => handleButtonClick('stop')} className='shadow-sm rounded' >
                        <IoStop size={20} color={isDebug ? "red" : "black"} />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Debug" placement="bottom" className='shadow-sm rounded'>
                    <IconButton onClick={() => isRun ? handleButtonClick('debug') : null} >
                        <VscDebugReverseContinue size={20} color={(isRun && !isDebug) ? 'black' : isDebug ? "green" : "gray"} />
                    </IconButton>
                </Tooltip>



                <Tooltip title="Auto Align" placement="bottom" className='shadow-sm rounded'>
                    <IconButton onClick={handleFitView}>
                        <FaAutoprefixer color={'black'} />
                    </IconButton>
                </Tooltip>
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Zoom In" placement="bottom" className='shadow-sm rounded'>
                        <IconButton onClick={handleZoomIn}>
                            <LuZoomIn color={'black'} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Zoom Out" placement="top" className='shadow-sm rounded'>
                        <IconButton onClick={handleZoomOut}>
                            <LuZoomOut color={'black'} />
                        </IconButton>
                    </Tooltip>

                </Stack>
                <Button className='shadow rounded bg-black text-white'
                    onClick={handleClick}
                    endIcon={isExpanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                    sx={{
                        textTransform: 'none',

                    }}
                >
                    Data Preview
                </Button>

                <PipelineDrawer
                    isExpanded={isExpanded}
                    toggleDrawer={toggleDrawer}
                    expandDrawer={expandDrawer}
                    drawerHeight={drawerHeight}
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                    isFullScreen={isFullScreen} handleClick={handleClick} />
            </Stack>

            {/* </footer> */}
        </>
    );
}
