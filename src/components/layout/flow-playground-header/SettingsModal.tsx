import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export const SettingsModal = () => {
    return (
        <Dialog>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 p-2 hover:bg-gray-100 rounded-full"
                            >
                                <Settings className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Flow Settings</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Flow Settings</DialogTitle>
                    <DialogDescription>
                        Configure your flow settings and preferences.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Add your settings form or content here */}
                    <p className="text-sm text-muted-foreground">
                        Settings content coming soon...
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};