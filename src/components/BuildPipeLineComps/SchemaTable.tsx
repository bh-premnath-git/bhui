import * as React from 'react';
import { FlexibleTable } from '@/components/Tabel';
import Checkbox from '@mui/material/Checkbox';
import { Button, Stack, Typography, Dialog, DialogTitle, DialogContent, TextField } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { MdOutlineDeleteSweep } from 'react-icons/md';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Label } from '../ui/label';

function SchemaTable() {
    const [openDialog, setOpenDialog] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');
    const [selectedDataType, setSelectedDataType] = React.useState('');

    // Column configuration for FlexibleTable
    const columns: any[] = [
        {
            key: 'name',
            header: 'Field Name',
            type: 'text',
        },
        {
            key: 'datatype',
            header: 'Data Type',
            type: 'text',
            render: () => (
                <Select
                    size='small'
                    value={selectedDataType}
                    onChange={(e: SelectChangeEvent) => setSelectedDataType(e.target.value)}
                    className="min-w-[150px] bg-white h-[28px]"
                    sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#e5e7eb',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#9ca3af',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#6b7280',
                        },
                    }}
                    displayEmpty
                >
                    <MenuItem value="">Timestamp</MenuItem>
                    <MenuItem value="array">Array</MenuItem>
                    <MenuItem value="binary">Binary</MenuItem>
                    <MenuItem value="boolean">Boolean</MenuItem>
                    <MenuItem value="byte">Byte</MenuItem>
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="int">Integer</MenuItem>
                    <MenuItem value="double">Double</MenuItem>
                </Select>
            )
        },
        {
            key: 'primarykey',
            header: 'Primary Key',
            type: 'text',
            render: () => (
                <Checkbox
                    defaultChecked
                    size="small"
                    sx={{
                        padding: '4px',
                        '&.Mui-checked': { color: '#07A260' },
                        '&:hover': { backgroundColor: 'transparent' }
                    }}
                    color="success"
                />
            )
        },
        {
            key: 'optional',
            header: 'Optional',
            type: 'text',
            render: () => (
                <Checkbox
                    defaultChecked
                    size="small"
                    sx={{
                        padding: '4px',
                        '&.Mui-checked': { color: '#07A260' },
                        '&:hover': { backgroundColor: 'transparent' }
                    }}
                    color="success"
                />
            )
        },
        {
            key: 'description',
            header: 'Description',
            type: 'text',
            render: (value: any) => (
                <button
                    onClick={() => setOpenDialog(true)}
                    className="text-blue-500 hover:text-blue-700"
                >
                    {value || "Add"}
                </button>
            )
        },
        {
            key: 'tags',
            header: 'Tags',
            type: 'text',
            render: (value: any) => value ? (
                <div className="flex items-center gap-2">
                    <span className="bg-gray-100 px-2 py-1 rounded-md text-sm flex items-center">
                        Infer Schema from Data
                        <ClearIcon className="ml-1 h-4 w-4 cursor-pointer" />
                    </span>
                </div>
            ) : null
        },
        {
            key: 'actions',
            header: '',
            type: 'text',
            render: () => (
                <MdOutlineDeleteSweep className="text-red-500 text-xl cursor-pointer hover:text-red-700" />
            )
        }
    ];

    // Sample data
    const tableData = Array(10).fill({
        name: 'NameType2',
        datatype: '',
        primarykey: true,
        optional: true,
        description: '',
        tags: '',
        actions: ''
    });

    const getDescription = (text: string) => {
        switch (text) {
            case 'Eliminate Duplicate Records':
                return 'Automatically removes any duplicate entries from your dataset';
            case 'Trim All Columns':
                return 'Removes leading and trailing whitespace from all text fields';
            case 'Eliminate Records without Primary Key':
                return 'Ensures data integrity by removing records with missing primary keys';
            default:
                return '';
        }
    };

    return (
        <div className="">
            <FlexibleTable
                data={tableData}
                columns={columns}
                itemsPerPageOptions={[5, 10, 15]}
                defaultItemsPerPage={10}
                isSearch={false}
                isAction={false}
                background="bg-black"
            />

            {/* Checkboxes Section */}
            <div className="space-y-1 bg-gray-50 p-2 rounded-lg mt-2">
                {[
                    'Eliminate Duplicate Records',
                    'Trim All Columns',
                    'Eliminate Records without Primary Key'
                ].map((text) => (
                    <div key={text} className="flex items-center gap-1">
                        <Checkbox
                            defaultChecked
                            disabled
                            size="small"
                            sx={{
                                padding: '2px',
                                '&.Mui-checked': {
                                    color: 'lightgery',
                                },
                            }}
                        />
                        <Label className="text-gray-500 font-light text-sm">
                            {text}
                        </Label>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 mt-4">
                <button className="px-6 py-1.5 border border-black rounded-md hover:bg-gray-50 transition-colors text-sm">
                    Close
                </button>
                <button className="px-6 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm">
                    Save
                </button>
            </div>

            {/* Description Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                className="rounded-lg"
                maxWidth="sm"
                fullWidth
            >
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <DialogTitle className="text-lg font-bold p-0">
                            Add Description
                        </DialogTitle>
                        <ClearIcon
                            className="cursor-pointer hover:text-gray-700"
                            onClick={() => setOpenDialog(false)}
                        />
                    </div>
                    {/* <DialogContent className="p-0"> */}
                    <TextField
                        autoFocus
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Enter Description Here"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="mt-2"
                    />
                    {/* </DialogContent> */}
                    <div className="flex justify-center gap-4 mt-6">
                        <button
                            className="px-7 py-2 border border-black rounded-md hover:bg-gray-50 transition-colors"
                            onClick={() => setOpenDialog(false)}
                        >
                            Close
                        </button>
                        <button
                            className="px-7 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                            onClick={() => {
                                console.log('Saved:', inputValue);
                                setOpenDialog(false);
                            }}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}

export default SchemaTable;