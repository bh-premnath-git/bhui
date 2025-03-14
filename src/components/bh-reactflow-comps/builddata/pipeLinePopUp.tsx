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

interface PipeLinePopUpProps {
    open: boolean
    handleClose: () => void
    transformData: any[]
    pipelineName: string
}

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

    // Generate columns for the table
    const columns: ColumnDef<any>[] = Object.keys(transformData[0] || {}).map((key) => ({
        accessorKey: key,
        header: key,
        enableColumnFilter: false,

    }));

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
                onClick: () => downloadCSV(transformData, "transform_data"),
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
            <DialogContent className="max-w-[1300px] p-0">
                {/* If !isExpanded => top portion with table */}
                {!isExpanded && (
                    <div className="p-4">
                        {/* Header */}
                        <DialogHeader style={{textAlign: 'left'}}>
                            <DialogTitle className="font-semibold text-lg text-start ">
                                {pipelineName}
                            </DialogTitle>
                            
                        </DialogHeader>

                        

                        {/* Table */}
                        <div className="overflow-auto" style={{ minWidth: "1200px" }}>
                            <DataTable
                                data={transformData}
                                columns={columns}
                                toolbarConfig={toolbarConfig}
                                topVariant="simple"
                                pagination={true}
                            />
                        </div>
                    </div>
                )}

                {/* If isExpanded => show logs or alternate content */}
                {isExpanded && (
                    <div className="p-4 w-full min-w-[1200px]">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">
                                Pipeline Name : Test_pipeline 1 (out)
                            </span>
                            <div className="flex items-center gap-4">
                                {/* Input (Search) */}
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="Search By Keywords"
                                        className="pl-8"
                                    />
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>

                                <div className="cursor-pointer">
                                    <img
                                        src="/assets/buildPipeline/downArrow.png"
                                        alt=""
                                        width={30}
                                    />
                                </div>
                                <X onClick={handleClose} className="cursor-pointer" />
                            </div>
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
