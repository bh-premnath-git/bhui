import React from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HiOutlinePlay } from 'react-icons/hi';
import { MdOutlineStop, MdOutlineSkipNext, MdError, MdWarning, MdCheckCircle } from 'react-icons/md';
import { cn } from '@/lib/utils';

export interface ValidationIssue {
    message: string;
    nodeId?: string;
    nodeName?: string;
    type?: string;
    severity: 'error' | 'warning' | 'info';
    suggestion?: string;
}

interface PipelineControlsProps {
    handleRunClick: () => void;
    handleStop: () => void;
    handleNext: () => void;
    isPipelineRunning: boolean;
    isValid?: boolean;
    validationErrors?: string[] | ValidationIssue[];
    validationWarnings?: string[] | ValidationIssue[];
}

// Terminal-style validation display component
const TerminalValidationItem: React.FC<{ issue: ValidationIssue; index: number }> = ({ issue, index }) => {
    const getIcon = () => {
        switch (issue.severity) {
            case 'error':
                return <MdError className="h-3 w-3 text-red-400 flex-shrink-0 mt-0.5" />;
            case 'warning':
                return <MdWarning className="h-3 w-3 text-yellow-400 flex-shrink-0 mt-0.5" />;
            case 'info':
                return <MdCheckCircle className="h-3 w-3 text-blue-400 flex-shrink-0 mt-0.5" />;
            default:
                return <MdError className="h-3 w-3 text-red-400 flex-shrink-0 mt-0.5" />;
        }
    };

    const getTypeColor = () => {
        switch (issue.severity) {
            case 'error':
                return 'text-red-300';
            case 'warning':
                return 'text-yellow-300';
            case 'info':
                return 'text-blue-300';
            default:
                return 'text-red-300';
        }
    };

    return (
        <div className="mb-2 last:mb-0">
            <div className="flex items-start gap-2 font-mono text-xs">
                {getIcon()}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={cn("font-medium", getTypeColor())}>
                            {issue.severity.toUpperCase()}
                        </span>
                        {issue.nodeName && (
                            <span className="text-gray-400 px-1.5 py-0.5 bg-gray-800 rounded text-xs">
                                {issue.nodeName}
                            </span>
                        )}
                        {issue.type && (
                            <span className="text-gray-500 text-xs">
                                [{issue.type}]
                            </span>
                        )}
                    </div>
                    <div className="text-gray-200 leading-tight mb-1">
                        {issue.message}
                    </div>
                    {issue.suggestion && (
                        <div className="text-gray-400 text-xs italic leading-tight">
                            💡 {issue.suggestion}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const PipelineControls: React.FC<PipelineControlsProps> = ({
    handleRunClick,
    handleStop,
    handleNext,
    isPipelineRunning,
    isValid = true,
    validationErrors = [],
    validationWarnings = []
}) => {
    // Determine if the run button should be disabled
    const isRunDisabled = !isPipelineRunning && (!isValid || validationErrors.length > 0);
    
    // Helper function to normalize validation issues
    const normalizeValidationIssues = (issues: string[] | ValidationIssue[], severity: 'error' | 'warning'): ValidationIssue[] => {
        return issues.map((issue, index) => {
            if (typeof issue === 'string') {
                // Try to extract node information from string patterns
                const nodeMatch = issue.match(/(?:node|Node)\s*["']([^"']+)["']|["']([^"']+)["']\s*(?:node|Node)/i);
                const nodeName = nodeMatch ? (nodeMatch[1] || nodeMatch[2]) : undefined;
                
                // Generate suggestions based on common error patterns
                let suggestion = undefined;
                if (issue.toLowerCase().includes('no input')) {
                    suggestion = "Connect an input node to this transformation";
                } else if (issue.toLowerCase().includes('no output')) {
                    suggestion = "Connect this node to a target or another transformation";
                } else if (issue.toLowerCase().includes('reader')) {
                    suggestion = "Add a Reader node to start the pipeline";
                } else if (issue.toLowerCase().includes('target')) {
                    suggestion = "Add a Target node to complete the pipeline";
                }

                return {
                    message: issue,
                    severity,
                    nodeName,
                    type: severity === 'error' ? 'CONNECTION' : 'VALIDATION',
                    suggestion
                };
            }
            return issue;
        });
    };

    // Generate tooltip content based on validation state
    const getRunTooltipContent = () => {
        if (isPipelineRunning) {
            return "Stop Pipeline";
        }

        const errors = normalizeValidationIssues(validationErrors, 'error');
        const warnings = normalizeValidationIssues(validationWarnings, 'warning');
        const hasIssues = errors.length > 0 || warnings.length > 0;

        if (!hasIssues && isValid) {
            return (
                <div className="flex items-center gap-2 text-green-400 font-mono text-sm">
                    <MdCheckCircle className="h-4 w-4" />
                    Ready to run
                </div>
            );
        }

        if (!isValid || errors.length > 0) {
            return (
                <div className="max-w-md bg-gray-900 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
                        <MdError className="h-4 w-4 text-red-400" />
                        <span className="font-mono text-sm text-red-400 font-medium">
                            PIPELINE BLOCKED
                        </span>
                        <span className="text-gray-500 text-xs bg-gray-800 px-2 py-1 rounded">
                            {errors.length} error{errors.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {errors.slice(0, 4).map((error, index) => (
                            <TerminalValidationItem key={index} issue={error} index={index} />
                        ))}
                        {errors.length > 4 && (
                            <div className="text-gray-500 text-xs font-mono text-center py-2 border-t border-gray-800">
                                ... and {errors.length - 4} more error{errors.length - 4 !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (warnings.length > 0) {
            return (
                <div className="max-w-md bg-gray-900 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
                        <MdWarning className="h-4 w-4 text-yellow-400" />
                        <span className="font-mono text-sm text-yellow-400 font-medium">
                            PIPELINE WARNINGS
                        </span>
                        <span className="text-gray-500 text-xs bg-gray-800 px-2 py-1 rounded">
                            {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {warnings.slice(0, 3).map((warning, index) => (
                            <TerminalValidationItem key={index} issue={warning} index={index} />
                        ))}
                        {warnings.length > 3 && (
                            <div className="text-gray-500 text-xs font-mono text-center py-2 border-t border-gray-800">
                                ... and {warnings.length - 3} more warning{warnings.length - 3 !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-800">
                        <div className="text-gray-400 text-xs font-mono">
                            ⚠️ Pipeline can run but may have issues
                        </div>
                    </div>
                </div>
            );
        }

        return "Run Pipeline";
    };

    return (
        <div className="flex items-center space-x-1 rounded-md border p-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        onClick={isPipelineRunning ? handleStop : handleRunClick}
                        variant="ghost"
                        size="sm"
                        disabled={isRunDisabled}
                        aria-label={isPipelineRunning ? "Stop Pipeline" : "Run Pipeline"}
                        className="px-2.5"
                    >
                        {isPipelineRunning ? (
                            <MdOutlineStop className="h-4 w-4 text-red-500" />
                        ) : (
                            <HiOutlinePlay className={`h-4 w-4 ${
                                isRunDisabled 
                                    ? "text-gray-400" 
                                    : validationWarnings.length > 0 
                                        ? "text-yellow-500" 
                                        : "text-green-500"
                            }`} />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="p-0 border-0 bg-transparent shadow-lg">
                    {getRunTooltipContent()}
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
                    <p>{isPipelineRunning ? "Next Step" : "Pipeline must be running to use Next Step"}</p>
                </TooltipContent>
            </Tooltip>
        </div>
    );
};

export default PipelineControls;