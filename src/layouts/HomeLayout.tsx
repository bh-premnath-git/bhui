// src/layouts/HomeLayout.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { WidgetShowcase } from "@/components/chat/WidgetShowcase";
import { RightAsideComponent } from "@/components/chat/RightAsideComponent";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { clearMessages, setContext, setOtherActions, setSelectedActionTitle, setCurrentInput } from "@/store/slices/chat/chatSlice";
import { useRecommendation } from '@/hooks/useRecommendation'
import { sizeToPixels, createSizeContext } from "@/lib/sizeHelper";

type ActionItem = {
  id: string;
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export const HomeLayout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { context, messages, otherActions, layoutMode, selectedConnection } = useAppSelector((s) => s.chat);
  const dispatch = useAppDispatch();
  const { data: recommendedSuggestions, isLoading: isLoadingRecommendations, isError: isRecommendationsError } = useRecommendation(
      'explorer',
      selectedConnection?.id
    );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [rightWidth, setRightWidth] = useState<number | null>(null);
  const isDraggingRef = useRef(false);

  const toggleSidebar = () => setSidebarOpen((x) => !x);

  const handleNewChat = () => {
    dispatch(setContext(""));
    dispatch(setOtherActions(null));
    dispatch(setSelectedActionTitle(null));
    dispatch(clearMessages());
  };

  const handleSuggestionClick = (suggestion: string) => {
    dispatch(setCurrentInput(suggestion));
  };

  // ----- Resizable right pane setup -----
  useEffect(() => {
    if (layoutMode !== "split" || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rightWidth === null) {
      const handleWidth = 8;
      const ctx = createSizeContext(rect.width);
      // CHANGED: prefer 70% when exploring data
      const desiredStr = context === 'action-explore-data' ? '70%' : '50%'; // CHANGED
      const minRightStr = context === 'action-explore-data' ? '750px' : '300px';
      const desired = sizeToPixels(desiredStr, ctx);
      const minRight = sizeToPixels(minRightStr, ctx);
      const minLeft = 420;
      const initial = Math.max(minRight, Math.floor(desired));
      const clamped = Math.min(Math.max(initial, minRight), rect.width - handleWidth - minLeft);
      setRightWidth(clamped);
    }
  }, [layoutMode, rightWidth, context]);

  useEffect(() => {
    if (!containerRef.current || rightWidth == null) return;
    const rect = containerRef.current.getBoundingClientRect();
    const handleWidth = 8;
    const ctx = createSizeContext(rect.width);
    const minRight = sizeToPixels(context === 'action-explore-data' ? '750px' : '300px', ctx);
    const minLeft = 420;
    const clamped = Math.min(Math.max(rightWidth, minRight), rect.width - handleWidth - minLeft);
    if (clamped !== rightWidth) setRightWidth(clamped);
  }, [context, rightWidth]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const handleWidth = 8;
      const ctx = createSizeContext(rect.width);
      const minRight = sizeToPixels(context === 'action-explore-data' ? '750px' : '300px', ctx);
      const minLeft = 420;
      let newRight = rect.right - e.clientX - handleWidth / 2;
      newRight = Math.min(Math.max(newRight, minRight), rect.width - handleWidth - minLeft);
      setRightWidth(newRight);
    };
    const onUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.cursor = "";
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [context]);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = "col-resize";
  };

  const clampRight = (val: number, rect: DOMRect, handleWidth = 8) => {
    const ctx = createSizeContext(rect.width);
    const minRight = sizeToPixels(context === 'action-explore-data' ? '750px' : '300px', ctx);
    const minLeft = 420;
    return Math.min(Math.max(val, minRight), rect.width - handleWidth - minLeft);
  };

  const handleKeyResize = (e: React.KeyboardEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const step = 24;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      setRightWidth((prev) => {
        const base = prev ?? Math.max(360, Math.floor(rect.width / 2));
        const delta = e.key === "ArrowRight" ? step : -step;
        return clampRight(base + delta, rect);
      });
    }
  };

  const OtherActionsPanel: React.FC<{ items: ActionItem[] }> = ({ items }) => {
    const titleToActionId: Record<string, string> = useMemo(
      () => ({
        "Add User or roles": "add-users-roles",
        "Add new Connection": "add-connections",
        "Add new Project": "add-project",
        "Add new Environment": "add-environment",
        "Onboard new dataset": "onboard-dataset",
        "Create pipeline": "create-pipeline",
        "Explore Data": "explore-data",
        "Check Job Statistics": "check-job-statistics",
      }),
      []
    );

    return (
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Choose an action:</h3>
        <div className="grid grid-cols-1 gap-2">
          {items.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={async () => {
                  const actionId = titleToActionId[action.title];
                  dispatch(setOtherActions(null));
                  dispatch(setSelectedActionTitle(action.title));
                  
                  if (actionId === 'explore-data') {
                    dispatch(clearMessages());
                    dispatch(setContext(`action-${actionId}`));
                  } else {
                    try {
                      const { getChatService } = await import("@/services/chatService");
                      const chatService = getChatService(dispatch);
                      await chatService.processAction(actionId);
                    } catch (e) {
                      console.error("Failed to process action", e);
                    }
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
    );
  };

  // ----- Onboarding (no context selected) -----
  if (!context) {
    return (
      <div className="flex h-[calc(100vh-4rem)] bg-chat-background">
        <ChatSidebar
          open={sidebarOpen}
          onToggle={toggleSidebar}
          onNewChat={handleNewChat}
          onSelectChat={() => {}}
        />
        <main className="flex-1 flex flex-col">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="space-y-10">
              <div className="text-center space-y-8">
                <ChatHeader />
                <ChatInput />
              </div>
              <WidgetShowcase />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ----- Split layout -----
  if (layoutMode === "split") {
    return (
      <div className="flex h-[calc(100vh-4rem)] bg-chat-background">
        <ChatSidebar
          open={sidebarOpen}
          onToggle={toggleSidebar}
          onNewChat={handleNewChat}
          onSelectChat={() => {}}
        />
        <div ref={containerRef} className="flex flex-1 h-full">
          {/* Left: Chat area */}
          <div className="flex flex-col flex-1 border-r border-chat-border/50">
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col h-full px-4 py-4">
                {context === "other-items" && otherActions && (
                  <OtherActionsPanel items={otherActions as unknown as ActionItem[]} />
                )}

                {messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <p className="text-muted-foreground text-sm">
                        {context === "other-items"
                          ? "Select an action above or start typing..."
                          : context === "action-explore-data"
                          ? selectedConnection
                            ? `Ask about data in ${selectedConnection.connection_config_name}`
                            : 'Ask me about your data'
                          : `Start your conversation about ${context.replace("-", " ")}...`}
                      </p>
                      {context === "action-explore-data" && selectedConnection && (
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground/80">Try these suggestions:</p>
                          <div className="flex flex-col gap-2 max-w-md">
                            {isLoadingRecommendations ? (
                              <div className="px-4 py-2 text-sm bg-muted/30 rounded-lg border border-border/50 text-center">
                                Loading suggestions...
                              </div>
                            ) : isRecommendationsError ? (
                              <div className="px-4 py-2 text-sm bg-destructive/10 rounded-lg border border-destructive/20 text-center text-destructive">
                                Failed to load suggestions
                              </div>
                            ) : recommendedSuggestions && recommendedSuggestions.length > 0 ? (
                              recommendedSuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  className="px-4 py-2 text-sm bg-muted/50 hover:bg-muted rounded-lg border border-border/50 hover:border-border transition-colors text-left"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                >
                                  "{suggestion}"
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-2 text-sm bg-muted/30 rounded-lg border border-border/50 text-center">
                                No suggestions available
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 pb-2">{children}</div>
                )}
              </div>
            </div>

            <div className="border-t border-chat-border/20 bg-background/80 backdrop-blur-sm sticky bottom-0">
              <div className="p-2">
                <ChatInput />
              </div>
            </div>
          </div>

          {/* Right: Aside with floating handle */}
          <div
            className="bg-background relative"
            // CHANGED: fallback width now 70% when exploring data
            style={{
              width: rightWidth ? `${rightWidth}px` : (context === 'action-explore-data' ? '70%' : '50%'), // CHANGED
              minWidth: context === 'action-explore-data' ? '750px' : '300px'
            }}
          >
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Drag to resize panel"
              tabIndex={0}
              onMouseDown={startResize}
              onKeyDown={handleKeyResize}
              className="absolute top-0 left-0 h-full w-0 select-none group"
              style={{ cursor: "col-resize" }}
            >
              <div
                className="absolute top-1/2 -translate-y-1/2 -left-4 pointer-events-none"
                style={{ zIndex: 1 }}
              >
                <div className="h-9 w-9 rounded-full bg-background/80 ring-1 ring-border/50 shadow-sm grid place-items-center transition-all group-hover:bg-muted/70 group-hover:ring-border">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="absolute top-0 -left-2 h-full w-4" style={{ cursor: "col-resize" }} />
            </div>

            <RightAsideComponent />
          </div>
        </div>
      </div>
    );
  }

  // ----- Full layout -----
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-chat-background">
      <ChatSidebar
        open={sidebarOpen}
        onToggle={toggleSidebar}
        onNewChat={handleNewChat}
        onSelectChat={() => {}}
      />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col container mx-auto px-4 max-w-4xl py-6">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  {context === "other-items"
                    ? "Select an action above or start typing..."
                    : context === "action-explore-data"
                    ? selectedConnection
                      ? `Ask about data in ${selectedConnection.connection_config_name}`
                      : 'Ask me about your data'
                    : `Start your conversation about ${context.replace("-", " ")}...`}
                </p>
                {context === "action-explore-data" && selectedConnection && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground/80">Try these suggestions:</p>
                    <div className="flex flex-col gap-2 max-w-md mx-auto">
                      {isLoadingRecommendations ? (
                        <div className="px-4 py-2 text-sm bg-muted/30 rounded-lg border border-border/50 text-center">
                          Loading suggestions...
                        </div>
                      ) : isRecommendationsError ? (
                        <div className="px-4 py-2 text-sm bg-destructive/10 rounded-lg border border-destructive/20 text-center text-destructive">
                          Failed to load suggestions
                        </div>
                      ) : recommendedSuggestions && recommendedSuggestions.length > 0 ? (
                        recommendedSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            className="px-4 py-2 text-sm bg-muted/50 hover:bg-muted rounded-lg border border-border/50 hover:border-border transition-colors text-left"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            "{suggestion}"
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm bg-muted/30 rounded-lg border border-border/50 text-center">
                          No suggestions available
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 pb-2">{children}</div>
          )}
        </div>
        <div className="border-t border-chat-border/20 bg-background/80 backdrop-blur-sm sticky bottom-0">
          <div className="container mx-auto px-4 py-2 max-w-4xl">
            <ChatInput />
          </div>
        </div>
      </main>
    </div>
  );
};
