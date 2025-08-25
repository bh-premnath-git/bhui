import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';

interface ExploreDataComponentProps {
  query?: string;
}

export const ExploreDataComponent: React.FC<ExploreDataComponentProps> = ({ query }) => {
  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Database className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Data Exploration</CardTitle>
            {query && (
              <p className="text-sm text-muted-foreground mt-2">
                Query: "{query}"
              </p>
            )}
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              This is where your data exploration interface will be built.
            </p>
            <div className="bg-muted/30 rounded-lg p-8 border-2 border-dashed border-muted-foreground/20">
              <p className="text-sm text-muted-foreground">
                Data visualization and analysis tools coming soon...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
