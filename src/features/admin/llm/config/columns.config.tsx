import { createColumnHelper } from '@tanstack/react-table';
import type { TToolbarConfig, ColumnDefWithFilters } from '@/types/table';
import { LLM } from '@/types/admin/llm';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/config/routes';
import { useNavigation } from '@/hooks/useNavigation';
import { PlusIcon, Trash2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@/components/ui/tooltip';
import { formatTimestamp } from '@/lib/date-format';

const columnHelper = createColumnHelper<LLM>();

interface ColumnsProps {
  onDelete?: (llm: LLM) => void;
}

const createColumns = (props?: ColumnsProps): ColumnDefWithFilters<LLM>[] => [
  columnHelper.accessor('provider', {
    header: 'Provider',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('model_name', {
    header: 'Model Name',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('model_type', {
    header: 'Model Type',
    enableColumnFilter: true,
    cell: ({ row }) => {
      const type = row.getValue('model_type') as string;
      return (
        <Badge className="capitalize bg-blue-100 text-blue-800">
          {type}
        </Badge>
      );
    },
  }),
  columnHelper.accessor('created_at', {
    header: 'Created On',
    enableColumnFilter: false,
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string;
      return <div>{formatTimestamp(date)}</div>;
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    enableColumnFilter: false,
    cell: ({ row }) => {
      const llm = row.original;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  props?.onDelete?.(llm);
                }}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete {llm.provider}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete LLM</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  })
];

const getToolbarConfig = (): TToolbarConfig => {
  const { handleNavigation } = useNavigation();
  return {
    buttons: [
      {
        label: (
          <>
            <Bot className="mr-2 h-4 w-4" />
            Add LLM
          </>
        ),
        variant: 'outline',
        className: 'bg-primary text-primary-foreground',
        icon: PlusIcon,
        onClick: () => {
          handleNavigation(ROUTES.ADMIN.LLM.ADD);
        },
      },
    ],
  };
};

const columns = createColumns();

export { createColumns, getToolbarConfig, columns };
