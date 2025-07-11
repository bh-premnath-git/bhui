import React from 'react';
import { HiChartBar } from "react-icons/hi";
import { Loader } from 'lucide-react';

interface RowCountBadgeProps {
    rowCount: any;
    isLoading?: boolean;
    onMetricsClick?: (e: React.MouseEvent) => void;
    className?: string;
}

export const RowCountBadge: React.FC<RowCountBadgeProps> = ({
    rowCount,
    isLoading = false,
    onMetricsClick,
    className = ""
}) => {
    if (!rowCount) {
        return null;
    }

    const isRelativePositioning = className?.includes('relative');
    const baseClasses = "bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-sm rounded px-2 py-1 flex items-center justify-center shadow-lg border border-blue-200/50 cursor-pointer hover:from-blue-100 hover:to-indigo-100 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105";
    const positionClasses = isRelativePositioning ? "" : "absolute -top-0 -right-0";
    
    const handleClick = (e: React.MouseEvent) => {
        console.log('RowCountBadge clicked');
        e.stopPropagation();
        e.preventDefault();
        
        if (onMetricsClick) {
            console.log('Calling onMetricsClick');
            setTimeout(() => {
                onMetricsClick(e);
            }, 0);
        } else {
            console.log('No onMetricsClick handler provided');
        }
    };
    
    return (
        <div 
            className={`${baseClasses} ${positionClasses} ${className} z-10`}
            style={{ zIndex: 10 }}
            onClick={handleClick}
            title="View Data in Bottom Drawer"
        >
            <div className="flex items-center gap-1.5">
                {isLoading ? (
                    <Loader className="w-3.5 h-3.5 animate-spin text-blue-600" />
                ) : (
                    <HiChartBar className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span className="text-xs font-semibold text-blue-700 leading-none tracking-wide">
                    {rowCount.toLocaleString()}
                </span>
            </div>
        </div>
    );
};