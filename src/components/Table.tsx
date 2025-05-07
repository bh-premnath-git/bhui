import React, { useEffect, useState, useMemo, useCallback, ChangeEvent } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
  ArrowRightCircle,
  Loader2,
  Save,
  Gavel,
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
const getValidPageNumber = (current: number, total: number): number => {
  // Ensure total is at least 1
  const validTotal = Math.max(1, total);
  // Ensure current is between 1 and validTotal
  return Math.max(1, Math.min(current, validTotal));
};

const getSafeString = (value: any): string => {
  return value?.toString?.() || "";
};

const getSafeNumber = (value: any): number => {
  const num = Number(value);
  return num > 0 ? num : 1;
};

// Interfaces and Types
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
  aiLoading?: boolean;
  saveLoading?: boolean;
  aiStatus?: string;
  saveStatus?: string;
  createNewFn?: () => void;
  handleAIgenFn?: () => void;
  handleAIsaveFn?: () => void;
  importSrcFn?: () => void;
  clickXploreFn?: () => void;
  actionFn?: (rowData: any, action: string) => void;
  playRow?: boolean;
  playRowFn?: (rowData: any) => void;
  background?: string;
  rowColorFn?: (rowData: any, index: number) => string;
  isAIGenerated?: boolean;
}

interface SortConfig {
  key: string;
  direction: "asc" | "desc" | null;
}

// Constants
const TABLE_NAME_CHECK_LIST = [
  "Create New Flow",
  "Create New Project",
  "Create New Environment",
  "Create New Bundle",
  "Add Pipeline",
];

const TABLE_NAME_RESTRICTED_ACTIONS = ["Create New Flow", "Add Pipeline"];
const TABLE_NAME_ACTIONS_AI = ["Catalog Table", "DataOps"];
const TABLE_AI_COLS = ["Description"];
const EXTRA_BUTTON_TABLE = ["Xplore"];

