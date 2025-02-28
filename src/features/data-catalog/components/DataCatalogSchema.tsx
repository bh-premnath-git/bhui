import { DataTable } from '@/components/bh-table/data-table';
import { createColumns, descriptionCellRefs } from '../config/layoutCloumns.config';
import { useLayoutFields } from '@/features/data-catalog/hooks/uselayoutFileds';
import About from './About';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { RootState } from "@/store/"
import { useAppSelector } from '@/hooks/useRedux';
import { apiService } from '@/lib/api/api-service';
import { AGENT_PORT } from '@/config/platformenv';

export function DataCatalogSchema({ dataSourceId }: { dataSourceId: number }) {
  const { dataSourceTypes } = useAppSelector(
    (state: RootState) => state.global
  );
  const { layoutFields, isLoading, isFetching, isError } = useLayoutFields({
    shouldFetch: true,
    dataSourceId: dataSourceId
  });

  const datatypes = dataSourceTypes?.codes_dtl || [];
  const layoutData = layoutFields ? layoutFields.layout_fields : [];

  const generateAllDescriptions = async () => {
    toast.info("Generating descriptions for all fields...");
    const body = {
      operation_type: 'column_description',
      thread_id: 'desc_123',
      params: {
        source_name: layoutFields.data_src_lyt_name,
        columns: []
      }
    }
    
    // Map to keep track of field IDs to column names
    const fieldIdToColumnName = new Map();
    
    // First, set all cells to loading state and collect column data
    for (const [fieldId, cellData] of descriptionCellRefs.entries()) {
      if (cellData.ref.current) {
        try {
          // Set the cell to loading state
          cellData.ref.current.setGenerating(true);
          
          const dataType = datatypes.find((dt) => dt.id === cellData.rowData.lyt_fld_data_type_cd);
          const column = {
            id: fieldId,
            name: cellData.rowData.lyt_fld_name,
            dataType
          }
          
          // Store the mapping of field ID to column name for later use
          fieldIdToColumnName.set(cellData.rowData.lyt_fld_name, fieldId);
          
          body.params.columns.push(column);
        } catch (error) {
          console.error(`Error preparing field ${fieldId}:`, error);
          toast.error(`Failed to prepare description for field: ${cellData.rowData.lyt_fld_name}`);
          if (cellData.ref.current) {
            cellData.ref.current.setGenerating(false);
          }
        }
      }
    }
    
    try {
      // Make the API call
      const response: any = await apiService.post({
        portNumber: AGENT_PORT,
        method: 'POST',
        url: '/pipeline_agent/generate',
        data: body,
        usePrefix: true,
        metadata: {
          errorMessage: `Failed to generate description for fields`
        }
      });
      
      const parsedResponse = JSON.parse(response.result as string);
      
      if (parsedResponse && parsedResponse.descriptions && Array.isArray(parsedResponse.descriptions)) {
        let successCount = 0;
        
      
        for (const desc of parsedResponse.descriptions) {
          const columnName = desc.column_name;
          const description = desc.description;
          
          const fieldId = fieldIdToColumnName.get(columnName);
          
          if (fieldId && descriptionCellRefs.has(fieldId)) {
            const cellData = descriptionCellRefs.get(fieldId);
            if (cellData && cellData.ref.current) {
              await cellData.ref.current.updateDescription(description);
              successCount++;
            }
          } else {
            console.warn(`Could not find field ID for column name: ${columnName}`);
          }
        }
        
        toast.success(`Successfully generated ${successCount} descriptions`);
      } else {
        toast.error("No descriptions found in the API response");
      }
    } catch (error) {
      toast.error("Failed to generate descriptions");
    } finally {
      for (const [fieldId, cellData] of descriptionCellRefs.entries()) {
        if (cellData.ref.current) {
          cellData.ref.current.setGenerating(false);
        }
      }
    }
  };

  const columns = useMemo(() => createColumns(generateAllDescriptions), []);

  if (isLoading || isFetching) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium">Schema Details</h3>
        <div className="mt-4">
          <LoadingState className='w-30 h-30' />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium">Schema Details</h3>
        <div className="mt-4">
          <ErrorState message="Failed to load schema details. Please try again later." />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium">Schema Details</h3>
      <div className="mt-4 flex gap-6">
        <div className="flex-1">
          {layoutData.length > 0 ? (
            <DataTable
              columns={columns}
              data={layoutData}
              topVariant="simple"
              pagination={true}
            />
          ) : (
            <div className="p-8 text-center text-gray-500">
              No schema details available for this data source.
            </div>
          )}
        </div>
        <div className="w-[300px]">
          <About />
        </div>
      </div>
    </div>
  );
}
