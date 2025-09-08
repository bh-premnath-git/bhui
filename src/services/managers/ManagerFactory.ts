import { BaseManager } from './types';
import { ChatMode } from '@/store/slices/chat/chatSlice';
import { PipelineManager } from './PipelineManager';
import { DataExplorerManager } from './DataExplorerManager';
import { CodeAnalysisManager } from './CodeAnalysisManager';
import { ReportGeneratorManager } from './ReportGeneratorManager';
import { QueryOptimizerManager } from './QueryOptimizerManager';
import { CheckJobsManager } from './CheckJobsManager';
import { AddUserManager } from './AddUserManager';
import { AddConnectionManager } from './AddConnectionManager';
import { OnboardDatasetManager } from './OnboardDatasetManager';
import { AddProjectManager } from './AddProjectManager';
import { AddEnvironmentManager } from './AddEnvironmentManager';
import { DefaultManager } from './DefaultManager';

export class ManagerFactory {
  private static managers: BaseManager[] = [
    new PipelineManager(),
    new DataExplorerManager(),
    new CodeAnalysisManager(),
    new ReportGeneratorManager(),
    new QueryOptimizerManager(),
    new CheckJobsManager(),
    new AddUserManager(),
    new AddConnectionManager(),
    new OnboardDatasetManager(),
    new AddProjectManager(),
    new AddEnvironmentManager(),
    new DefaultManager(),
  ];

  static getManager(mode: ChatMode): BaseManager {
    const manager = this.managers.find(m => m.canHandle(mode));
    return manager || new DefaultManager();
  }

  static getAllManagers(): BaseManager[] {
    return this.managers;
  }
}

// Smart mode detection based on user query
export const detectModeFromQuery = (query: string): ChatMode | null => {
  const lowerQuery = query.toLowerCase();
  
  // Pipeline keywords
  if (lowerQuery.includes('pipeline') || lowerQuery.includes('workflow') || 
      lowerQuery.includes('etl') || lowerQuery.includes('data flow') ||
      lowerQuery.includes('process data') || lowerQuery.includes('ingest')) {
    return 'create-pipeline';
  }
  
  // Data exploration keywords
  if (lowerQuery.includes('explore') || lowerQuery.includes('analyze') || 
      lowerQuery.includes('chart') || lowerQuery.includes('graph') ||
      lowerQuery.includes('visualize') || lowerQuery.includes('query') ||
      lowerQuery.includes('data') || lowerQuery.includes('insight')) {
    return 'explore-data';
  }
  
  // Code analysis keywords
  if (lowerQuery.includes('code') || lowerQuery.includes('optimize') ||
      lowerQuery.includes('performance') || lowerQuery.includes('sql')) {
    return 'analyze-code';
  }
  
  // Report generation keywords
  if (lowerQuery.includes('report') || lowerQuery.includes('summary') ||
      lowerQuery.includes('dashboard') || lowerQuery.includes('export')) {
    return 'generate-report';
  }
  
  return null; // No clear mode detected
};