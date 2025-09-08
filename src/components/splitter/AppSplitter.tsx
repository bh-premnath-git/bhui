import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { 
  sizeToPixels, 
  createSizeContext, 
  validateSize, 
  easingFunctions,
  type SizeValue 
} from '@/lib/sizeHelper';

export interface AppSplitterProps {
  autoSaveId: string;
  split: 'vertical' | 'horizontal';
  preserveSide: 'left' | 'right';
  defaultLayout: [SizeValue, SizeValue];
  className?: string;
  splitterClassName?: string;
  leftPanelMinSize?: SizeValue;
  rightPanelMinSize?: SizeValue;
  leftChildren: React.ReactNode;
  rightChildren: React.ReactNode;
  animationDuration?: number;
  animationEasing?: keyof typeof easingFunctions;
}

const AppSplitterComponent: React.FC<AppSplitterProps> = ({
  autoSaveId,
  split,
  preserveSide,
  defaultLayout,
  className,
  splitterClassName,
  leftPanelMinSize = 160,
  rightPanelMinSize = 160,
  leftChildren,
  rightChildren,
  animationDuration = 200,
  animationEasing = 'easeInOutCubic',
}) => {
  const [sizes, setSizes] = useState<[SizeValue, SizeValue]>(() => {
    // Validate default layout on initialization
    const [left, right] = defaultLayout;
    return [
      validateSize(left) ? left : '50%',
      validateSize(right) ? right : 'auto'
    ];
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const moveHandlerRef = useRef<(e: MouseEvent) => void>();
  const upHandlerRef = useRef<() => void>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Load saved layout on mount with validation
  useEffect(() => {
    const saved = localStorage.getItem(`splitter-${autoSaveId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 2) {
          const [left, right] = parsed;
          if (validateSize(left) && validateSize(right)) {
            setSizes([left, right]);
          }
        }
      } catch {
        // Ignore invalid saved data
        console.warn(`Invalid saved splitter data for ${autoSaveId}`);
      }
    }
  }, [autoSaveId]);

  // Save layout when sizes change with validation
  const saveLayout = useCallback((newSizes: [SizeValue, SizeValue]) => {
    if (validateSize(newSizes[0]) && validateSize(newSizes[1])) {
      localStorage.setItem(`splitter-${autoSaveId}`, JSON.stringify(newSizes));
    }
  }, [autoSaveId]);

  // Get current container size and create context
  const getSizeContext = useCallback(() => {
    if (!containerRef.current) return { containerSize: 1000 };
    
    const rect = containerRef.current.getBoundingClientRect();
    const containerSize = split === 'vertical' ? rect.width : rect.height;
    
    return createSizeContext(containerSize);
  }, [split]);

  // Convert sizes to pixels with enhanced support
  const getComputedSizes = useMemo(() => {
    const context = getSizeContext();
    const leftPx = sizeToPixels(leftPanelMinSize, context);
    const rightPx = sizeToPixels(rightPanelMinSize, context);
    
    return {
      leftMinPx: leftPx,
      rightMinPx: rightPx,
      context
    };
  }, [leftPanelMinSize, rightPanelMinSize, getSizeContext]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startPos = split === 'vertical' ? e.clientX : e.clientY;
    const container = (e.target as Element).closest('.splitter-container') as HTMLElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerSize = split === 'vertical' ? containerRect.width : containerRect.height;
    const context = createSizeContext(containerSize);
    const { leftMinPx, rightMinPx } = getComputedSizes;

    const handleMouseMove = (e: MouseEvent) => {
      const currentPos = split === 'vertical' ? e.clientX : e.clientY;
      const containerStart = split === 'vertical' ? containerRect.left : containerRect.top;
      const relativePos = currentPos - containerStart;

      let leftSize: number;
      let rightSize: number;

      if (preserveSide === 'left') {
        leftSize = Math.max(leftMinPx, Math.min(relativePos, containerSize - rightMinPx));
        rightSize = containerSize - leftSize;
      } else {
        rightSize = Math.max(rightMinPx, Math.min(containerSize - relativePos, containerSize - leftMinPx));
        leftSize = containerSize - rightSize;
      }

      const newSizes: [SizeValue, SizeValue] = preserveSide === 'left' 
        ? [`${leftSize}px`, 'auto']
        : ['auto', `${rightSize}px`];

      setSizes(newSizes);
      saveLayout(newSizes);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      
      // Add smooth transition back
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), animationDuration);
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    moveHandlerRef.current = handleMouseMove;
    upHandlerRef.current = handleMouseUp;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [split, preserveSide, saveLayout, getComputedSizes, animationDuration]);

  useEffect(() => {
    return () => {
      if (moveHandlerRef.current)
        document.removeEventListener('mousemove', moveHandlerRef.current);
      if (upHandlerRef.current)
        document.removeEventListener('mouseup', upHandlerRef.current);
    };
  }, []);

  const isVertical = split === 'vertical';
  const splitterSize = isVertical ? 'w-2' : 'h-2'; // Made thicker for visibility
  const flexDirection = isVertical ? 'flex-row' : 'flex-col';

  // Enhanced styles with proper size conversion and animations
  const leftStyle = useMemo<React.CSSProperties>(() => {
    const context = getSizeContext();
    const minSize = sizeToPixels(leftPanelMinSize, context);
    
    return {
      flexBasis: typeof sizes[0] === 'string' && sizes[0].includes('calc(') 
        ? sizes[0] 
        : sizeToPixels(sizes[0], context),
      flexShrink: preserveSide === 'left' ? 0 : 1,
      flexGrow: preserveSide === 'left' ? 0 : 1,
      minWidth: isVertical ? minSize : undefined,
      minHeight: !isVertical ? minSize : undefined,
      transition: isDragging ? 'none' : `all ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    };
  }, [sizes, preserveSide, isVertical, leftPanelMinSize, getSizeContext, isDragging, animationDuration]);

  const rightStyle = useMemo<React.CSSProperties>(() => {
    const context = getSizeContext();
    const minSize = sizeToPixels(rightPanelMinSize, context);
    
    return {
      flexBasis: typeof sizes[1] === 'string' && sizes[1].includes('calc(') 
        ? sizes[1] 
        : sizeToPixels(sizes[1], context),
      flexShrink: preserveSide === 'right' ? 0 : 1,
      flexGrow: preserveSide === 'right' ? 0 : 1,
      minWidth: isVertical ? minSize : undefined,
      minHeight: !isVertical ? minSize : undefined,
      transition: isDragging ? 'none' : `all ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    };
  }, [sizes, preserveSide, isVertical, rightPanelMinSize, getSizeContext, isDragging, animationDuration]);

  return (
    <div 
      ref={containerRef}
      className={cn('splitter-container flex', flexDirection, className)}
    >
      <div 
        style={leftStyle} 
        className={cn(
          "min-h-0 min-w-0 flex-1 flex flex-col overflow-hidden",
          isAnimating && "animate-fade-in"
        )}
      >
        {leftChildren}
      </div>
      
      <div
        className={cn(
          'splitter group relative flex items-center justify-center',
          'bg-border/60 hover:bg-border border-l border-r border-border/40',
          isVertical ? 'cursor-col-resize min-w-[8px]' : 'cursor-row-resize min-h-[8px]',
          splitterSize,
          'select-none transition-all duration-200 hover:bg-primary/10',
          isDragging && 'bg-primary/20 shadow-lg',
          splitterClassName
        )}
        onMouseDown={handleMouseDown}
        role="separator"
        aria-orientation={isVertical ? 'vertical' : 'horizontal'}
        tabIndex={0}
        onKeyDown={(e) => {
          // Add keyboard support for accessibility
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
              e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            // Could add keyboard resize logic here
          }
        }}
      >
        {/* Visual drag indicator */}
        <div className={cn(
          'absolute flex items-center justify-center rounded-sm',
          'bg-muted-foreground/20 group-hover:bg-muted-foreground/40 transition-all duration-200',
          isDragging && 'bg-primary/60',
          isVertical 
            ? 'w-1 h-8 flex-col' 
            : 'w-8 h-1 flex-row'
        )}>
          {/* Grip dots/lines */}
          <div className={cn(
            'bg-muted-foreground/60 group-hover:bg-muted-foreground transition-colors',
            isDragging && 'bg-primary-foreground',
            isVertical ? 'w-0.5 h-1 mb-0.5' : 'w-1 h-0.5 mr-0.5'
          )} />
          <div className={cn(
            'bg-muted-foreground/60 group-hover:bg-muted-foreground transition-colors',
            isDragging && 'bg-primary-foreground',
            isVertical ? 'w-0.5 h-1 mb-0.5' : 'w-1 h-0.5 mr-0.5'
          )} />
          <div className={cn(
            'bg-muted-foreground/60 group-hover:bg-muted-foreground transition-colors',
            isDragging && 'bg-primary-foreground',
            isVertical ? 'w-0.5 h-1' : 'w-1 h-0.5'
          )} />
        </div>
      </div>
      
      <div 
        style={rightStyle} 
        className={cn(
          "min-h-0 min-w-0 flex-1 flex flex-col overflow-hidden",
          isAnimating && "animate-fade-in"
        )}
      >
        {rightChildren}
      </div>
    </div>
  );
};

export const AppSplitter = React.memo(AppSplitterComponent);
AppSplitter.displayName = 'AppSplitter';
