import React, { useState, useEffect, useRef } from 'react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';

import { ChatInput } from '@/components/chat/ChatInput';
import { ActionCategories } from '@/components/chat/ActionCategories';
import { CommunityShowcase } from '@/components/chat/CommunityShowcase';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { RightAsideComponent } from '@/components/chat/RightAsideComponent';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { setContext, setOtherActions, setSelectedActionTitle, clearMessages } from '@/store/slices/chat/chatSlice';

// Example for centered/empty state
const Home: React.FC = () => {
  const { context, messages, otherActions, selectedActionTitle, layoutMode } = useAppSelector((state) => state.chat);
  const dispatch = useAppDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Resizable right panel state
  const containerRef = useRef<HTMLDivElement>(null);
  const [rightWidth, setRightWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ui.rightAsideWidth');
      const parsed = saved ? parseInt(saved, 10) : NaN;
      return Number.isFinite(parsed) ? parsed : 560; // default width in px
    } catch {
      return 560;
    }
  });
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const lastExpandedWidthRef = useRef<number>(560);
  const rafIdRef = useRef<number | null>(null);

  const clampWidth = (w: number) => {
    const containerWidth = containerRef.current?.clientWidth ?? window.innerWidth;
    const minRight = 300; // match min-w-[300px]
    const minLeft = 360; // keep chat area usable
    const maxRight = Math.max(minRight, containerWidth - minLeft);
    return Math.min(Math.max(w, minRight), maxRight);
  };

  useEffect(() => {
    const handleResize = () => setRightWidth((w) => clampWidth(w));
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Collapse/expand persistence
  useEffect(() => {
    try {
      const savedCollapsed = localStorage.getItem('ui.rightAsideCollapsed');
      if (savedCollapsed === 'true') {
        setIsCollapsed(true);
      }
      const savedLast = localStorage.getItem('ui.rightAsideLastExpandedWidth');
      if (savedLast) lastExpandedWidthRef.current = parseInt(savedLast, 10) || lastExpandedWidthRef.current;
    } catch {}
  }, []);

  useEffect(() => {
    if (!isResizing) return;
    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startXRef.current;
      const next = clampWidth(startWidthRef.current - dx);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => setRightWidth(next));
    };
    const onMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      try {
        localStorage.setItem('ui.rightAsideWidth', String(rightWidth));
        localStorage.setItem('ui.rightAsideCollapsed', String(isCollapsed));
        if (!isCollapsed) {
          lastExpandedWidthRef.current = rightWidth;
          localStorage.setItem('ui.rightAsideLastExpandedWidth', String(rightWidth));
        }
      } catch {}
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing, rightWidth]);

  useEffect(() => {
    if (!isResizing) return;
    const onTouchMove = (e: TouchEvent) => {
      const x = e.touches[0]?.clientX ?? startXRef.current;
      const dx = x - startXRef.current;
      const next = clampWidth(startWidthRef.current - dx);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => setRightWidth(next));
    };
    const onTouchEnd = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      try {
        localStorage.setItem('ui.rightAsideWidth', String(rightWidth));
        localStorage.setItem('ui.rightAsideCollapsed', String(isCollapsed));
        if (!isCollapsed) {
          lastExpandedWidthRef.current = rightWidth;
          localStorage.setItem('ui.rightAsideLastExpandedWidth', String(rightWidth));
        }
      } catch {}
    };
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isResizing, rightWidth]);

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = rightWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleResizeTouchStart = (e: React.TouchEvent) => {
    setIsResizing(true);
    startXRef.current = e.touches[0]?.clientX ?? 0;
    startWidthRef.current = rightWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleNewChat = () => {
    dispatch(setContext(''));
    dispatch(setOtherActions(null));
    dispatch(setSelectedActionTitle(null));
    dispatch(clearMessages());
  };

  const handleToggleSidebar = () => setSidebarOpen((open) => !open);

  // Optionally handle chat history item click
  const handleSelectChat = (id: number) => {
    // Add context switch logic here if needed
  };

  // No context selected - show onboarding/centered layout
  if (!context) {
    return (
      <div className="flex h-screen bg-chat-background">
        <ChatSidebar
          open={sidebarOpen}
          onToggle={handleToggleSidebar}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
        />
        <main className="flex-1 flex flex-col items-center justify-center">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-10">
              <div className="text-center space-y-8">

                <ChatInput />
                <ActionCategories />
              </div>
              <CommunityShowcase />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Split layout mode
  if (layoutMode === 'split') {
    return (
      <div className="flex h-screen bg-chat-background">
        <ChatSidebar
          open={sidebarOpen}
          onToggle={handleToggleSidebar}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
        />
        <div className="flex flex-1 h-full" ref={containerRef}>
          {/* Left Panel - Chat */}
          <div className="flex flex-col flex-1 border-r border-chat-border/50">
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col h-full px-4 py-4">
                {/* {context === 'other-items' && otherActions && (
                  <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-6 flex-shrink-0">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Choose an action:</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {otherActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={action.id}
                            onClick={() => {
                              dispatch(setContext(`action-${action.id}`));
                              dispatch(setOtherActions(null));
                              dispatch(setSelectedActionTitle(action.title));
                            }}
                            className="justify-start h-10 px-3 text-sm hover:bg-accent hover:text-accent-foreground rounded-lg border border-transparent hover:border-border flex items-center"
                          >
                            <Icon className="w-4 h-4 mr-3 text-current" />
                            <span>{action.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )} */}

                {messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">
                      {context === 'other-items'
                        ? 'Select an action above or start typing...'
                        : `Start your conversation about ${context.replace('-', ' ')}...`}
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 pb-4">
                    <ChatMessages />
                  </div>
                )}
              </div>
            </div>
            <div className="bg-background/80 backdrop-blur-sm sticky bottom-0">
              <div className="p-4">
                <ChatInput />
              </div>
            </div>
          </div>
          {/* Right Panel - Component */}
          {/* Resizable container with a draggable handle */}
          <div
            className={`relative flex items-stretch transition-[width] duration-150 ease-out ${isCollapsed ? 'overflow-hidden' : ''}`}
            style={{ width: isCollapsed ? 40 : rightWidth }}
          >
            {/* Drag Handle */}
            <div
              role="separator"
              aria-orientation="vertical"
              onMouseDown={handleResizeMouseDown}
              onTouchStart={handleResizeTouchStart}
              className={`absolute ${isCollapsed ? 'left-0' : 'left-[-6px]'} top-0 h-full ${isCollapsed ? 'w-2' : 'w-3'} cursor-col-resize select-none z-10`}
            >
              {/* Visual handle line with hover/active effects */}
              <div
                className={`mx-auto h-full w-px bg-chat-border/40 transition-colors ${
                  isResizing ? 'bg-primary/60' : 'hover:bg-primary/40'
                }`}
              />
            </div>

            {/* Content wrapper with collapse behavior */}
            <div className={`h-full ${isCollapsed ? 'w-0' : 'min-w-[300px] flex-1'} bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 ring-1 ring-border/20`}> 
              {/* Top bar with collapse/expand button */}
              <div className="h-8 flex items-center justify-end px-2 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
                <button
                  onClick={() => {
                    if (isCollapsed) {
                      setIsCollapsed(false);
                      const newWidth = clampWidth(lastExpandedWidthRef.current || rightWidth || 560);
                      setRightWidth(newWidth);
                      try {
                        localStorage.setItem('ui.rightAsideCollapsed', 'false');
                        localStorage.setItem('ui.rightAsideWidth', String(newWidth));
                      } catch {}
                    } else {
                      setIsCollapsed(true);
                      lastExpandedWidthRef.current = rightWidth;
                      try {
                        localStorage.setItem('ui.rightAsideCollapsed', 'true');
                        localStorage.setItem('ui.rightAsideLastExpandedWidth', String(rightWidth));
                      } catch {}
                    }
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                  title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
                >
                  {isCollapsed ? 'Expand' : 'Collapse'}
                </button>
              </div>
              <div className={`${isCollapsed ? 'hidden' : 'block'} h-[calc(100%-2rem)]`}>
                <RightAsideComponent />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full-screen chat mode
  return (
    <div className="flex h-screen bg-chat-background">
      <ChatSidebar
        open={sidebarOpen}
        onToggle={handleToggleSidebar}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col container mx-auto px-4 max-w-4xl py-6">
          {/* {context === 'other-items' && otherActions && (
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-6 flex-shrink-0">
              <h3 className="text-sm font-semibold text-foreground mb-3">Choose an action:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {otherActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        dispatch(setContext(`action-${action.id}`));
                        dispatch(setOtherActions(null));
                        dispatch(setSelectedActionTitle(action.title));
                      }}
                      className="justify-start h-12 px-3 text-sm hover:bg-accent hover:text-accent-foreground rounded-lg border border-transparent hover:border-border flex items-center"
                    >
                      <Icon className="w-4 h-4 mr-3 text-current" />
                      <span>{action.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )} */}
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">
                {context === 'other-items'
                  ? 'Select an action above or start typing...'
                  : `Start your conversation about ${context.replace('-', ' ')}...`}
              </p>
            </div>
          ) : (
            <div className="flex-1 pb-4">
              <ChatMessages />
            </div>
          )}
        </div>
        <div className="border-t border-chat-border/20 bg-background/80 backdrop-blur-sm sticky bottom-0">
          <div className="container mx-auto px-4 py-4 max-w-4xl">
            <ChatInput />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;