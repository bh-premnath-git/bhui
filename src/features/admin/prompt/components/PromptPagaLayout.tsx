
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

interface ProjectPageLayoutProps {
  description: string;
  children: React.ReactNode;
}

export function PromptPageLayout({ description, children }: ProjectPageLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-2 m-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-muted-foreground mt-5">{description}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.ADMIN.PROMPT.INDEX)}
          className="shrink-0"
        >
          View All Prompt
        </Button>
      </div>
      <div className="bg-card border rounded-lg shadow-sm">
        {children}
      </div>
    </div>
  );
}
