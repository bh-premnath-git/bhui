import { createColumnHelper } from "@tanstack/react-table";
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table";
import { Prompt } from "@/types/admin/prompt";
import { ROUTES } from "@/config/routes";
import { useNavigation } from "@/hooks/useNavigation";
import { PlusIcon, BookMarked} from "lucide-react";
import { formatTimestamp } from "@/lib/date-format";

const columnHelper = createColumnHelper<Prompt>();

const columns: ColumnDefWithFilters<Prompt>[] = [
    columnHelper.accessor('prompt_name',{
        header: 'Name',
        enableColumnFilter: true
    }),
    columnHelper.accessor('created_at', {
        header: 'Created On',
        enableColumnFilter: true,
        cell: ({ row }) => {
            const date = row.getValue('created_at') as string | null;
            return <div>{formatTimestamp(date)}</div>;
          },
    }),
    columnHelper.accessor('module_name',{
        header:'Module',
        enableColumnFilter: true
    })
];

const getToolbarConfig = (): TToolbarConfig => {
    const { handleNavigation } = useNavigation()
    return {
      buttons: [
        {
          label: <BookMarked className="mr-2 h-4 w-4" />,
          variant: "outline",
          className: "bg-primary text-primary-foreground",
          icon: PlusIcon,
          onClick: () => {
            handleNavigation(ROUTES.ADMIN.PROMPT.ADD)
          },
        }]
    }
  
  }
  
  export { columns, getToolbarConfig }