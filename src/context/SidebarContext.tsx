import React, { createContext, useContext, useState } from 'react';

interface SidebarContextType {
  isExpanded: boolean;
  toggleSidebar: () => void;
  isRightAsideOpen: boolean; 
  toggleRightAside: () => void;
  openRightAside: () => void;
  closeRightAside: () => void;
  isBottomDrawerOpen: boolean;
  toggleBottomDrawer: () => void;
  openBottomDrawer: () => void;
  closeBottomDrawer: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRightAsideOpen, setIsRightAsideOpen] = useState(false);
  const [isBottomDrawerOpen, setIsBottomDrawerOpen] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(prev => !prev);
  };

  const toggleRightAside = () => {
    setIsRightAsideOpen(prev => !prev);
  };

  const openRightAside = () => {
    setIsRightAsideOpen(true);
  };

  const closeRightAside = () => {
    setIsRightAsideOpen(false);
  };

  const toggleBottomDrawer = () => {
    setIsBottomDrawerOpen(prev => !prev);
  };

  const openBottomDrawer = () => {
    setIsBottomDrawerOpen(true);
  };

  const closeBottomDrawer = () => {
    setIsBottomDrawerOpen(false);
  };

  return (
    <SidebarContext.Provider 
      value={{ 
        isExpanded, 
        toggleSidebar, 
        isRightAsideOpen, 
        toggleRightAside,
        openRightAside,
        closeRightAside,
        isBottomDrawerOpen,
        toggleBottomDrawer,
        openBottomDrawer,
        closeBottomDrawer
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
