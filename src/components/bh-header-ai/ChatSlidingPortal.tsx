import { Sheet, SheetContent } from "@/components/ui/sheet";

export const ChatSlidingPortal = ({ isOpen, onClose, imageSrc }: { isOpen: boolean; onClose: () => void; imageSrc: string }) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] p-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold">AI Chat</h2>
        </div>
        <div className="mt-4 flex flex-col items-center">
          <img src={imageSrc} alt="AI" className="w-16 h-16" />
          <p className="text-sm text-gray-600 mt-2">How can I assist you today?</p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
