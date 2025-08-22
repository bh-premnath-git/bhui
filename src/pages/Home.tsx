import React, { useState, useRef, useEffect } from 'react';
import { GripVertical } from 'lucide-react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Resizable right panel state/refs (for split layout)
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [rightWidth, setRightWidth] = useState<number | null>(null);
  const isDraggingRef = useRef(false);

  // Initialize default right panel width when split layout mounts
  useEffect(() => {
    if (layoutMode !== 'split' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rightWidth === null) {
      setRightWidth(Math.max(360, Math.floor(rect.width / 2)));
    }
  }, [layoutMode, rightWidth]);

  // Handle drag to resize right panel
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const handleWidth = 8; // px
      const minRight = 300;  // px
      const minLeft = 420;   // px to keep chat usable

      let newRight = rect.right - e.clientX - handleWidth / 2;
      newRight = Math.min(Math.max(newRight, minRight), rect.width - handleWidth - minLeft);
      setRightWidth(newRight);
    };

    const onUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
  };

  // Clamp helper to respect min widths
  const clampRight = (val: number, rect: DOMRect, handleWidth = 8) => {
    const minRight = 300;
    const minLeft = 420;
    return Math.min(Math.max(val, minRight), rect.width - handleWidth - minLeft);
  };

  // Keyboard accessibility for resizing
  const handleKeyResize = (e: React.KeyboardEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const step = 24; // px per key press
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      setRightWidth((prev) => {
        const base = prev ?? Math.max(360, Math.floor(rect.width / 2));
        const delta = e.key === 'ArrowRight' ? step : -step;
        return clampRight(base + delta, rect);
      });
    }
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
        <main className="flex-1 flex flex-col">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="space-y-10">
              {/* Header + Input + Categories */}
              <div className="text-center space-y-8">
                <ChatHeader />
                <ChatInput />
                
              </div>

              {/* Community Showcase (widgets grid) */}
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
        <div ref={containerRef} className="flex flex-1 h-full">
          {/* Left Panel - Chat */}
          <div className="flex flex-col flex-1 border-r border-chat-border/50">
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col h-full px-4 py-4">
                {context === 'other-items' && otherActions && (
                  <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-6 flex-shrink-0">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Choose an action:</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {otherActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={action.id}
                            onClick={async () => {
                              const titleToActionId: Record<string, string> = {
                                'Add User or roles': 'add-users-roles',
                                'Add new Connection': 'add-connections',
                                'Add new Project': 'add-project',
                                'Add new Environment': 'add-environment',
                                'Onboard new dataset': 'onboard-dataset',
                                'Create pipeline': 'create-pipeline',
                                'Explore Data': 'explore-data',
                                'Check Job Statistics': 'check-job-statistics',
                              };
                              const actionId = titleToActionId[action.title];
                              dispatch(setOtherActions(null));
                              dispatch(setSelectedActionTitle(action.title));
                              try {
                                const { getChatService } = await import('@/services/chatService');
                                const chatService = getChatService(dispatch);
                                await chatService.processAction(actionId);
                              } catch (e) {
                                console.error('Failed to process action', e);
                              }
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
                )}

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
            <div className="border-t border-chat-border/20 bg-background/80 backdrop-blur-sm sticky bottom-0">
              <div className="p-4">
                <ChatInput />
              </div>
            </div>
          </div>

          {/* Right Panel - Component with overlayed handle (no extra layout width) */}
          <div
            className="bg-background relative"
            style={{
              width: rightWidth ? `${rightWidth}px` : '50%',
              minWidth: 300,
            }}
          >
            {/* Absolutely positioned handle sitting on the left edge of right panel */}
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Drag to resize panel"
              tabIndex={0}
              onMouseDown={startResize}
              onKeyDown={handleKeyResize}
              className="absolute top-0 left-0 h-full w-0 select-none group"
              style={{ cursor: 'col-resize' }}
            >
              {/* Centered circular grip that floats, no width taken */}
              <div className="absolute top-1/2 -translate-y-1/2 -left-4 pointer-events-none" style={{zIndex: 1}}>
                <div className="h-9 w-9 rounded-full bg-background/80 ring-1 ring-border/50 shadow-sm grid place-items-center transition-all group-hover:bg-muted/70 group-hover:ring-border">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              {/* Expand the draggable hit area invisibly for usability */}
              <div className="absolute top-0 -left-2 h-full w-4" style={{ cursor: 'col-resize' }} />
            </div>

            <RightAsideComponent />
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