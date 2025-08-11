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

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { getConnectionConfigList } from "@/store/slices/dataCatalog/datasourceSlice";
import { AppDispatch } from "@/store";

import { ReaderDataProvider, useReaderData } from '@/context/ReaderDataContext';
import { setIsRightPanelOpen } from "@/store/slices/designer/buildPipeLine/BuildPipeLineSlice";
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { apiService } from '@/lib/api/api-service';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
 
// Internal component that uses the context
function OrderPopUpContent({ isOpen, onClose, source, nodeId, onSourceUpdate }: any) {
  const [selected, setSelected] = React.useState(0);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [initialData, setInitialData] = React.useState<any>(null);
  const [sourceColumns, setSourceColumns] = React.useState<any[]>([]);
  const [isLoadingColumns, setIsLoadingColumns] = React.useState(false);
const [dataSource, setDataSource] = React.useState<number | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { readerData, setReaderData } = useReaderData();
  const { pipelineJson } = usePipelineContext();
  const {connectionConfigList} = useSelector((state: any) => state.datasource);
  
  console.log('🔧 OrderPopUp: Initializing OrderPopUpContent with source:', source);
  console.log('🔧 OrderPopUp: NodeId:', nodeId);
  console.log('🔧 OrderPopUp: Pipeline JSON available:', !!pipelineJson);

  // Function to find transformation from pipeline JSON by data_src_id
  const findTransformationFromPipeline = React.useCallback((dataSrcId: number) => {
    if (!pipelineJson || !pipelineJson.transformations) {
      return null;
    }

    // Find transformation that has a source with matching data_src_id
    const transformation = pipelineJson.transformations.find((trans: any) => {
      if (trans.transformation === 'Reader' && trans.source) {
        // Handle $ref case
        if (trans.source.$ref) {
          const refPath = trans.source.$ref.replace('#/', '').split('/');
          let sourceObj = pipelineJson;
          for (const path of refPath) {
            sourceObj = sourceObj[path];
          }
          return sourceObj && sourceObj.data_src_id === dataSrcId;
        }
        // Handle direct source case
        return trans.source.data_src_id === dataSrcId;
      }
      return false;
    });

    return transformation;
  }, [pipelineJson]);

  // Function to resolve source reference from pipeline JSON
  const resolveSourceFromPipeline = React.useCallback((sourceRef: any) => {
    if (!pipelineJson) return null;

    if (sourceRef.$ref) {
      const refPath = sourceRef.$ref.replace('#/', '').split('/');
      let sourceObj = pipelineJson;
      for (const path of refPath) {
        sourceObj = sourceObj[path];
      }
      return sourceObj;
    }
    return sourceRef;
  }, [pipelineJson]);

  // Function to fetch source layout fields
  const fetchSourceLayoutFields = React.useCallback(async (dataSrcId: number) => {
    if (!dataSrcId) {
      console.log('🔧 OrderPopUp: No data_src_id provided for fetching layout fields');
      return [];
    }

    setIsLoadingColumns(true);
    try {
      console.log('🔧 OrderPopUp: Fetching layout fields for data_src_id:', dataSrcId);
      
      const response: any = await apiService.get({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: `/data_source_layout/list_full/?data_src_id=${dataSrcId}`,
        usePrefix: true,
        method: 'GET',
        metadata: {
          errorMessage: 'Failed to fetch source layout fields'
        }
      });

      console.log('🔧 OrderPopUp: Raw API response:', response);
setDataSource(response)
      const columns = response?.layout_fields?.map((field: any) => ({
        name: field.lyt_fld_name,
        dataType: field.lyt_fld_data_type_cd
      })) || [];

      console.log('🔧 OrderPopUp: Processed columns:', columns);
      setSourceColumns(columns);
      return columns;
    } catch (error) {
      console.error(`🔧 OrderPopUp: Error fetching columns for data source ${dataSrcId}:`, error);
      toast.error('Failed to fetch source layout fields');
      setSourceColumns([]);
      return [];
    } finally {
      setIsLoadingColumns(false);
    }
  }, []);

  // Function to create proper initial data structure for ReaderOptionsForm
  const createInitialData = React.useCallback(() => {
    console.log('🔧 OrderPopUp: Creating initial data from source:', source);
    console.log('🔧 OrderPopUp: Pipeline JSON:', pipelineJson);
    
    if (!source) {
      console.log('🔧 OrderPopUp: No source data available');
      return null;
    }

    const dataSrcId = source.data_src_id || source.source?.data_src_id;
    console.log('🔧 OrderPopUp: Looking for data_src_id:', dataSrcId);

    // Try to find existing transformation in pipeline JSON
    let pipelineTransformation = null;
    let pipelineSource = null;

    if (dataSrcId && pipelineJson) {
      pipelineTransformation = findTransformationFromPipeline(dataSrcId);
      console.log('🔧 OrderPopUp: Found pipeline transformation:', pipelineTransformation);

      if (pipelineTransformation && pipelineTransformation.source) {
        pipelineSource = resolveSourceFromPipeline(pipelineTransformation.source);
        console.log('🔧 OrderPopUp: Resolved pipeline source:', pipelineSource);
      }
    }
    // debugger
// let con_cof_id=connectionConfigList.find((config: any) => config.connection_config_name === dataSource[0].connection_config_name)?.connection_config_id || null;
    // Create the structure that ReaderOptionsForm expects
    // Priority: pipeline JSON data > current source data
    const initialData = {
      // Basic transformation info - prefer pipeline data
      name: pipelineTransformation?.name || source.name || source.data_src_name || '',
      transformation: 'Reader',
      
      // Source object structure that matches the schema
      source: {
        name: pipelineSource?.name || source.name || source.data_src_name || '',
        source_type: pipelineSource?.source_type || (source.source?.source_type === 'File' ? 'File' : 'Relational'),
        data_src_id: pipelineSource?.data_src_id || source.data_src_id || source.source?.data_src_id,
        table_name: pipelineSource?.table_name || source.table_name || source.source?.table_name,
        file_name: pipelineSource?.file_name || source.file_name || source.source?.file_name,
        file_type: pipelineSource?.file_type || source.file_type || source.source?.file_type,
        
        // Connection info - prefer pipeline data
        connection_config_id: pipelineSource?.connection?.connection_config_id || source?.source?.connection?.connection_config_id || source?.connection?.connection_config_id,
        connection_type: pipelineSource?.connection_type || source.connection_type || source.source?.connection_type,
        database: pipelineSource?.database || source.database || source.source?.database,
        schema: pipelineSource?.schema || source.schema || source.source?.schema,
        
        // Connection object if available
        connection: pipelineSource?.connection || source.connection || source.source?.connection
      },
      
      // Reader-specific options - prefer pipeline data
      read_options: pipelineTransformation?.read_options || source.read_options || {},
      select_columns: pipelineTransformation?.select_columns || source.select_columns || [],
      drop_columns: pipelineTransformation?.drop_columns || source.drop_columns || [],
      rename_columns: pipelineTransformation?.rename_columns || source.rename_columns || {},
      
      // Additional metadata
      nodeId: nodeId,
      dependent_on: pipelineTransformation?.dependent_on || source.dependent_on || []
    };
    console.log('🔧 OrderPopUp: Created initial data:', dataSource);

    console.log('🔧 OrderPopUp: Created initial data with pipeline priority:', initialData);
    return initialData;
  }, [source, nodeId, pipelineJson, findTransformationFromPipeline, resolveSourceFromPipeline]);

  // Set up initial data when component mounts or source changes
  React.useEffect(() => {
    const data = createInitialData();
    setInitialData(data);
  }, [createInitialData]);

  // Fetch source layout fields when component mounts or source changes
  React.useEffect(() => {
    const dataSrcId = source?.data_src_id || source?.source?.data_src_id;
    if (dataSrcId && isOpen) {
      fetchSourceLayoutFields(dataSrcId);
    }
  }, [source, isOpen, fetchSourceLayoutFields]);

  // Callback for ReaderOptionsForm to update global context
  const handleFormDataChange = (updatedFormData: any) => {
    setReaderData(updatedFormData);
  };

  // Function to refresh columns - can be called externally
  const refreshColumns = React.useCallback(() => {
    const dataSrcId = source?.data_src_id || source?.source?.data_src_id;
    if (dataSrcId) {
      fetchSourceLayoutFields(dataSrcId);
    }
  }, [source, fetchSourceLayoutFields]);
  useEffect(() => {
    const fetchConnectionConfigs = async () => {
      try {
        await dispatch(getConnectionConfigList({ offset: 0, limit: 1000 })).unwrap();
      } catch (error) {
        console.error('Error fetching connection configs:', error);
        toast.error('Failed to load connection configurations');
      }
    };

    fetchConnectionConfigs();
  }, [dispatch]);

  // Close right panel when component mounts
  useEffect(() => {
    dispatch(setIsRightPanelOpen(false))
  }, [dispatch]);


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

      
        {/* Content Section - Fixed height container */}
        <div className="flex-1 overflow-auto">
          <div className="h-full">
            {selected === 0 && initialData && (
              <ReaderOptionsForm
                initialData={initialData} // Pass the properly structured initial data
                onSubmit={() => { }}
                onClose={onClose}
                nodeId={nodeId}
                sourceColumns={sourceColumns} // Pass the fetched columns
                isLoadingColumns={isLoadingColumns} // Pass loading state
                refreshColumns={refreshColumns} // Pass refresh function
                onSourceUpdate={(updatedSource) => {
                  console.log('🔧 OrderPopUp: Received updatedSource from ReaderOptionsForm:', updatedSource);
                  console.log('🔧 OrderPopUp: Calling parent onSourceUpdate with nodeId:', nodeId);
                  onSourceUpdate(updatedSource);
                  // The changes will be saved automatically by the auto-save mechanism
                }}
                onFormDataChange={handleFormDataChange} // Pass the callback
              />
            )}
            {selected === 0 && !initialData && (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">
                  {isLoadingColumns ? 'Loading reader options and columns...' : 'Loading reader options...'}
                </div>
              </div>
            )}
            {selected === 1 && (
              <SchemaTable 
                dataSourceId={source.source?.data_src_id} 
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
