import { useDataCatalogManagementService } from '@/features/data-catalog/services/datacatalogMgtSrv';

export function DataCatalogSchema() {
  const dataCatalogSrv = useDataCatalogManagementService();

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium">Schema Details</h3>
      <div className="mt-4">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Description</h4>
            <p className="text-sm text-muted-foreground"></p>
          </div>
          <div>
            <h4 className="font-medium">Total Records</h4>
            <p className="text-sm text-muted-foreground"></p>
          </div>
        </div>
      </div>
    </div>
  );
}
