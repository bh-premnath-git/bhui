import React, { useState, useEffect, useCallback } from 'react';
import { Node } from './types/formTypes';
import { X } from 'lucide-react';
import { Menu, MenuItem } from '@mui/material';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { ApiService } from '../../services/apiServices';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setUnsavedChanges } from '@/redux/features/autoSaveSlice';
import { CATALOG_API_PORT } from '@/configration/environment';

const NodeDropList = ({ filteredNodes, handleNodeClick, addNodeToHistory }: any) => {
    // Track the currently opened dropdown
    const [dropdownVisible, setDropdownVisible] = useState<string | null>(null);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [open, setOpen] = React.useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };


    const handleMoreClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMoreClose = () => {
        setAnchorEl(null);
    };
    const [dataSources, setDataSources] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const ITEMS_PER_PAGE = 10;
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredSources, setFilteredSources] = useState<any[]>([]);
    // Add new state to track if dropdown is being interacted with
    const [isInteractingWithDropdown, setIsInteractingWithDropdown] = useState(false);
    const dispatch = useDispatch();
    const { hasUnsavedChanges } = useSelector((state: RootState) => state.autoSave);
    // Update the fetchDataSources function
    const fetchDataSources = useCallback(async (pageNum: number) => {
        try {
            setLoading(true);
            const response = await ApiService(
                CATALOG_API_PORT,
                'get',
                '/data_source/list/',
                null,
                {
                    offset: (pageNum - 1) * ITEMS_PER_PAGE,
                    limit: ITEMS_PER_PAGE,
                    order_desc: false
                }
            );
            if (pageNum === 1) {
                setDataSources(response || []);
            } else {
                setDataSources(prev => [...prev, ...(response || [])]);
            }
        } catch (error) {
            console.error('Error fetching data sources:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Update useEffect to use the new fetch function
    useEffect(() => {
        fetchDataSources(1);
    }, [fetchDataSources]);

    // Add scroll handler for infinite scroll
    const handleScroll = useCallback((event: React.UIEvent<HTMLUListElement>) => {
        const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight * 1.5 && !loading) {
            setPage(prev => prev + 1);
            fetchDataSources(page + 1);
        }
    }, [fetchDataSources, loading, page]);

    // Function to handle clicking outside to close the dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Close dropdown if the click is outside the dropdown or button
            const dropdown = document.querySelector('.dropdown') as HTMLElement;
            const button = event.target as HTMLElement;

            if (dropdown && !dropdown.contains(button) && !button.closest('.node-button')) {
                setDropdownVisible(null); // Close dropdown
            }
        };

        // Add the event listener when the component mounts
        document.addEventListener('click', handleClickOutside);

        // Cleanup the event listener when the component unmounts
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // Handle button click to toggle dropdown visibility for "Source"
    const handleButtonClick = (node: Node) => {
        dispatch(setUnsavedChanges());
        if (node.ui_properties.module_name === 'Reader') {
            setDropdownVisible((prevState) =>
                prevState === node.ui_properties.module_name ? null : node.ui_properties.module_name
            );
        } else {
            addNodeToHistory(); // Save current state before adding a new node
            handleNodeClick(node); // Handle click for other nodes
        }
    };

    // Update useEffect to filter sources when search term or dataSources change
    useEffect(() => {
        const filtered = dataSources.filter(source =>
            source.data_src_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSources(filtered);
    }, [searchTerm, dataSources]);

    // Update the hover logic
    const handleNodeHover = (nodeName: string | null) => {
        if (!isInteractingWithDropdown) {
            setHoveredNode(nodeName);
        }
    };

    return (
        <div className="flex justify-center gap-4 mb-4">
            {filteredNodes.slice(0, 8).map((node: Node) => (
                <div key={node.ui_properties.module_name}
                    onMouseEnter={() => handleNodeHover(node.ui_properties.module_name)}
                    onMouseLeave={() => handleNodeHover(null)}
                    className="relative">
                    {/* Node Button */}
                    <button
                        onClick={() => handleButtonClick(node)}
                        className="node-button rounded text-white flex items-center p-0.5 transition-all duration-300 ease-in-out"
                        style={{
                            backgroundColor: node.ui_properties.color,
                        }}
                    >
                        <div className={`
                            flex items-center rounded-lg
                            transition-all duration-300 ease-in-out
                            ${hoveredNode === node.ui_properties.module_name ? 'w-auto' : 'w-9'}
                        `}>
                            <img
                                src={node.ui_properties.icon}
                                alt={node.ui_properties.module_name}
                                className="w-9 h-9 rounded"
                            />
                            {hoveredNode === node.ui_properties.module_name && (
                                <div className="ml-2 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out text-sm">
                                    {node.ui_properties.module_name}
                                </div>
                            )}
                        </div>
                    </button>

                    {/* Dropdown for "Source" - Updated with mouse event handlers */}
                    {node.ui_properties.module_name === 'Reader' && dropdownVisible === node.ui_properties.module_name && (
                        <div
                            className="dropdown absolute bg-white shadow-lg rounded-lg mt-2 p-2 w-80"
                            style={{ left: '-30vh' }}
                            onMouseEnter={() => setIsInteractingWithDropdown(true)}
                            onMouseLeave={() => setIsInteractingWithDropdown(false)}
                        >
                            <div className="flex justify-between">
                                <Label className='text-black font-medium'>Add Source</Label>
                                <div className='bg-white text-gray-700 font-medium cursor-pointer' onClick={() => setDropdownVisible(null)}>
                                    <X size={16} />
                                </div>
                            </div>
                            <div className='position-relative z-10'>
                                <Input
                                    className='my-2'
                                    placeholder='Search sources...'
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <ul
                                    className="space-y-3  max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200"
                                    onScroll={handleScroll}
                                >
                                    {filteredSources.map((source: any, index: number) => (
                                        <span key={`${source.id || index}`}>
                                            <li onClick={() => {
                                                handleNodeClick(node, source)
                                                setDropdownVisible(null)
                                            }}
                                                className="cursor-pointer text-sm text-gray-700 flex items-center gap-2"
                                            >
                                                <img
                                                    src={source.connection_type === 'postgres' ? '/assets/buildPipeline/connection/postgres.png' :
                                                        source.connection_type === 'snowflake' ? '/assets/buildPipeline/connection/snowflake.png' :
                                                            source.connection_type === 'local' ? '/assets/buildPipeline/connection/bigquery.png' :
                                                                node.ui_properties.icon}
                                                    alt={source.connection_type || node.ui_properties.module_name}
                                                    className="w-9 h-9 rounded"
                                                />
                                                {source.data_src_name}
                                            </li>
                                            <hr className="border-gray-200 my-2" />
                                        </span>
                                    ))}
                                    {loading && (
                                        <div className="text-center py-2 text-gray-500">
                                            Loading...
                                        </div>
                                    )}
                                </ul>
                                <div className='flex justify-center mt-2'>
                                    <Button className='bg-black hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-sm disabled:bg-gray-400'
                                        onClick={() => handleNodeClick(node)}
                                    >
                                        Add Source
                                    </Button>
                                </div>
                            </div>

                        </div>
                    )}



                </div>
            ))}
            {filteredNodes.length > 8 && (
                <>
                    <button
                        onClick={handleMoreClick}
                        className="rounded"
                    >
                        <img src="/assets/buildPipeline/add.svg" alt="" />
                    </button>

                    <Menu elevation={1}
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMoreClose}
                    >
                        {filteredNodes.slice(8).map((node: Node) => (
                            <MenuItem
                                key={node.ui_properties.module_name}
                                onClick={() => {
                                    handleNodeClick(node);
                                    handleMoreClose();
                                }}
                                sx={{
                                    width: '300px',  // Increased width
                                    padding: '12px 16px' // More padding for elegance
                                }}
                            >
                                <div className="flex items-center w-full">
                                    <img
                                        src={node.ui_properties.icon}
                                        alt={node.ui_properties.module_name}
                                        className="w-9 h-9"
                                    />
                                    <div className="mx-4 flex flex-col justify-between h-8 relative">
                                        <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-200 -translate-x-1/2"></div>
                                        <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                    </div>
                                    <span className="text-gray-700">{node.ui_properties.module_name}</span>
                                </div>
                            </MenuItem>
                        ))}
                    </Menu>
                </>
            )}


        </div>

    );
};

export default NodeDropList;
