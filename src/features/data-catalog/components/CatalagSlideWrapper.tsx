import { DataSource } from '@/types/data-catalog/dataCatalog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { DataCatalogSchema } from './DataCatalogSchema';

interface CatalagSlideWrapperProps {
  isSheetOpen: boolean;
  setIsSheetOpen: (open: boolean) => void;
  selectedRow?: DataSource;
}

export function CatalagSlideWrapper({
  isSheetOpen,
  setIsSheetOpen,
  selectedRow,
}: CatalagSlideWrapperProps) {
  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent 
        side="right" 
        className="!w-[65vw]"
      >
        <SheetHeader>
          <SheetTitle>{selectedRow?.data_src_name}</SheetTitle>
        </SheetHeader>
        <DataCatalogSchema />
      </SheetContent>
    </Sheet>
  );
}