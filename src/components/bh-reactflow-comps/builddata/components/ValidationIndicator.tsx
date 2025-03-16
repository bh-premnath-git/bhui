import React from 'react';

interface ValidationIndicatorProps {
    data: {
        label?: string;
        source?: {
            data_src_desc?: string;
            connection_config_id?: string;
            target_type?: string;
            connection?: {
                connection_config_id?: string;
            };
        };
    };
    validationStatus: 'none' | 'valid' | 'warning' | 'error';
    validationMessages: string[];
    showTooltip: boolean;
    onTooltipEnter: () => void;
    onTooltipLeave: () => void;
}

export const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({
    data,
    validationStatus,
    validationMessages,
    showTooltip,
    onTooltipEnter,
    onTooltipLeave
}) => {
    const getIndicatorColor = () => {
        if (!data?.label) return 'bg-gray-300';

        if (data.label.toLowerCase() === "reader") {
            console.log("data.source", data.source);
            if (!data.source) return 'bg-red-500';
            return (data?.source?.data_src_desc && data?.source?.connection_config_id) 
                ? 'bg-green-500' 
                : (data?.source?.data_src_desc || data?.source?.connection_config_id)
                    ? 'bg-yellow-500'
                    : 'bg-red-500';
        }

        if (data.label.toLowerCase() === "target") {
            if (!data.source) return 'bg-red-500';
            return (data.source.target_type && data.source.connection?.connection_config_id)
                ? 'bg-green-500'
                : (data.source.target_type || data.source.connection?.connection_config_id)
                    ? 'bg-yellow-500'
                    : 'bg-red-500';
        }

        return validationStatus === 'valid'
            ? 'bg-green-500'
            : validationStatus === 'warning'
                ? 'bg-yellow-500'
                : validationStatus === 'error'
                    ? 'bg-red-500'
                    : 'bg-gray-300';
    };

    const getStatusIcon = () => {
        if (validationStatus === 'error') {
            return (
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
            );
        }
        if (validationStatus === 'warning') {
            return (
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
            );
        }
        return (
            <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2}
                d="M5 13l4 4L19 7" 
            />
        );
    };

    const getStatusColor = () => {
        return validationStatus === 'error'
            ? 'text-red-600'
            : validationStatus === 'warning'
                ? 'text-amber-600'
                : 'text-emerald-600';
    };

    const getStatusBgColor = () => {
        return validationStatus === 'error'
            ? 'bg-red-50'
            : validationStatus === 'warning'
                ? 'bg-amber-50'
                : 'bg-emerald-50';
    };

    const getDotColor = () => {
        return validationStatus === 'error'
            ? 'bg-red-300 group-hover:bg-red-400'
            : validationStatus === 'warning'
                ? 'bg-amber-300 group-hover:bg-amber-400'
                : 'bg-emerald-300 group-hover:bg-emerald-400';
    };

    return (
        <div className="absolute -bottom-6 left-0 right-0 flex flex-col items-center">
            <div className="flex items-center gap-1">
                <div 
                    className="flex items-center justify-center"
                    onMouseEnter={onTooltipEnter}
                    onMouseLeave={onTooltipLeave}
                >
                    <div className={`w-2 h-2 rounded-full transition-colors duration-200 ${getIndicatorColor()}`} />
                    
                    {showTooltip && (
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50
                                      bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-gray-100
                                      text-xs w-max max-w-[280px] animate-fadeIn">
                            <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 
                                          w-5 h-5 bg-white/95 backdrop-blur-sm rotate-45 border-r border-b border-gray-100">
                            </div>

                            <div className="flex items-center gap-3 mb-2.5 pb-2.5 border-b border-gray-100">
                                <div className={`p-1.5 rounded-lg ${getStatusBgColor()}`}>
                                    <svg 
                                        className={`w-4 h-4 ${getStatusColor()}`} 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                    >
                                        {getStatusIcon()}
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className={`font-semibold ${getStatusColor()}`}>
                                        {validationStatus.charAt(0).toUpperCase() + validationStatus.slice(1)}
                                    </span>
                                    <span className="text-gray-400 text-[10px]">Validation Status</span>
                                </div>
                            </div>

                            <ul className="space-y-2">
                                {data?.label && data.label.toLowerCase() === 'source' ? (
                                    // Source-specific validation messages
                                    !data.source ? (
                                        <li className="flex items-start gap-2.5 group">
                                            <span className="mt-1 h-2 w-2 rounded-full flex-shrink-0 transition-all duration-300 group-hover:scale-110 bg-red-300 group-hover:bg-red-400"></span>
                                            <span className="text-gray-600 leading-relaxed">Source configuration is missing</span>
                                        </li>
                                    ) : (
                                        <>
                                            {!data.source.data_src_desc && (
                                                <li className="flex items-start gap-2.5 group">
                                                    <span className="mt-1 h-2 w-2 rounded-full flex-shrink-0 transition-all duration-300 group-hover:scale-110 bg-amber-300 group-hover:bg-amber-400"></span>
                                                    <span className="text-gray-600 leading-relaxed">Source description is missing</span>
                                                </li>
                                            )}
                                            {!data.source.connection_config_id && (
                                                <li className="flex items-start gap-2.5 group">
                                                    <span className="mt-1 h-2 w-2 rounded-full flex-shrink-0 transition-all duration-300 group-hover:scale-110 bg-amber-300 group-hover:bg-amber-400"></span>
                                                    <span className="text-gray-600 leading-relaxed">Connection configuration ID is missing</span>
                                                </li>
                                            )}
                                        </>
                                    )
                                ) : (
                                    // Regular validation messages
                                    validationMessages.map((msg, idx) => (
                                        <li key={idx} className="flex items-start gap-2.5 group">
                                            <span className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${getDotColor()}`}></span>
                                            <span className="text-gray-600 leading-relaxed">{msg}</span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    )}
                </div>
                <span className="text-black text-[8px]">{data.label}</span>
            </div>
        </div>
    );
}; 