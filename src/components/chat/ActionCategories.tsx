import React from 'react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/hooks/useRedux';
import { setContext } from '@/store/slices/chat/chatSlice';
import { type LucideIcon, Plus, Database, ListChecks, MoreHorizontal } from 'lucide-react';

interface ActionCategory {
  id: string;
  title: string;
  icon: LucideIcon;
  action?: { id: number; title: string; icon: LucideIcon, chat?: any }[];
}

const categories: ActionCategory[] = [
  {
    id: 'other-items',
    title: 'Other Items',
    icon: MoreHorizontal,
  }
];

export const ActionCategories: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleCategoryClick = (categoryId: string) => {
    dispatch(setContext(categoryId));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant="ghost"
              onClick={() => handleCategoryClick(category.id)}
              className={`
    h-10 px-4 rounded-full border border-border
    bg-card text-card-foreground
    backdrop-blur-sm text-sm font-medium
    transition-all duration-300 ease-out
    hover:border-accent hover:bg-accent hover:text-accent-foreground
    hover:shadow-lg hover:shadow-black/20 hover:scale-105
    active:scale-95 group
  `}
              aria-label={category.title}
            >
              {/* Icon */}
              <Icon className="w-4 h-4 mr-2 text-current" />

              {/* Text */}
              <span className="relative z-10">{category.title}</span>
            </Button>

          );
        })}
      </div>
    </div>
  );
};