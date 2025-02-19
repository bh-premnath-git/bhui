import { createColumnHelper } from "@tanstack/react-table"
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { ROUTES } from '@/config/routes';
import { PlusIcon, Users } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { getInitials } from '@/lib/utils';
import { useNavigation } from "@/hooks/useNavigation";
import { Pipeline } from '@/types/designer/pipeline';

const columnHelper = createColumnHelper<Pipeline>()

export const columns: ColumnDefWithFilters<Pipeline, any>[] = [
  columnHelper.accessor('pipeline_name', {
    header: 'Name',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('bh_project_name', {
    header: 'Project Name',
    enableColumnFilter: true,
  }),
];
