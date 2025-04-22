import React from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HiOutlinePlay } from 'react-icons/hi';
import { MdOutlineStop, MdOutlineSkipNext } from 'react-icons/md';

const PipelineControls: React.FC<any> = ({
    handleRunClick,
    handleStop,
    handleNext,
    isPipelineRunning
}: any) => {
    return (
        <div className="flex items-center space-x-1 rounded-md border p-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        onClick={isPipelineRunning ? handleStop : handleRunClick}
                        variant="ghost"
                        size="sm"
                        aria-label={isPipelineRunning ? "Stop Pipeline" : "Run Pipeline"}
                        className="px-2.5"
                    >
                        {isPipelineRunning ? (
                            <MdOutlineStop className="h-4 w-4 text-red-500" />
                        ) : (
                            <HiOutlinePlay className="h-4 w-4 text-green-500" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{isPipelineRunning ? "Stop Pipeline" : "Run Pipeline"}</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        onClick={handleNext}
                        variant="ghost"
                        size="sm"
                        disabled={!isPipelineRunning}
                        aria-label="Next Step"
                        className="px-2.5"
                    >
                        <MdOutlineSkipNext className={`h-4 w-4 ${isPipelineRunning ? "text-blue-500" : "text-gray-400"}`} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Next Step</p>
                </TooltipContent>
            </Tooltip>
        </div>
    );
};

export default PipelineControls;