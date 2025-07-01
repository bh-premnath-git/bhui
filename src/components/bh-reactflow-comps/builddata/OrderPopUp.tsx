import React, { useState, useEffect } from "react";
import SchemaTable from "./SchemaTable";
import OnboardTaggingStep from "./OnboardTaggingStep";
import { ReaderOptionsForm } from "./ReaderOptionsForm";
import { useDispatch, useSelector } from "react-redux";
import { Search, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { usePipelineContext } from "@/context/designers/DataPipelineContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { getConnectionConfigList } from "@/store/slices/dataCatalog/datasourceSlice";
import { AppDispatch } from "@/store";

export default function OrderPopUp({ isOpen, onClose, source, nodeId, onSourceUpdate }: any) {
  const [selected, setSelected] = React.useState(0);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [initialData, setInitialData] = useState(null);
  const { pipelineJson } = usePipelineContext();
  const dispatch = useDispatch<AppDispatch>();
  const { connectionConfigList } = useSelector((state: any) => state.datasource);
  console.log(pipelineJson, "pipelineJson")
  // const { pipelineJson } = useSelector((state: any) => state.buildPipeline.pipelineJsonData);
  console.log(pipelineJson, "pipelineJson")
  const handleClose2 = () => {
    setAnchorEl(null);
  };
  useEffect(() => {
    const fetchConnectionConfigs = async () => {
      try {
        const response = await dispatch(getConnectionConfigList({ offset: 0, limit: 1000 })).unwrap();
        // Remove the setTimeout and call initialSource directly after we have the data
        initialSource();
      } catch (error) {
        console.error('Error fetching connection configs:', error);
        toast.error('Failed to load connection configurations');
      }
    };

    fetchConnectionConfigs();
  }, [dispatch]);

  // Add a new useEffect to watch for changes in connectionConfigList and source
  useEffect(() => {
    if (connectionConfigList?.length > 0 && source) {
      initialSource();
    }
  }, [connectionConfigList, source]);

  const initialSource = () => {
    console.log(source, "source")
    if (source && connectionConfigList) {
      const connection = connectionConfigList.find((item: any) => item.id === source?.connection_config_id);
      console.log(connection)
      if (!connection) {
        console.warn('Connection not found for the given connection_config_id');
        return;
      }



      const pipelineJsonData = pipelineJson?.sources?.find((item: any) => item.data_src_id === source?.data_src_id);
      console.log(pipelineJsonData, "pipelineJsonData")
      console.log('Connection data:', connection);
      console.log('Source file_path_prefix:', source?.file_path_prefix);
      console.log('Pipeline connection:', pipelineJsonData?.connection);
      
      const initialData = {
        reader_name: source?.data_src_name || pipelineJsonData?.name || '',
        name: pipelineJsonData?.name || source?.data_src_name || '',
        file_type: pipelineJsonData?.connection?.file_type || source?.file_type || 'CSV',

        source: {
          type: (connection.connection_name?.toLowerCase() === 'local' ||
            connection.connection_name?.toLowerCase() === 's3')
            ? 'File'
            : 'Relational',
          source_name: pipelineJsonData?.name || source?.data_src_name || '',
          file_name: pipelineJsonData?.file_name || source?.file_name,
          table_name: pipelineJsonData?.connection?.table_name ||
            source?.data_src_name ||
            pipelineJsonData?.name || '',
          bh_project_id: pipelineJsonData?.bh_project_id || source?.bh_project_id || '',
          data_src_id: pipelineJsonData?.data_src_id || source?.data_src_id || '',
          file_type: pipelineJsonData?.connection?.file_type || source?.file_type || 'CSV',
          connection: {
            ...(pipelineJsonData?.connection || source?.custom_metadata?.custom_metadata || connection?.custom_metadata),
            file_path_prefix: pipelineJsonData?.connection?.file_path_prefix || 
                             source?.file_path_prefix || 
                             connection?.custom_metadata?.file_path_prefix || '',
          },
          connection_config_id: pipelineJsonData?.connection?.connection_config_id || source?.connection_config_id || '',
        }
      };

      setInitialData(initialData);
    }
  };
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
      <DialogContent className="max-w-[1000px] h-[650px] px-6 overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="py-2 px-2 shrink-0">
          <DialogTitle className="flex items-center">
            <div className="mr-2 font-semibold text-base">
              {source?.data_src_name || source?.name }
            </div>
            {source?.data_src_desc && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent side="right" align="start">
                    <p className="text-sm w-72">{source?.data_src_desc}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className=" shrink-0">
          <div className="flex">
            {['Reader Options', 'Schema'].map((label, index) => (
              <button
                key={label}
                onClick={() => handleClick(index)}
                className={`
                  p-1.5 text-sm font-medium
                  ${selected === index
                    ? 'bg-black text-white border-b-2 border-black rounded-t'
                    : 'text-gray-600 border-b-2 border-transparent '
                  }
                  transition-all duration-200
              `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Popover */}
        <Popover
          open={open}
          onOpenChange={handleClose2}
        >
          <PopoverContent>
            <div className="flex flex-col">
              <div className="bg-gradient-to-r from-violet-500 via-blue-500 via-purple-500 to-pink-300 text-white">
                <p className="p-3 text-sm">How Can I Help You Today?</p>
              </div>
              <div className="m-3">
                <div className="relative">
                  <input
                    autoFocus
                    type="search"
                    id="search"
                    placeholder="Search By Keywords"
                    className="w-full px-8 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Content Section - Fixed height container */}
        <div className="flex-1 overflow-auto">
          <div className="h-full">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
