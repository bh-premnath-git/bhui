import * as React from 'react';
import { MdOutlineDeleteSweep } from 'react-icons/md';
import { X, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useEffect } from 'react';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { apiService } from '@/lib/api/api-service';
import { DataTable } from '@/components/bh-table/data-table';
import { useAppSelector } from '@/hooks/useRedux';
import { RootState } from '@/store';
import { useReaderData } from '@/context/ReaderDataContext';

function SchemaTable({ dataSourceId, onSwitchToReaderOptions }: any) {
    console.log('🔧 SchemaTable: Initializing SchemaTable with dataSourceId:', dataSourceId);
    const [openDialog, setOpenDialog] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');
    const [selectedDataType, setSelectedDataType] = React.useState('');
    const [tableData, setTableData] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const { dataSourceTypes } = useAppSelector((state: RootState) => state.global);
    const { readerData } = useReaderData();

    // Ensure dataSourceTypes is an array
    const dataTypeOptions = Array.isArray(dataSourceTypes) ? dataSourceTypes : [];

    // Use readerData from context if available, otherwise fall back to dataSourceId
    const currentData = readerData || dataSourceId;

    // Add debugging to understand what data we're receiving
    useEffect(() => {
        
    }, [readerData, dataSourceId, currentData]);

    useEffect(() => {
        const fetchData = async () => {
            // const dataSourceId = dataSourceId;
            console.log('🔧 SchemaTable: Using data_src_id:', dataSourceId);
            
            if (!dataSourceId) {
                console.warn('🔧 SchemaTable: No data_src_id found, cannot fetch schema');
                setIsLoading(false);
                return;
            }
            
            setIsLoading(true);
            try {
                const url = `/data_source_layout/list_full/?data_src_id=${dataSourceId}`;
                console.log('🔧 SchemaTable: Making API call to:', url);
                
                const response = await apiService.get({
                    baseUrl: CATALOG_REMOTE_API_URL,
                    url: url,
                    method: 'GET',
                    usePrefix: true,
                });
                console.log('🔧 SchemaTable: API response:', response);
                
                if (response && response[0]?.layout_fields) {
                    const transformedData = response[0].layout_fields.map((field: any) => ({
                        name: field.lyt_fld_name,
                        datatype: String(field.lyt_fld_data_type),
                        primarykey: Boolean(field.lyt_fld_is_pk),
                        optional: true,
                        description: field.lyt_fld_desc || '',
                        tags: field.lyt_fld_tags || {},
                        actions: ''
                    }));
                    console.log('🔧 SchemaTable: Transformed data:', transformedData);
                    setTableData(transformedData);
                } else {
                    console.log('🔧 SchemaTable: No layout_fields found in response');
                    setTableData([]);
                }
            } catch (error) {
                console.error('🔧 SchemaTable: Error fetching data:', error);
                setTableData([]);
            } finally {
                setIsLoading(false);
            }
        };

        // const dataSourceId = dataSourceId;
        if (dataSourceId) {
            console.log('🔧 SchemaTable: Found data_src_id, calling fetchData');
            fetchData();
        } else {
            setIsLoading(false);
        }
    }, [dataSourceId]);

    const columns = [
        {
            accessorKey: 'name',
            header: 'Field Name',
            enableColumnFilter: false,
        },
        {
            accessorKey: 'datatype',
            header: 'Data Type',
            enableColumnFilter: false
        },
        {
            accessorKey: 'primarykey',
            header: 'Primary Key',
            enableColumnFilter: false,
            cell: ({ row }) => (
                <input 
                    type="checkbox"
                    checked={row.original.primarykey}
                    disabled
                    className="h-4 w-4 rounded border-gray-300 text-gray-400 cursor-not-allowed"
                />
            )
        },
        {
            accessorKey: 'optional',
            header: 'Optional',
            enableColumnFilter: false,
            cell: ({ row }) => (
                <input 
                    type="checkbox"
                    checked={row.original.optional}
                    disabled
                    className="h-4 w-4 rounded border-gray-300 text-gray-400 cursor-not-allowed"
                />
            )
        },
        {
            accessorKey: 'description',
            header: 'Description',
            enableColumnFilter: false,
            cell: ({ row }) => (
                <span className="text-gray-600">
                    {row.original.description || "No description"}
                </span>
            )
        },
    ];

    
    return (
        <div className="h-full flex flex-col">
            {isLoading ? (
                <div className="flex justify-center items-center flex-1">
                    <div className="animate-spin rounded-full h-6 w-6 border-green-600" />
                </div>
            ) : tableData.length > 0 ? (
                <div className="flex-1 overflow-auto">
                    <DataTable
                        data={tableData}
                        columns={columns}
                        topVariant="simple"
                        pagination={true}
                        showSearch={false}
                    />

                    {/* Checkboxes Section */}
                    {/* <div className="space-y-1 bg-gray-50 p-2 rounded-lg mt-2">
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
                    </div> */}

                    {/* Action Buttons */}
                    {/* <div className="flex justify-center gap-3 mt-4">
                        <button className="px-6 py-1.5 border border-black rounded-md hover:bg-gray-50 transition-colors text-sm">
                            Close
                        </button>
                        <button className="px-6 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm">
                            Save
                        </button>
                    </div> */}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                    <div className="text-center">
                        <p className="text-lg mb-2">No schema data available</p>
                        <p className="text-sm mb-4">
                            {currentData?.source?.data_src_id || currentData?.data_src_id 
                                ? 'Schema information could not be loaded for this data source.'
                                : 'No data source ID found. Please configure the Reader in the "Reader Options" tab first.'}
                        </p>
                        {!(currentData?.source?.data_src_id || currentData?.data_src_id) && onSwitchToReaderOptions && (
                            <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                <button 
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    onClick={onSwitchToReaderOptions}
                                >
                                    Configure Reader Options
                                </button>
                                <p className="text-xs text-gray-600 mt-2">
                                    Select a data source to view its schema
                                </p>
                            </div>
                        )}
                        {(currentData?.source?.data_src_id || currentData?.data_src_id) && (
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <button 
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    onClick={() => {
                                        // TODO: Implement schema discovery API call
                                    }}
                                >
                                    Discover Schema
                                </button>
                                <p className="text-xs text-gray-400 mt-2">
                                    Data source ID: {currentData?.source?.data_src_id || currentData?.data_src_id}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="sm:max-w-[400px]">
                    <div className="flex justify-between items-center mb-3">
                        <DialogTitle className="text-base">Add Description</DialogTitle>
                        <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </DialogClose>
                    </div>
                    <Input
                        autoFocus
                        className="min-h-[80px] text-sm"
                        placeholder="Enter Description Here"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            className="px-3 py-1.5 text-xs border border-black rounded-md hover:bg-gray-50 transition-colors"
                            onClick={() => setOpenDialog(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-3 py-1.5 text-xs bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                            onClick={() => {
                                console.log('Saved:', inputValue);
                                setOpenDialog(false);
                            }}
                        >
                            Save
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default SchemaTable;