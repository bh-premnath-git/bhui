import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PlusCircle,
  Filter,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  ArrowLeftCircle,
  ArrowRightCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ColumnConfig {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  type?: "text" | "number" | "date" | "image" | "badge";
  badgeConfig?: {
    colorMap: { [key: string]: string };
  };
  align?: "left" | "center" | "right";
}

interface TableProps {
  data: any[];
  columns: ColumnConfig[];
  itemsPerPageOptions?: number[];
  defaultItemsPerPage?: number;
  tableName?: string;
  isSearch?: boolean;
  isAction?: boolean;
  createNewFn?: () => void;
  actionFn?: (rowData: any, action: string) => void;
  playRow?: boolean;
  playRowFn?: (rowData: any) => void;
  background?: string;
  rowColorFn?: (rowData: any, index: number) => string;
}

type SortConfig = {
  key: string;
  direction: "asc" | "desc" | null;
};

const tableNameCheckList = [
  "Create New Flow",
  "Create New Project",
  "Create New Environment",
  "Create New Bundle"
];

/**
 * Custom Table Header Component
 */
const CustomTableHeader: React.FC<{
  columns: ColumnConfig[];
  sortConfig: SortConfig;
  requestSort: (key: string) => void;
  className?: string;
  isAction?: boolean;
}> = React.memo(({ columns, sortConfig, requestSort, className, isAction }) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? (
        <ChevronUp className="inline ml-1 h-4 w-4" />
      ) : sortConfig.direction === "desc" ? (
        <ChevronDown className="inline ml-1 h-4 w-4" />
      ) : null;
    }
    return null;
  };

  return (
    <TableHeader className={cn("bg-gray-200 text-black font-bold", className)}>
      <TableRow>
        {columns.map((column) => (
          <TableHead
            key={column.key}
            onClick={() => column.sortable && requestSort(column.key)}
            className={column.sortable ? "cursor-pointer" : ""}
          >
            {column.header} {column.sortable && getSortIcon(column.key)}
          </TableHead>
        ))}
        {isAction && <TableHead>Action</TableHead>}
      </TableRow>
    </TableHeader>
  );
});

/**
 * Table Body Component
 */
