import React, { useState, useEffect } from "react";
import SchemaTable from "./SchemaTable";
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
import { apiService } from '@/lib/api/api-service';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { ReaderDataProvider, useReaderData } from '@/context/ReaderDataContext';
 
// Internal component that uses the context
function OrderPopUpContent({ isOpen, onClose, source, nodeId, onSourceUpdate }: any) {
  const [selected, setSelected] = React.useState(0);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [initialData, setInitialData] = useState(null);
  const [dataSources, setDataSources] = useState<any[]>([]);
  const { pipelineJson } = usePipelineContext();
  const dispatch = useDispatch<AppDispatch>();
  const { connectionConfigList } = useSelector((state: any) => state.datasource);
  const { readerData, setReaderData } = useReaderData();
  
console.log('🔧 OrderPopUp: Initializing OrderPopUpContent with source:', source);
  // Callback for ReaderOptionsForm to update global context
  const handleFormDataChange = (updatedFormData: any) => {
    setReaderData(updatedFormData);
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

  // Fetch data sources to try to match file names with data_src_id
  useEffect(() => {
    const fetchDataSources = async () => {
      try {
        const response:any = await apiService.get({
          baseUrl: CATALOG_REMOTE_API_URL,
          url: '/data_source/list/',
          usePrefix: true,
          method: 'GET',
          params: { limit: 1000 }
        });
        const dataSourcesArray = response?.data || [];
        setDataSources(dataSourcesArray);
      } catch (error) {
        console.error('🔧 OrderPopUp: Error fetching data sources:', error);
      }
    };

    fetchDataSources();
  }, []);

  // Add a new useEffect to watch for changes in connectionConfigList, source, and dataSources
  useEffect(() => {
    
    if (connectionConfigList?.length > 0 && source) {
      initialSource();
    }
  }, [connectionConfigList, source, dataSources]);

  const initialSource = () => {
    
let data_src_id=dataSources.find((item: any) => item.data_src_name === source?.name||source?.source?.name )?.data_src_id;
    if (source && connectionConfigList) {
      // Try to find a matching data source if data_src_id is missing
      let matchedDataSource = null;
      if (!source?.data_src_id && !source?.source?.data_src_id && dataSources?.length > 0) {
        const fileName = source?.file_name || source?.source?.file_name || source?.name || source?.reader_name;
        const connectionId = source?.connection_config_id || source?.source?.connection_config_id || source?.source?.connection?.connection_config_id;
        
       
        
        matchedDataSource = dataSources.find((ds: any) => {
          const nameMatch = ds.data_src_name === fileName || ds.file_name === fileName;
          const connectionMatch = ds.connection_config_id === connectionId || ds.connection_config_id === parseInt(connectionId);
         
          return nameMatch && connectionMatch;
        });
        
        if (matchedDataSource) {
          source = {
            ...source,
            data_src_id: data_src_id,
            source: {
              ...source.source,
              data_src_id: data_src_id
            }
          };
        } else {
        }
      }
      let connection = connectionConfigList.find((item: any) => item.id === source?.connection_config_id);
      // If no connection found by ID, try to find by name
      if (!connection && source?.connection?.name) {
        connection = connectionConfigList.find((item: any) => 
          item.connection_config_name === source?.connection?.name ||
          item.connection_name === source?.connection?.name
        );
      }
      
      // If still no connection, use the first available connection as fallback
      if (!connection && connectionConfigList.length > 0) {
        connection = connectionConfigList[0];
      }
      
      if (!connection) {
        console.warn('No connections available in connectionConfigList');
        return;
      }

      const pipelineJsonData = pipelineJson?.sources?.find((item: any) => item.data_src_id === (source?.data_src_id || source?.source?.data_src_id));
      
      const initialData = {
        reader_name: source?.reader_name || source?.name || source?.data_src_name || pipelineJsonData?.name || '',
        name: source?.name || source?.reader_name || pipelineJsonData?.name || source?.data_src_name || '',
        file_type: source?.file_type || pipelineJsonData?.connection?.file_type || source?.source?.file_type || 'CSV',

        source: {
          type: source?.source?.type || 
                (connection.connection_name?.toLowerCase() === 'local' ||
                 connection.connection_name?.toLowerCase() === 's3')
                ? 'File'
                : 'Relational',
          source_name: source?.source?.source_name || source?.name || source?.reader_name || pipelineJsonData?.name || source?.data_src_name || '',
          file_name: source?.source?.file_name || pipelineJsonData?.file_name || source?.file_name || source?.data_src_name || source?.name || '',
          table_name: source?.source?.table_name || 
                     pipelineJsonData?.connection?.table_name ||
                     source?.data_src_name ||
                     pipelineJsonData?.name || '',
          bh_project_id: source?.source?.bh_project_id || pipelineJsonData?.bh_project_id || source?.bh_project_id || '',
          data_src_id: data_src_id,
          file_type: source?.source?.file_type || source?.file_type || pipelineJsonData?.connection?.file_type || 'CSV',
          connection: {
            ...(source?.source?.connection || pipelineJsonData?.connection || source?.custom_metadata?.custom_metadata || connection?.custom_metadata),
            name: source?.source?.connection?.name || connection?.connection_config_name || connection?.connection_name || '',
            connection_config_id: source?.source?.connection?.connection_config_id || 
                                 pipelineJsonData?.connection?.connection_config_id || 
                                 source?.connection_config_id || 
                                 connection?.id || '',
            file_path_prefix: source?.source?.connection?.file_path_prefix ||
                             pipelineJsonData?.connection?.file_path_prefix || 
                             source?.file_path_prefix || 
                             connection?.custom_metadata?.file_path_prefix || '',
          },
          connection_config_id: source?.source?.connection_config_id || 
                               pipelineJsonData?.connection?.connection_config_id || 
                               source?.connection_config_id || '',
        }
      };

      console.log('🔧 OrderPopUp: Setting initialData and readerData context:', initialData);
      console.log('🔧 OrderPopUp: data_src_id being set:', initialData.source?.data_src_id);
      setInitialData(initialData);
      setReaderData(initialData); // Set global context for both components
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
  };

  const handleTagClick = () => {
  };

  const handlePreviewClick = () => {
  };
 

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const handleClose2 = (open: boolean) => {
    if (!open) {
      setAnchorEl(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
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
                onFormDataChange={handleFormDataChange} // Pass the callback
              />
            )}
            {selected === 1 && (
              <SchemaTable 
                initialData={readerData || initialData} 
                onSwitchToReaderOptions={() => setSelected(0)}
              />
            )}
            {/* {selected === 2 && <OnboardTaggingStep />} */}
            {/* {selected === 3 && <PreviewTable />} */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main component that provides the context
export default function OrderPopUp(props: any) {
  return (
    <ReaderDataProvider>
      <OrderPopUpContent {...props} />
    </ReaderDataProvider>
  );
}
