import React from 'react';
import { Button } from "@/components/ui/button";

interface TabButtonsProps {
  activeTab: 'property' | 'settings';
  onTabChange: (tab: 'property' | 'settings') => void;
}

export const TabButtons: React.FC<TabButtonsProps> = React.memo(({ activeTab, onTabChange }) => (
  <div className="flex gap-2">
    <Button
      variant={activeTab === 'property' ? 'default' : 'secondary'}
      onClick={() => onTabChange('property')}
    >
      Property
    </Button>
    <Button
      variant={activeTab === 'settings' ? 'default' : 'secondary'}
      onClick={() => onTabChange('settings')}
    >
      Settings
    </Button>
  </div>
));

TabButtons.displayName = 'TabButtons';