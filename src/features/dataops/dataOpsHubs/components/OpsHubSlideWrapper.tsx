import { DataOpsHub } from '@/types/dataops/dataOpsHub';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { DataOpsHubSchema } from './DataOpsHubSchema';

interface OpsHubSlideWrapperProps {
    isSheetOpen: boolean;
    setIsSheetOpen: (open: boolean) => void;
    selectedRow?: DataOpsHub;
}

export const OpsHubSlideWrapper = ({
    isSheetOpen,
    setIsSheetOpen,
    selectedRow,
}: OpsHubSlideWrapperProps) => {
    return (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent 
        side="right" 
        className="!w-[65vw]"
      >
        <SheetHeader>
          <SheetTitle>{selectedRow?.flow_name}</SheetTitle>
        </SheetHeader>
         <DataOpsHubSchema jobId={selectedRow?.job_id} />
      </SheetContent>
    </Sheet>
    );
}
