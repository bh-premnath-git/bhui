import React, { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import SchemaTable from "./SchemaTable"
import OnboardTaggingStep from "./OnboardTaggingStep"
import PreviewTable from "./PreviewTable"
import { ReaderOptionsForm } from "./ReaderOptionsForm"
import { useConnectionConfigQuery } from "@/lib/hooks/useConnectionConfig"

// shadcn/ui imports
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

// Example: a custom input component or your own from shadcn
import { Input } from "@/components/ui/input"

interface OrderPopUpProps {
  isOpen: boolean
  onClose: () => void
  source: any
  nodeId: any
  onSourceUpdate: (data: any) => void
}

export default function OrderPopUp({
  isOpen,
  onClose,
  source,
  nodeId,
  onSourceUpdate,
}: OrderPopUpProps) {
  const [selected, setSelected] = React.useState(0)
  const [initialData, setInitialData] = useState<any>(null)

  // For the Help popover
  const [popoverOpen, setPopoverOpen] = useState(false)

  const { data: configData } = useConnectionConfigQuery(
    {
      id: source?.connection_config_id || '',
    },
    {
      enabled: !!source?.connection_config_id
    }
  );

  useEffect(() => {
    if (configData) {
      const data = {
        ...configData,
        sourceId: source?.data_src_id,
        connectionConfigId: source?.connection_config_id
      };
      setInitialData(data);
    } else if (source?.data_src_id) {
      setInitialData({ sourceId: source?.data_src_id });
    }
  }, [configData, source]);

  const handleClose = () => {
    onClose()
  }

  const handleClick = (index: number) => {
    setSelected(index)
    switch (index) {
      case 0:
        console.log("Schema button clicked")
        break
      case 1:
        console.log("Tag button clicked")
        break
      case 2:
        console.log("Preview button clicked")
        break
      default:
        break
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}
    >
      <DialogContent className="p-0 w-[1000px] h-[800px] max-h-[90vh] overflow-auto">
        {/* You can optionally wrap this in <DialogHeader> if you want a consistent layout */}
        <div className="flex flex-col p-3 bg-white h-full">
          {/* Header */}
          <div className="flex justify-between items-center text-black mb-2">
            {/* Replace MUI Typography with any heading or paragraph */}
            <DialogHeader className="p-0">
              <DialogTitle className="text-base font-bold mb-0">
                Orders
              </DialogTitle>
            </DialogHeader>
            <X onClick={handleClose} className="cursor-pointer" />
          </div>

          {/* Tabs */}
          <div className="flex justify-between items-center">
            <div className="flex">
              {["Reader Options", "Schema", "Tag", "Preview"].map((label, index) => (
                <button
                  key={label}
                  onClick={() => handleClick(index)}
                  className={`
                    px-6 py-2 text-sm font-medium transition-all duration-200
                    ${
                      selected === index
                        ? "bg-black text-white border-b-2 border-black rounded"
                        : "text-gray-600 border-b-2 border-transparent hover:border-gray-300"
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Popover for "How Can I Help You?" */}
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  className="px-3 py-1 text-sm font-medium rounded hover:bg-gray-100"
                  // e.g. a "Help" button or icon
                >
                  Help
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" side="bottom" className="p-0 w-64">
                <div className="flex flex-col">
                  <div className="bg-gradient-to-r from-violet-500 via-blue-500 via-purple-500 to-pink-300 text-white">
                    <p className="p-4">How Can I Help You Today?</p>
                  </div>
                  <div className="m-4">
                    <div className="relative">
                      <Input
                        autoFocus
                        type="search"
                        id="search"
                        placeholder="Search By Keywords"
                        className="pl-10"
                      />
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size="18"
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Content Section */}
          <div className="mt-4 flex-1">
            {selected === 0 && (
              <ReaderOptionsForm
                onSubmit={() => {}}
                onClose={onClose}
                initialData={initialData}
                nodeId={nodeId}
                onSourceUpdate={onSourceUpdate}
              />
            )}
            {selected === 1 && <SchemaTable initialData={initialData} />}
            {selected === 2 && <OnboardTaggingStep />}
            {selected === 3 && <PreviewTable />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
