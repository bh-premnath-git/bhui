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
        <Card className={`border-red-200 bg-red-50 shadow-lg mt-14 ml-12 ${className}`} role="alert" aria-live="polite">
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-red-800 mb-1">
                                {title}
                            </h3>
                            <div className="text-sm text-red-700">
                                <pre className="whitespace-pre-wrap font-mono text-xs">
                                    {isExpanded ? description : truncatedDescription}
                                </pre>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                        {onShowLogs && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onShowLogs}
                                className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-100"
                            >
                                View Logs
                            </Button>
                        )}
                        
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopy}
                            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-100"
                        >
                            <Copy className="h-4 w-4" />
                            {copySuccess ? 'Copied!' : 'Copy'}
                        </Button>
                        
                        {isLongMessage && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-100"
                            >
                                {isExpanded ? (
                                    <>
                                        <ChevronUp className="h-4 w-4" />
                                        Less
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-4 w-4" />
                                        More
                                    </>
                                )}
                            </Button>
                        )}
                        
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};