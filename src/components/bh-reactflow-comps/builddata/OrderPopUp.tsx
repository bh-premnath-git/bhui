import React, { useState, useEffect } from "react";
import SchemaTable from "./SchemaTable";
import OnboardTaggingStep from "./OnboardTaggingStep";
import { ReaderOptionsForm } from "./ReaderOptionsForm";
import { useSelector } from "react-redux";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { usePipelineContext } from "@/context/designers/DataPipelineContext";

export default function OrderPopUp({ isOpen, onClose, source, nodeId, onSourceUpdate }: any) {
  const [selected, setSelected] = React.useState(0);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [initialData, setInitialData] = useState(null);
  const { pipelineJson } = usePipelineContext();
  console.log(pipelineJson, "pipelineJson")
  // const { pipelineJson } = useSelector((state: any) => state.buildPipeline.pipelineJsonData);
  console.log(pipelineJson, "pipelineJson")
  const handleClose2 = () => {
    setAnchorEl(null);
  };
  useEffect(() => {
    if (source) {
      console.log(source)
      let pipelineJsonData = pipelineJson?.sources?.find((item: any) => item.data_src_id === source?.data_src_id);
      console.log(pipelineJsonData, "pipelineJson")
      const initialData = {
        reader_name: source?.data_src_desc || pipelineJsonData?.name ||  '',
        name: pipelineJsonData?.name || source?.data_src_name || '',
        source: {
          type: pipelineJsonData?.source_type || (source?.connection_type === 'FILE' ? 'File' : source?.connection_type) || '',
          source_name: pipelineJsonData?.name || source?.data_src_name || '',
          file_name: pipelineJsonData?.file_name || source?.file_name || '',
          bh_project_id: pipelineJsonData?.bh_project_id || source?.bh_project_id || '',
          data_src_id: pipelineJsonData?.data_src_id || source?.data_src_id || '',
          file_type: pipelineJsonData?.connection?.file_type || source?.file_type || '',

          connection: {
            connection_config_id: pipelineJsonData?.connection?.connection_config_id || source?.connection_config_id || '',
            type: pipelineJsonData?.connection?.connection_type || source?.connection_type || '',
            file_path_prefix: pipelineJsonData?.connection?.file_path_prefix || source?.file_path_prefix || '',
            connection_name: pipelineJsonData?.connection?.name || source?.connection_config?.connection_name || '',
            file_type: pipelineJsonData?.connection?.file_type?.toUpperCase() || source?.file_type || ''
          }
        }
      };
      console.log(initialData,"initialData")
      setInitialData(initialData);
    }
  }, [source]);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;


  const handleClick = (index: any) => {
    setSelected(index);
    switch (index) {
      case 0:
        handleSchemaClick();
        break;
      case 1:
        handleTagClick();
        break;
      case 2:
        handlePreviewClick();
        break;
      default:
        break;
    }
  };
  const handleSchemaClick = () => {
    console.log("Schema button clicked");
  };

  const handleTagClick = () => {
    console.log("Tag button clicked");
  };

  const handlePreviewClick = () => {
    console.log("Preview button clicked");
  };
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1200px]  px-20 overflow-scroll ">
          {/* Header */}
          <DialogHeader className=" m-0">
            {/* <div className="flex flex-col"> */}
              <DialogTitle>{source?.data_src_name}</DialogTitle>
              <p className="text-sm font-bold">{source?.data_src_desc}</p>
            {/* </div> */}
          </DialogHeader>

          <div className="">
            <div className="flex">
              {['Reader Options', 'Schema'].map((label, index) => (
                <button
                  key={label}
                  onClick={() => handleClick(index)}
                  className={`
                  px-6 py-2 text-sm font-medium
                  ${selected === index
                      ? 'bg-black text-white border-b-2 border-black rounded'
                      : 'text-gray-600 border-b-2 border-transparent hover:border-gray-300'
                    }
                  transition-all duration-200
              `}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Popover */}
            <Popover
              open={open}
              onOpenChange={handleClose2}
            >
              <PopoverContent>
                <div className="flex flex-col">
                  <div className="bg-gradient-to-r from-violet-500 via-blue-500 via-purple-500 to-pink-300 text-white">
                    <p className="p-4">How Can I Help You Today?</p>
                  </div>
                  <div className="m-4">
                    <div className="relative">
                      <input
                        autoFocus
                        type="search"
                        id="search"
                        placeholder="Search By Keywords"
                        className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Content Section */}
          <div className="">
            {selected === 0 && (
              <ReaderOptionsForm
                onSubmit={() => { }}
                onClose={onClose}
                initialData={initialData}
                nodeId={nodeId}
                onSourceUpdate={(updatedSource) => {
                  onSourceUpdate(updatedSource);
                  // The changes will be saved automatically by the auto-save mechanism
                }}
              />
            )}
            {selected === 1 && <SchemaTable initialData={initialData} />}
            {/* {selected === 2 && <OnboardTaggingStep />} */}
            {/* {selected === 3 && <PreviewTable />} */}
          </div>
      </DialogContent>
    </Dialog>
  );
}