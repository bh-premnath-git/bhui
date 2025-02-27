
import { DataTable } from '@/components/bh-table/data-table';
import { columns,getToolbarConfig } from './config/columns.config';
import { Environment } from '@/types/admin/environment';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { useEnvironmentManagementServive } from '@/features/admin/environment/services/envMgtSrv';

export function EnvironmentList({environments}:{environments: Environment[]}) {
  const { handleNavigation } = useNavigation()
  const envMgntSrv = useEnvironmentManagementServive();

  const onRowClickHandler = (row: Row<Environment>) => {
    envMgntSrv.selectatedEnvironment(row.original)
    handleNavigation(ROUTES.ADMIN.ENVIRONMENT.EDIT(row.original.bh_env_id.toString()))
  }
 
  return (
      <DataTable<Environment> 
        columns={columns} 
        data={environments || []}
        topVariant='simple'
        pagination={true}
        onRowClick={onRowClickHandler}
        toolbarConfig={getToolbarConfig()}
      />
  );
}