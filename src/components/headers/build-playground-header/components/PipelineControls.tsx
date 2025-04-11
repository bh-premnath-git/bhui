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
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        onClick={handleRunClick}
                        variant="default"
                        size="icon"
                        disabled={isPipelineRunning}
                        aria-label="Run Pipeline"
                    >
                        <HiOutlinePlay className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Run Pipeline</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        className={`border ${isPipelineRunning ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-50'}`}
                        onClick={handleStop}
                        variant="ghost"
                        size="icon"
                        disabled={!isPipelineRunning}
                        aria-label="Stop Pipeline"
                    >
                        <MdOutlineStop className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Stop Pipeline</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        className={`border ${isPipelineRunning ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-gray-50'}`}

                        onClick={handleNext}
                        variant="ghost"
                        size="icon"
                        disabled={!isPipelineRunning}
                        aria-label="Next Step"
                    >
                        <MdOutlineSkipNext className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Next Step</p>
                </TooltipContent>
            </Tooltip>
        </>
    );
};

export default PipelineControls;