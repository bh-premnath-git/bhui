import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { logData } from "./DataOpsColumn";
import { LogItem } from "./ShowingLogs";

const DataLogsDrawer = ({
    isExpanded,
    toggleDrawer,
    handleClick,
    drawerHeight,
    selectedTab,
    handleTabChange,
    isFullScreen,
    selectedRowData
}: any) => {
    return (
        <Drawer open={isExpanded} onOpenChange={toggleDrawer(false)}>
            <DrawerContent className="p-4" style={{ height: drawerHeight, transition: 'height 0.3s ease' }}>
                <div className="flex justify-between items-center mb-4">
                    <Label>
                        Job Name: <span className="font-bold">{selectedRowData?.pipeline_name}</span>
                    </Label>
                    <div className='flex items-center gap-3'>
                        <Input placeholder="Search logs" className="w-48" />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <img src="/assets/dataops/Download.svg" alt="download" className="w-8 h-8" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>CSV</DropdownMenuItem>
                                <DropdownMenuItem>Excel</DropdownMenuItem>
                                <DropdownMenuItem>Json</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <img onClick={handleClick} src="/assets/dataops/minimise.svg" alt="minimise" className="w-8 h-8" />
                    </div>
                </div>
                {logData.map((log, index) => (
                    <LogItem
                        key={index}
                        date={log.date}
                        label={log.label}
                        description={log.description}
                        isEven={index % 2 === 0}
                    />
                ))}
            </DrawerContent>
        </Drawer>
    );
};

export default DataLogsDrawer;