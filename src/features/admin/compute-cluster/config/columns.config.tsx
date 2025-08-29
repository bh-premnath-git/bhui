import { ColumnDef } from "@tanstack/react-table";
import { ComputeCluster } from "@/types/admin/compute-cluster";
import { Badge } from "@/components/ui/badge";
import { TToolbarConfig } from "@/types/table";
import { ROUTES } from "@/config/routes";
import { useNavigation } from '@/hooks/useNavigation';
import { PlusIcon, Server } from 'lucide-react';

export const columns: ColumnDef<ComputeCluster>[] = [
  {
    accessorKey: "name",
    header: "Compute Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "environment",
    header: "Environment",
    cell: ({ row }) => (
      <span>{row.getValue("environment")}</span>
    ),
  },
  {
    accessorKey: "platform",
    header: "Compute Type",
    cell: ({ row }) => (
      <div className="flex items-center">
        <span>{row.getValue("platform")}</span>
      </div>
    ),
  },
  {
    accessorKey: "region",
    header: "Region",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue("region")}</span>
    ),
  },
  {
    accessorKey: "instanceType",
    header: "Instance Type",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.getValue("instanceType")}</Badge>
    ),
  },
  {
    accessorKey: "currentNodes",
    header: "Nodes",
    cell: ({ row }) => {
      const current = row.getValue("currentNodes") as number;
      const min = row.original.minNodes;
      const max = row.original.maxNodes;
      return (
        <div className="text-left">
          <span className="font-medium">{current}</span>
          <span className="text-muted-foreground text-xs ml-1">
            ({min}-{max})
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const getStatusVariant = (status: string) => {
        switch (status) {
          case 'active':
            return 'success';
          case 'inactive':
            return 'secondary';
          case 'pending':
            return 'outline';
          case 'error':
            return 'destructive';
          default:
            return 'secondary';
        }
      };
      
      return (
        <Badge variant={getStatusVariant(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  },
];

export const getToolbarConfig = (): TToolbarConfig => {
  const { handleNavigation } = useNavigation();
  return {
    buttons: [
      {
        label: (
          <>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Compute Config
          </>
        ),
        variant: "default",
        className: "bg-primary text-primary-foreground",
        onClick: () => {
          handleNavigation(ROUTES.ADMIN.COMPUTE_CLUSTER.ADD);
        },
      }
    ]
  };
};