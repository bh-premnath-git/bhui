import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Figma, Upload, Globe, X } from 'lucide-react';

interface ActionCategory {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  gradient: string;
}

const categories: ActionCategory[] = [
  {
    id: 'create-pipeline',
    title: 'Create pipeline...',
    icon: Camera,
    description: 'Build data processing pipelines',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'explore-data',
    title: 'Explore Data',
    icon: Figma,
    description: 'Analyze and visualize datasets',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'check-jobs',
    title: 'Check Jobs',
    icon: Upload,
    description: 'Monitor job status and statistics',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    id: 'other-items',
    title: 'Other Items',
    icon: Globe,
    description: 'Additional tools and features',
    gradient: 'from-orange-500 to-red-500',
  },
];

export const ActionCategories: React.FC = () => {
  const handleCategoryClick = (categoryId: string) => {
    console.log(`Selected category: ${categoryId}`);
    // TODO: Implement category-specific actions
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant="outline"
            onClick={() => handleCategoryClick(category.id)}
            className="h-24 p-4 bg-chat-surface/50 border-chat-border/50 hover:border-primary/30 hover:bg-chat-surface transition-smooth group relative overflow-hidden"
          >
            {/* Background Gradient Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-5 transition-smooth`} />
            
            <div className="relative z-10 flex flex-col items-center space-y-2 text-center">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${category.gradient} group-hover:scale-110 transition-bounce`}>
                <category.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-sm">{category.title}</p>
                <p className="text-xs text-muted-foreground">{category.description}</p>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};