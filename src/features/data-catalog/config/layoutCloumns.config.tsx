import { createRef } from 'react';
import type { ColumnDefWithFilters } from "@/types/table"; 
import { LayoutField } from "@/types/data-catalog/dataCatalog";
import { Gavel } from "lucide-react";
import { toast } from "sonner";
import { DescriptionCell, DescriptionCellRef } from "../components/DescriptionCell";
import { TagCell } from "../components/TagCell";

// Keep track of all description cell refs and their corresponding row data
export interface CellRefData {
  ref: React.RefObject<DescriptionCellRef>;
  rowData: LayoutField;
}

export const descriptionCellRefs = new Map<string | number, CellRefData>();

// Function to create columns with generate descriptions handler
export const createColumns = (generateDescriptions?: () => Promise<void>): ColumnDefWithFilters<LayoutField>[] => [
  {
    id: 'lyt_fld_name',
    accessorKey: 'lyt_fld_name',
    header: 'Name',
    enableColumnFilter: false,
  },
  {
    id: 'lyt_fld_desc',
    accessorKey: 'lyt_fld_desc',
    header: 'Description',
    enableColumnFilter: false,
    cell: ({ getValue, row }) => {
      const fieldId = row.original.lyt_fld_id;
      const rowData = row.original;
      
      // Create or get existing ref for this cell
      if (!descriptionCellRefs.has(fieldId)) {
        descriptionCellRefs.set(fieldId, {
          ref: createRef<DescriptionCellRef>(),
          rowData
        });
      } else {
        // Update row data in case it changed
        const existingData = descriptionCellRefs.get(fieldId)!;
        existingData.rowData = rowData;
      }
      
      const ref = descriptionCellRefs.get(fieldId)!.ref;
      
      return (
        <DescriptionCell 
          ref={ref}
          value={getValue() as string | undefined}
          fieldId={fieldId}
        />
      );
    },
    ...(generateDescriptions && {
      headerButton: {
        icon: Gavel,
        onClick: async () => {
          await generateDescriptions();
        },
        tooltip: "Generate descriptions for all fields using AI",
      }
    })
  },
  {
    id: 'lyt_fld_tags',
    accessorKey: 'lyt_fld_tags',
    header: 'Tags',
    cell: ({ getValue, row, table }) => {
      const tags = getValue() as Record<string, string> || {};
      
      const handleAddTag = (key: string, value: string) => {
        const newTags = { ...tags, [key]: value };
        // Here you would typically update the data in your table/backend
        toast.success(`Added tag ${key}: ${value}`);
      };

      const handleRemoveTag = (key: string) => {
        const { [key]: removed, ...newTags } = tags;
        // Here you would typically update the data in your table/backend
        toast.success(`Removed tag ${key}`);
      };

      return (
        <TagCell
          tags={tags}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
        />
      );
    },
    enableColumnFilter: false,
  },
];

// Default columns with no description generation
export const columns = createColumns();