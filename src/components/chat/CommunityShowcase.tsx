import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Heart, ExternalLink } from 'lucide-react';
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setFeaturedProjects, likeProject } from '@/store/slices/chat/communitySlice';
import type { CommunityProject } from '@/store/slices/chat/communitySlice';

// Mock data for widgets based on reference images
const mockProjects: CommunityProject[] = [
  {
    id: '1',
    title: 'Widgets (Ops Page)',
    description: 'Operations dashboard widgets and monitoring tools',
    category: 'Operations',
    imageUrl: '/lovable-uploads/c8ebfe8d-f07f-407a-9e10-83df4cf59c24.png',
    author: 'DataOps Team',
    likes: 178,
    tags: ['Operations', 'Monitoring', 'Dashboard'],
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Widgets (Data Governance Page)',
    description: 'Data governance and compliance management widgets',
    category: 'Governance',
    imageUrl: '/lovable-uploads/c8ebfe8d-f07f-407a-9e10-83df4cf59c24.png',
    author: 'Governance Team',
    likes: 234,
    tags: ['Governance', 'Compliance', 'Data Quality'],
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    title: 'Widgets (Data Quality Page)',
    description: 'Data quality metrics and validation widgets',
    category: 'Quality',
    imageUrl: '/lovable-uploads/c8ebfe8d-f07f-407a-9e10-83df4cf59c24.png',
    author: 'Quality Team',
    likes: 156,
    tags: ['Data Quality', 'Validation', 'Metrics'],
    createdAt: new Date('2024-01-08'),
  },
  {
    id: '4',
    title: 'Widgets (Pipelines recently created)',
    description: 'Recent pipeline creation and management widgets',
    category: 'Pipelines',
    imageUrl: '/lovable-uploads/c8ebfe8d-f07f-407a-9e10-83df4cf59c24.png',
    author: 'Pipeline Team',
    likes: 289,
    tags: ['Pipelines', 'ETL', 'Data Processing'],
    createdAt: new Date('2024-01-05'),
  },
];

export const CommunityShowcase: React.FC = () => {
  const { featuredProjects } = useAppSelector((state) => state.community);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize with mock data
    dispatch(setFeaturedProjects(mockProjects));
  }, [dispatch]);

  const handleLike = (projectId: string) => {
    dispatch(likeProject(projectId));
  };

  const handleViewProject = (projectId: string) => {
    console.log(`Viewing project: ${projectId}`);
    // TODO: Navigate to project detail view
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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredProjects.map((project) => (
          <Card
            key={project.id}
            className="group cursor-pointer bg-chat-surface/50 border-chat-border/50 hover:border-primary/30 transition-smooth overflow-hidden"
            onClick={() => handleViewProject(project.id)}
          >
            <div className="relative aspect-video bg-gradient-surface">
              {/* Project Preview */}
              <div className="absolute inset-0 bg-muted/20 flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <ExternalLink className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">{project.title}</p>
                </div>
              </div>
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center">
                <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-smooth">
                  View Project
                </Button>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Project Info */}
                <div>
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-smooth">
                    {project.title}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 2).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs bg-muted/50 hover:bg-muted"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {project.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs bg-muted/50">
                      +{project.tags.length - 2}
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