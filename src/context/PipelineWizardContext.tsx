import React, { createContext, useContext } from 'react';
import { usePipelineWizard } from '@/hooks/pipeline/usePipelineWizard';

export type PipelineWizardCtx = ReturnType<typeof usePipelineWizard>;
const PipelineWizardContext = createContext<PipelineWizardCtx | null>(null);

export const usePipelineWizardContext = () => {
  const ctx = useContext(PipelineWizardContext);
  if (!ctx) throw new Error('usePipelineWizardContext must be inside provider');
  return ctx;
};

export const PipelineWizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wizard = usePipelineWizard();
  return <PipelineWizardContext.Provider value={wizard}>{children}</PipelineWizardContext.Provider>;
};
