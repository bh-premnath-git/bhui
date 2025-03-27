import { useState } from "react"
import { Filter, Search, X } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/bh-table/data-table"
import AddFilterPopUp from "./AddFilterPopUp"
import AddSortPopUp from "./AddSortPopUp"
import { downloadCSV } from "@/lib/utils"
import type { TToolbarConfig } from "@/types/table"

// shadcn/ui imports
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

// Add proper typing for the transform data
type TransformData = Record<string, any>

interface PipeLinePopUpProps {
    open: boolean
    handleClose: () => void
    transformData: TransformData[]
    pipelineName: string
    isLoading?: boolean
    totalCount?: number
    onPageChange?: (page: number, pageSize: number) => void
    onPageSizeChange?: (pageSize: number) => void
}

// Separate component for the header actions
const HeaderActions = ({ onClose, showSearch = false }: { onClose: () => void, showSearch?: boolean }) => (
    <div className="flex items-center gap-4">
        {showSearch && (
            <div className="relative">
                <Input
                    type="text"
                    placeholder="Search By Keywords"
                    className="pl-8"
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
        )}
        <div className="cursor-pointer">
            <img
                src="/assets/buildPipeline/downArrow.png"
                alt="Expand"
                width={30}
            />
        </div>
        <X onClick={onClose} className="cursor-pointer" />
    </div>
)

export default function PipeLinePopUp({
    open,
    handleClose,
    transformData,
    pipelineName,
    isLoading = false,
    totalCount,
    onPageChange,
    onPageSizeChange
}: PipeLinePopUpProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [openFilter, setOpenFilter] = useState(false)
    const [openSort, setOpenSort] = useState(false)
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    // Generate columns only if we have data
    const columns: ColumnDef<TransformData>[] = transformData.length 
        ? Object.keys(transformData[0]).map((key) => ({
            accessorKey: key,
            header: key,
            enableColumnFilter: false,
        }))
        : [];

    const toolbarConfig: TToolbarConfig = {
        buttons: [
            // {
            //     label: "Filter",
            //     icon: Filter,
            //     variant: "outline",
            //     onClick: () => setOpenFilter(true),
            // },
            {
                label: "Export CSV",
                icon: Search,
                variant: "default",
                onClick: () => downloadCSV(transformData, pipelineName),
            },
        ],
    };

    const handleFilterClose = () => {
        setOpenFilter(false)
    }

   
    const handleSortClose = () => {
        setOpenSort(false)
    }

    const handlePageChange = (newPage: number) => {
        setPageIndex(newPage);
        onPageChange?.(newPage, pageSize);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setPageIndex(1);
        onPageSizeChange?.(newPageSize);
    };

    // Add pagination logic
    const paginatedData = transformData.slice(
        (pageIndex - 1) * pageSize,
        pageIndex * pageSize
    );

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    handleClose()
                }
            }}
        >
            {/* Dialog content container */}
            <DialogContent className="max-w-[1250px] p-0">
                {/* If !isExpanded => top portion with table */}
                {!isExpanded && (
                    <div className="p-4 flex flex-col h-full">
                        {/* Header */}
                        <DialogHeader className="mb-4">
                            <div className="flex justify-between items-center">
                                <DialogTitle className="font-semibold text-lg">
                                    {pipelineName}
                                </DialogTitle>
                                {/* <HeaderActions onClose={handleClose} /> */}
                            </div>
                        </DialogHeader>

                        {/* Table container with fixed height */}
                        <div className="w-full overflow-x-auto flex-1" style={{ maxHeight: 'calc(55vh - 100px)', minHeight: 'calc(55vh - 100px)' }}>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                            ) : transformData.length > 0 ? (
                                <DataTable
                                    data={paginatedData}
                                    columns={columns}
                                    toolbarConfig={toolbarConfig}
                                    topVariant="simple"
                                    pagination={false}
                                />
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No data available
                                </div>
                            )}
                        </div>

                        {/* Pagination Footer */}
                        {transformData.length > 0 && (
                            <div className="mt-4 border-t pt-4 flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                    Showing {((pageIndex - 1) * pageSize) + 1} to {Math.min(pageIndex * pageSize, totalCount || transformData.length)} of {totalCount || transformData.length} entries
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        className="border rounded px-2 py-1"
                                        value={pageSize}
                                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                    >
                                        {[5, 10, 20, 30, 50].map((size) => (
                                            <option key={size} value={size}>
                                                {size} per page
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        className="px-3 py-1 border rounded disabled:opacity-50"
                                        onClick={() => handlePageChange(pageIndex - 1)}
                                        disabled={pageIndex === 1}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        className="px-3 py-1 border rounded disabled:opacity-50"
                                        onClick={() => handlePageChange(pageIndex + 1)}
                                        disabled={pageIndex >= Math.ceil((totalCount || transformData.length) / pageSize)}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* If isExpanded => show logs or alternate content */}
                {isExpanded && (
                    <div className="p-4 w-full overflow-x-auto">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">
                                Pipeline Name: {pipelineName}
                            </span>
                            <HeaderActions onClose={handleClose} showSearch={true} />
                        </div>

                        <div className="font-semibold">Showing All Logs</div>
                    </div>
                )}
            </DialogContent>
            <AddFilterPopUp handleFilterClose={handleFilterClose} openFilter={openFilter} />
            <AddSortPopUp handleSortClose={handleSortClose} openSort={openSort} />
        </Dialog>
    )
}
