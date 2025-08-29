import React from 'react';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';

const DebugPanel: React.FC = () => {
    const { debuggedNodesList, handleDebugToggle } = usePipelineContext();

    return (
        debuggedNodesList.length > 0 && (
            <div className="mb-4 p-2 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Debugged Nodes:</h3>
                <div className="flex flex-wrap gap-2">
                    {debuggedNodesList.map(({ id, title }) => (
                        <div
                            key={id}
                            className="flex items-center gap-2 bg-white px-3 py-1 rounded-full text-sm text-blue-700 border border-blue-200"
                        >
                            <span>{title}</span>
                            <button
                                onClick={() => handleDebugToggle(id, title)}
                                className="hover:text-blue-900"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )
    );
};

export default DebugPanel;