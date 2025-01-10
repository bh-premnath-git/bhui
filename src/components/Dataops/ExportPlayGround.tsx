import React, { useEffect, useState } from 'react';
import { AppBar, Tabs, Tab, Stack } from '@mui/material';
import PropTypes from 'prop-types';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { IoClose } from 'react-icons/io5';
import { FlexibleTable } from '../Tabel';
import { Editor } from '@monaco-editor/react';
import { tap } from 'lodash';


function ExportPlayGround() {
    const [tabIndex, setTabIndex] = useState(0);
    const [tabs, setTabs] = useState([{ id: 0, label: 'Dataset 1', content: '',isExecute:false }]);

    const handleAddTab = () => {
        setTabs((prevTabs) => {
            const newTabId = prevTabs.length;
            const updatedTabs = [...prevTabs, { id: newTabId, label: `Dataset ${newTabId + 1}`, content: '' ,isExecute:false }];
            setTabIndex(newTabId + 1); // Set focus to the new tab
            return updatedTabs;
        });
    };

    const handleRun = () => {
        setTabs(prevTabs => 
            prevTabs.map(tab => 
                tab.id === prevTabs[tabIndex].id ? { ...tab, isExecute: true } : tab
            ))
    };


    const handleChangeTab = (event: any, newIndex: number) => {
        setTabIndex(newIndex);
    };

    const handleContentChange = (id: number, value: string) => {
        setTabs((prevTabs) =>
            prevTabs.map((tab) => (tab.id === id ? { ...tab, content: value } : tab))
        );
    };

    const handleRemoveTab = (index: number) => {
        setTabs((prevTabs) => {
            const newTabs = prevTabs.filter((_, i) => i !== index); // Remove the tab at the specified index
            if (newTabs.length === 0) {
                // If all tabs are removed, reset to a default tab
                setTabIndex(0);
                return [{ id: 0, label: "Dataset 1", content: "",isExecute:false }];
            }
            if (index === tabIndex) {
                // Adjust the selected tab if the current one is removed
                setTabIndex(Math.max(0, index - 1));
            } else if (index < tabIndex) {
                // Shift the selected index if removing a tab before the active tab
                setTabIndex(tabIndex - 1);
            }
            return newTabs;
        });
    };

    // Column configuration for the FlexibleTable component



    return (
        <div className="h-screen flex flex-col bg-gray-100 ">

            <AppBar elevation={0} position="static" className="bg-white">
                <div className="flex items-center justify-between p-1">
                    <h1 className="text-2xl font-semibold text-gray-800">Explorer</h1>
                </div>
            </AppBar>

            <Stack direction="row" spacing={2} justifyContent="space-between" className="bg-white">
                <Tabs
                    value={tabIndex}
                    onChange={handleChangeTab}
                    variant="scrollable"
                    scrollButtons="auto"
                    className="bg-white w-4/5 text-start justify-start"
                    TabIndicatorProps={{
                        style: {
                            backgroundColor: '#000',
                            height: 5,
                            width: '30px',
                            marginLeft: `calc((100% / ${tabs.length * 1.2}) / 15)`,
                            borderRadius: '10px 10px 0px 0px',
                        },
                    }}
                    sx={{
                        '& .MuiTabs-flexContainer': {
                            justifyContent: 'start',
                        },
                        '& .MuiTab-root': {
                            display: 'flex',
                            justifyContent: 'center',
                        },
                    }}
                >
                    <Stack className="flex items-center justify-center">
                        <img src="/assets/buildPipeline/bighammer.png" alt="bighammer" className="w-8 h-8" />
                    </Stack>
                    {tabs.map((tab, index) => (
                        <Tab
                            sx={{
                                textTransform: 'none',
                                color: 'black',
                                '&.Mui-selected': {
                                    color: 'black',
                                    fontWeight: 'bold',
                                },
                            }}
                            key={tab.id}
                            label={
                                <div className='flex items-center'>
                                    {tab.label}
                                    <IoClose
                                        className='ml-2 cursor-pointer'
                                        size={20}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent tab change on close icon click
                                            handleRemoveTab(index);
                                        }}
                                    />
                                </div>
                            }
                            className="text-gray-800"
                            id={`tab-${index}`}
                            aria-controls={`tabpanel-${index}`}
                        />
                    ))}
                    <Stack className="flex items-center justify-center">
                        <Button
                            variant="ghost"
                            onClick={handleAddTab}
                            className="text-gray-800 border w-28 rounded-sm"
                        >
                            + Add Query
                        </Button>
                    </Stack>
                </Tabs>
                <Stack direction="row" spacing={2} justifyContent="space-between">
                    <Stack>
                        <Input placeholder="Search By keywords" className="w-48" />
                    </Stack>
                    <Stack onClick={handleRun}>
                        <img src="/assets/explore/Run.svg" alt="run" className="w-8 h-8 mr-2" />
                    </Stack>
                    <Stack>
                        <img src="/assets/explore/Save.svg" alt="download" className="w-8 h-8 mr-2" />
                    </Stack>
                </Stack>
            </Stack>
            <TabContent tabs={tabs} tabIndex={tabIndex} handleContentChange={handleContentChange} />

        </div>
    );
}

