import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  isExpanded: boolean;
  toggleSidebar: () => void;
  
  // Right Aside state
  isRightAsideOpen: boolean; 
  toggleRightAside: () => void;
  openRightAside: () => void;
  closeRightAside: () => void;
  rightAsideContent: ReactNode | null;
  rightAsideTitle: string;
  setRightAsideContent: (content: ReactNode, title?: string) => void;
  
  // Bottom Drawer state
  isBottomDrawerOpen: boolean;
  toggleBottomDrawer: () => void;
  openBottomDrawer: () => void;
  closeBottomDrawer: () => void;
  bottomDrawerContent: ReactNode | null;
  bottomDrawerTitle: string;
  setBottomDrawerContent: (content: ReactNode, title?: string) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Right Aside state
  const [isRightAsideOpen, setIsRightAsideOpen] = useState(false);
  const [rightAsideContent, setRightAsideContentState] = useState<ReactNode | null>(null);
  const [rightAsideTitle, setRightAsideTitle] = useState('Details');
  
  // Bottom Drawer state
  const [isBottomDrawerOpen, setIsBottomDrawerOpen] = useState(false);
  const [bottomDrawerContent, setBottomDrawerContentState] = useState<ReactNode | null>(null);
  const [bottomDrawerTitle, setBottomDrawerTitle] = useState('Console');

  const toggleSidebar = () => {
    setIsExpanded(prev => !prev);
  };

  // Right Aside methods
  const toggleRightAside = () => {
    setIsRightAsideOpen(prev => !prev);
  };

  const openRightAside = () => {
    setIsRightAsideOpen(true);
  };

  const closeRightAside = () => {
    setIsRightAsideOpen(false);
  };
  
  const setRightAsideContent = (content: ReactNode, title?: string) => {
    setRightAsideContentState(content);
    if (title) setRightAsideTitle(title);
    if (content) openRightAside();
  };

  // Bottom Drawer methods
  const toggleBottomDrawer = () => {
    setIsBottomDrawerOpen(prev => !prev);
  };

  const openBottomDrawer = () => {
    setIsBottomDrawerOpen(true);
  };

  const closeBottomDrawer = () => {
    setIsBottomDrawerOpen(false);
  };
  
  const setBottomDrawerContent = (content: ReactNode, title?: string) => {
    setBottomDrawerContentState(content);
    if (title) setBottomDrawerTitle(title);
    if (content) openBottomDrawer();
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
        rightAsideContent,
        rightAsideTitle,
        setRightAsideContent,
        
        isBottomDrawerOpen,
        toggleBottomDrawer,
        openBottomDrawer,
        closeBottomDrawer,
        bottomDrawerContent,
        bottomDrawerTitle,
        setBottomDrawerContent
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
