import React, { useState, useEffect } from 'react';
import { Node } from './types/formTypes';
import { X } from 'lucide-react';
import { Menu, MenuItem } from '@mui/material';
import { Button } from '../ui/button';
import Dialog from '@mui/material/Dialog';
// import CustomForm from './SourceForm';
import schema from './json/Source.json';
import { SourceForm } from './SourceForm';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
const NodeDropList = ({ filteredNodes, handleNodeClick }: any) => {
    // Track the currently opened dropdown
    const [dropdownVisible, setDropdownVisible] = useState<string | null>(null);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [open, setOpen] = React.useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleMoreClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMoreClose = () => {
        setAnchorEl(null);
    };
    const [formData, setFormData] = useState<Record<string, any>>({});

    // const handleFormSubmit = () => {
    //     console.log("Form submitted:", formData);

    //     // You can handle the form data here, e.g., send it to an API
    // };
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
        if (node.ui_properties.module_name === 'Source') {
            setDropdownVisible((prevState) =>
                prevState === node.ui_properties.module_name ? null : node.ui_properties.module_name
            );
        } else {
            handleNodeClick(node); // Handle click for other nodes
        }
    };

    return (
        <div className="flex justify-center gap-4 mb-4">
            {filteredNodes.slice(0, 8).map((node: Node) => (
                <div key={node.ui_properties.module_name}
                    onMouseEnter={() => setHoveredNode(node.ui_properties.module_name)}
                    onMouseLeave={() => setHoveredNode(null)} className="relative">
                    {/* Node Button */}
                    <button
                        onClick={() => handleButtonClick(node)}
                        className="node-button rounded text-white flex items-center transition-all duration-500 ease-in-out"
                        style={{
                            backgroundColor: node.ui_properties.color,
                            padding: dropdownVisible === node.ui_properties.module_name ? '1px' : '1px',
                        }}
                    >
                        {hoveredNode === node.ui_properties.module_name ? (
                            <div className="flex items-center transition-all duration-500 ease-in-out rounded-lg">
                                <img
                                    src={node.ui_properties.icon}
                                    alt={node.ui_properties.module_name}
                                    className="w-9 h-9"
                                />
                                <div className="ml-2 opacity-100 transition-opacity duration-500 ease-in-out text-sm">
                                    {node.ui_properties.module_name}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center transition-all duration-300 rounded-lg ease-in-out">
                                <img
                                    src={node.ui_properties.icon}
                                    alt={node.ui_properties.module_name}
                                    className="w-9 h-9 rounded"
                                />
                            </div>
                        )}
                    </button>

                    {/* Dropdown for "Source" */}
                    {node.ui_properties.module_name === 'Source' && dropdownVisible === node.ui_properties.module_name && (
                        <div className="dropdown absolute bg-white shadow-lg rounded-lg mt-2 p-2 w-80" style={{ left: '-30vh' }}>

                            <div className="flex justify-between">
                                <Label className='text-black font-medium'>Add Source</Label><br></br>
                                <div className='bg-white text-gray-700 font-medium  cursor-pointer' onClick={() => setDropdownVisible(null)}><X size={16} /></div>
                            </div>
                            <Input className='my-2' placeholder='Source Name' />
                            <ul className="space-y-3 position-relative z-10">
                                {[1, 2, 3, 4, 5].map((index: number) => (
                                    <span key={index}>
                                        <li onClick={() => {
                                            handleNodeClick(node)
                                            setDropdownVisible(null)
                                        }}

                                            className="cursor-pointer text-sm text-gray-700 flex items-center gap-2"
                                        >
                                            <img
                                                src={node.ui_properties.icon}
                                                alt={node.ui_properties.module_name}
                                                className="w-9 h-9 rounded"
                                            />
                                            Source {index}
                                        </li>
                                        <hr className="border-gray-200 my-2" />
                                    </span>
                                ))}

                                <div className='flex justify-center'>
                                    <Button className='bg-black hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-sm disabled:bg-gray-400'
                                        onClick={handleClickOpen}
                                    >
                                        Add Source
                                    </Button>

                                </div>
                            </ul>
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

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth={'xl'}
                style={{ width: '100%', maxWidth: '1400px', margin: 'auto' }}
            >
                <div className='flex justify-between px-4 pt-4'>
                    <div>
                        <Label className='text-black font-medium'>Configure A New Source</Label><br></br>
                        <Label className='text-gray-600 text-sm font-normal'>Select the type of source you want to add to your pipeline.</Label>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Input placeholder='Source Name' />
                        <div className='bg-white text-gray-700 font-medium  cursor-pointer' onClick={handleClose} ><X size={16} /></div>

                    </div>
                </div>
                <SourceForm onSubmit={() => { }} />

            </Dialog>
        </div>

    );
};

export default NodeDropList;
