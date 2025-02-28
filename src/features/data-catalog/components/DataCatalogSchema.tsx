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

export function DataCatalogSchema({ dataSourceId }: { dataSourceId: number }) {
  const { dataSourceTypes } = useAppSelector(
    (state: RootState) => state.global
  );
  const { layoutFields, isLoading, isFetching, isError } = useLayoutFields({
    shouldFetch: true,
    dataSourceId: dataSourceId
  });

  // Cast to the correct type to access layout_fields
  const layoutData = layoutFields ? layoutFields.layout_fields : [];

  const generateAllDescriptions = async () => {
    toast.info("Generating descriptions for all fields...");
    for (const [fieldId, cellData] of descriptionCellRefs.entries()) {
      if (cellData.ref.current) {
        try {
          console.log("Field ID:", fieldId);
          console.log("Row data:", cellData.rowData);
         
          // For now, still call the existing generateDescription method
          await cellData.ref.current.generateDescription();
        } catch (error) {
          toast.error(`Failed to generate description for field: ${cellData.rowData.lyt_fld_name}`);
        }
      }
    }
    toast.success("All descriptions generated successfully");
  };

  // Create columns with the generate description handler
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
