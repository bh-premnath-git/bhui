import React from 'react';

interface NodeTitleProps {
    isEditing: boolean;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    onDoubleClick: (e: React.MouseEvent) => void;
    error: string | null;
    isSelected: boolean;
    label: string;
}

export const NodeTitle: React.FC<NodeTitleProps> = ({
    isEditing,
    value,
    onChange,
    onBlur,
    onDoubleClick,
    error,
    isSelected,
    label
}) => {
    return (
        <div 
            className={`flex justify-center text-black text-[8px] w-9 m-auto text-center font-medium mb-1 ${
                isSelected ? 'text-blue-600 font-semibold' : ''
            }`}
            onDoubleClick={onDoubleClick}
        >
            {isEditing ? (
                <div className="relative">
                    <input 
                        type="text" 
                        value={value} 
                        onChange={onChange} 
                        onBlur={onBlur}
                        className={`min-w-0 w-auto text-center text-[8px] border rounded-sm px-1 py-0.5 outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:border-gray-300 ${
                            error ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : 'border-gray-200 focus:ring-blue-400 focus:border-blue-400'
                        }`}
                        style={{ width: `${Math.min(Math.max(value.length * 10.5, 20), 200)}px` }}
                        autoFocus 
                        spellCheck="false" 
                    />
                    {error && (
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-[7px] text-red-500 whitespace-nowrap">
                            {error}
                        </div>
                    )}
                </div>
            ) : (
                <span className="cursor-pointer select-none max-w-[100px]" title={value || label}>
                    {value || label}
                </span>
            )}
        </div>
    );
}; 