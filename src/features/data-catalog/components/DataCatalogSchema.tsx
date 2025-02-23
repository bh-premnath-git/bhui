import { DataTable } from '@/components/bh-table/data-table';
import { useDataCatalogManagementService } from '@/features/data-catalog/services/datacatalogMgtSrv';
import { columns } from '../config/layoutCloumns.config';
import { useLayoutFields } from '@/features/data-catalog/hooks/uselayoutFileds';
import About from './About';

export function DataCatalogSchema({ dataSourceId }: { dataSourceId: number }) {
  const dataCatalogSrv = useDataCatalogManagementService();
  const { layoutFields, isLoading } = useLayoutFields({ 
    shouldFetch: true,
    dataSourceId: dataSourceId
  });

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium">Schema Details</h3>
      <div className="mt-4 flex gap-6">
        <div className="flex-1">
          <DataTable
            columns={columns}
            data={layoutFields}
            topVariant="simple"
            pagination={true}
          />
        </div>
        <div className="w-[300px]">
          <About />
        </div>
      </div>
    </div>
  );
}
