import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setRightComponent, addMessage } from '@/store/slices/chat/chatSlice';
import { getChatService } from '@/services/chatService';

// Import specific form components
import { ConnectionForm } from './forms/ConnectionForm';
import { AddProjectForm } from './forms/AddProjectForm';
import { AddEnvironmentForm } from './forms/AddEnvironmentForm';
import { AddProject } from '@/features/admin/projects/AddProject';
import { AddEnvironment } from '@/features/admin/environment/AddEnvironment';
import ImportDataSourceStepper from '@/features/data-catalog/components/ImportDataSourceWizard';
import { useProjects } from '@/features/admin/projects/hooks/useProjects';
import { PipelineForm } from './forms/PipelineForm';
import { PipelineCanvasWrapper } from './wrappers/PipelineCanvasWrapper';
import { PlaygroundHeader } from '@/components/headers/playground-header';

// Component to trigger table import using existing data catalog functionality
const TableImportTrigger: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  React.useEffect(() => {
    // Trigger the existing table import dialog
    window.dispatchEvent(new Event("openImportSourceDialog"));
    // Close this panel since we're using the existing flow
    onClose();
  }, [onClose]);

  return (
    <div className="p-4 text-center">
      <p>Opening table import...</p>
    </div>
  );
};




export const RightAsideComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const rightComponent = useAppSelector((state) => state.chat.rightComponent);
  const chatService = getChatService(dispatch);
  const { projects } = useProjects();

  if (!rightComponent || !rightComponent.isVisible) {
    return null;
  }

  const handleClose = async () => {
    // Close the right component
    dispatch(setRightComponent(null));
    
    // Treat close as submit - add success message and trigger next step based on component type
    let successMessage = '✅ Configuration completed successfully!';
    let nextStep: string | null = null;
    
    switch (rightComponent?.componentId) {
      case 'connection-form':
        successMessage = '✅ Connection configuration completed successfully!';
        nextStep = 'connectionSelected'; // Continue to next step in pipeline workflow
        break;
      case 'project-form':
        successMessage = '✅ Project created successfully!';
        nextStep = 'projectSelected'; // Continue to next step in pipeline workflow
        break;
      case 'environment-form':
        successMessage = '✅ Environment created successfully!';
        nextStep = 'environmentSelected'; // Continue to next step in pipeline workflow
        break;
      case 'table-form':
        successMessage = '✅ Table data source added successfully!';
        nextStep = 'dataSourceSelected'; // Continue to next step in pipeline workflow
        break;
      case 'file-form':
        successMessage = '✅ File data source added successfully!';
        nextStep = 'dataSourceSelected'; // Continue to next step in pipeline workflow
        break;
      case 'pipeline-form':
        successMessage = '🎉 Pipeline created successfully!';
        nextStep = 'pipelineCreated'; // Final step
        break;
      case 'pipeline-canvas':
        // Don't show success message for canvas, just close
        return;
    }
    
    dispatch(addMessage({
      content: successMessage,
      isUser: false
    }));

    // If there's a next step and we're in a workflow, continue to it
    if (nextStep) {
      setTimeout(() => {
        chatService.executeStep(nextStep);
      }, 1000); // Small delay to show the success message first
    }
  };

  const renderComponent = () => {
    switch (rightComponent.componentId) {
      case 'connection-form':
        return <ConnectionForm />;
      case 'project-form':
        return <AddProject />;
      case 'environment-form':
        return <AddEnvironment />;
      case 'table-form':
        return <TableImportTrigger onClose={handleClose} />;
      case 'file-form':
        return (
          <ImportDataSourceStepper
            gitProjectList={Array.isArray(projects) ? projects.map((project: any) => ({
              ProjectId: project.bh_project_id,
              Project_Name: project.bh_project_name
            })) : []}
            closeImportSection={handleClose}
            onRefetch={() => {}}
          />
        );
      case 'pipeline-form':
        return <PipelineForm onClose={handleClose} />;
      case 'pipeline-canvas':
        return (
          <div className="flex flex-col h-full w-full">
            {/* Inline playground header for pipeline */}
            <div className="border-b">
              <PlaygroundHeader playGroundHeader="pipeline" />
            </div>
            {/* Canvas below header; hide its internal header */}
            <div className="flex-1 overflow-hidden">
              <PipelineCanvasWrapper onClose={handleClose} hideHeader />
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4 text-center text-muted-foreground">
            Component "{rightComponent.componentId}" not found
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full bg-background border-l border-chat-border/50">
      <Card className="h-full rounded-none border-0 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-chat-border/30">
          <CardTitle className="text-lg font-semibold">
            {rightComponent.title}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-4rem)] overflow-auto">
          {renderComponent()}
        </CardContent>
      </Card>
    </div>
  );
};