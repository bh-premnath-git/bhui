import { FC } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { DataCatalogSchema } from './DataCatalogSchema';
import { DataSource } from '@/types/data-catalog/dataCatalog';

interface CatalagSlideWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRow: DataSource | null;
}

export const CatalagSlideWrapper: FC<CatalagSlideWrapperProps> = ({
  open,
  onOpenChange,
  selectedRow,
}) => {
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full max-w-[70vw] overflow-auto p-6"
        aria-describedby="data-catalog-description"
      >
        <SheetHeader>
          <SheetTitle>{selectedRow?.data_src_name}</SheetTitle>
          <SheetDescription id="data-catalog-description">
            Detailed view of the data catalog source.
          </SheetDescription>
        </SheetHeader>
        <div className="w-full">
          <DataCatalogSchema 
            dataSourceId={selectedRow?.data_src_id}
            selectedSource={selectedRow} 
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};