import { createColumnHelper } from '@tanstack/react-table';
import { formatTimestamp } from '@/lib/date-format';
import { LLM } from '@/types/admin/llm';
import { TToolbarConfig } from '@/types/table';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { PlusIcon } from 'lucide-react';

const columnHelper = createColumnHelper<LLM>();

const llmColumns = [
  columnHelper.accessor('model_name', {
    header: 'Model Name',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('model_type', {
    header: 'Type',
    enableColumnFilter: false,
    cell: ({ row }) => {
      const type = row.getValue('model_type') as string;
      return (
      <>
          {type}
      </>
      );
    },
  }),

  columnHelper.accessor('created_at', {
    header: 'Created On',
    cell: ({ row }) => {
      const timestamp = row.getValue('created_at') as string;
      return formatTimestamp(timestamp);
    },
    enableColumnFilter: false,
  }),
];

const getLLMToolbarConfig = (): TToolbarConfig => {
  
  const { handleNavigation } = useNavigation();
  return {
    buttons: [
      {
        label: (
          <>
            Add LLM
          </>
        ),
        variant: "default",
        icon: PlusIcon,
        onClick: () => {
          handleNavigation(ROUTES.ADMIN.LLM.ADD);
        },
      },
    ],
  };
};

export { llmColumns, getLLMToolbarConfig }