// Components
const CustomTableHeader: React.FC<{
  columns: ColumnConfig[];
  tableName?: string;
  sortConfig: SortConfig;
  requestSort: (key: string) => void;
  className?: string;
  isAction?: boolean;
  aiLoading?: boolean;
  saveLoading?: boolean;
  aiStatus?: string;
  saveStatus?: string;
  isAIGenerated?: boolean;
  handleAIgen: () => void;
  handleAISave: () => void;
}> = React.memo(({
  columns,
  tableName,
  sortConfig,
  requestSort,
  className,
  isAction,
  isAIGenerated,
  aiLoading,
  saveLoading,
  aiStatus,
  saveStatus,
  handleAIgen,
  handleAISave,
}) => {
  const getSortIcon = useCallback((key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="inline ml-1 h-4 w-4" aria-label="Ascending" />
    ) : sortConfig.direction === "desc" ? (
      <ChevronDown className="inline ml-1 h-4 w-4" aria-label="Descending" />
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
            aria-sort={
              sortConfig.key === column.key
                ? sortConfig.direction === "asc"
                  ? "ascending"
                  : sortConfig.direction === "desc"
                    ? "descending"
                    : "none"
                : "none"
            }
          >
            {column.header} {column.sortable && getSortIcon(column.key)}
            {TABLE_NAME_ACTIONS_AI.includes(tableName ?? "") &&
              TABLE_AI_COLS.includes(column.header) && (
                <>
                  <Button
                    variant="outline"
                    className={cn(
                      "ml-2",
                      aiStatus === "Success" ? "bg-green-500 text-white" : "",
                      aiStatus === "Failed" ? "bg-red-500 text-white" : "",
                      aiStatus === null || aiLoading ? "text-black" : ""
                    )}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAIgen();
                    }}
                    disabled={aiLoading}
                    aria-label="Generate AI Action"
                  >
                    {aiLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Gavel className="h-4 w-4" />
                    )}
                  </Button>
                  {isAIGenerated && (
                    <Button
                      variant="outline"
                      className={cn(
                        "ml-2",
                        saveStatus === "Success" ? "bg-green-500 text-white" : "",
                        saveStatus === "Failed" ? "bg-red-500 text-white" : "",
                        saveStatus === null || saveLoading ? "text-black" : ""
                      )}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAISave();
                      }}
                      disabled={saveLoading}
                      aria-label="Save AI Action"
                    >
                      {saveLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </>
              )}
          </TableHead>
        ))}
        {isAction && <TableHead>Action</TableHead>}
      </TableRow>
    </TableHeader>
  );
});

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
  rowColorFn,
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
          key={`${row?.job_id || row?.id}-${index}`}
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
                  column.align === "left"
                    ? "text-left"
                    : column.align === "center"
                      ? "text-center"
                      : column.align === "right"
                        ? "text-right"
                        : column.type === "number"
                          ? "text-center"
                          : "text-justify"
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
                  <Badge
                    className={`${column.badgeConfig.colorMap[value]} text-white p-1`}
                  >
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
                  <Button variant="ghost" size="sm" aria-label="Actions Menu">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" sideOffset={-15}>
                  {!TABLE_NAME_RESTRICTED_ACTIONS.includes(tableName ?? "") ? (
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

const TableFilters: React.FC<{
  columns: ColumnConfig[];
  data: any[];
  filters: { [key: string]: string };
  setFilters: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}> = React.memo(({ columns, data, filters, setFilters, setCurrentPage }) => {
  const handleFilter = useCallback(
    (key: string, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    [setFilters, setCurrentPage]
  );

  const filterableColumns = useMemo(
    () => columns.filter((col) => col.filterable),
    [columns]
  );

  if (!filterableColumns.length) return null;

  return (
    <>
      {filterableColumns.map((column) => {
        const uniqueValues = useMemo(
          () =>
            new Set(
              data
                .map((item) => item[column.key])
                .filter((value) => value !== undefined && value !== null)
            ),
          [data, column.key]
        );

        return (
          <DropdownMenu key={column.key}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" aria-label={`Filter by ${column.header}`}>
                <Filter className="mr-2 h-2 w-2" />
                {column.header} / {filters[column.key] || "All"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleFilter(column.key, "All")}>
                All
              </DropdownMenuItem>
              {Array.from(uniqueValues).map((value) => (
                <DropdownMenuItem
                  key={String(value)}
                  onClick={() => handleFilter(column.key, String(value))}
                >
                  {String(value)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </>
  );
});

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
  totalItems,
}) => {
  // Ensure we have valid numbers
  const validTotal = Math.max(1, totalPages);
  const validCurrent = getValidPageNumber(currentPage, validTotal);


  if (!showPagination) return null;

  const handlePageChange = (newPage: number) => {
    const validNewPage = getValidPageNumber(newPage, validTotal);
    if (validNewPage !== currentPage) {
      setCurrentPage(validNewPage);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value, 10);
    if (itemsPerPageOptions.includes(newItemsPerPage)) {
      setItemsPerPage(newItemsPerPage);
      setCurrentPage(1);
    } else {
      setItemsPerPage(itemsPerPageOptions[0]); // Reset to first option
      setCurrentPage(1);
    }
  };

  return (
    <div className="flex justify-between items-center mt-4">
      <div className="flex items-center space-x-2">
        <ArrowLeftCircle
          aria-label="Previous Page"
          className={cn(
            "text-gray-900",
            validCurrent <= 1
              ? "opacity-50 cursor-not-allowed"
              : "hover:text-gray-800 cursor-pointer"
          )}
          onClick={() => validCurrent > 1 && handlePageChange(validCurrent - 1)}
          aria-disabled={validCurrent <= 1}
          style={{ fontSize: "1.5rem" }}
        />
        <span>
          Page {validCurrent} of {validTotal} ({totalItems} items)
        </span>
        <ArrowRightCircle
          aria-label="Next Page"
          className={cn(
            "text-gray-900",
            validCurrent >= validTotal
              ? "opacity-50 cursor-not-allowed"
              : "hover:text-gray-800 cursor-pointer"
          )}
          onClick={() =>
            validCurrent < validTotal && handlePageChange(validCurrent + 1)
          }
          aria-disabled={validCurrent >= validTotal}
          style={{ fontSize: "1.5rem" }}
        />
      </div>
      <Select
        value={itemsPerPage.toString()}
        onValueChange={handleItemsPerPageChange}
        aria-label="Items Per Page"
      >
        <SelectTrigger className="w-[180px]" aria-label="Select items per page">
          <SelectValue placeholder={`${itemsPerPage} per page`} />
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
});

// FlexibleTable Component
export function FlexibleTable({
  data = [],
  columns,
  itemsPerPageOptions = [5, 15, 25],
  defaultItemsPerPage = 5,
  tableName = "",
  isSearch = true,
  isAction = true,
  createNewFn,
  handleAIgenFn,
  handleAIsaveFn,
  importSrcFn,
  clickXploreFn,
  actionFn,
  playRow = false,
  playRowFn,
  background = "gray",
  rowColorFn,
  isAIGenerated = false,
  aiLoading = false,
  saveLoading = false,
  aiStatus = "",
  saveStatus = "",
}: TableProps) {

  const initialItemsPerPage = itemsPerPageOptions.includes(defaultItemsPerPage)
    ? defaultItemsPerPage
    : itemsPerPageOptions[0];


  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: columns[0]?.key || "",
    direction: null,
  });
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (itemsPerPageOptions.includes(defaultItemsPerPage)) {
      setItemsPerPage(defaultItemsPerPage);
    } else {
      setItemsPerPage(itemsPerPageOptions[0]);
    }
    setCurrentPage(1);
  }, []);

  // Handle sorting
  const requestSort = useCallback((key: string) => {
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
  }, []);

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.filter((item) => {
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (value === "All") return true;
        return getSafeString(item[key]).toLowerCase() === value.toLowerCase();
      });

      const matchesSearch = isSearch
        ? searchTerm
          ? Object.values(item).some((val) =>
            getSafeString(val).toLowerCase().includes(searchTerm.toLowerCase())
          )
          : true
        : true;

      return matchesFilters && matchesSearch;
    });
  }, [data, filters, searchTerm, isSearch]);

  // Sorting the filtered data
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredData;

    const { key, direction } = sortConfig;
    const column = columns.find((col) => col.key === key);

    return [...filteredData].sort((a, b) => {
      try {
        let aValue = a[key];
        let bValue = b[key];
        let compare = 0;

        if (column?.type === "date") {
          const aDate = new Date(aValue).getTime();
          const bDate = new Date(bValue).getTime();
          if (isNaN(aDate) && isNaN(bDate)) compare = 0;
          else if (isNaN(aDate)) compare = 1;
          else if (isNaN(bDate)) compare = -1;
          else compare = aDate - bDate;
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          compare = aValue - bValue;
        } else {
          compare = getSafeString(aValue).localeCompare(getSafeString(bValue));
        }
        return direction === "asc" ? compare : -compare;
      } catch (error) {
        console.error("Sorting error:", error);
        return 0;
      }
    });
  }, [filteredData, sortConfig, columns]);

  // Calculate total pages and validate current page
  const validTotalPages = useMemo(
    () => Math.max(1, Math.ceil(sortedData.length / itemsPerPage)),
    [sortedData.length, itemsPerPage]
  );

  const validCurrentPage = useMemo(
    () => getValidPageNumber(currentPage, validTotalPages),
    [currentPage, validTotalPages]
  );

  // Update currentPage if it becomes invalid
  useEffect(() => {
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
    }
  }, [validCurrentPage, currentPage]);

  // Paginate the sorted data
  const paginatedData = useMemo(() => {
    if (!Array.isArray(sortedData)) return [];
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    return sortedData.slice(
      startIndex,
      Math.min(startIndex + itemsPerPage, sortedData.length)
    );
  }, [sortedData, validCurrentPage, itemsPerPage]);

  // Handlers
  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value || "");
    setCurrentPage(1);
  }, []);

  const handleCreateNew = useCallback(() => {
    if (createNewFn) createNewFn();
  }, [createNewFn]);

  const handleAIgen = useCallback(() => {
    if (handleAIgenFn) handleAIgenFn();
  }, [handleAIgenFn]);

  const handleAISave = useCallback(() => {
    if (handleAIsaveFn) handleAIsaveFn();
  }, [handleAIsaveFn]);

  const handleImportSRC = useCallback(() => {
    if (importSrcFn) importSrcFn();
  }, [importSrcFn]);

  const handleClickXplore = useCallback(() => {
    if (clickXploreFn) clickXploreFn();
  }, [clickXploreFn]);

  return (
    <div className="container mx-auto p-1">
      {/* Top Controls: Filters and Action Buttons */}
      <div className="flex justify-between items-center mb-4">
        <TableFilters
          columns={columns}
          data={data}
          filters={filters}
          setFilters={setFilters}
          setCurrentPage={setCurrentPage}
        />
        <div className="flex space-x-2">
          {isSearch && (
            <Input
              placeholder="Search"
              className="w-44"
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Search"
            />
          )}
          {tableName && EXTRA_BUTTON_TABLE.includes(tableName) && (
            <Button
              variant="default"
              className={cn(
                TABLE_NAME_CHECK_LIST.includes(tableName)
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : `${background} hover:${background} text-white`
              )}
              onClick={handleImportSRC}
              aria-label="Import Source"
            >
              Import Source
            </Button>
          )}
          {tableName && !TABLE_NAME_ACTIONS_AI.includes(tableName) && (
            <Button
              variant="default"
              className={cn(
                TABLE_NAME_CHECK_LIST.includes(tableName)
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : `${background} hover:${background} text-white`
              )}
              onClick={
                tableName === "Xplore" ? handleClickXplore : handleCreateNew
              } 
              aria-label={`Create New ${tableName}`}
            >
              {tableName} <PlusCircle className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <CustomTableHeader
            className="text-black"
            tableName={tableName}
            columns={columns}
            sortConfig={sortConfig}
            requestSort={requestSort}
            isAction={isAction}
            isAIGenerated={isAIGenerated}
            handleAIgen={handleAIgen}
            handleAISave={handleAISave}
            aiLoading={aiLoading}
            saveLoading={saveLoading}
            aiStatus={aiStatus}
            saveStatus={saveStatus}
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
      </div>

      {/* Pagination Controls */}
      <TablePaginationControls
        currentPage={validCurrentPage}
        totalPages={validTotalPages}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        itemsPerPageOptions={itemsPerPageOptions}
        showPagination={sortedData.length > itemsPerPage}
        totalItems={sortedData.length}
      />
    </div>
  );
}
