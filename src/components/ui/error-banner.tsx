import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';

interface ErrorBannerProps {
    title: string;
    description: string;
    onClose: () => void;
    className?: string;
    autoClose?: boolean;
    autoCloseDuration?: number;
    onShowLogs?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
    title,
    description,
    onClose,
    className = '',
    autoClose = false,
    autoCloseDuration = 15000,
    onShowLogs
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    
    const isLongMessage = description.length > 200;

    // Auto-close functionality
    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseDuration);
            
            return () => clearTimeout(timer);
        }
    }, [autoClose, autoCloseDuration, onClose]);
    const truncatedDescription = isLongMessage ? description.substring(0, 200) + '...' : description;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(description);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <Card className={`border-red-200 bg-red-50 shadow-lg w-full max-w-full mx-auto ${className}`} role="alert" aria-live="polite">
            <div className="p-3 sm:p-4">
                <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-4">
                    <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0 w-full sm:w-auto">
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xs sm:text-sm font-medium text-red-800 mb-1 break-words">
                                {title}
                            </h3>
                            <div className="text-xs sm:text-sm text-red-700">
                                <pre className="whitespace-pre-wrap font-mono text-xs break-words overflow-hidden">
                                    {isExpanded ? description : truncatedDescription}
                                </pre>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 w-full sm:w-auto order-2 sm:order-none justify-end sm:justify-start">
                        {onShowLogs && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onShowLogs}
                                className="h-7 sm:h-8 px-1 sm:px-2 text-xs sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-100 hidden sm:inline-flex"
                            >
                                View Logs
                            </Button>
                        )}
                        
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopy}
                            className="h-7 sm:h-8 px-1 sm:px-2 text-red-600 hover:text-red-700 hover:bg-red-100"
                            title="Copy error message"
                        >
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline ml-1">{copySuccess ? 'Copied!' : 'Copy'}</span>
                        </Button>
                        
                        {isLongMessage && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="h-7 sm:h-8 px-1 sm:px-2 text-red-600 hover:text-red-700 hover:bg-red-100"
                                title={isExpanded ? "Show less" : "Show more"}
                            >
                                {isExpanded ? (
                                    <>
                                        <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="hidden sm:inline ml-1">Less</span>
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="hidden sm:inline ml-1">More</span>
                                    </>
                                )}
                            </Button>
                        )}
                        
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                            title="Close error banner"
                        >
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};