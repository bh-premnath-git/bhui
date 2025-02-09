import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { IoClose } from "react-icons/io5";
import ExportPlayGround from "./ExportPlayGround";

const ExploreDrawer = ({ isExpanded, toggleDrawer, handleClick }: any) => {
  return (
    <Sheet open={isExpanded} onOpenChange={toggleDrawer}>
      <SheetContent side="right" className="w-[90%] h-screen p-4">
        <SheetTrigger asChild>
          <div
            onClick={handleClick}
            className="absolute top-2 left-[8.5%] w-8 h-8 flex items-center justify-center bg-white rounded-sm cursor-pointer shadow-md"
          >
            <IoClose className="text-black text-xl" />
          </div>
        </SheetTrigger>
        <ExportPlayGround />
      </SheetContent>
    </Sheet>
  );
};

export default ExploreDrawer;
