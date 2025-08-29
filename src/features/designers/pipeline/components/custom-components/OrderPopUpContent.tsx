import React, { useState, useEffect, Suspense } from "react";
import SchemaTable from "@/components/bh-reactflow-comps/builddata/SchemaTable";
import OnboardTaggingStep from "@/components/bh-reactflow-comps/builddata/OnboardTaggingStep";

// Lazy load ReaderOptionsForm to avoid circular dependency
const ReaderOptionsForm = React.lazy(() => 
  import("@/components/bh-reactflow-comps/builddata/ReaderOptionsForm").then(module => ({
    default: module.ReaderOptionsForm
  }))
);
import { useDispatch, useSelector } from "react-redux";
import { Search, HelpCircle } from "lucide-react";
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

interface OrderPopUpContentProps {
  source: any;
  nodeId: string;
  onSourceUpdate: (updatedSource: any) => void;
}

export default function OrderPopUpContent({ source, nodeId, onSourceUpdate }: OrderPopUpContentProps) {
  const [selected, setSelected] = React.useState(0);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [initialData, setInitialData] = useState(null);
  const { pipelineJson } = usePipelineContext();
  const dispatch = useDispatch<AppDispatch>();
  const { connectionConfigList } = useSelector((state: any) => state.datasource);
  
  console.log('🔧 OrderPopUpContent rendered with source:', source);
  console.log('🔧 OrderPopUpContent pipelineJson:', pipelineJson);

  const handleClose2 = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchConnectionConfigs = async () => {
      try {
        const response = await dispatch(getConnectionConfigList({ offset: 0, limit: 1000 })).unwrap();
        initialSource();
      } catch (error) {
        console.error('Error fetching connection configs:', error);
        toast.error('Failed to load connection configurations');
      }
    };
    console.log("Fetching connection configs...", connectionConfigList);

    fetchConnectionConfigs();
  }, [dispatch]);

  useEffect(() => {
    if (connectionConfigList?.length > 0 && source) {
      initialSource();
    }
  }, [connectionConfigList, source]);

  const initialSource = () => {
    console.log('🔧 OrderPopUpContent initialSource called with source:', source);
    if (source && connectionConfigList) {
      const connection = connectionConfigList.find((item: any) => item.id === source?.connection_config_id);
      console.log('🔧 Found connection:', connection);
      
      if (!connection) {
        console.warn('Connection not found for the given connection_config_id');
        return;
      }

      const pipelineJsonData = pipelineJson?.sources?.find((item: any) => item.data_src_id === source?.data_src_id);
      console.log('🔧 PipelineJsonData:', pipelineJsonData);
      
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
            name: connection?.connection_config_name || connection?.connection_name || '',
            connection_config_id: pipelineJsonData?.connection?.connection_config_id || source?.connection_config_id || connection?.id || '',
            file_path_prefix: pipelineJsonData?.connection?.file_path_prefix || 
                             source?.file_path_prefix || 
                             connection?.custom_metadata?.file_path_prefix || '',
          },
          connection_config_id: pipelineJsonData?.connection?.connection_config_id || source?.connection_config_id || '',
        }
      };
      console.log('🔧 OrderPopUpContent: Final initialData:', initialData);
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

  const handleSubmit = (data: any) => {
    console.log('🔧 OrderPopUpContent: Form submitted with data:', data);
    onSourceUpdate(data);
  };

  // Render the content without Dialog wrapper
  return (
    <div className="max-w-[1000px] min-h-[650px] px-6 flex flex-col bg-white border rounded-lg">
      {/* Header */}
      <div className="py-4 px-2 border-b">
        <div className="flex items-center">
          <div className="mr-2 font-semibold text-lg">
            {source?.data_src_name || source?.name || 'Reader Configuration'}
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
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-1 p-2 bg-gray-50 rounded-lg my-4">
        {['Configure', 'Tag', 'Preview'].map((label, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selected === index
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {selected === 0 && (
          <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
            <ReaderOptionsForm
              onSubmit={handleSubmit}
              onClose={() => console.log('Form closed')}
              initialData={initialData}
              onSourceUpdate={onSourceUpdate}
              nodeId={nodeId}
            />
          </Suspense>
        )}
        {selected === 1 && (
          <OnboardTaggingStep 
            initialData={initialData}
            onSubmit={handleSubmit}
          />
        )}
        {selected === 2 && (
          <SchemaTable 
            source={source}
            nodeId={nodeId}
          />
        )}
      </div>

      {/* Debug information */}
      <div className="mt-4 p-3 bg-gray-50 border-t text-xs">
        <details>
          <summary className="cursor-pointer font-medium">🔧 Debug Info</summary>
          <div className="mt-2 space-y-2">
            <div><strong>Source:</strong> <pre>{JSON.stringify(source, null, 2)}</pre></div>
            <div><strong>Initial Data:</strong> <pre>{JSON.stringify(initialData, null, 2)}</pre></div>
            <div><strong>Selected Tab:</strong> {selected}</div>
          </div>
        </details>
      </div>
    </div>
  );
}