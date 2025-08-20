import React, { useEffect, useState } from 'react';
import DataPipelineCanvasNew from '@/features/designers/DataPipelineCanvasNew';

interface PipelineCanvasWrapperProps {
  onClose: () => void;
}

export const PipelineCanvasWrapper: React.FC<PipelineCanvasWrapperProps> = ({ onClose }) => {
  const [pipelineData, setPipelineData] = useState<any>(null);

  useEffect(() => {
    // Check if there's sample pipeline JSON data
    const storedPipelineJson = localStorage.getItem('selectedPipelineJson');
    if (storedPipelineJson) {
      try {
        const pipelineJson = JSON.parse(storedPipelineJson);
        setPipelineData(pipelineJson);
        // Clear the stored data after using it
        localStorage.removeItem('selectedPipelineJson');
      } catch (error) {
        console.error('Error parsing pipeline JSON:', error);
      }
    }
  }, []);

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header with close button */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Pipeline Canvas</h3>
          {pipelineData && (
            <p className="text-sm text-gray-600 mt-1">
              {pipelineData.name || 'Sample Pipeline'}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close pipeline canvas"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Canvas content */}
      <div className="flex-1 overflow-hidden">
        {pipelineData ? (
          <div className="h-full w-full">
            <DataPipelineCanvasNew pipelineJson={pipelineData} />
          </div>
        ) : (
          <DataPipelineCanvasNew />
        )}
      </div>
    </div>
  );
};