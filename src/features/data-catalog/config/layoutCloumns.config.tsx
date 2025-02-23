import { createRef } from 'react';
import type { ColumnDefWithFilters } from "@/types/table"; 
import { LayoutField } from "@/types/data-catalog/dataCatalog";
import { Gavel } from "lucide-react";
import { toast } from "sonner";
import { DescriptionCell, DescriptionCellRef } from "../components/DescriptionCell";
import { TagCell } from "../components/TagCell";

// Keep track of all description cell refs
const descriptionCellRefs = new Map<string | number, React.RefObject<DescriptionCellRef>>();

export const columns: ColumnDefWithFilters<LayoutField>[] = [
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
      // Create or get existing ref for this cell
      if (!descriptionCellRefs.has(fieldId)) {
        descriptionCellRefs.set(fieldId, createRef<DescriptionCellRef>());
      }
      const ref = descriptionCellRefs.get(fieldId)!;
      
      return (
        <DescriptionCell 
          ref={ref}
          value={getValue() as string | undefined}
          fieldId={fieldId}
        />
      );
    },
    headerButton: {
      icon: Gavel,
      onClick: async () => {
        toast.info("Generating descriptions for all fields...");
        // Generate descriptions for all cells
        for (const ref of descriptionCellRefs.values()) {
          if (ref.current) {
            await ref.current.generateDescription();
          }
        }
        toast.success("All descriptions generated successfully");
      },
      tooltip: "Generate descriptions for all fields using AI",
    },
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