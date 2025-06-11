import { withPageErrorBoundary } from '@/components/withPageErrorBoundary';
import DataPipelineCanvasNew from '@/features/designers/DataPipelineCanvasNew';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LoadingState } from '@/components/shared/LoadingState';

const DataPipelineCanvasPage = () => {
  const { id } = useParams();
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Handle initial page load
  useEffect(() => {
    // Show loading state briefly to ensure components initialize properly
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Track ID changes
  useEffect(() => {
    // Reset initializing state when ID changes
    if (!isInitializing) {
      setIsInitializing(true);
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [id]);
  
  return (
    <div className="h-full w-full relative">
      {isInitializing && (
        <LoadingState 
          fullScreen={true}
          className="bg-background/90 backdrop-blur-sm"
        />
      )}
      <DataPipelineCanvasNew />
    </div>
  )
}

export default withPageErrorBoundary(DataPipelineCanvasPage, 'DataPipelineCanvas')