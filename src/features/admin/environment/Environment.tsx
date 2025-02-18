
import { DataTable } from '@/components/bh-table/data-table';
import { columns } from './config/columns.config';
import { Environment } from '@/types/admin/environemnt';

export function EnvironmentList({environments}:{environments: Environment[]}) {
 
  return (
    
      <DataTable<Environment> 
        columns={columns} 
        data={environments || []}
        topVariant='simple'
        pagination={true}
      />
  );
}


