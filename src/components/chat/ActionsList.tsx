import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Users, Database, Package, BarChart3, Search, TrendingUp } from 'lucide-react';

interface Action {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

// Actions from the second reference image
const actions: Action[] = [
  {
    id: 'add-users',
    title: 'Add Users or roles...',
    description: 'Manage user permissions and access control',
    icon: Users,
    category: 'User Management',
  },
  {
    id: 'add-connections',
    title: 'Add new Connections...',
    description: 'Connect to databases and data sources',
    icon: Database,
    category: 'Data Sources',
  },
  {
    id: 'onboard-dataset',
    title: 'Onboard new dataset...',
    description: 'Import and configure new datasets',
    icon: Package,
    category: 'Data Management',
  },
  {
    id: 'create-pipeline',
    title: 'Create pipeline...',
    description: 'Build data processing workflows',
    icon: BarChart3,
    category: 'Pipelines',
  },
  {
    id: 'explore-data',
    title: 'Explore Data...',
    description: 'Analyze and visualize your data',
    icon: Search,
    category: 'Analytics',
  },
  {
    id: 'check-statistics',
    title: 'Check Job Statistics...',
    description: 'Monitor job performance and metrics',
    icon: TrendingUp,
    category: 'Monitoring',
  },
];

export const ActionsList: React.FC = () => {
  const handleActionClick = (actionId: string) => {
    console.log(`Action clicked: ${actionId}`);
    // TODO: Implement action-specific logic
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <Card className="bg-chat-surface/30 border-chat-border/50">
        <CardContent className="p-6">
          <div className="space-y-3">
            {actions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                onClick={() => handleActionClick(action.id)}
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

          {/* Quick Text Input */}
          <div className="mt-6 pt-4 border-t border-chat-border/30">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Text..."
                className="flex-1 p-3 border border-chat-border/50 rounded-lg bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-smooth"
              />
              <Button size="sm" className="bg-primary text-primary-foreground">
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};