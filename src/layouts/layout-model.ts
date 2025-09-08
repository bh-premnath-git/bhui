import type { SizeValue } from '@/lib/sizeHelper';

/**
 * Base layout node interface
 */
export interface BaseLayoutNode {
  id: string;
}

/**
 * Leaf node represents a final component/panel
 */
export interface LeafNode extends BaseLayoutNode {
  type: 'leaf';
  component: string; // e.g., 'Content', 'Inspector', 'Sidebar'
}

/**
 * Split node represents a container that splits into two parts
 */
export interface SplitNode extends BaseLayoutNode {
  type: 'split';
  direction: 'vertical' | 'horizontal';
  preserveSide: 'left' | 'right';
  defaultLayout: [SizeValue, SizeValue];
  left: LayoutNode;
  right: LayoutNode;
}

/**
 * Union type for all layout nodes
 */
export type LayoutNode = LeafNode | SplitNode;

/**
 * Layout definitions for different modes
 */
export const LAYOUT_DEFINITIONS = {
  '1C': {
    id: 'root',
    type: 'leaf',
    component: 'Content'
  } as LeafNode,

  '2C': {
    id: 'root',
    type: 'split',
    direction: 'vertical',
    preserveSide: 'left',
    defaultLayout: ['320px', 'auto'],
    left: {
      id: 'left',
      type: 'leaf',
      component: 'Content'
    },
    right: {
      id: 'right',
      type: 'leaf',
      component: 'Renderer'
    }
  } as SplitNode,

  '3C': {
    id: 'root',
    type: 'split',
    direction: 'vertical',
    preserveSide: 'left',
    defaultLayout: ['320px', 'auto'],
    left: {
      id: 'left',
      type: 'leaf',
      component: 'Content'
    },
    right: {
      id: 'right-split',
      type: 'split',
      direction: 'vertical',
      preserveSide: 'right',
      defaultLayout: ['auto', '300px'],
      left: {
        id: 'middle',
        type: 'leaf',
        component: 'Renderer'
      },
      right: {
        id: 'right',
        type: 'leaf',
        component: 'Inspector'
      }
    }
  } as SplitNode,

  '2R': {
    id: 'root',
    type: 'split',
    direction: 'horizontal',
    preserveSide: 'left',
    defaultLayout: ['50%', 'auto'],
    left: {
      id: 'top',
      type: 'leaf',
      component: 'Content'
    },
    right: {
      id: 'bottom',
      type: 'leaf',
      component: 'Renderer'
    }
  } as SplitNode
} as const;

export type LayoutType = keyof typeof LAYOUT_DEFINITIONS;

/**
 * Helper to deep-clone a layout definition so the caller can safely mutate it
 * without affecting the shared constants. `structuredClone` is available in
 * modern browsers/Node; fall back to JSON round-trip if necessary.
 */
function cloneLayout<T extends LayoutNode>(layout: T): T {
  // @ts-ignore – types narrowed by runtime feature detection
  return typeof structuredClone === 'function'
    ? structuredClone(layout)
    : JSON.parse(JSON.stringify(layout));
}

// Factory helpers used by `useLayoutControl` hook
export const oneCol = (): LayoutNode => cloneLayout(LAYOUT_DEFINITIONS['1C']);
export const twoCol = (): LayoutNode => cloneLayout(LAYOUT_DEFINITIONS['2C']);
export const threeCol = (): LayoutNode => cloneLayout(LAYOUT_DEFINITIONS['3C']);
export const twoRow = (): LayoutNode => cloneLayout(LAYOUT_DEFINITIONS['2R']);