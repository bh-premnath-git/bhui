interface NodeToolbarProps {
    show: boolean;
    onEdit: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
    onInfo: (e: React.MouseEvent) => void;
    onClone: (e: React.MouseEvent) => void;
    onDebug: (e: React.MouseEvent) => void;
    isDebugged: boolean;
}

export const NodeToolbar = ({ show, onEdit, onDelete, onInfo, onClone, onDebug, isDebugged }: NodeToolbarProps) => {
    if (!show) return null;

    return (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm shadow-lg rounded-md px-1 py-1 z-20 flex gap-1">
            <ToolbarButton title="Edit" onClick={onEdit}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </ToolbarButton>
            
            <ToolbarButton title="Delete" onClick={onDelete}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </ToolbarButton>
            
            <ToolbarButton title="Info" onClick={onInfo}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </ToolbarButton>
            
            <ToolbarButton title="Clone" onClick={onClone}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </ToolbarButton>
            
            <ToolbarButton 
                title="Debug" 
                onClick={onDebug}
                className={isDebugged ? 'bg-blue-100' : ''}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
            </ToolbarButton>
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