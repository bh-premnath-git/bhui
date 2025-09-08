import { useState, useCallback } from 'react';
import { LayoutNode, oneCol, twoCol, threeCol, twoRow } from '@/layouts/layout-model';

export function useLayoutControl(initialLayout: LayoutNode = oneCol()) {
  const [root, setRoot] = useState<LayoutNode>(initialLayout);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const getLayoutLabel = useCallback((layout: LayoutNode): string => {
    if (layout.type === 'leaf') return '1C';
    if (layout.direction === 'vertical') {
      if (layout.right.type === 'split' && layout.right.direction === 'vertical') return '3C';
      return '2C';
    }
    return '2R';
  }, []);

  const changeLayout = useCallback((newLayout: LayoutNode) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setRoot(newLayout);
      setTimeout(() => setIsTransitioning(false), 100);
    }, 150);
  }, []);

  const setOneColumn = useCallback(() => changeLayout(oneCol()), [changeLayout]);
  const setTwoColumn = useCallback(() => changeLayout(twoCol()), [changeLayout]);
  const setThreeColumn = useCallback(() => changeLayout(threeCol()), [changeLayout]);
  const setTwoRow = useCallback(() => changeLayout(twoRow()), [changeLayout]);

  // Close functions for progressive closing
  const closePanel = useCallback(() => {
    const currentLabel = getLayoutLabel(root);
    if (currentLabel === '3C') {
      changeLayout(twoCol());
    } else if (currentLabel === '2C') {
      changeLayout(oneCol());
    }
  }, [root, changeLayout, getLayoutLabel]);

  return {
    root,
    setRoot,
    isTransitioning,
    currentLayoutLabel: getLayoutLabel(root),
    setOneColumn,
    setTwoColumn,
    setThreeColumn,
    setTwoRow,
    closePanel,
  };
}