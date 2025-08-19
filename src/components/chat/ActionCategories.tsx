import React from 'react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/hooks/useRedux';
import { setContext } from '@/store/slices/chat/chatSlice';

interface ActionCategory {
  id: string;
  title: string;
  gradient: string;
}

const categories: ActionCategory[] = [
  {
    id: 'create-pipeline',
    title: 'Create pipeline...',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'explore-data',
    title: 'Explore Data',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'check-jobs',
    title: 'Check Jobs',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    id: 'other-items',
    title: 'Other Items',
    gradient: 'from-orange-500 to-red-500',
  },
];

export const ActionCategories: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleCategoryClick = (categoryId: string) => {
    dispatch(setContext(categoryId));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant="outline"
            onClick={() => handleCategoryClick(category.id)}
            className="h-16 p-4 bg-chat-surface/50 border-chat-border/50 hover:border-primary/30 hover:bg-chat-surface transition-smooth group relative overflow-hidden"
          >
            {/* Background Gradient Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-smooth`} />
            
            <div className="relative z-10 flex items-center justify-center text-center">
              <p className="font-medium text-sm">{category.title}</p>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};