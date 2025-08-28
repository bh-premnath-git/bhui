import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Database, Plus, ListChecks, Users, BarChart3, FolderPlus, Settings, Cable, Upload } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { setSelectedActionTitle, setContext } from '@/store/slices/chat/chatSlice';

interface Action {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

type ActionsListProps = {
  variant?: 'card' | 'compact';
};

// Master actions library - all available actions
const ACTIONS: Record<string, Action> = {
  'add-users-roles': {
    id: 'add-users-roles',
    title: 'Add Users or roles',
    description: 'Manage user access and permissions',
    icon: Users,
  },
  'add-connections': {
    id: 'add-connections',
    title: 'Add new Connections',
    description: 'Connect to databases and data sources',
    icon: Cable,
  },
  'onboard-dataset': {
    id: 'onboard-dataset',
    title: 'Onboard new dataset',
    description: 'Import and configure new datasets',
    icon: Upload,
  },
  'create-pipeline': {
    id: 'create-pipeline',
    title: 'Create pipeline',
    description: 'Build data processing pipelines',
    icon: Plus,
  },
  'explore-data': {
    id: 'explore-data',
    title: 'Explore Data',
    description: 'Analyze and visualize your data',
    icon: Database,
  },
  'check-job-statistics': {
    id: 'check-job-statistics',
    title: 'Check Job Statistics',
    description: 'Monitor job performance and metrics',
    icon: BarChart3,
  },
  'add-project': {
    id: 'add-project',
    title: 'Add Project',
    description: 'Create and configure new projects',
    icon: FolderPlus,
  },
  'add-environment': {
    id: 'add-environment',
    title: 'Add Environment',
    description: 'Set up development and production environments',
    icon: Settings,
  },
};

// Mapping from selected category context -> which suggestion actions to show
const CONTEXT_TO_ACTION_IDS: Record<string, string[]> = {
  'create-pipeline': ['create-pipeline'],
  'explore-data': ['explore-data'],
  'check-jobs': ['check-job-statistics'],
  'other-items': [
    'add-users-roles',
    'add-connections', 
    'onboard-dataset',
    'add-project',
    'add-environment'
  ],
};

export const ActionsList: React.FC<ActionsListProps> = ({ variant = 'card' }) => {
  const dispatch = useAppDispatch();
  const context = useAppSelector((s) => s.chat.context);

  const actions = useMemo(() => {
    const ids = CONTEXT_TO_ACTION_IDS[context] || [];
    return ids.map((id) => ACTIONS[id]).filter(Boolean);
  }, [context]);

  const handleActionClick = async (actionId: string, actionTitle: string) => {
    // Set the selected action title and context
    dispatch(setSelectedActionTitle(actionTitle));
    dispatch(setContext(`action-${actionId}`));
    
    if (actionId === 'explore-data') {
      // For explore-data, only set context without triggering service call
      return;
    }
    
    // Optional: Handle with chat service if available
    try {
      const { getChatService } = await import('@/services/chatService');
      const chatService = getChatService(dispatch);
      await chatService.processAction(actionId);
    } catch (error) {
      console.log('Chat service not available, using fallback action handling');
    }
  };

  if (!actions.length) return null;

  if (variant === 'compact') {
    // Render small suggestion chips inline (for inside input panel)
    return (
      <div className="flex flex-wrap gap-2 pt-1">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={() => handleActionClick(action.id, action.title)}
            className="rounded-full h-8 px-3 border-chat-border/50 hover:border-primary/40 bg-background/60"
          >
            <action.icon className="h-3.5 w-3.5 mr-1.5 text-primary" />
            <span className="text-xs">{action.title}</span>
          </Button>
        ))}
      </div>
    );
  }

  // Default card variant
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-chat-surface/30 border-chat-border/50">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3">
            {actions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                onClick={() => handleActionClick(action.id, action.title)}
                className="w-full h-auto p-4 justify-between bg-background/50 hover:bg-background border-chat-border/30 hover:border-primary/30 transition-smooth group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-smooth">
                    <action.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-smooth" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};