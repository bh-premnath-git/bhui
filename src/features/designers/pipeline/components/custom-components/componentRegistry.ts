// Component registry for custom UI components
import React from 'react';

// Import wrapper components that adapt existing components to new system
import { ReaderWrapper } from './ReaderWrapper';
import { TargetWrapper } from './TargetWrapper';

// Import existing components for fallback/direct use
import OrderPopUp from '@/components/bh-reactflow-comps/builddata/OrderPopUp';
import TargetPopUp from '@/components/bh-reactflow-comps/TargetPopUp';
import OrderPopUpContent from './OrderPopUpContent';

// Component registry mapping
export const componentRegistry: Record<string, React.ComponentType<any>> = {
  // For Reader transformations - use OrderPopUp directly
  'ReaderOptionsForm.tsx': OrderPopUp,
  'ReaderOptionsForm': OrderPopUp,
  
  // For Target transformations - use wrapper to adapt existing component
  'TargetPopUp.tsx': TargetWrapper,
  'TargetPopUp': TargetWrapper, 
  
  // For other transformations that might use OrderPopUp directly
  'OrderPopUp.tsx': OrderPopUp,
  'OrderPopUp': OrderPopUp,
  
  // Direct access to original components (if needed)
  'TargetPopUp.original': TargetPopUp,
  'ReaderWrapper': ReaderWrapper,
  
  // Add more custom components here as needed
};

// Function to get component by name
export const getCustomComponent = (componentName: string): React.ComponentType<any> | null => {
  return componentRegistry[componentName] || null;
};