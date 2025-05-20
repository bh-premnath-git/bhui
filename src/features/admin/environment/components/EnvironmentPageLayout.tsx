import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

interface EnvironmentPageLayoutProps {
  description: string;
  children: React.ReactNode;
}

export function EnvironmentPageLayout({ description, children }: EnvironmentPageLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-2 m-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-muted-foreground mt-5">{description}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.ADMIN.ENVIRONMENT.INDEX)}
          className="shrink-0"
        >
          View All Environments
        </Button>
      </div>
      <div className="bg-card border rounded-lg shadow-sm">
        {children}
      </div>
    </div>
  );
}
