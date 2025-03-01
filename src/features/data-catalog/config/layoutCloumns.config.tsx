import { createRef } from 'react';
import type { ColumnDefWithFilters } from "@/types/table"; 
import { LayoutField, LayoutFieldTags } from "@/types/data-catalog/dataCatalog";
import { Gavel } from "lucide-react";
import { toast } from "sonner";
import { DescriptionCell, DescriptionCellRef } from "../components/DescriptionCell";
import { TagCell, TagCellRef } from "../components/TagCell";
import { Button } from "@/components/ui/button";

// Keep track of all description cell refs and their corresponding row data
export interface CellRefData {
  ref: React.RefObject<DescriptionCellRef>;
  rowData: LayoutField;
}

export const descriptionCellRefs = new Map<string | number, CellRefData>();

// Keep track of all tag cell refs
export interface TagCellRefData {
  ref: React.RefObject<TagCellRef>;
  rowData: LayoutField;
}

export const tagCellRefs = new Map<string | number, TagCellRefData>();

export const createColumns = (
  generateDescriptions?: () => Promise<void>,
  updateFieldTags?: (fieldId: number, key: string, value: string) => void,
  removeFieldTags?: (fieldId: number, key: string) => void,
  handleDataUpdate?: (rowId: number, columnId: string, value: any) => void
): ColumnDefWithFilters<LayoutField>[] => [
  {
    id: 'lyt_fld_name',
    accessorKey: 'lyt_fld_name',
    header: 'Name',
    enableColumnFilter: false,
  },
  {
    id: 'lyt_fld_desc',
    accessorKey: 'lyt_fld_desc',
    header: () => (
      <div className="flex items-center justify-between">
        <span>Description</span>
        {generateDescriptions && (
          <Button
            variant="ghost"
            size="sm"
            onClick={generateDescriptions}
            className="h-6 w-6 p-0"
            title="Generate descriptions for all fields"
          >
            <Gavel className="h-4 w-4" />
          </Button>
        )}
      </div>
    ),
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
    enableColumnFilter: false,
  },
  {
    id: 'lyt_fld_tags',
    accessorKey: 'lyt_fld_tags',
    header: 'Tags',
    cell: ({ getValue, row }) => {
      const fieldId = row.original.lyt_fld_id;
      const tags = getValue() as LayoutFieldTags | undefined;
      const rowData = row.original;
      
      // Create or get existing ref for this cell
      if (!tagCellRefs.has(fieldId)) {
        tagCellRefs.set(fieldId, {
          ref: createRef<TagCellRef>(),
          rowData
        });
      } else {
        // Update row data in case it changed
        const existingData = tagCellRefs.get(fieldId)!;
        existingData.rowData = rowData;
      }
      
      const ref = tagCellRefs.get(fieldId)!.ref;
      
      return (
        <TagCell
          ref={ref}
          tags={tags}
          fieldId={fieldId}
        />
      );
    },
    enableColumnFilter: false,
  },
];

// Default columns with no description generation
export const columns = createColumns();