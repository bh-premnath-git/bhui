import React from 'react';
import { useSelector } from 'react-redux';

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
        selectedData?: any;
        transformationData?: {
            lookup_type?: string;
            lookup_columns?: Array<{
                column: string;
                out_column_name: string;
            }>;
            lookup_conditions?: {
                column_name: string;
                lookup_with: string;
            };
        };
    };
    validationStatus: 'none' | 'valid' | 'warning' | 'error';
    validationMessages: string[];
    showTooltip: boolean;
    onTooltipEnter: () => void;
    onTooltipLeave: () => void;
    type?: string;
    label?: any;
}

export const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({
    data,
    validationStatus,
    validationMessages,
    showTooltip,
    onTooltipEnter,
    onTooltipLeave,
    type,
    label
}) => {
    const getIndicatorColor = () => {
        const { isFlow } = useSelector((state: any) => state.buildPipeline);
        if (isFlow) {
            if (data?.selectedData) return 'bg-green-500';
            else return 'bg-red-500';

        } else {
            if (!data?.label) return 'bg-gray-300';

            if (data.label.toLowerCase() === "reader") {

                if (!data.source) return 'bg-red-500';
                console.log('Reader source:', data.source);
                // debugger
                return ( data?.source?.connection_config_id)
                    ? 'bg-green-500'
                    : (data?.source?.data_src_desc || data?.source?.connection_config_id)
                        ? 'bg-yellow-500'
                        : 'bg-red-500';

            }

            if (data.label.toLowerCase() === "target") {
                
                if (!data.source) {
                    return 'bg-red-500';
                }
                
                // Check for connection_config_id in different possible locations
                const hasConnection = data.source.connection?.connection_config_id || 
                                    data.source.connection_config_id;
                const hasTargetType = data.source.target_type;
                
                
                
                return (hasTargetType && hasConnection)
                    ? 'bg-green-500'
                    : (hasTargetType || hasConnection)
                        ? 'bg-yellow-500'
                        : 'bg-red-500';
            }

            if (data.label.toLowerCase() === "lookup") {
                // Check if transformationData exists (where lookup form data is stored)
                const lookupData = data.transformationData;
                if (!lookupData) {
                    return 'bg-red-500';
                }
                
                // Check required fields for lookup
                const hasLookupType = lookupData.lookup_type && lookupData.lookup_type.trim() !== '';
                const hasLookupColumns = lookupData.lookup_columns && Array.isArray(lookupData.lookup_columns) && lookupData.lookup_columns.length > 0;
                const hasLookupConditions = lookupData.lookup_conditions && 
                    lookupData.lookup_conditions.column_name && lookupData.lookup_conditions.column_name.trim() !== '' &&
                    lookupData.lookup_conditions.lookup_with && lookupData.lookup_conditions.lookup_with.trim() !== '';
                
                const allRequiredFieldsFilled = hasLookupType && hasLookupColumns && hasLookupConditions;
                const someFieldsFilled = hasLookupType || hasLookupColumns || hasLookupConditions;
                
                return allRequiredFieldsFilled
                    ? 'bg-green-500'
                    : someFieldsFilled
                        ? 'bg-yellow-500'
                        : 'bg-red-500';
            }

            // For all other node types, use the validation status directly
            return validationStatus === 'valid'
                ? 'bg-green-500'
                : validationStatus === 'warning'
                    ? 'bg-yellow-500'
                    : validationStatus === 'error'
                        ? 'bg-red-500'
                        : 'bg-gray-300';
        }
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
        <div className="absolute -bottom-8 left-0 right-0 flex flex-col items-center">
            {/* First row: Validation indicator */}
            <div className="flex items-center justify-center mb-1">
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
                                ) : data?.label && data.label.toLowerCase() === 'lookup' ? (
                                    // Lookup-specific validation messages
                                    (() => {
                                        const lookupData = data.transformationData;
                                        if (!lookupData) {
                                            return (
                                                <li className="flex items-start gap-2.5 group">
                                                    <span className="mt-1 h-2 w-2 rounded-full flex-shrink-0 transition-all duration-300 group-hover:scale-110 bg-red-300 group-hover:bg-red-400"></span>
                                                    <span className="text-gray-600 leading-relaxed">Lookup configuration is missing</span>
                                                </li>
                                            );
                                        }
                                        
                                        const messages = [];
                                        const hasLookupType = lookupData.lookup_type && lookupData.lookup_type.trim() !== '';
                                        const hasLookupColumns = lookupData.lookup_columns && Array.isArray(lookupData.lookup_columns) && lookupData.lookup_columns.length > 0;
                                        const hasLookupConditions = lookupData.lookup_conditions && 
                                            lookupData.lookup_conditions.column_name && lookupData.lookup_conditions.column_name.trim() !== '' &&
                                            lookupData.lookup_conditions.lookup_with && lookupData.lookup_conditions.lookup_with.trim() !== '';
                                        
                                        if (!hasLookupType) {
                                            messages.push({ text: 'Lookup type is required', color: 'bg-red-300 group-hover:bg-red-400' });
                                        }
                                        if (!hasLookupColumns) {
                                            messages.push({ text: 'Lookup columns are required', color: 'bg-red-300 group-hover:bg-red-400' });
                                        }
                                        if (!hasLookupConditions) {
                                            messages.push({ text: 'Lookup conditions are required', color: 'bg-red-300 group-hover:bg-red-400' });
                                        }
                                        
                                        if (messages.length === 0) {
                                            messages.push({ text: 'All required fields are filled', color: 'bg-emerald-300 group-hover:bg-emerald-400' });
                                        }
                                        
                                        return messages.map((msg, idx) => (
                                            <li key={idx} className="flex items-start gap-2.5 group">
                                                <span className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${msg.color}`}></span>
                                                <span className="text-gray-600 leading-relaxed">{msg.text}</span>
                                            </li>
                                        ));
                                    })()
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
            </div>
            
            {/* Second row: Label and type in horizontal layout */}
            <div className="flex items-center justify-center flex-wrap">
                {label && (
                    <span className="text-black text-[8px] text-center whitespace-nowrap" title={typeof label === 'string' ? label : ''}>
                        {label}
                    </span>
                )}
                
                {data?.type && (
                    <span className="text-black text-[8px] text-center whitespace-nowrap" title={data.type}>
                        {data.type}
                    </span>
                )}
            </div>
        </div>
    );
}; 