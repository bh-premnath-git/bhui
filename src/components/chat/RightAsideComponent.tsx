import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, FileText, GitBranch, Table as TableIcon, Eye, Code2, Loader2 } from 'lucide-react';
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
import SampleDataTableView from './SampleDataTableView';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

// Dummy preview data component for pipeline canvas
const PipelinePreviewData: React.FC = () => {
  const dummyData = [
    {
      id: 1,
      customer_name: 'John Doe',
      product: 'Laptop',
      amount: 1299.99,
      status: 'Completed'
    },
    {
      id: 2,
      customer_name: 'Jane Smith',
      product: 'Smartphone',
      amount: 899.99,
      status: 'Processing'
    },
    {
      id: 3,
      customer_name: 'Bob Johnson',
      product: 'Headphones',
      amount: 249.99,
      status: 'Shipped'
    },
    {
      id: 4,
      customer_name: 'Alice Brown',
      product: 'Monitor',
      amount: 349.99,
      status: 'Delivered'
    },
    {
      id: 5,
      customer_name: 'Charlie Wilson',
      product: 'Keyboard',
      amount: 129.99,
      status: 'Processing'
    }
  ];

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Pipeline Preview Data</h3>
        <p className="text-sm text-gray-600">Sample data showing the expected output format</p>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dummyData.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.id}</TableCell>
                <TableCell>{row.customer_name}</TableCell>
                <TableCell>{row.product}</TableCell>
                <TableCell>${row.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    row.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    row.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                    row.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {row.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
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
  const [exploreTitle, setExploreTitle] = React.useState<string | null>(null);
  const [hasManuallyClosed, setHasManuallyClosed] = React.useState(false);
  
  React.useEffect(() => {
    if (rightComponent?.componentId !== 'explore-data') {
      setExploreTitle(null);
    }
  }, [rightComponent?.componentId]);

  // Auto-open bottom drawer with preview data when pipeline canvas is opened
  React.useEffect(() => {
    if (rightComponent?.componentId === 'pipeline-canvas' && !bottomDrawer.isOpen && !hasManuallyClosed) {
      // Small delay to ensure the canvas is fully rendered
      const timer = setTimeout(() => {
        dispatch(openChatBottomDrawer({
          title: 'Pipeline Preview Data',
          content: <PipelinePreviewData />,
          height: 400
        }));
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [rightComponent?.componentId, bottomDrawer.isOpen, hasManuallyClosed, dispatch]);

  // Fix the synchronization conflict by using a ref to prevent infinite loops
  const syncRef = React.useRef(false);
  
  React.useEffect(() => {
    if (syncRef.current) return;
    
    if (bottomDrawer.isOpen && !isBottomDrawerOpen) {
      syncRef.current = true;
      openBottomDrawer();
      setTimeout(() => { syncRef.current = false; }, 100);
    } else if (!bottomDrawer.isOpen && isBottomDrawerOpen) {
      syncRef.current = true;
      closeBottomDrawer();
      setTimeout(() => { syncRef.current = false; }, 100);
    }
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

  const handleDrawerClose = () => {
    // Mark that user has manually closed the drawer
    setHasManuallyClosed(true);
    dispatch(closeChatBottomDrawer());
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
            onRefetch={() => { }}
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
      case 'data-table-view':
        return (
          <div className="flex flex-col h-full w-full">
            <div className="flex-1 overflow-auto">
              <SampleDataTableView />
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
            onTitleChange={setExploreTitle}
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
    <div className="w-full h-full bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 ring-1 ring-border/20">
      <Card className="h-full rounded-none border-0 shadow-none">
        <CardHeader
          className="flex p-1 flex-row items-center justify-between space-y-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <CardTitle
              className="text-base font-medium truncate min-w-0"
              title={rightComponent.componentId === 'explore-data' ? exploreTitle ?? undefined : rightComponent.title}
            >
              {rightComponent.componentId === 'explore-data'
                ? (exploreTitle ? exploreTitle : <Loader2 className="h-4 w-4 animate-spin" />)
                : rightComponent.title}
            </CardTitle>
            {/* Segmented toggle (visible when extra.toggles is provided) */}
            {Array.isArray((rightComponent as any).extra?.toggles) && (
              <div className="ml-2 flex-shrink-0">
                <div className="inline-flex items-center rounded-md bg-[#F2F0EB] p-1 shadow-sm border border-[#E5E1D8]">
                  {(() => {
                    // Expect two options: left=view (data-table-view) with eye, right=code (pipeline-canvas) with </>
                    const toggles = (rightComponent as any).extra.toggles as any[];
                    // Derive order: left = data-table-view, right = pipeline-canvas; fallback to existing order
                    const left = toggles.find(t => t.componentId === 'data-table-view') || toggles[0];
                    const right = toggles.find(t => t.componentId === 'pipeline-canvas') || toggles[1] || toggles[0];
                    const items = [left, right];
                    return items.map((t, idx) => {
                      const isActive = rightComponent.componentId === t.componentId;
                      const isLeft = idx === 0;
                      const commonClasses = 'px-3 py-1.5 text-xs font-medium transition-colors inline-flex items-center justify-center';
                      const activeClasses = 'bg-white border border-[#E5E1D8] text-foreground shadow-sm';
                      const inactiveClasses = 'bg-transparent text-[#6B6A65] hover:text-foreground';
                      const radius = isLeft ? 'rounded-md' : 'rounded-md';
                      const onClick = () => handleToggle(t.componentId);
                      return (
                        <button
                          key={t.id || t.componentId}
                          onClick={onClick}
                          className={`${commonClasses} ${radius} ${isActive ? activeClasses : inactiveClasses}`}
                          title={t.title}
                          aria-label={t.title}
                          aria-pressed={isActive}
                        >
                          <span className="flex items-center justify-center">
                            {(() => {
                              const iconMap: Record<string, React.ComponentType<any>> = {
                                eye: Eye,
                                code: Code2,
                                table: TableIcon,
                                branch: GitBranch,
                                file: FileText,
                              };
                              const FallbackIcon = t.componentId === 'data-table-view' ? Eye
                                : t.componentId === 'pipeline-canvas' ? Code2
                                  : GitBranch;
                              const IconComp = (t.icon && iconMap[t.icon]) ? iconMap[t.icon] : FallbackIcon;
                              return <IconComp className="h-4 w-4" />;
                            })()}
                          </span>
                        </button>
                      );
                    });
                  })()}
                </div>
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
                onClose={handleDrawerClose}
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