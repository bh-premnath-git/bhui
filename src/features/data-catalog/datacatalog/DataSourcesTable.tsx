import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataSource } from "@/types/data-catalog.types";
import { DataTable } from "@/components/bh-table/data-table"
import { Database, Import, RotateCcw } from "lucide-react"
import { CustomToolbarConfig } from "@/types/data-table.types";
import { getUniqueValues } from "@/lib/utils";
import { ColumnDefWithFilters } from "@/types/typesys.types";
import { Row } from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import DataCatalogSchema from "./DataCatalogSchema";
import DataCatalogImport from "../importsource/DataCatalogImport";
import { formatDate } from "@/lib/dayeformat";


interface DataSourcesTableProps {
  data: DataSource[];
}

export const DataSourcesTable = ({ data }: DataSourcesTableProps) => {
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<DataSource | null>(null);
  const [showImportSection, setShowImportSection] = useState(false);
  const columns: ColumnDefWithFilters<DataSource>[] = [
    {
      accessorKey: "data_src_name",
      header: "Data Source",
      filterOptions: getUniqueValues(data, 'data_src_name'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 min-w-[80px]">
          <div className="flex items-center justify-center bg-gray-100 rounded p-1">
            <Database className="text-green-500" size={20} />
          </div>
          {row.getValue("data_src_name")}
        </div>
      ),
    },
    {
      accessorKey: "bh_project_name",
      header: "Project",
    },
    {
      accessorKey: "owner",
      header: "Owner",
      cell: ({ row }) => {
        const ownerName = row.getValue("owner") as string
        if (!ownerName) return null
        const nameParts = ownerName.split(" ");
        const initials =
          nameParts.length === 1
            ? nameParts[0].slice(0, 2).toUpperCase()
            : (
              nameParts[0][0] +
              nameParts[nameParts.length - 1][0]
            ).toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{ownerName}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "data_src_quality",
      header: "Quality",
      cell: ({ row }) => {
        const qualityScore = row.getValue("data_src_quality");
        const getColor = (score: number) => {
          if (score >= 80) return "bg-green-500";
          if (score >= 50) return "bg-yellow-500";
          return "bg-red-500";
        };

        return (
          <div className="w-[120px]">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">{Number(qualityScore) || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${getColor(Number(qualityScore) || 0)}`}
                style={{ width: `${Number(qualityScore) || 0}%` }}
              ></div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "updated_at",
      header: "Last Updated",
      cell: ({ row }) => {
        return <>{formatDate(row.original.updated_at)}</>
      }
    },
  ];

  const customToolbarConfig: CustomToolbarConfig = {
    buttons: [
      {
        label: "Import Source",
        icon: Import,
        variant: "default",
        onClick: () => {
          setShowImportSection(true);
        },
      },
      {
        label: "Xplore",
        icon: RotateCcw,
        variant: "outline",
        onClick: () => {
          navigate("/data-catalog/xplore")
        },
      }
    ],
  };

  const tableName: string = "datacatalog"

  function rowClickHandler(row: Row<DataSource>) {
    setIsSheetOpen(true);
    setSelectedRow(row.original);
  }

  return (
    <React.Fragment>
      {showImportSection ? (
        <DataCatalogImport />
      ) : (
        <React.Fragment>
          <DataTable
            tableName={tableName}
            customToolbarConfig={customToolbarConfig}
            columns={columns}
            data={data}
            showToolbar={true}
            onRowClick={rowClickHandler}
          />
        </React.Fragment>
      )}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-[90vw]">
          <SheetHeader>
            <SheetTitle>{selectedRow?.data_src_name}</SheetTitle>
          </SheetHeader>
          <DataCatalogSchema data={selectedRow} />
        </SheetContent>
      </Sheet>
    </React.Fragment>
  );
};