import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setFeaturedProjects } from '@/store/slices/chat/communitySlice';
import type { CommunityProject } from '@/store/slices/chat/communitySlice';

// Mock data for widgets based on reference images
const widgets: CommunityProject[] = [
  {
    id: '1',
    title: 'Operations Dashboard Widgets',
    description: 'Operations dashboard widgets and monitoring tools',
    category: 'Operations',
    tags: ['Operations', 'Monitoring', 'Dashboard'],
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Data Governance Widgets',
    description: 'Data governance and compliance management widgets',
    category: 'Governance',
    tags: ['Governance', 'Compliance', 'Data Quality'],
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    title: 'Data Quality Widgets',
    description: 'Data quality metrics and validation widgets',
    category: 'Quality',
    tags: ['Data Quality', 'Validation', 'Metrics'],
    createdAt: new Date('2024-01-08'),
  },
  {
    id: '4',
    title: 'Pipeline Dashboard Widgets',
    description: 'Recent pipeline creation and management widgets',
    category: 'Pipelines',
    tags: ['Pipelines', 'ETL', 'Data Processing'],
    createdAt: new Date('2024-01-05'),
  },
];

export const CommunityShowcase: React.FC = () => {
  const { featuredProjects } = useAppSelector((state) => state.community);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize with mock data
    dispatch(setFeaturedProjects(widgets));
  }, [dispatch]);

  const handleViewWidget = (widgetId: string) => {
    console.log(`Viewing widget: ${widgetId}`);
    // TODO: Navigate to widget detail view
  };

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-end mb-8">
        <Button variant="ghost" className="text-primary hover:text-primary/80">
          Browse All
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredProjects.map((widget) => (
          <Card
            key={widget.id}
            className="cursor-pointer bg-chat-surface/50 border-chat-border/50 hover:border-primary/30 transition-smooth overflow-hidden"
            onClick={() => handleViewWidget(widget.id)}
          >
            <div className="group relative aspect-video bg-gradient-surface">
              {/* Widget Preview */}
              <div className="absolute inset-0 bg-muted/20 flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <ExternalLink className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">{widget.title}</p>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center">
                <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-smooth">
                  View Widget
                </Button>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Widget Info */}
                <div>
                  <h4 className="font-medium text-foreground hover:text-primary transition-smooth">
                    {widget.title}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {widget.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {widget.tags.slice(0, 2).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs bg-muted/50 hover:bg-muted"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {widget.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs bg-muted/50">
                      +{widget.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
