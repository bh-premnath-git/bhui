
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

interface ProjectPageLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function ProjectPageLayout({ title, description, children }: ProjectPageLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.ADMIN.PROJECTS.INDEX)}
          className="shrink-0"
        >
          View All Projects
        </Button>
      </div>
      <div className="bg-card border rounded-lg shadow-sm">
        {children}
      </div>
    </div>
  );
}
