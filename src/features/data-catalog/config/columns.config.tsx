import { createColumnHelper } from '@tanstack/react-table';
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { DataSource } from '@/types/data-catalog/dataCatalog';
import { formatDate } from "@/lib/date-format";
import {
  Database,
  PlusIcon,
  ImportIcon,
  Trash2
} from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const columnHelper = createColumnHelper<DataSource>();

interface ColumnsProps {
  onDelete?: (datasource: DataSource) => void;
}

const connectionImages = {
  "mysql": "/assets/buildPipeline/connection/mysql.svg",
  "postgres": "/assets/buildPipeline/connection/postgres.svg",
  "oracle": "/assets/buildPipeline/connection/oracle.svg",
  "snowflake": "/assets/buildPipeline/connection/snowflake.svg",
  "bigquery": "/assets/buildPipeline/connection/bigquery.svg",
  "redshift": "/assets/buildPipeline/connection/redshift.svg",
  "local": "/assets/buildPipeline/connection/local.png",
  "gcs": "/assets/buildPipeline/connection/gcs.svg",
  "s3": "/assets/buildPipeline/connection/s3.svg",
  "databricks_lakehouse": "/assets/buildPipeline/connection/databricks.svg",
  "ms_sql_server": "/assets/buildPipeline/connection/ms_sql_server.svg",
  "mongodb": "/assets/buildPipeline/connection/mongodb.svg",
  "clickhouse": "/assets/buildPipeline/connection/clickhouse.svg",
  "pinecone": "/assets/buildPipeline/connection/pinecone.svg",
  "redis": "/assets/buildPipeline/connection/redis.svg",
  "salesforce": "/assets/buildPipeline/connection/salesforce.svg",
  "weaviate": "/assets/buildPipeline/connection/weaviate.svg",
  "apache_iceberg": "/assets/buildPipeline/connection/apache_iceberg.svg",
  "azure_blob_storage": "/assets/buildPipeline/connection/azure_blob_storage.svg",
  "duckdb": "/assets/buildPipeline/connection/duckdb.svg",
  "elasticsearch": "/assets/buildPipeline/connection/elasticsearch.svg",
  "google_sheets": "/assets/buildPipeline/connection/google_sheets.svg",
  "google_pubsub": "/assets/buildPipeline/connection/google_pubsub.svg",
  "kafka": "/assets/buildPipeline/connection/kafka.svg",
  "dynamodb": "/assets/buildPipeline/connection/dynamodb.svg",
  "starburst_galaxy": "/assets/buildPipeline/connection/starburst.svg",
  "google_firestore": "/assets/buildPipeline/connection/google_firestore.svg",
  "ibm_db2": "/assets/buildPipeline/connection/ibm_db2.svg",
  "ibm_idms": "/assets/buildPipeline/connection/idms.png",
  "teradata": "/assets/buildPipeline/connection/teradata.svg",
};

const createColumns = (props?: ColumnsProps): ColumnDefWithFilters<DataSource>[] => [
  columnHelper.accessor('data_src_name', {
    header: 'Name',
    cell: (info) => {
      const value = info.getValue();
      const rowData = info.row.original;
      const connName = rowData.connection_config?.connection_name
        ?.toLowerCase()
        .replace(/\s+/g, "") || '';


      return (
        <div className="flex items-center gap-4 min-w-[250px]">
          <div className="flex items-center justify-center bg-muted rounded-md p-2 w-10 h-10">
            {connectionImages[connName] ? (
              <img
                src={connectionImages[connName]}
                alt={rowData.connection_config?.connection_name || 'connection'}
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <Database className="w-6 h-6 text-green-500" />
            )}
          </div>
          <div>
            <p className="text-base font-medium text-foreground mb-1">
              {value || "Never"}
            </p>
            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
              {rowData.data_src_desc || "No description available"}
            </p>
          </div>
        </div>
      );
    }
    ,
    enableColumnFilter: true,
  }),
  columnHelper.accessor('bh_project_name', {
    header: 'Project',
    enableColumnFilter: true,
  }),
  columnHelper.accessor((row) => row.connection_config?.connection_name ?? "-", {
    id: 'connection_name',
    header: 'Connection',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('updated_at', {
    header: 'Last Updated',
    cell: (info) => formatDate(info.getValue()),
    enableColumnFilter: false,
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: (info) => {
      const datasource = info.row.original;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  props?.onDelete?.(datasource);
                }}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete {datasource.data_src_name}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete data source</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableColumnFilter: false,
  }),
];

const getToolbarConfig = (): TToolbarConfig => {
  return {
    buttons: [
      {
        label: "Dataset",
        variant: "outline",
        className: "bg-primary text-primary-foreground",
        icon: PlusIcon,
        dropdownItems: [
          {
            label: "Tables",
            icon: Database,
            onClick: () => {
              window.dispatchEvent(new Event("openImportSourceDialog"));
            },
          },
          {
            label: "Flat File",
            icon: ImportIcon,
            onClick: () => {
              window.dispatchEvent(new Event("openLocalImport"));
            },
          }
        ]
      },
    ]
  }
}

// Keep the original columns export for backward compatibility
const columns: ColumnDefWithFilters<DataSource>[] = createColumns();

export { columns, createColumns, getToolbarConfig }
