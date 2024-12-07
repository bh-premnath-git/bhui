import React, { memo, useCallback, useState, useEffect } from 'react';
import { Handle, Position, useEdges, useReactFlow } from 'reactflow';
import schemaData from '../../pages/buildPipeLine/mdata.json';
interface Schema {
    title: string;
    nodeId?: string;
    [key: string]: any;
}

// Add new helper function to validate form data against schema
const validateFormData = (formData: any, schema: any): { isValid: boolean; warnings: string[] } => {
    const warnings: string[] = [];
    let isValid = true;

    // Check required fields
    if (schema?.required) {
        schema.required.forEach((field: string) => {
            if (!formData || !formData[field]) {
                warnings.push(`Required field "${field}" is missing`);
                isValid = false;
            }
        });
    }

    // Add additional validation logic here if needed
    // For example, checking field types, patterns, etc.

    return { isValid, warnings };
};

export const CustomNode = memo(({ data, id, setNodes, setSelectedSchema, setFormStates, setIsFormOpen, formStates, setRunDialogOpen, setSelectedFormState, onDebugToggle, debuggedNodes }: {
    data: any;
    id: string;
    setNodes: any;
    setSelectedSchema: any;
    setFormStates: any;
    setIsFormOpen: any;
    formStates: any;
    setRunDialogOpen: any;
    setSelectedFormState: any;
    onDebugToggle: (nodeId: string, title: string) => void;
    debuggedNodes: Set<string>;
}) => {
    const [showToolbar, setShowToolbar] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState(data.title || data.label);
    const edges = useEdges();
    const reactFlowInstance = useReactFlow();
    const [showInfo, setShowInfo] = useState(false);
    const [toolbarTimeout, setToolbarTimeout] = useState<NodeJS.Timeout | null>(null);
    const [validationStatus, setValidationStatus] = useState<'none' | 'valid' | 'warning' | 'error'>('none');
    const [validationMessages, setValidationMessages] = useState<string[]>([]);
    const [showValidationTooltip, setShowValidationTooltip] = useState(false);

    // Add useEffect to check validation status whenever formStates changes
    useEffect(() => {
        const formData = formStates[id];
        const nodeSchema = schemaData.schema.find((s: any) => s.title === data.label);

        if (!formData) {
            setValidationStatus('error');
            setValidationMessages(['Form not filled']);
            return;
        }

        if (nodeSchema) {
            const { isValid, warnings } = validateFormData(formData, nodeSchema);
            if (isValid) {
                setValidationStatus('valid');
                setValidationMessages([]);
            } else {
                setValidationStatus('warning');
                setValidationMessages(warnings);
            }
        }
    }, [formStates, id, data.label]);

    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditingTitle(true);
    }, []);

    const handleImageHover = useCallback(() => {
        // Clear any existing timeout
        if (toolbarTimeout) {
            clearTimeout(toolbarTimeout);
        }
        setShowToolbar(true);
    }, [toolbarTimeout]);

    const handleImageLeave = useCallback(() => {
        // Set a new timeout
        const timeout = setTimeout(() => {
            setShowToolbar(false);
        }, 4000); // 4 seconds
        setToolbarTimeout(timeout);
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (toolbarTimeout) {
                clearTimeout(toolbarTimeout);
            }
        };
    }, [toolbarTimeout]);

    const handleDelete = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setNodes((nodes: any[]) => nodes.filter(node => node.id !== id));
    }, [id, setNodes]);

    const handleClone = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setNodes((nodes: any[]) => {
            const nodeToClone = nodes.find(node => node.id === id);
            if (!nodeToClone) return nodes;

            const cloneCount = nodes.filter(node =>
                node.id.startsWith(`${id}_clone_`)
            ).length;

            const newNode = {
                ...nodeToClone,
                id: `${id}_clone_${Date.now()}`,
                position: {
                    x: nodeToClone.position.x + (100 * (cloneCount + 1)),
                    y: nodeToClone.position.y
                }
            };
            return [...nodes, newNode];
        });
    }, [id, setNodes]);

    const handleEdit = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditingTitle(true);
    }, []);

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTitleValue(e.target.value);
    }, []);

    const handleTitleBlur = useCallback(() => {
        setIsEditingTitle(false);
        setNodes((nodes: any[]) =>
            nodes.map(node =>
                node.id === id
                    ? { ...node, data: { ...node.data, title: titleValue } }
                    : node
            )
        );
    }, [id, setNodes, titleValue]);

    const handleInfo = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setShowInfo(true);
    }, []);

    const handleImageClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const schema = schemaData.schema.find(
            (s: Schema) => s.title === data.label
        );
        if (schema) {
            setSelectedSchema({ ...schema, nodeId: id });
            const existingState = formStates[id] || {};
            setFormStates((prev: any) => ({
                ...prev,
                [id]: existingState
            }));
            setIsFormOpen(true);
        }
    }, [data.label, formStates, setSelectedSchema, setFormStates, setIsFormOpen, id]);

    const handleRunClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (formStates[id]) {
            const allNodes = reactFlowInstance.getNodes();
            const getOrderedNodes = (nodeId: string): string[] => {
                const visited = new Set<string>();
                const ordered: string[] = [];

                const visit = (currentId: string) => {
                    if (visited.has(currentId)) return;
                    visited.add(currentId);

                    // First process all incoming nodes
                    const incomingEdges = edges.filter(edge => edge.target === currentId);
                    for (const edge of incomingEdges) {
                        visit(edge.source);
                    }
                    ordered.push(currentId);
                };

                visit(nodeId);
                return ordered;
            };

            const orderedNodeIds = getOrderedNodes(id);

            // Create formatted states in topological order
            const cumulativeStates = orderedNodeIds
                .filter(nodeId => formStates[nodeId])
                .map(nodeId => {
                    const node = allNodes.find(n => n.id === nodeId);
                    if (!node) return null;

                    const moduleName = node.data.label.split(' ')[0].toLowerCase();
                    const incomingEdges = edges.filter(edge => edge.target === nodeId);

                    const dependentOn = incomingEdges.map(edge => {
                        const sourceNode = allNodes.find(n => n.id === edge.source);
                        const sourceLabel = sourceNode?.data?.label || '';
                        return `${sourceLabel.split(' ')[0].toLowerCase()}_transformation`;
                    });

                    return {
                        name: `${moduleName}_transformation`,
                        dependent_on: dependentOn.length > 0 ? dependentOn : ['read_input_data'],
                        transformation: node.data.label,
                        ...formStates[nodeId]
                    };
                })
                .filter(Boolean);

            setSelectedFormState(cumulativeStates);
            setRunDialogOpen(true);
        }
    }, [formStates, id, data.label, edges, reactFlowInstance]);

    const handleDebug = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDebugToggle(id, titleValue);
    }, [id, titleValue, onDebugToggle]);

    return (
        <div className="relative group" style={{ minWidth: 50 }}>
            {showToolbar && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-md px-0.5 py-0.5 z-10 flex gap-0.5"
                    onClick={e => e.stopPropagation()}>
                    <button className="p-0.5 hover:bg-gray-100 rounded" title="Edit" onClick={handleEdit}>
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button className="p-0.5 hover:bg-gray-100 rounded" title="Delete" onClick={handleDelete}>
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                    <button className="p-0.5 hover:bg-gray-100 rounded" title="Info" onClick={handleInfo}>
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                    <button className="p-0.5 hover:bg-gray-100 rounded" title="Clone" onClick={handleClone}>
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <button
                        className={`p-0.5 hover:bg-gray-100 rounded ${debuggedNodes.has(id) ? 'bg-blue-100' : ''}`}
                        title="Debug"
                        onClick={handleDebug}
                    >
                        <svg
                            className={`w-2.5 h-2.5 ${debuggedNodes.has(id) ? 'text-blue-500' : 'text-gray-600'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                        </svg>
                    </button>
                </div>
            )}
            {debuggedNodes.has(id) && (
                <div className="absolute -top-2 -right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            )}

            <div className="relative p-2 rounded-lg border-1 border-gray-100 transition-all duration-300 group-hover:border-indigo-200 group-hover:shadow-md bg-white"
                style={{ position: 'relative', zIndex: 10, border: '1px solid #ccc' }}>
                <div className="flex flex-col items-center gap-0">
                    <div className="flex justify-center text-black text-[8px] w-9 m-auto text-center font-medium mb-1"
                        onDoubleClick={handleDoubleClick}>
                        {isEditingTitle ? (
                            <input type="text" value={titleValue} onChange={handleTitleChange} onBlur={handleTitleBlur}
                                className="min-w-0 w-auto text-center text-[8px] border border-gray-200 rounded-sm px-1 py-0.5 outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm hover:border-gray-300"
                                style={{ width: `${Math.min(Math.max(titleValue.length * 4.5, 20), 100)}px` }}
                                autoFocus spellCheck="false" />
                        ) : (
                            <span className="cursor-pointer select-none truncate max-w-[100px]" title={titleValue || data.label}>
                                {titleValue || data.label}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <div className="relative group" onMouseEnter={handleImageHover} onMouseLeave={handleImageLeave}>
                            <img src={data.icon} alt={data.label} className="w-8 h-8 object-contain cursor-pointer"
                                onClick={handleImageClick} />
                            {formStates[id] && (
                                <button onClick={handleRunClick}
                                    className="absolute -bottom-2 -right-2 p-0.5 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg opacity-100 transition-all duration-300 ease-in-out transform scale-90 hover:scale-100 flex items-center justify-center border-2 border-white z-10"
                                    title="Run Configuration">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M8.5 8.84V15.16c0 1.52 1.63 2.48 2.93 1.73l5.5-3.16c1.3-.75 1.3-2.71 0-3.46l-5.5-3.16c-1.3-.75-2.93.21-2.93 1.73z" />
                                    </svg>
                                </button>
                            )}
                        </div>


                    </div>

                    <div className="flex">

                            <div className=" flex items-center justify-center"
                                onMouseEnter={() => setShowValidationTooltip(true)}
                                onMouseLeave={() => setShowValidationTooltip(false)}>
                                <div className={`w-2 h-2 rounded-full transition-colors duration-200 ${validationStatus === 'valid' ? 'bg-green-500' :
                                        validationStatus === 'warning' ? 'bg-yellow-500' :
                                            validationStatus === 'error' ? 'bg-red-500' :
                                                'bg-gray-300'
                                    }`} />

                                {/* Validation tooltip */}
                                {showValidationTooltip && validationMessages.length > 0 && (
                                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50
                                              bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-gray-100
                                              text-xs w-max max-w-[280px] animate-fadeIn">
                                        {/* Glass-morphism Tooltip Arrow */}
                                        <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 
                                                    w-5 h-5 bg-white/95 backdrop-blur-sm rotate-45 border-r border-b border-gray-100"></div>
                                        
                                        {/* Status Header */}
                                        <div className="flex items-center gap-3 mb-2.5 pb-2.5 border-b border-gray-100">
                                            <div className={`p-1.5 rounded-lg ${
                                                validationStatus === 'error' ? 'bg-red-50' :
                                                validationStatus === 'warning' ? 'bg-amber-50' :
                                                'bg-emerald-50'
                                            }`}>
                                                <svg className={`w-4 h-4 ${
                                                    validationStatus === 'error' ? 'text-red-500' :
                                                    validationStatus === 'warning' ? 'text-amber-500' :
                                                    'text-emerald-500'
                                                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    {validationStatus === 'error' ? (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    ) : validationStatus === 'warning' ? (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    ) : (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                              d="M5 13l4 4L19 7" />
                                                    )}
                                                </svg>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`font-semibold ${
                                                    validationStatus === 'error' ? 'text-red-600' :
                                                    validationStatus === 'warning' ? 'text-amber-600' :
                                                    'text-emerald-600'
                                                }`}>
                                                    {validationStatus.charAt(0).toUpperCase() + validationStatus.slice(1)}
                                                </span>
                                                <span className="text-gray-400 text-[10px]">Validation Status</span>
                                            </div>
                                        </div>

                                        {/* Messages List */}
                                        <ul className="space-y-2">
                                            {validationMessages.map((msg, idx) => (
                                                <li key={idx} className="flex items-start gap-2.5 group">
                                                    <span className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${
                                                        validationStatus === 'error' ? 'bg-red-300 group-hover:bg-red-400' :
                                                        validationStatus === 'warning' ? 'bg-amber-300 group-hover:bg-amber-400' :
                                                        'bg-emerald-300 group-hover:bg-emerald-400'
                                                    }`}></span>
                                                    <span className="text-gray-600 leading-relaxed">{msg}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-center text-black text-[8px] w-9 m-auto text-center mt-1">
                        {data.label}
                    </div>
                    </div>
                    
                </div>
            </div>

            {/* Output Handles - Triangle style */}
            {data.ports?.outputs > 0 && Array.from({ length: data.ports.outputs }).map((_, index) => (
                <Handle
                    key={`output-${index}`}
                    type="source"
                    position={Position.Right}
                    id={`output-${index}`}
                    style={{
                        top: data.ports.outputs === 1 ? '35%' : `${(index + 1) * (100 / (data.ports.outputs + 1))}%`,
                        opacity: 1,
                        width: 0,
                        height: 0,
                        transform: 'translateX(50%)',
                        cursor: 'pointer',
                        border: '6px solid transparent',
                        borderLeft: '8px solid #000000',
                        background: 'transparent',
                        transition: 'all 0.2s ease',
                        zIndex: 5,
                    }}
                    className="hover:scale-110 hover:border-l-gray-600"
                />
            ))}

            {/* Input Handles - Enhanced Circle style */}
            {data.ports?.inputs > 0 && Array.from({ length: data.ports.inputs }).map((_, index) => (
                <Handle
                    key={`input-${index}`}
                    type="target"
                    position={Position.Left}
                    id={`input-${index}`}
                    style={{
                        top: data.ports.inputs === 1 ? '35%' : `${(index + 1) * (100 / (data.ports.inputs + 1))}%`,
                        opacity: 1,
                        width: '8px',
                        height: '8px',
                        background: '#000000',
                        border: '2px solid #000000',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        zIndex: 5,
                        left: '-4px',
                    }}
                    className="hover:scale-110 hover:border-gray-600 hover:shadow-md"
                />
            ))}

            {showInfo && (
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
                            onClick={() => setShowInfo(false)}
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
            )}

        </div>
    );
});