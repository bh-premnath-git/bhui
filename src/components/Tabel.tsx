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
import { PlusCircle, Filter, ChevronUp, ChevronDown, MoreVertical } from "lucide-react";
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
import { cn } from "@/lib/utils"


interface ColumnConfig {
  key: string;
  header: string;
  render?: (value: any,row:any) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  type?: "text" | "number" | "date" | "image" | "badge";
  badgeConfig?: {
    colorMap: { [key: string]: string };
  };
}

interface TableProps {
  data: any[];
  columns: ColumnConfig[];
  itemsPerPageOptions?: number[];
  defaultItemsPerPage?: number;
  tableName?: string;
  createNewFn?: () => void;
  actionFn?: (rowData: any, action: string) => void;
  playRow?: boolean;
  playRowFn?: (rowData: any) => void;
  background?:string
}

type SortConfig = {
  key: string;
  direction: "asc" | "desc" | null;
};

const CustomTableHeader: React.FC<{
  columns: ColumnConfig[];
  sortConfig: SortConfig;
  requestSort: (key: string) => void;
  className?: string;
}> = React.memo(({ columns, sortConfig, requestSort, className }) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc")
        return <ChevronUp className="inline ml-1 h-4 w-4" />;
      if (sortConfig.direction === "desc")
        return <ChevronDown className="inline ml-1 h-4 w-4" />;
    }
    return null;
  };

  return (
    <TableHeader className={cn("bg-gray-200 text-black font-bold",className)}>
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
        <TableHead>Action</TableHead>
      </TableRow>
    </TableHeader>
  );
});

const TableBodyComponent: React.FC<{
  data: any[];
  columns: ColumnConfig[];
  actionFn?: (rowData: any, action: string) => void;
  playRow?: boolean;
  playRowFn?: (rowData: any) => void;
}> = React.memo(({ data, columns, actionFn, playRow, playRowFn }) => (
  <TableBody>
    {data.map((row, index) => (
      <TableRow 
      key={index}
        onClick={
          playRow && playRowFn
            ? () => playRowFn(row)
            : undefined
        }
        className={playRow ? "cursor-pointer border-none" : "border-none"}
      >
        {columns.map((column) => (
          <TableCell key={column.key} className="text-justify">
            {column.render
              ? column.render(row[column.key],row)
              : column.type === "image"
                ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={row[column.key]} alt={row[column.key]} />
                    <AvatarFallback>
                      {row[column.key]
                        ? row[column.key][0]
                        : <PlusCircle className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                )
                : column.type === "badge" && column.badgeConfig
                  ? (
                    <Badge
                      className={`${column.badgeConfig.colorMap[row[column.key]]} text-white`}
                    >
                      {row[column.key]}
                    </Badge>
                  )
                  : row[column.key]}
          </TableCell>
        ))}
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" sideOffset={-15}>
              <DropdownMenuItem
                onClick={() => actionFn && actionFn(row, "edit")}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actionFn && actionFn(row, "changeStatus")}
              >
                Change Status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
));

export function FlexibleTable({
  data,
  columns,
  itemsPerPageOptions = [5, 15, 25],
  defaultItemsPerPage = 5,
  tableName = "",
  createNewFn,
  actionFn,
  playRow = false,
  playRowFn,
  background='gray',
}: TableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: columns[0].key,
    direction: null,
  });
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedAndFilteredData = useMemo(() => {
    return data
      .filter((item) =>
        Object.entries(filters).every(
          ([key, value]) =>
            value === "All" || item[key]?.toString() === value
        )
      )
      .filter((item) =>
        Object.values(item).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      .sort((a, b) => {
        if (!sortConfig.direction) return 0;

        const column = columns.find((col) => col.key === sortConfig.key);
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        let compare = 0;

        if (column?.type === "date") {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
          compare = aValue - bValue;
        } else if (
          typeof aValue === "number" &&
          typeof bValue === "number"
        ) {
          compare = aValue - bValue;
        } else {
          compare = aValue.toString().localeCompare(bValue.toString());
        }

        return sortConfig.direction === "asc" ? compare : -compare;
      });
  }, [data, sortConfig, filters, searchTerm, columns]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAndFilteredData.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [sortedAndFilteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedAndFilteredData.length / itemsPerPage);

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

  const handleFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  function functionCreation() {
    if (createNewFn) {
      createNewFn();
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        {columns.filter((col) => col.filterable).map((column) => (
          <DropdownMenu key={column.key}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> {column.header} /{" "}
                {filters[column.key] || "All"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => handleFilter(column.key, "All")}
              >
                All
              </DropdownMenuItem>
              {Array.from(
                new Set(
                  data
                    .map((item) => item[column.key])
                    .filter((value) => value !== undefined)
                )
              ).map((value) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => handleFilter(column.key, value)}
                >
                  {value}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
        <div className="flex space-x-2">
          <Input
            placeholder="Search"
            className="w-44"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="default" className={`${background} hover:${background} " text-white "`} onClick={() => {
            functionCreation();
          }}>
         {tableName} <PlusCircle className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      <Table>
        <CustomTableHeader
        className="text-black"
          columns={columns}
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
        <TableBodyComponent data={paginatedData} columns={columns} actionFn={actionFn} playRow={playRow} playRowFn={playRowFn}
        />
      </Table>
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          <Button
            className="bg-gray-900 text-white hover:bg-gray-800"
            onClick={() =>
              setCurrentPage((prev) => Math.max(prev - 1, 1))
            }
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            className="bg-gray-900 text-white hover:bg-gray-800"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
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
    </div>
  );
}