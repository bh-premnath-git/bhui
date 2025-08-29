import React from 'react';
import { useAppDispatch } from '@/hooks/useRedux';
import { setContext, setOtherActions, clearMessages, setSelectedActionTitle } from '@/store/slices/chat/chatSlice';
import {  Plus, Database, ListChecks, MoreHorizontal, Users, Cable, Upload, BarChart3, FolderPlus, Settings } from 'lucide-react';
import SuggestionButton from '@/features/designers/pipeline/components/SuggestionButton';
import { ActionCategory, ActionItem } from '@/types/home/home';

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

  const handleCategoryClick = async (categoryId: string) => {
    // Map categories to actionIds used by chatService
    const categoryToActionId: Record<string, string> = {
      'create-pipeline': 'create-pipeline',
      'explore-data': 'explore-data',
      'check-jobs': 'check-job-statistics',
    };

    if (categoryId === 'other-items') {
      dispatch(setContext('other-items'));
      dispatch(setOtherActions(otherItemsActions));
      dispatch(clearMessages());
      return;
    }

    // For direct categories, immediately start the workflow (no extra click)
    const actionId = categoryToActionId[categoryId];
    dispatch(setOtherActions(null));
    dispatch(clearMessages());

    try {
      // Show the selected title in header/surface if needed
      const titles: Record<string, string> = {
        'create-pipeline': 'Create pipeline',
        'explore-data': 'Explore Data',
        'check-job-statistics': 'Check Job Statistics',
      };
      if (titles[actionId]) dispatch(setSelectedActionTitle(titles[actionId]));

      // Set context to action-* for consistency with ActionsList clicks
      dispatch(setContext(`action-${actionId}`));

      if (actionId === 'explore-data') {
        // For explore-data, only set context without triggering service call
        return;
      }

      const { getChatService } = await import('@/services/chatService');
      const chatService = getChatService(dispatch);
      await chatService.processAction(actionId);
    } catch (e) {
      // Fallback: at least set context so user sees conversation view
      dispatch(setContext(categoryId));
      console.error('Failed to start action from category click', e);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {categories.map((category, idx) => (
          <SuggestionButton
            key={category.id}
            text={category.title}
            onClick={() => handleCategoryClick(category.id)}
            index={idx}
            className="mr-1.5 sm:mr-2"
            icon={<category.icon className="w-4 h-4" />}
          />
        ))}
      </div>
    </div>
  );
};