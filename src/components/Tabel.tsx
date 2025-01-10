import React, { useState, useMemo, useEffect, useCallback } from "react";
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

// Utility functions
const getValidPageNumber = (current: number, total: number): number =>
  Math.max(1, Math.min(current, total || 1));

const getSafeString = (value: any): string =>
  value?.toString?.() || '';

const getSafeNumber = (value: any): number =>
  Number(value) || 0;

// Types and Interfaces
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

interface SortConfig {
  key: string;
  direction: "asc" | "desc" | null;
}

const TABLE_NAME_CHECK_LIST = [
  "Create New Flow",
  "Create New Project",
  "Create New Environment",
  "Create New Bundle"
];

// Custom Table Header Component
const CustomTableHeader: React.FC<{
  columns: ColumnConfig[];
  sortConfig: SortConfig;
  requestSort: (key: string) => void;
  className?: string;
  isAction?: boolean;
}> = React.memo(({ columns, sortConfig, requestSort, className, isAction }) => {
  const getSortIcon = useCallback((key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="inline ml-1 h-4 w-4" />
    ) : sortConfig.direction === "desc" ? (
      <ChevronDown className="inline ml-1 h-4 w-4" />
    ) : null;
  }, [sortConfig]);

  return (
    <TableHeader className={cn("bg-gray-200 text-black font-bold", className)}>
      <TableRow>
        {columns.map((column) => (
          <TableHead
            key={column.key}
            onClick={() => column.sortable && requestSort(column.key)}
            className={cn(column.sortable ? "cursor-pointer" : "")}
          >
            {column.header} {column.sortable && getSortIcon(column.key)}
          </TableHead>
        ))}
        {isAction && <TableHead>Action</TableHead>}
      </TableRow>
    </TableHeader>
  );
});

