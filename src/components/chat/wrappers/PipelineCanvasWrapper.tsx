import React, { useEffect, useState } from 'react';
import DataPipelineCanvasNew from '@/features/designers/DataPipelineCanvasNew';

interface PipelineCanvasWrapperProps {
  onClose: () => void;
  hideHeader?: boolean; // when true, wrapper won't render its own header (use external header instead)
  pipelineType?: string; // pipeline type (e.g., 'design', 'production')
  hideIcons?: boolean; // when true, hide icons in the header
}

export const PipelineCanvasWrapper: React.FC<PipelineCanvasWrapperProps> = ({ 
  onClose, 
  hideHeader, 
  pipelineType = 'design',
  hideIcons = false 
}) => {
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const applyFromStorage = () => {
      const storedPipelineJson = localStorage.getItem('selectedPipelineJson');
      if (storedPipelineJson) {
        try {
          const pipelineJson = JSON.parse(storedPipelineJson);
          setPipelineData(pipelineJson);
          setVersion(v => v + 1); // bump to force re-render
        } catch (error) {
          console.error('Error parsing pipeline JSON:', error);
        }
      }
    };

    // Initial load from storage
    applyFromStorage();

    // Listen to live updates from chat cards
    const handler = (e: any) => {
      const detail = (e as CustomEvent).detail as any;
      if (detail?.pipelineJson) {
        setPipelineData(detail.pipelineJson);
        setVersion(v => v + 1);
      } else {
        applyFromStorage();
      }
    };
    window.addEventListener('chat:set-pipeline-json', handler as EventListener);

    return () => {
      window.removeEventListener('chat:set-pipeline-json', handler as EventListener);
    };
  }, []);

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header (optional) */}
      {!hideHeader && (
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div>
            {pipelineType === 'design' ? (
              <h3 className="text-lg font-semibold text-gray-900">Pipeline Designer</h3>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900">Pipeline Canvas</h3>
                {pipelineData && (
                  <p className="text-sm text-gray-600 mt-1">
                    {pipelineData.name || 'Sample Pipeline'}
                  </p>
                )}
              </> 
            )}
          </div>
          {!hideIcons && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close pipeline canvas"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Canvas content */}
      <div className="flex-1 overflow-hidden">
        {pipelineData ? (
          <div key={version} className="h-full w-full">
            <DataPipelineCanvasNew 
              pipelineJson={pipelineData} 
              pipelineType={pipelineType}
              hideIcons={hideIcons}
              skipFetchOnMount
            />
          </div>
        ) : (
          <DataPipelineCanvasNew 
            key={`empty-${version}`}
            pipelineType={pipelineType}
            hideIcons={hideIcons}
            skipFetchOnMount
          />
        )}
      </div>
    </div>
  );
};