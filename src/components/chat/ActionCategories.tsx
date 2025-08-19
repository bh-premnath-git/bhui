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
    title: 'Create Pipeline',
    gradient: 'from-blue-500 via-blue-600 to-cyan-500',
  },
  {
    id: 'explore-data',
    title: 'Explore Data',
    gradient: 'from-purple-500 via-purple-600 to-pink-500',
  },
  {
    id: 'check-jobs',
    title: 'Check Jobs',
    gradient: 'from-green-500 via-green-600 to-emerald-500',
  },
  {
    id: 'other-items',
    title: 'Other Items',
    gradient: 'from-orange-500 via-orange-600 to-red-500',
  },
];

export const ActionCategories: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleCategoryClick = (categoryId: string) => {
    dispatch(setContext(categoryId));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant="ghost"
            onClick={() => handleCategoryClick(category.id)}
            className="
              h-10 px-4 rounded-full border border-white/10
              bg-gradient-to-br from-white/5 to-white/[0.02]
              backdrop-blur-sm text-sm font-medium
              transition-all duration-300 ease-out
              hover:border-white/20 hover:from-white/10 hover:to-white/[0.05]
              hover:shadow-lg hover:shadow-black/10 hover:scale-105
              active:scale-95 group relative overflow-hidden
            "
          >
            {/* Gradient Overlay */}
            <div className={`
              absolute inset-0 rounded-full bg-gradient-to-br ${category.gradient} 
              opacity-15 group-hover:opacity-30 
              transition-all duration-300 group-hover:scale-110
            `} />
            
            {/* Text */}
            <span className="relative z-10 text-foreground group-hover:text-white transition-colors duration-300">
              {category.title}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};