// Table Body Component
const TableBodyComponent: React.FC<{
  tableName?: string;
  data: any[];
  columns: ColumnConfig[];
  actionFn?: (rowData: any, action: string) => void;
  playRow?: boolean;
  playRowFn?: (rowData: any) => void;
  isAction?: boolean;
  rowColorFn?: (rowData: any, index: number) => string;
}> = React.memo(({
  tableName,
  data,
  columns,
  actionFn,
  playRow,
  playRowFn,
  isAction,
  rowColorFn
}) => {
  if (!data?.length) {
    return (
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={columns.length + (isAction ? 1 : 0)}
            className="text-center py-4"
          >
            No data available
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {data.map((row, index) => (
        <TableRow
          key={index}
          onClick={playRow && playRowFn ? () => playRowFn(row) : undefined}
          className={cn(
            playRow ? "cursor-pointer" : "",
            rowColorFn ? rowColorFn(row, index) : ""
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
            <TableCell onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" sideOffset={-15}>
                  {!["Create New Flow", "Add Pipeline"].includes(tableName) ? (
                    <>
                      <DropdownMenuItem onClick={() => actionFn?.(row, "edit")}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => actionFn?.(row, "changeStatus")}>
                        Change Status
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onClick={() => actionFn?.(row, "delete")}>
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
  );
});

// Table Filters Component
const TableFilters: React.FC<{
  columns: ColumnConfig[];
  data: any[];
  filters: { [key: string]: string };
  setFilters: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}> = React.memo(({ columns, data, filters, setFilters, setCurrentPage }) => {
  const handleFilter = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filter changes
  }, [setFilters, setCurrentPage]);

  const filterableColumns = columns.filter(col => col.filterable);
  if (!filterableColumns.length) return null;

  return (
    <>
      {filterableColumns.map((column) => {
        const uniqueValues = new Set(
          data
            .map(item => item[column.key])
            .filter(value => value !== undefined)
        );

        return (
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
              {Array.from(uniqueValues).map((value) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => handleFilter(column.key, value)}
                >
                  {value}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </>
  );
});

// Table Pagination Controls Component
const TablePaginationControls: React.FC<{
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  setItemsPerPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPageOptions: number[];
  showPagination: boolean;
  totalItems: number;
}> = React.memo(({
  currentPage,
  totalPages,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
  itemsPerPageOptions,
  showPagination,
  totalItems
}) => {

  const validCurrentPage = getValidPageNumber(currentPage, totalPages);

  if (validCurrentPage !== currentPage) {
    setCurrentPage(validCurrentPage);
  }

  return showPagination ? (
    <div className="flex justify-between items-center mt-4">
      <div className="flex items-center space-x-2">
        <ArrowLeftCircle
          className={cn(
            "text-gray-900",
            validCurrentPage === 1 ? "opacity-50" : "hover:text-gray-800 cursor-pointer"
          )}
          onClick={() => validCurrentPage > 1 && setCurrentPage(validCurrentPage - 1)}
          style={{ fontSize: '1.5rem' }}
        />
        <span>
          Page {validCurrentPage} of {Math.max(1, totalPages)} ({totalItems} items)
        </span>
        <ArrowRightCircle
          className={cn(
            "text-gray-900",
            validCurrentPage === totalPages ? "opacity-50" : "hover:text-gray-800 cursor-pointer"
          )}
          onClick={() => validCurrentPage < totalPages && setCurrentPage(validCurrentPage + 1)}
          style={{ fontSize: '1.5rem' }}
        />
      </div>
      <Select
        value={itemsPerPage.toString()}
        onValueChange={(value) => {
          const newItemsPerPage = getSafeNumber(value);
          setItemsPerPage(newItemsPerPage);
          setCurrentPage(1); // Reset to first page when changing items per page
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
  ) : null;
});

// Main FlexibleTable Component
export function FlexibleTable({
  data = [],
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
  // debugger
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: columns[0].key,
    direction: null,
  });
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters, search, or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm, itemsPerPage]);

  const requestSort = useCallback((key: string) => {
    setSortConfig(prevConfig => ({
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
  }, []);

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.filter(item => {
      const matchesFilters = Object.entries(filters).every(
        ([key, value]) => value === "All" || getSafeString(item[key]) === value
      );

      const matchesSearch = searchTerm
        ? Object.values(item).some(val =>
          getSafeString(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
        : true;

      return matchesFilters && matchesSearch;
    });
  }, [data, filters, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig.direction) return filteredData;

    const { key, direction } = sortConfig;
    const column = columns.find(col => col.key === key);

    return [...filteredData].sort((a, b) => {
      try {
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
          compare = getSafeString(aValue).localeCompare(getSafeString(bValue));
        }

        return direction === "asc" ? compare : -compare;
      } catch (error) {
        console.error('Sorting error:', error);
        return 0;
      }
    });
  }, [filteredData, sortConfig, columns]);

  const validTotalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const validCurrentPage = getValidPageNumber(currentPage, validTotalPages);

  const paginatedData = useMemo(() => {
    if (!Array.isArray(sortedData)) return [];

    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    return sortedData.slice(
      startIndex,
      Math.min(startIndex + itemsPerPage, sortedData.length)
    );
  }, [sortedData, validCurrentPage, itemsPerPage]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value || '');
    setCurrentPage(1); // Reset to first page on search
  }, []);

  const handleCreateNew = useCallback(() => {
    if (createNewFn) createNewFn();
  }, [createNewFn]);

  return (
    <div className="container mx-auto p-1">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <TableFilters
            columns={columns}
            data={data}
            filters={filters}
            setFilters={setFilters}
            setCurrentPage={setCurrentPage}
          />
        </div>

        <div className="flex space-x-2">
          {isSearch && (
            <Input
              placeholder="Search"
              className="w-44"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          )}
          {tableName && (
            <Button
              variant="default"
              className={cn(
                TABLE_NAME_CHECK_LIST.includes(tableName)
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : `${background} hover:${background} text-white`
              )}
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
        currentPage={validCurrentPage}
        totalPages={validTotalPages}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        itemsPerPageOptions={itemsPerPageOptions}
        showPagination={data?.length > 10}
        totalItems={sortedData.length}
      />
    </div>
  );
}