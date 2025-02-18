import { createColumnHelper } from '@tanstack/react-table';
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { DataSource } from '@/types/data-catalog/dataCatalog';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/config/routes';
import { useNavigation } from '@/hooks/useNavigation';
import { PlusIcon, FolderGit2 } from 'lucide-react';


const columnHelper = createColumnHelper<DataSource>();

export const columns: ColumnDefWithFilters<DataSource>[] = [
  columnHelper.accessor('data_src_name', {
    header: 'Name',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('data_src_desc', {
    header: 'Description',
    enableColumnFilter: false,
  }),
];




