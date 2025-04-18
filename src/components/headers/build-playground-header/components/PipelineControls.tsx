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
                        onClick={handleRunClick}
                        variant="ghost"
                        size="sm"
                        disabled={isPipelineRunning}
                        aria-label="Run Pipeline"
                        className="px-2.5"
                    >
                        <HiOutlinePlay className={`h-4 w-4 ${!isPipelineRunning ? "text-green-500" : "text-gray-400"}`} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Run Pipeline</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        onClick={handleStop}
                        variant="ghost"
                        size="sm"
                        disabled={!isPipelineRunning}
                        aria-label="Stop Pipeline"
                        className="px-2.5"
                    >
                        <MdOutlineStop className={`h-4 w-4 ${isPipelineRunning ? "text-red-500" : "text-gray-400"}`} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Stop Pipeline</p>
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