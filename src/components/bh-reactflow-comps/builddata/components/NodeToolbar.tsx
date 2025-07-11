import React from "react";
import { useSelector } from "react-redux";
import { useAppSelector } from "@/hooks/useRedux";
import { RootState } from "@/store";
import aiIcon from '/assets/ai/ai.svg';
import { Hammer } from "lucide-react";

interface NodeToolbarProps {
    show: boolean;
    onEdit: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
    onDebug: (e: React.MouseEvent) => void;
    onRefresh?: (e: React.MouseEvent) => void;
    onAiChat: (e: React.MouseEvent) => void;
    isDebugged: boolean;
}

export const NodeToolbar = ({ show, onEdit, onDelete, onDebug, onRefresh, onAiChat, isDebugged }: NodeToolbarProps) => {
      const { isFlow, selectedMode } = useAppSelector((state: RootState) => state.buildPipeline);
    
    if (!show) return null;

    const renderToolbarButtons = () => {
        const commonButtons = (
            <>
                <ToolbarButton title="Edit" onClick={onEdit}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </ToolbarButton>
                
                <ToolbarButton title="Delete" onClick={onDelete}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </ToolbarButton>
                
                <ToolbarButton title="AI Chat" onClick={onAiChat}>
                   <Hammer />
                </ToolbarButton>
            </>
        );

        if (isFlow) {
            return commonButtons;
        }

        // Pipeline mode - show different buttons based on selectedMode
        switch (selectedMode) {
            case 'engine':
                return commonButtons;
                
            case 'debug':
                return (
                    <>
                        {commonButtons}
                        <ToolbarButton 
                            title="Debug" 
                            onClick={onDebug}
                            className={isDebugged ? 'bg-red-100' : ''}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                        </ToolbarButton>
                    </>
                );
                
            case 'interactive':
                return (
                    <>
                        {commonButtons}
                        {onRefresh && (
                            <ToolbarButton title="Refresh" onClick={onRefresh}>
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                                />
                            </ToolbarButton>
                        )}
                    </>
                );
                
            default:
                return commonButtons;
        }
    };

    return (
        <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm shadow-lg rounded-md px-1 py-1 z-50 flex gap-1" style={{ zIndex: 50 }}>
            {renderToolbarButtons()}
        </div>
    );
};

const ToolbarButton = ({ title, onClick, children, className = '' }: {
    title: string;
    onClick: (e: React.MouseEvent) => void;
    children: React.ReactNode;
    className?: string;
}) => (
    <button 
        className={`p-0.5 hover:bg-gray-100 rounded ${className}`} 
        title={title} 
        onClick={onClick}
    >
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {children}
        </svg>
    </button>
); 