import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { X, Play, MoreVertical } from 'lucide-react';
import DataLogsDrawer from "./DataLogsDrawer";
import { logData } from "./DataOpsColumn";

export default function ShowingLogs({ selectedRowData }) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [drawerHeight, setDrawerHeight] = React.useState('95%');
    const [selectedTab, setSelectedTab] = React.useState(0);
    const [isFullScreen, setIsFullScreen] = React.useState(false);

    const toggleDrawer = (newState) => () => {
        setOpen(newState);
    };

    const expandDrawer = () => {
        setIsFullScreen((prevState) => !prevState);
    };

    const handleClick = () => {
        toggleDrawer(true);
        setIsExpanded(!isExpanded);
    };

    return (
        <>
            <div className="flex justify-between items-center my-4">
                <Label className="text-md">Showing logs from <span className="font-bold">last hour</span> ending at <span className="font-bold">13:41</span></Label>
                <div className="flex items-center gap-3">
                    <Input placeholder="Search logs" className="w-44" />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <img src="/assets/dataops/Download.svg" alt="download" className="w-8 h-8" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>CSV</DropdownMenuItem>
                            <DropdownMenuItem>Excel</DropdownMenuItem>
                            <DropdownMenuItem>Json</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" size="icon" onClick={handleClick}>
                        <img src="/assets/dataops/maximise.svg" alt="expand" className="w-8 h-8" />
                    </Button>
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
            
            <DataLogsDrawer
                selectedRowData={selectedRowData}
                isExpanded={isExpanded}
                toggleDrawer={toggleDrawer}
                expandDrawer={expandDrawer}
                drawerHeight={drawerHeight}
                selectedTab={selectedTab}
                isFullScreen={isFullScreen} />
        </>
    );
}

export const LogItem = ({ date, label, description, isEven }) => (
    <div className={`flex justify-between items-center p-2 rounded-sm ${isEven ? '' : 'bg-gray-200'}`}>
        <div className="flex items-center gap-3">
            <Play className="h-5 w-5" />
            <Label>{date}</Label>
            <Label>{label}</Label>
            <Label>{description}</Label>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Download Log</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
);
