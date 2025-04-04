import { useEffect, useState } from "react"
import { Filter, Search, X, Loader2 } from "lucide-react"
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
    DialogClose,
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


export default function PipeLinePopUp({
    open,
    handleClose,
    transformData,
    pipelineName,
    totalCount,
    onPageChange,
    onPageSizeChange
}: PipeLinePopUpProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [openFilter, setOpenFilter] = useState(false)
    const [openSort, setOpenSort] = useState(false)
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(()=>{
        console.log(transformData,"transformData");
       if(transformData.length>0){
        setIsLoading(false)
       }else{
        setTimeout(()=>{
            if(transformData.length>0){
                setIsLoading(false)
            }else{
                setIsLoading(true)
            }
                    },4500)
       }
            
    },[transformData,open])
    
    // Generate columns only if we have data
    const columns = transformData.length 
        ? Object.keys(transformData[0])
            .filter(key => key !== 'row_number') // Filter out row_number column
        : [];

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

    const handleExportCSV = () => {
        downloadCSV(transformData, pipelineName);
    };

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
            <DialogContent className="max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] p-0 h-[80vh] flex flex-col">
                {/* If !isExpanded => top portion with table */}
                {!isExpanded && (
                    <div className="p-4 flex flex-col h-full">
                        {/* Header */}
                        <DialogHeader className="mb-4">
                            <div className="flex justify-between items-center">
                                <DialogTitle className="font-semibold text-lg">
                                    {pipelineName}
                                </DialogTitle>
                                <div className="flex items-center gap-6">
                                    <button 
                                        onClick={handleExportCSV}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition-colors"
                                    >
                                        <Search className="h-4 w-4" />
                                        Export CSV
                                    </button>
                                    <DialogClose onClick={handleClose} className="cursor-pointer rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                        {/* <X className="h-5 w-5 hover:text-primary transition-colors" /> */}
                                        <span className="sr-only">Close</span>
                                    </DialogClose>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Table container with dynamic height */}
                        <div className="w-full flex-1 overflow-hidden flex flex-col">
                            {isLoading ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                    <div className="relative">
                                        <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl animate-pulse"></div>
                                        <Loader2 className="h-12 w-12 animate-spin text-primary relative" />
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-primary/80 font-medium">Loading Data</p>
                                        <div className="flex gap-1">
                                            <span className="h-2 w-2 rounded-full bg-primary/60 animate-[bounce_1s_infinite] [animation-delay:-0.3s]"></span>
                                            <span className="h-2 w-2 rounded-full bg-primary/60 animate-[bounce_1s_infinite] [animation-delay:-0.2s]"></span>
                                            <span className="h-2 w-2 rounded-full bg-primary/60 animate-[bounce_1s_infinite] [animation-delay:-0.1s]"></span>
                                        </div>
                                    </div>
                                </div>
                            ) : transformData.length > 0 ? (
                                <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                                    <div className="inline-block min-w-full align-middle">
                                        <table className="min-w-full divide-y divide-gray-200 table-fixed">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    {columns.map((column) => (
                                                        <th 
                                                            key={column} 
                                                            scope="col" 
                                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap sticky top-0 bg-gray-50"
                                                        >
                                                            {column}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {paginatedData.map((row, rowIndex) => (
                                                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        {columns.map((column) => (
                                                            <td 
                                                                key={`${rowIndex}-${column}`} 
                                                                className="px-4 py-2 text-sm text-gray-900 truncate max-w-[200px]"
                                                                title={String(row[column])}
                                                            >
                                                                {String(row[column])}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-center py-8 text-gray-500">
                                    No data available
                                </div>
                            )}
                        </div>

                        {/* Pagination Footer */}
                        {transformData.length > 0 && (
                            <div className="mt-4 border-t pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                                <div className="text-sm text-gray-500">
                                    Showing {((pageIndex - 1) * pageSize) + 1} to {Math.min(pageIndex * pageSize, totalCount || transformData.length)} of {totalCount || transformData.length} entries
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        className="border rounded px-2 py-1 text-sm bg-white"
                                        value={pageSize}
                                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                    >
                                        {[5, 10, 20, 30, 50].map((size) => (
                                            <option key={size} value={size}>
                                                {size} per page
                                            </option>
                                        ))}
                                    </select>
                                    <div className="flex">
                                        <button
                                            className="px-3 py-1 border border-r-0 rounded-l text-sm disabled:opacity-50 disabled:bg-gray-100 hover:bg-gray-50 transition-colors"
                                            onClick={() => handlePageChange(pageIndex - 1)}
                                            disabled={pageIndex === 1}
                                        >
                                            Previous
                                        </button>
                                        <button
                                            className="px-3 py-1 border rounded-r text-sm disabled:opacity-50 disabled:bg-gray-100 hover:bg-gray-50 transition-colors"
                                            onClick={() => handlePageChange(pageIndex + 1)}
                                            disabled={pageIndex >= Math.ceil((totalCount || transformData.length) / pageSize)}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </DialogContent>
            <AddFilterPopUp handleFilterClose={handleFilterClose} openFilter={openFilter} />
            <AddSortPopUp handleSortClose={handleSortClose} openSort={openSort} />
        </Dialog>
    )
}
