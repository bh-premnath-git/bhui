import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useChatController } from '@/context/ChatControllerContext';
import { closePanel } from '@/store/slices/chat/layoutSlice';
import { AppSplitter } from '@/components/splitter/AppSplitter';
import { ChatContent } from './ChatContent';
import { RendererHost } from './RendererHost';
import { InspectorPanel } from './InspectorPanel';
import { LAYOUT_DEFINITIONS, type LayoutNode, type SplitNode, type LeafNode } from './layout-model';

// Create panel registry to map component names to actual React elements
const createPanelRegistry = (
  layoutType: string,
  showMessages: boolean,
  onClosePanel?: () => void,
  onAssistantMessageClick?: (messageId: string) => void
): Record<string, React.ReactNode> => ({
  Content: <ChatContent
    showMessages={showMessages}
    onAssistantMessageClick={onAssistantMessageClick}
  />,
  Renderer: <RendererHost />,
  Inspector: <InspectorPanel />
});

function LeafView({ 
  node, 
  layoutType,
  showMessages,
  onClosePanel,
  onAssistantMessageClick
}: { 
  node: LeafNode; 
  layoutType: string;
  showMessages: boolean;
  onClosePanel?: () => void;
  onAssistantMessageClick?: (messageId: string) => void;
}) {
  const panelRegistry = createPanelRegistry(layoutType, showMessages, onClosePanel, onAssistantMessageClick);
  
  return (
    <div className="h-full min-h-0 w-full min-w-0 overflow-hidden flex flex-col">
      {panelRegistry[node.component] ?? (
        <div className="flex h-full w-full items-center justify-center p-3 text-muted-foreground">
          {node.component}
        </div>
      )}
    </div>
  );
}

function SplitView({
  node,
  routeKey,
  layoutType,
  showMessages,
  onClosePanel,
  onAssistantMessageClick,
}: {
  node: SplitNode;
  routeKey: string;
  layoutType: string;
  showMessages: boolean;
  onClosePanel?: () => void;
  onAssistantMessageClick?: (messageId: string) => void;
}) {
  const autoSaveId = useMemo(() => `${routeKey}:${node.id}`, [routeKey, node.id]);

  return (
    <div className="h-full min-h-0 w-full">
      <AppSplitter
        autoSaveId={autoSaveId}
        split={node.direction}
        preserveSide={node.preserveSide}
        defaultLayout={node.defaultLayout}
        className="h-full w-full"
        splitterClassName={node.direction === 'vertical' ? 'w-1' : 'h-1'}
        leftPanelMinSize={node.direction === 'vertical' ? 160 : 120}
        rightPanelMinSize={node.direction === 'vertical' ? (layoutType === '3C' ? 240 : 280) : 120}
        leftChildren={
          <SplitterLayoutRenderer 
            node={node.left} 
            routeKey={routeKey} 
            layoutType={layoutType}
            showMessages={showMessages}
            onClosePanel={onClosePanel} 
            onAssistantMessageClick={onAssistantMessageClick} 
          />
        }
        rightChildren={
          <SplitterLayoutRenderer 
            node={node.right} 
            routeKey={routeKey} 
            layoutType={layoutType}
            showMessages={showMessages}
            onClosePanel={onClosePanel} 
            onAssistantMessageClick={onAssistantMessageClick} 
          />
        }
      />
    </div>
  );
}

export function SplitterLayoutRenderer({
  node,
  routeKey,
  layoutType,
  showMessages,
  onClosePanel,
  onAssistantMessageClick,
}: {
  node: LayoutNode;
  routeKey: string;
  layoutType?: string;
  showMessages: boolean;
  onClosePanel?: () => void;
  onAssistantMessageClick?: (messageId: string) => void;
}) {
  // Determine layoutType from node structure if not provided
  const currentLayoutType = layoutType || getLayoutTypeFromNode(node);
  
  if (node.type === 'leaf') {
    return (
      <LeafView 
        node={node} 
        layoutType={currentLayoutType}
        showMessages={showMessages}
        onClosePanel={onClosePanel} 
        onAssistantMessageClick={onAssistantMessageClick} 
      />
    );
  }
  
  return (
    <SplitView 
      node={node} 
      routeKey={routeKey} 
      layoutType={currentLayoutType}
      showMessages={showMessages}
      onClosePanel={onClosePanel} 
      onAssistantMessageClick={onAssistantMessageClick} 
    />
  );
}

// Helper function to determine layout type from node structure
function getLayoutTypeFromNode(node: LayoutNode): string {
  if (node.type === 'leaf') return '1C';
  if (node.direction === 'vertical') {
    if (node.right.type === 'split' && node.right.direction === 'vertical') return '3C';
    return '2C';
  }
  return '2R';
}

// Main component that integrates with Redux state
export const LayoutRenderer = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { type: layoutType, isTransitioning } = useAppSelector(state => state.layout);
  const { view } = useAppSelector(state => state.home);
  
  // Show messages based on view, not layout type
  const showMessages = view === 'chat';
  
  // Get the layout definition for the current layout type
  const layoutNode = LAYOUT_DEFINITIONS[layoutType as keyof typeof LAYOUT_DEFINITIONS];
  
  const handleClosePanel = () => {
    dispatch(closePanel());
  };

  const { onAssistantMessageClick } = useChatController();

  const handleAssistantMessageClick = (messageId: string) => {
    onAssistantMessageClick(messageId);
  };

  // Use pathname as route key for auto-save
  const routeKey = location.pathname;

  return (
    <div className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-200 ${isTransitioning ? 'opacity-50' : ''}`}>
      <SplitterLayoutRenderer
        node={layoutNode}
        routeKey={routeKey}
        layoutType={layoutType}
        showMessages={showMessages}
        onClosePanel={handleClosePanel}
        onAssistantMessageClick={handleAssistantMessageClick}
      />
    </div>
  );
};