const TableBodyComponent: React.FC<{
  tableName?: string;
  data: any[];
  columns: ColumnConfig[];
  actionFn?: (rowData: any, action: string) => void;
  playRow?: boolean;
  playRowFn?: (rowData: any) => void;
  isAction?: boolean;
  rowColorFn?: (rowData: any, index: number) => string; // Updated to include index
}> = React.memo(({ tableName, data, columns, actionFn, playRow, playRowFn, isAction, rowColorFn }) => (
  <TableBody>
    {data?.map((row, index) => (
      <TableRow
        key={index}
        onClick={playRow && playRowFn ? () => playRowFn(row) : undefined}
        className={cn(
          playRow ? "cursor-pointer" : "",
          rowColorFn ? rowColorFn(row, index) : "" // Apply rowColorFn
        )}
      >
        {columns.map((column) => {
          const value = row[column.key];
          return (
            <TableCell
              key={column.key}
              className={cn(
                column.align === "left" ? "text-left" :
                column.align === "center" ? "text-center" :
                column.align === "right" ? "text-right" :
                column.type === "number" ? "text-center" : "text-justify"
              )}
            >
              {column.render ? (
                column.render(value, row)
              ) : column.type === "image" ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={value} alt={value} />
                  <AvatarFallback>
                    {value ? value[0] : <PlusCircle className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              ) : column.type === "badge" && column.badgeConfig ? (
                <Badge className={`${column.badgeConfig.colorMap[value]} text-white p-1`}>
                  {value}
                </Badge>
              ) : (
                value
              )}
            </TableCell>
          );
        })}
        {isAction && (
          <TableCell
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" sideOffset={-15}>
                {tableName !== "Create New Flow" && (
                  <>
                    <DropdownMenuItem onClick={() => actionFn && actionFn(row, "edit")}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => actionFn && actionFn(row, "changeStatus")}>
                      Change Status
                    </DropdownMenuItem>
                  </>
                )}
                {tableName === "Create New Flow" && (
                  <DropdownMenuItem onClick={() => actionFn && actionFn(row, "delete")}>
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        )}
      </TableRow>
    ))}
  </TableBody>
));
/**
 * Table Filters Component
 */
const TableFilters: React.FC<{
  columns: ColumnConfig[];
  data: any[];
  filters: { [key: string]: string };
  setFilters: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}> = ({ columns, data, filters, setFilters }) => {
  const handleFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {columns.filter((col) => col.filterable).map((column) => (
        <DropdownMenu key={column.key}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-2 w-2" /> {column.header} /{" "}
              {filters[column.key] || "All"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleFilter(column.key, "All")}>
              All
            </DropdownMenuItem>
            {Array.from(
              new Set(
                data
                  .map((item) => item[column.key])
                  .filter((value) => value !== undefined)
              )
            ).map((value) => (
              <DropdownMenuItem key={value} onClick={() => handleFilter(column.key, value)}>
                {value}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </>
  );
};

/**
 * Table Pagination Controls Component
 */
const TablePaginationControls: React.FC<{
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  setItemsPerPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPageOptions: number[];
  showPagination: boolean;
}> = ({
  currentPage,
  totalPages,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
  itemsPerPageOptions,
  showPagination
}) => {
    if (!showPagination) return null;

    return (
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          <ArrowLeftCircle
            className={`text-gray-900 ${currentPage === 1 ? 'opacity-50' : 'hover:text-gray-800 cursor-pointer'}`}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            style={{ fontSize: '1.5rem' }}
          />
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <ArrowRightCircle
            className={`text-gray-900 ${currentPage === totalPages ? 'opacity-50' : 'hover:text-gray-800 cursor-pointer'}`}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            style={{ fontSize: '1.5rem' }}
          />
        </div>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => {
            setItemsPerPage(Number(value));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select items per page" />
          </SelectTrigger>
          <SelectContent>
            {itemsPerPageOptions.map((num) => (
              <SelectItem key={num} value={num.toString()}>
                {num} per page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

/**
 * Main FlexibleTable Component
 */
export function FlexibleTable({
  data,
  columns,
  itemsPerPageOptions = [5, 15, 25],
  defaultItemsPerPage = 5,
  tableName = "",
  isSearch = true,
  isAction = true,
  createNewFn,
  actionFn,
  playRow = false,
  playRowFn,
  background = 'gray',
  rowColorFn,
}: TableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: columns[0].key,
    direction: null,
  });
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);

  const requestSort = (key: string) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key
          ? prevConfig.direction === "asc"
            ? "desc"
            : prevConfig.direction === "desc"
              ? null
              : "asc"
          : "asc",
    }));
  };

  const filteredData = useMemo(() => {
    return data
      ?.filter((item) =>
        Object.entries(filters).every(
          ([key, value]) => value === "All" || item[key]?.toString() === value
        )
      )
      .filter((item) =>
        Object.values(item).some((val) =>
          val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
  }, [data, filters, searchTerm]);

  const sortedAndFilteredData = useMemo(() => {
    if (!filteredData) return [];
    if (!sortConfig.direction) return filteredData;

    const { key, direction } = sortConfig;
    const column = columns.find((col) => col.key === key);

    return [...filteredData].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];
      let compare = 0;

      if (column?.type === "date") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
        compare = aValue - bValue;
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        compare = aValue - bValue;
      } else {
        compare = aValue.toString().localeCompare(bValue.toString());
      }

      return direction === "asc" ? compare : -compare;
    });
  }, [filteredData, sortConfig, columns]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAndFilteredData?.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAndFilteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil((sortedAndFilteredData?.length || 0) / itemsPerPage);

  const handleCreateNew = () => {
    if (createNewFn) createNewFn();
  };

  return (
    <div className="container mx-auto p-1">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <TableFilters columns={columns} data={data} filters={filters} setFilters={setFilters} />
        </div>

        <div className="flex space-x-2">
          {isSearch && (
            <Input
              placeholder="Search"
              className="w-44"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}
          {tableName && (
            <Button
              variant="default"
              className={
                tableNameCheckList.includes(tableName)
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : `${background} hover:${background} text-white`
              }
              onClick={handleCreateNew}
            >
              {tableName} <PlusCircle className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Table>
        <CustomTableHeader
          className="text-black"
          columns={columns}
          sortConfig={sortConfig}
          requestSort={requestSort}
          isAction={isAction}
        />
        <TableBodyComponent
          tableName={tableName}
          data={paginatedData}
          columns={columns}
          actionFn={actionFn}
          playRow={playRow}
          playRowFn={playRowFn}
          isAction={isAction}
          rowColorFn={rowColorFn}
        />
      </Table>

      <TablePaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        itemsPerPageOptions={itemsPerPageOptions}
        showPagination={data?.length > 10}
      />
    </div>
  );
}
