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
    pipelineName
}: PipeLinePopUpProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [openFilter, setOpenFilter] = useState(false)
    const [openSort, setOpenSort] = useState(false)
    const [isLogsOpen, setIsLogsOpen] = useState(false)

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
            {
                label: "Filter",
                icon: Filter,
                variant: "outline",
                onClick: () => setOpenFilter(true),
            },
            {
                label: "Export CSV",
                icon: Search,
                variant: "outline",
                onClick: () => downloadCSV(transformData, pipelineName),
            },
        ],
    };

    const handleFilterClose = () => {
        setOpenFilter(false)
    }

    const handleSortOpen = () => {
        setOpenSort(true)
    }

    const handleSortClose = () => {
        setOpenSort(false)
    }

    const handleCloseLogs = () => {
        setIsLogsOpen(false)
    }

    const handleClick = () => {
        setIsExpanded((prev) => !prev)
    }

    return (
        <Dialog
            open={open}
            // When the dialog is closed (e.g., user clicks outside or X),
            // call `handleClose()` to mirror the old MUI onClose behavior.
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    handleClose()
                }
            }}
        >
            {/* Dialog content container */}
            <DialogContent className="max-w-[1150px] p-0">
                {/* If !isExpanded => top portion with table */}
                {!isExpanded && (
                    <div className="p-4">
                        {/* Header */}
                        <DialogHeader className="mb-4">
                            <div className="flex justify-between items-center">
                                <DialogTitle className="font-semibold text-lg">
                                    {pipelineName}
                                </DialogTitle>
                                <HeaderActions onClose={handleClose} />
                            </div>
                        </DialogHeader>

                        {/* Table container with fixed height */}
                        <div className="w-full overflow-x-auto max-h-[65vh]">
                            {transformData.length > 0 ? (
                                <DataTable
                                    data={transformData}
                                    columns={columns}
                                    toolbarConfig={toolbarConfig}
                                    topVariant="simple"
                                    pagination={true}
                                />
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No data available
                                </div>
                            )}
                        </div>
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
