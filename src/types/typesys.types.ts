import { ColumnDef } from "@tanstack/react-table";

export type ColumnDefWithFilters<T> = ColumnDef<T> & {
    filterOptions?: {
      label: string;
      value: string;
    }[];
  };
  