import React, { memo, useCallback, useState } from 'react';
import { Handle, Position, useEdges, useReactFlow } from 'reactflow';
import schemaData from '../../pages/buildPipeLine/mdata.json';
interface Schema {
    title: string;
    nodeId?: string;
    [key: string]: any;
}
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
    const [titleValue, setTitleValue] = useState(data.title || 'No Title');
    const edges = useEdges();
    const reactFlowInstance = useReactFlow();

    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowToolbar(prev => !prev);
        setTimeout(() => { setShowToolbar(prev => !prev); }, 2000)
    }, []);

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

            // Modified to return nodes in topological order
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

                    // Then add current node
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
        <div
            className="relative group"
            style={{ minWidth: 50 }}
            onDoubleClick={handleDoubleClick}
        >
            {showToolbar && (
                <div
                    className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-md px-0.5 py-0.5 z-10 flex gap-0.5"
                    onClick={e => e.stopPropagation()}
                >
                    <button
                        className="p-0.5 hover:bg-gray-100 rounded"
                        title="Edit"
                        onClick={handleEdit}
                    >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        className="p-0.5 hover:bg-gray-100 rounded"
                        title="Delete"
                        onClick={handleDelete}
                    >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                    <button
                        className="p-0.5 hover:bg-gray-100 rounded"
                        title="Info"
                        onClick={handleInfo}
                    >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                    <button
                        className="p-0.5 hover:bg-gray-100 rounded"
                        title="Clone"
                        onClick={handleClone}
                    >
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
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            )}
            <Handle
                type="source"
                position={Position.Right}
                style={{ top: '35%', transform: 'translateY(-50%)', opacity: 0.1 }}
            />
            <div
                className="relative p-0.5 rounded-lg transition-all duration-300 group-hover:transform group-hover:scale-105"
            >
                <div className="flex flex-col items-center gap-0">
                    <div className="flex items-center gap-2">
                        <div className="relative group">
                            <div className="bg-white bg-opacity-20 rounded-lg relative">
                                <img
                                    src={data.icon}
                                    alt={data.label}
                                    className="w-8 h-8 object-contain cursor-pointer"
                                    onClick={handleImageClick}
                                />
                                {formStates[id] && (
                                    <button
                                        onClick={handleRunClick}
                                        className="absolute -top-0.5 -right-0.5 p-0.5 
                                                 bg-blue-500 hover:bg-blue-400
                                                 rounded-full shadow-lg
                                                 opacity-0 group-hover:opacity-100
                                                 transition-all duration-300 ease-in-out
                                                 transform scale-75 hover:scale-100
                                                 flex items-center justify-center
                                                 border border-white"
                                        title="Run Configuration"
                                    >
                                        <svg
                                            className="w-2.5 h-2.5 text-white"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M8.5 8.84V15.16c0 1.52 1.63 2.48 2.93 1.73l5.5-3.16c1.3-.75 1.3-2.71 0-3.46l-5.5-3.16c-1.3-.75-2.93.21-2.93 1.73z"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div
                        className="flex justify-center text-black text-[8px] w-9 m-auto text-center font-medium text-center cursor-pointer select-none"
                    >
                        {data.label}
                    </div>
                    <div className="flex justify-center text-black text-[8px] w-9 m-auto text-center font-medium text-center">
                        {isEditingTitle ? (
                            <input
                                type="text"
                                value={titleValue}
                                onChange={handleTitleChange}
                                onBlur={handleTitleBlur}
                                className="w-full text-center text-[8px] border border-gray-200 rounded 
                                         px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-blue-400 
                                         focus:border-blue-400 transition-all duration-200 
                                         shadow-sm hover:border-gray-300"
                                autoFocus
                                spellCheck="false"
                            />
                        ) : (
                            <span className="cursor-pointer select-none">
                                {titleValue || 'No Title'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            {data.label?.toLowerCase() !== 'source' && (<Handle
                type="target"
                position={Position.Left}
                style={{ top: '35%', transform: 'translateY(-50%)', opacity: 0.1 }}
            />)}


        </div>
    );
});