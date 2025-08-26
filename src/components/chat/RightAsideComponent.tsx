import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, FileText, GitBranch } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setRightComponent, addMessage, openChatBottomDrawer, closeChatBottomDrawer, setChatBottomDrawerHeight } from '@/store/slices/chat/chatSlice';
import { getChatService } from '@/services/chatService';
import { BottomDrawer } from '@/components/BottomDrawer';
import { useSidebar } from '@/context/SidebarContext';

// Import specific form components
import { ConnectionForm } from './forms/ConnectionForm';
import { AddProject } from '@/features/admin/projects/AddProject';
import { AddEnvironment } from '@/features/admin/environment/AddEnvironment';
import ImportDataSourceStepper from '@/features/data-catalog/components/ImportDataSourceWizard';
import { useProjects } from '@/features/admin/projects/hooks/useProjects';
import { PipelineForm } from './forms/PipelineForm';
import { PipelineCanvasWrapper } from './wrappers/PipelineCanvasWrapper';
import { PlaygroundHeader } from '@/components/headers/playground-header';
import RequirementForm from '@/pages/designers/requirements/RequirementForm';
import { ExploreDataComponent } from './ExploreDataComponent';

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
  const bottomDrawer = useAppSelector((state) => state.chat.bottomDrawer);
  const chatService = getChatService(dispatch);
  const { projects } = useProjects();

  // sync SidebarContext open/close with Redux bottom drawer so DataPipelineCanvasNew controls still work if needed
  const { isBottomDrawerOpen, openBottomDrawer, closeBottomDrawer, updateBottomDrawerHeight } = useSidebar();
  
  React.useEffect(() => {
    if (bottomDrawer.isOpen && !isBottomDrawerOpen) openBottomDrawer();
    if (!bottomDrawer.isOpen && isBottomDrawerOpen) closeBottomDrawer();
  }, [bottomDrawer.isOpen, isBottomDrawerOpen, openBottomDrawer, closeBottomDrawer]);
  
  React.useEffect(() => {
    // push height to context for consistent internal behavior of BottomDrawer
    updateBottomDrawerHeight(`${bottomDrawer.height}px`);
  }, [bottomDrawer.height, updateBottomDrawerHeight]);

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
            {/* Conditionally show playground header only when not in designer mode */}
                <PlaygroundHeader playGroundHeader="pipeline" />
            {/* Canvas below header; hide its internal header */}
            <div className="flex-1 overflow-hidden">
              <PipelineCanvasWrapper 
                onClose={handleClose} 
                hideHeader 
                pipelineType={rightComponent.extra?.pipelineType}
                hideIcons={rightComponent.extra?.hideIcons}
              />
            </div>
          </div>
        );
      case 'requirement-form':
        return (
          <div className="h-full overflow-auto">
            <RequirementForm />
          </div>
        );
      case 'explore-data':
        return (
          <ExploreDataComponent 
            query={(rightComponent as any).extra?.query}
            connection={(rightComponent as any).extra?.connection}
            threadId={(rightComponent as any).extra?.threadId}
          />
        );
      default:
        return (
          <div className="p-4 text-center text-muted-foreground">
            Component "{rightComponent.componentId}" not found
          </div>
        );
    }
  };

  const handleToggle = (targetComponentId: string) => {
    if (!rightComponent) return;
    // Switch component in-place while keeping title and extra
    dispatch(setRightComponent({
      ...rightComponent,
      componentId: targetComponentId,
      // Keep visible
      isVisible: true,
    }));
  };

  return (
    <div className="w-full mt-10 h-full bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 ring-1 ring-border/20 mt-8">
      <Card className="h-full rounded-none border-0 shadow-none">
        <CardHeader 
          className="flex flex-row items-center justify-between space-y-0 pb-3 bg-gradient-to-r from-primary/5 via-transparent to-transparent"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <CardTitle className="text-base font-medium truncate min-w-0" title={rightComponent.title}>
              {rightComponent.title}
            </CardTitle>
            {/* Toggle icons (visible when extra.toggles is provided) */}
            {Array.isArray((rightComponent as any).extra?.toggles) && (
              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                {(rightComponent as any).extra.toggles.map((t: any) => {
                  const isActive = rightComponent.componentId === t.componentId;
                  const IconComp = t.componentId === 'requirement-form' ? FileText : GitBranch;
                  return (
                    <Button
                      key={t.id}
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 rounded-full transition-colors ${isActive ? 'bg-primary text-primary-foreground shadow ring-2 ring-primary' : 'hover:bg-muted/60 text-muted-foreground'}`}
                      title={t.title}
                      aria-label={t.title}
                      aria-pressed={isActive}
                      onClick={() => handleToggle(t.componentId)}
                    >
                      <IconComp className="h-4 w-4" />
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 rounded-full hover:bg-muted/60"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-3rem)] overflow-hidden flex flex-col">
          <div className={`flex-1 min-h-0 ${bottomDrawer.isOpen ? '' : 'overflow-auto'}`}>
            {renderComponent()}
          </div>
          {/* Scoped Bottom Drawer controlled by Redux */}
          {bottomDrawer.isOpen && bottomDrawer.content && (
            <div id="bottom-drawer-container" className="flex-shrink-0 w-full">
              <BottomDrawer 
                title={bottomDrawer.title}
                height={`h-[${bottomDrawer.height}px]`}
                onClose={() => dispatch(closeChatBottomDrawer())}
              >
                {bottomDrawer.content}
              </BottomDrawer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};