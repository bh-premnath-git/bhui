import { useFlow } from '@/context/designers/FlowContext';
import { Button } from '@/components/ui/button';
import { CloudSun, Cloud, CloudOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export const AutoSaveButton = () => {
    const { autoSave, isSaved, isSaving, toggleAutoSave } = useFlow();

    const renderIcon = () => {
        if (isSaving) return <CloudSun className="h-5 w-5 animate-spin" />;
        if (autoSave) return <Cloud className="h-5 w-5" />;
        return <CloudOff className="h-5 w-5" />;
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "relative",
                            autoSave && "text-primary",
                            !isSaved && !isSaving && "animate-pulse text-yellow-500"
                        )}
                        onClick={toggleAutoSave}
                    >
                        {renderIcon()}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{autoSave ? 'Disable' : 'Enable'} Auto Save</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
