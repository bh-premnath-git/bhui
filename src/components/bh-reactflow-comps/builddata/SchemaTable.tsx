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
import { CATALOG_API_PORT } from '@/config/platformenv';
import { apiService } from '@/lib/api/api-service';
import { DataTable } from '@/components/bh-table/data-table';
import { useAppSelector } from '@/hooks/useRedux';
import { RootState } from '@/store';

function SchemaTable({ initialData }: any) {
    const [openDialog, setOpenDialog] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');
    const [selectedDataType, setSelectedDataType] = React.useState('');
    const [tableData, setTableData] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const { dataSourceTypes } = useAppSelector((state: RootState) => state.global);

    // Ensure dataSourceTypes is an array
    const dataTypeOptions = Array.isArray(dataSourceTypes) ? dataSourceTypes : [];

    console.log(initialData)
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await apiService.get({
                    portNumber: CATALOG_API_PORT,
                    url: `/data_source_layout/list_full/?data_src_id=${initialData?.source?.data_src_id}`,
                    method: 'GET',
                    usePrefix: true,
                });
                console.log(response,"response")
                if (response[0]?.layout_fields) {
                    const transformedData = response[0].layout_fields.map((field: any) => ({
                        name: field.lyt_fld_name,
                        datatype: String(field.lyt_fld_data_type_cd),
                        primarykey: Boolean(field.lyt_fld_is_pk),
                        optional: true,
                        description: field.lyt_fld_desc || '',
                        tags: field.lyt_fld_tags || {},
                        actions: ''
                    }));
                    console.log(transformedData,"transformedData")
                    setTableData(transformedData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                // You might want to add error state handling here
            } finally {
                setIsLoading(false);
            }
        };

        if (initialData?.source?.data_src_id) {
            fetchData();
        }
    }, [initialData?.source?.data_src_id]);

    const columns = [
        {
            accessorKey: 'name',
            header: 'Field Name',
            enableColumnFilter: false,
        },
        {
            accessorKey: 'datatype',
            header: 'Data Type',
            enableColumnFilter: false,
            cell: ({ row }) => {
                // Ensure dataSourceTypes is an array before using find
                const dataType = dataTypeOptions.find(type => type.id.toString() === row.datatype);
                return <span>{dataType?.dtl_desc || 'unknown'}</span>;
            }
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
        <div className="">
            {isLoading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                </div>
            ) : (
                <>
                    <DataTable
                        data={tableData}
                        columns={columns}
                        topVariant="simple"
                        pagination={true}
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
                </>
            )}

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <div className="flex justify-between items-center mb-4">
                        <DialogTitle>Add Description</DialogTitle>
                        <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </DialogClose>
                    </div>
                    <Input
                        autoFocus
                        className="min-h-[100px]"
                        placeholder="Enter Description Here"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
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
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default SchemaTable;