export default ExportPlayGround;

const TabContent = ({ tabs, tabIndex, handleContentChange }: any) => {
    useEffect(() => {
        console.log(tabIndex);
        console.log(tabs);
    }, [tabs, tabIndex]);
    const columns: any = [
        {
            header: 'ID',
            key: 'id',
            sortable: true, // If the column is sortable
        },
        {
            header: 'Name',
            key: 'name',
            sortable: true,
        },
        {
            header: 'Email',
            key: 'email',
            sortable: true,
        },
        {
            header: 'Role',
            key: 'role',
            sortable: true,
        },
        {
            header: 'Status',
            key: 'status',
            sortable: true,
        },
    ];
    return (
        <>
            {tabs.map((tab: any, index: number) => (
                <TabPanel key={tab.id} value={tabIndex} index={tabIndex == 0 ? index : index + 1}>
                    <div className='rounded shadow-sm' style={{
                        overflow: 'hidden',
                    }}>
                        <Editor
                            options={{
                                minimap: { enabled: false }, // Hide minimap
                                scrollBeyondLastLine: false, // Remove extra scrolling space
                                renderLineHighlight: 'none', // Remove line highlight
                                lineNumbers: 'on',
                                overviewRulerBorder: false, // Remove border around minimap
                                padding: { top: 0, bottom: 0 }, // Adjust padding
                            }} height="30vh" language="sql" value={tab.content}
                            onChange={(e: any) => handleContentChange(tab.id, e.target.value)} />

                    </div>

                    {tab.isExecute&&(<Stack className=' rounded-sm'>
                        <FlexibleTable
                            data={userList}
                            columns={columns}
                            itemsPerPageOptions={[5, 10, 20]}
                            defaultItemsPerPage={10}
                            background="bg-black"
                            isAction={false}
                            isSearch={false}
                            rowColorFn={(row, index) => (index % 2 === 0 ? "bg-white" : "bg-gray-100")}
                        />
                    </Stack>)}
                </TabPanel>
            ))}
        </>
    );
};

function TabPanel(props: any) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && <div className="p-3">{children}</div>}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    value: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
};


// Sample data for user list
const userList = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Admin',
        status: 'Active',
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'Editor',
        status: 'Inactive',
    },
    {
        id: 3,
        name: 'Sam Wilson',
        email: 'sam.wilson@example.com',
        role: 'Viewer',
        status: 'Active',
    },
    {
        id: 4,
        name: 'Emily Brown',
        email: 'emily.brown@example.com',
        role: 'Admin',
        status: 'Active',
    },
    {
        id: 5,
        name: 'Michael Green',
        email: 'michael.green@example.com',
        role: 'Editor',
        status: 'Inactive',
    },
    // Add more user objects as needed
];
