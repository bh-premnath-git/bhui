import { DataTable } from '@/components/bh-table/data-table';
import { columns } from './config/columns.config';
import { DataSource } from '@/types/data-catalog/dataCatalog';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { useDataCatalogManagementService } from './services/datacatalogMgtSrv';

function DataCatalog({ datasources }: { datasources: DataSource[] }) {
  const { handleNavigation } = useNavigation();
  const dataCatalogSrv = useDataCatalogManagementService();

  return (
    <DataTable<DataSource>
      columns={columns}
      data={datasources || []}
      topVariant="simple"
      pagination={true}
    />
  );
}

export default DataCatalog;