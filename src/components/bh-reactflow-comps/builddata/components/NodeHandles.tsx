import React from 'react';
import { Handle, Position } from 'reactflow';

interface NodeHandlesProps {
    data: {
        ports?: {
            inputs?: number;
            outputs?: number;
            maxInputs?: string | number;
            maxOutputs?: number;
        };
    };
}

export const NodeHandles: React.FC<NodeHandlesProps> = ({ data }) => {
    return (
        <>
            {/* Input Handles - Enhanced Circle style */}
            {data.ports?.inputs > 0 && Array.from({
                length: data.ports.maxInputs === "unlimited" ? 2 : (data.ports.inputs || 1)
            }).map((_, index) => (
                <Handle
                    key={`input-${index}`}
                    type="target"
                    position={Position.Left}
                    id={`input-${index}`}
                    style={{
                        top: data.ports.maxInputs === "unlimited"
                            ? `calc(40% + ${index * 20}px)`
                            : '50%',
                        opacity: 1,
                        width: '8px',
                        height: '8px',
                        background: '#000000',
                        border: '2px solid #000000',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        zIndex: -1,
                        left: 0,
                        transform: 'translate(-50%, -50%)',
                    }}
                    className="hover:scale-110 hover:border-gray-600 hover:shadow-md"
                />
            ))}

            {/* Output Handles - Triangle style */}
            {data.ports?.outputs > 0 && Array.from({
                length: data.ports.maxOutputs || data.ports.outputs || 1
            }).map((_, index) => (
                <Handle
                    key={`output-${index}`}
                    type="source"
                    position={Position.Right}
                    id={`output-${index}`}
                    style={{
                        top: data.ports.outputs > 1 ? `calc(33% + ${index * 15}px)` : '50%',
                        opacity: 1,
                        width: 0,
                        height: 0,
                        transform: 'translateX(50%) translateY(-50%)',
                        cursor: 'pointer',
                        border: '6px solid transparent',
                        borderLeft: '8px solid #000000',
                        background: 'transparent',
                        transition: 'all 0.2s ease',
                        zIndex: -1,
                    }}
                    className="hover:scale-110 hover:border-l-gray-600"
                />
            ))}
        </>
    );
}; 