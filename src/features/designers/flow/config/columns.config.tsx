import { createColumnHelper } from "@tanstack/react-table"
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { ROUTES } from '@/config/routes';
import { PlusIcon, Users } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { getInitials } from '@/lib/utils';
import { useNavigation } from "@/hooks/useNavigation";
import { Flow } from '@/types/designer/flow';
import { FlowDeployment } from '@/types/designer/flow';

const columnHelper = createColumnHelper<Flow>()

export const columns: ColumnDefWithFilters<Flow>[] = [
  columnHelper.accessor('flow_name', {
    header: 'Name',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('bh_project_name', {
    header: 'Project Name',
    enableColumnFilter: true,     
  }),
  columnHelper.accessor(row => row.flow_deployment[0]?.bh_env_name ?? '', {
    header: 'Environment Name',
    enableColumnFilter: true,
  }),
];
