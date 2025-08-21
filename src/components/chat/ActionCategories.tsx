import React from 'react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/hooks/useRedux';
import { setContext, setOtherActions } from '@/store/slices/chat/chatSlice';
import { type LucideIcon, Plus, Database, ListChecks, MoreHorizontal, Users, Cable, Upload, BarChart3, FolderPlus, Settings } from 'lucide-react';

interface ActionItem {
  id: number;
  title: string;
  icon: LucideIcon;
}

interface ActionCategory {
  id: string;
  title: string;
  icon: LucideIcon;
}

const categories: ActionCategory[] = [
  {
    id: 'create-pipeline',
    title: 'Create Pipeline',
    icon: Plus,
  },
  {
    id: 'explore-data',
    title: 'Explore Data',
    icon: Database,
  },
  {
    id: 'check-jobs',
    title: 'Check Jobs',
    icon: ListChecks,
  },
  {
    id: 'other-items',
    title: 'Other Items',
    icon: MoreHorizontal,
  },
];

const otherItemsActions: ActionItem[] = [
  { id: 1, title: "Add User or roles", icon: Users },
  { id: 2, title: "Add new Connection", icon: Cable },
  { id: 3, title: "Add new Project", icon: FolderPlus },
  { id: 4, title: "Add new Environment", icon: Settings },
  { id: 5, title: "Onboard new dataset", icon: Upload },
  { id: 6, title: "Create pipeline", icon: Plus },
  { id: 7, title: "Explore Data", icon: Database },
  { id: 8, title: "Check Job Statistics", icon: BarChart3 },
];

export const ActionCategories: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'other-items') {
      dispatch(setContext('other-items'));
      dispatch(setOtherActions(otherItemsActions));
    } else {
      dispatch(setOtherActions(null));
      dispatch(setContext(categoryId));
    }
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