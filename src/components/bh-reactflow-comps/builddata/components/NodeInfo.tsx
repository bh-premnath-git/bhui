import React from 'react';

interface NodeInfoProps {
    data: {
        icon: string;
        label: string;
    };
    titleValue: string;
    debuggedNodes: Set<string>;
    id: string;
    formStates: any;
    onClose: () => void;
}

export const NodeInfo: React.FC<NodeInfoProps> = ({
    data,
    titleValue,
    debuggedNodes,
    id,
    formStates,
    onClose
}) => {
    return (
        <div
            className="absolute z-20 w-48 p-2.5 bg-white rounded-md shadow-lg border border-gray-100 
                     transform -translate-x-1/2 left-1/2 bottom-full mb-2
                     text-[10px] animate-fadeIn"
            onClick={e => e.stopPropagation()}
        >
            {/* Arrow pointer */}
            <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 
                          w-2 h-2 bg-white border-r border-b border-gray-100 
                          rotate-45">
            </div>

            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5">
                    <img src={data.icon} alt={data.label} className="w-4 h-4 object-contain" />
                    <h3 className="font-medium text-gray-800">{data.label}</h3>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 p-0.5"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="space-y-1">
                <div className="grid grid-cols-5 gap-x-2 text-[9px]">
                    <span className="col-span-2 text-gray-500">Title:</span>
                    <span className="col-span-3 text-gray-700 font-medium">{titleValue || 'No Title'}</span>

                    <span className="col-span-2 text-gray-500">Debug:</span>
                    <span className="col-span-3 text-gray-700 font-medium">
                        {debuggedNodes.has(id) ? 'Enabled' : 'Disabled'}
                    </span>
                </div>

                {formStates[id] && (
                    <div className="mt-2 pt-2 border-t border-gray-50">
                        <p className="text-gray-500 mb-1">Configuration:</p>
                        <pre className="bg-gray-50 p-1.5 rounded text-[8px] max-h-20 overflow-y-auto">
                            {JSON.stringify(formStates[id], null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}; 