import { useCallback } from 'react';
import ELK from 'elkjs/lib/elk.bundled.js';
import type { Edge, FitViewOptions, Node, ReactFlowInstance } from '@xyflow/react';

// Shared options for all aligners
export type AlignCommonOptions = {
  startX?: number;
  startY?: number;
  fitView?: boolean;
  fitViewOptions?: FitViewOptions;
};

export type AlignHorizontalOptions = AlignCommonOptions & {
  levelWidth?: number; // horizontal distance between levels (columns)
  nodeSpacing?: number; // vertical spacing between nodes in a level
  fanInPaddingPerEdge?: number; // extra padding per incoming edge to spread high fan-in nodes (used in 'compact')
  distribution?: 'compact' | 'even' | 'priority'; // 'priority' = priority-based positioning with adaptive layout
  priorityFunction?: (node: Node) => number; // custom priority function (higher = more priority)
  overlapPrevention?: boolean; // enable advanced overlap detection and prevention
  minNodeGap?: number; // minimum gap between nodes to prevent overlaps
};

export type AlignVerticalOptions = AlignCommonOptions & {
  levelHeight?: number; // vertical distance between levels (rows)
  nodeSpacing?: number; // horizontal spacing in the same row (column spacing)
};

export type AlignGridOptions = AlignCommonOptions & {
  columns?: number;
  spacing?: number;
};

export type AlignHierarchicalOptions = AlignCommonOptions & {
  direction?: 'RIGHT' | 'DOWN' | 'LEFT' | 'UP';
  nodeNodeSpacing?: number; // spacing between nodes
  layerSpacing?: number; // spacing between layers
  defaultNodeSize?: { width: number; height: number };
};

// ---- Helpers ----
function buildSources(nodes: Node[], edges: Edge[]) {
  const hasIncoming = new Map<string, boolean>();
  nodes.forEach((n) => hasIncoming.set(n.id, false));
  edges.forEach((e) => hasIncoming.set(e.target, true));
  return nodes.filter((n) => !hasIncoming.get(n.id));
}

function getPredecessors(nodeId: string, edges: Edge[]) {
  return edges.filter((e) => e.target === nodeId).map((e) => e.source);
}

function getSuccessors(nodeId: string, edges: Edge[]) {
  return edges.filter((e) => e.source === nodeId).map((e) => e.target);
}

function getHandleIndex(handleId?: string): number {
  if (!handleId) return 0;
  // Try common patterns: "in-0", "in1", "target-2"
  const m = handleId.match(/(\d+)/);
  if (m) return parseInt(m[1], 10);
  return 0;
}

function median(values: number[]): number {
  if (values.length === 0) return Number.POSITIVE_INFINITY; // put at end
  const arr = [...values].sort((a, b) => a - b);
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 === 0 ? (arr[mid - 1] + arr[mid]) / 2 : arr[mid];
}

// Enhanced priority and positioning helpers

/**
 * Determines node priority for alignment algorithms.
 * Higher values indicate higher priority (positioned first, resist movement).
 * 
 * Priority hierarchy:
 * - 100: Input/Source nodes (critical flow entry points)
 * - 90: Output/Sink nodes (critical flow exit points)  
 * - 80: Transform/Process nodes (core business logic)
 * - 70: Filter/Condition nodes (flow control)
 * - 60: Join/Merge nodes (data combination)
 * - 50: Default/Unknown nodes
 */
function getDefaultNodePriority(node: Node): number {
  const nodeType = (node.type || '').toLowerCase();
  const nodeData = node.data || {};
  
  // Check for explicit priority in node data
  if (typeof nodeData.priority === 'number') {
    return Math.max(0, Math.min(100, nodeData.priority)); // Clamp to 0-100
  }
  
  // Priority based on node type/category
  if (nodeType.includes('input') || nodeType.includes('source')) return 100;
  if (nodeType.includes('output') || nodeType.includes('sink') || nodeType.includes('target')) return 90;
  if (nodeType.includes('transform') || nodeType.includes('process')) return 80;
  if (nodeType.includes('filter') || nodeType.includes('condition')) return 70;
  if (nodeType.includes('join') || nodeType.includes('merge')) return 60;
  
  // Check for priority hints in node data labels or names
  const label = ((nodeData.label as string) || '').toLowerCase();
  const name = ((nodeData.name as string) || '').toLowerCase();
  const combined = `${label} ${name}`;
  
  if (combined.includes('critical') || combined.includes('important')) return 85;
  if (combined.includes('optional') || combined.includes('secondary')) return 30;
  
  return 50; // Default priority
}

function getNodeDimensions(node: Node): { width: number; height: number } {
  // Try to get actual measured dimensions first
  const measured = (node as any)?.measured;
  if (measured?.width && measured?.height) {
    return { width: measured.width, height: measured.height };
  }
  
  // Fall back to node data dimensions
  const nodeData = node.data || {};
  if (nodeData.width && nodeData.height) {
    return { width: nodeData.width as any, height: nodeData.height as any };
  }
  
  // Default dimensions based on node type
  const nodeType = (node.type || '').toLowerCase();
  if (nodeType.includes('input') || nodeType.includes('output')) {
    return { width: 180, height: 80 };
  }
  
  return { width: 220, height: 100 }; // default
}

function detectOverlap(
  pos1: { x: number; y: number }, 
  dim1: { width: number; height: number },
  pos2: { x: number; y: number }, 
  dim2: { width: number; height: number },
  minGap: number = 10
): boolean {
  const left1 = pos1.x - dim1.width / 2;
  const right1 = pos1.x + dim1.width / 2;
  const top1 = pos1.y - dim1.height / 2;
  const bottom1 = pos1.y + dim1.height / 2;
  
  const left2 = pos2.x - dim2.width / 2;
  const right2 = pos2.x + dim2.width / 2;
  const top2 = pos2.y - dim2.height / 2;
  const bottom2 = pos2.y + dim2.height / 2;
  
  // Check if rectangles overlap with minimum gap
  return !(
    right1 + minGap < left2 || 
    left1 > right2 + minGap || 
    bottom1 + minGap < top2 || 
    top1 > bottom2 + minGap
  );
}

/**
 * Advanced overlap resolution algorithm that respects node priorities.
 * Higher priority nodes maintain their positions while lower priority nodes are moved.
 */
function resolveOverlaps(
  positions: Map<string, { x: number; y: number }>,
  nodes: Node[],
  minGap: number = 10
): Map<string, { x: number; y: number }> {
  const resolvedPositions = new Map(positions);
  const nodeDimensions = new Map<string, { width: number; height: number }>();
  const nodePriorities = new Map<string, number>();
  
  // Cache node dimensions and priorities
  nodes.forEach(node => {
    nodeDimensions.set(node.id, getNodeDimensions(node));
    nodePriorities.set(node.id, getDefaultNodePriority(node));
  });
  
  // Sort nodes by priority (higher priority first) to resolve conflicts in favor of important nodes
  const sortedNodes = [...nodes].sort((a, b) => 
    (nodePriorities.get(b.id) ?? 50) - (nodePriorities.get(a.id) ?? 50)
  );
  
  // Multiple passes to ensure all overlaps are resolved
  let maxPasses = 3;
  let hasOverlaps = true;
  
  while (hasOverlaps && maxPasses > 0) {
    hasOverlaps = false;
    maxPasses--;
    
    for (let i = 0; i < sortedNodes.length; i++) {
      const currentNode = sortedNodes[i];
      const currentPos = resolvedPositions.get(currentNode.id);
      const currentDim = nodeDimensions.get(currentNode.id);
      
      if (!currentPos || !currentDim) continue;
      
      // Check for overlaps with all other nodes
      for (let j = 0; j < sortedNodes.length; j++) {
        if (i === j) continue;
        
        const otherNode = sortedNodes[j];
        const otherPos = resolvedPositions.get(otherNode.id);
        const otherDim = nodeDimensions.get(otherNode.id);
        
        if (!otherPos || !otherDim) continue;
        
        if (detectOverlap(currentPos, currentDim, otherPos, otherDim, minGap)) {
          hasOverlaps = true;
          
          // Determine which node should move based on priority
          const currentPriority = nodePriorities.get(currentNode.id) ?? 50;
          const otherPriority = nodePriorities.get(otherNode.id) ?? 50;
          
          if (currentPriority < otherPriority) {
            // Current node has lower priority, move it
            const moveDistance = (currentDim.height + otherDim.height) / 2 + minGap;
            const newY = otherPos.y > currentPos.y 
              ? otherPos.y - moveDistance 
              : otherPos.y + moveDistance;
            
            resolvedPositions.set(currentNode.id, { ...currentPos, y: newY });
          } else if (otherPriority < currentPriority) {
            // Other node has lower priority, move it
            const moveDistance = (currentDim.height + otherDim.height) / 2 + minGap;
            const newY = currentPos.y > otherPos.y 
              ? currentPos.y - moveDistance 
              : currentPos.y + moveDistance;
            
            resolvedPositions.set(otherNode.id, { ...otherPos, y: newY });
          } else {
            // Equal priority, move the one that's lower on the screen
            const nodeToMove = currentPos.y > otherPos.y ? currentNode : otherNode;
            const nodeToMovePos = resolvedPositions.get(nodeToMove.id)!;
            const fixedPos = nodeToMove === currentNode ? otherPos : currentPos;
            
            const moveDistance = (currentDim.height + otherDim.height) / 2 + minGap;
            const newY = fixedPos.y + moveDistance;
            
            resolvedPositions.set(nodeToMove.id, { ...nodeToMovePos, y: newY });
          }
        }
      }
    }
  }
  
  return resolvedPositions;
}

/**
 * Calculates optimal spacing between nodes based on their types and relationships.
 */
function calculateAdaptiveSpacing(
  node: Node, 
  predecessors: Node[], 
  baseSpacing: number,
  fanInPadding: number
): number {
  const priority = getDefaultNodePriority(node);
  const fanIn = predecessors.length;
  
  // Higher priority nodes get more space
  const priorityMultiplier = priority > 80 ? 1.2 : priority < 40 ? 0.8 : 1.0;
  
  // Nodes with many inputs need more space
  const fanInSpacing = fanIn * fanInPadding;
  
  return Math.round(baseSpacing * priorityMultiplier + fanInSpacing);
}

export function useFlowAlignment(params: {
  nodes: Node[];
  edges: Edge[];
  updateNodes: (nodes: Node[], edges: Edge[]) => void;
  reactFlowInstance?: ReactFlowInstance | null;
}) {
  const { nodes, edges, updateNodes, reactFlowInstance } = params;

  // Build BFS levels (Sugiyama layering)
  const buildLevels = useCallback(() => {
    const nodeLevels = new Map<string, number>();
    const visited = new Set<string>();

    const sourceNodes = buildSources(nodes, edges);
    const queue: { id: string; level: number }[] =
      sourceNodes.length > 0
        ? sourceNodes.map((n) => ({ id: n.id, level: 0 }))
        : nodes[0]
        ? [{ id: nodes[0].id, level: 0 }]
        : [];

    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      nodeLevels.set(id, level);
      const outgoing = edges.filter((e) => e.source === id);
      outgoing.forEach((e) => !visited.has(e.target) && queue.push({ id: e.target, level: level + 1 }));
    }

    // Disconnected nodes default to level 0
    nodes.forEach((n) => {
      if (!visited.has(n.id)) nodeLevels.set(n.id, 0);
    });

    // Group nodes by level (preserve stable order by appearance)
    const nodesByLevel = new Map<number, string[]>();
    nodes.forEach((n) => {
      const lvl = nodeLevels.get(n.id) ?? 0;
      if (!nodesByLevel.has(lvl)) nodesByLevel.set(lvl, []);
      nodesByLevel.get(lvl)!.push(n.id);
    });

    return { nodeLevels, nodesByLevel };
  }, [nodes, edges]);

  // Barycenter/median ordering to reduce crossings
  const orderLevelsForHorizontal = useCallback(
    (nodesByLevel: Map<number, string[]>, sweeps: number = 4) => {
      const levels = Array.from(nodesByLevel.keys()).sort((a, b) => a - b);
      if (levels.length <= 1) return nodesByLevel;

      const sortByMedian = (
        ids: string[],
        refIndex: Map<string, number>,
        neighborGetter: (id: string) => string[]
      ) => {
        return ids.sort((a, b) => {
          const aVals = neighborGetter(a)
            .map((nid) => refIndex.get(nid))
            .filter((v): v is number => v !== undefined);
          const bVals = neighborGetter(b)
            .map((nid) => refIndex.get(nid))
            .filter((v): v is number => v !== undefined);
          const am = median(aVals);
          const bm = median(bVals);
          if (am === bm) return a.localeCompare(b);
          return am - bm;
        });
      };

      for (let pass = 0; pass < sweeps; pass++) {
        // Downward pass: for L=1..max, order by median of predecessors in L-1
        for (let i = 1; i < levels.length; i++) {
          const prev = nodesByLevel.get(levels[i - 1]) ?? [];
          const prevIndex = new Map(prev.map((id, idx) => [id, idx] as const));
          const cur = nodesByLevel.get(levels[i]) ?? [];
          nodesByLevel.set(
            levels[i],
            sortByMedian(cur, prevIndex, (id) => getPredecessors(id, edges))
          );
        }

        // Upward pass: for L=max-1..0, order by median of successors in L+1
        // Include target handle index as a small tiebreaker so sources feeding input0 come above input1
        for (let i = levels.length - 2; i >= 0; i--) {
          const next = nodesByLevel.get(levels[i + 1]) ?? [];
          const nextIndex = new Map(next.map((id, idx) => [id, idx] as const));
          const cur = nodesByLevel.get(levels[i]) ?? [];

          const epsilon = 0.1; // small weight so handle index influences order but doesn't dominate
          const valuesForId = (id: string): number[] => {
            // consider only edges from id to nodes in next level
            const out = edges.filter((e) => e.source === id && nextIndex.has(e.target));
            return out.map((e) => (nextIndex.get(e.target) ?? 0) + epsilon * getHandleIndex(e.targetHandle));
          };

          const sorted = cur.sort((a, b) => {
            const am = median(valuesForId(a));
            const bm = median(valuesForId(b));
            if (am === bm) return a.localeCompare(b);
            return am - bm;
          });
          nodesByLevel.set(levels[i], sorted);
        }
      }

      return nodesByLevel;
    },
    [edges]
  );

  const orderLevelsForVertical = useCallback(
    (nodesByLevel: Map<number, string[]>) => {
      // Same idea, but now previous/next levels correspond to rows above/below.
      // We still use predecessors for downward pass, successors for upward pass.
      return orderLevelsForHorizontal(nodesByLevel);
    },
    [orderLevelsForHorizontal]
  );

  const doFitView = useCallback(
    (options?: FitViewOptions) => {
      if (reactFlowInstance?.fitView) {
        reactFlowInstance.fitView({ padding: 0.1, duration: 800, ...options });
      }
    },
    [reactFlowInstance]
  );

  // ---- Enhanced Priority-Based Horizontal Aligner ----
  /**
   * Enhanced horizontal alignment algorithm with priority-based positioning.
   * 
   * Key Features:
   * - Priority-driven layout: Higher priority nodes are positioned first and resist movement
   * - Adaptive spacing: Spacing adjusts based on node type, priority, and fan-in/fan-out
   * - Advanced overlap prevention: Intelligent conflict resolution respecting priorities
   * - Multiple distribution modes: 'priority', 'compact', 'even'
   * - Customizable priority functions for domain-specific requirements
   * 
   * @param opts Configuration options for the alignment algorithm
   */
  const alignHorizontal = useCallback(
    (opts?: AlignHorizontalOptions) => {
      if (!nodes || nodes.length === 0) return;
      
      // Configuration
      const startX = opts?.startX ?? 50;
      const startY = opts?.startY ?? 50;
      const levelWidth = Math.max(80, opts?.levelWidth ?? 240);
      const baseSpacing = Math.max(60, opts?.nodeSpacing ?? 160);
      const distribution = opts?.distribution ?? 'compact';
      const priorityFunction = opts?.priorityFunction ?? getDefaultNodePriority;
      const overlapPrevention = opts?.overlapPrevention ?? true;
      const minNodeGap = Math.max(10, opts?.minNodeGap ?? 20);

      const { nodeLevels, nodesByLevel } = buildLevels();
      const ordered = orderLevelsForHorizontal(new Map(nodesByLevel));
      const levels = Array.from(ordered.keys()).sort((a: number, b: number) => a - b);
      const yPos = new Map<string, number>();

      if (distribution === 'priority') {
        // Priority-based positioning: higher priority nodes positioned first, others adapt
        const fanInPaddingPerEdge = Math.max(0, opts?.fanInPaddingPerEdge ?? 10);
        const incomingCount = new Map<string, number>();
        nodes.forEach((n) => incomingCount.set(n.id, 0));
        edges.forEach((e) => incomingCount.set(e.target, (incomingCount.get(e.target) ?? 0) + 1));

        // Process each level with priority-based positioning
        for (const lvl of levels) {
          const levelNodes = ordered.get(lvl) ?? [];
          const nodeObjects = levelNodes.map(id => nodes.find(n => n.id === id)!).filter(Boolean);
          
          // Sort by priority (higher priority first)
          const prioritySorted = nodeObjects.sort((a, b) => priorityFunction(b) - priorityFunction(a));
          
          if (lvl === 0) {
            // First level: position high-priority nodes in optimal positions
            let currentY = startY;
            for (const node of prioritySorted) {
              const fanIn = incomingCount.get(node.id) ?? 0;
              const additionalPadding = fanIn * fanInPaddingPerEdge;
              yPos.set(node.id, currentY + additionalPadding);
              currentY += baseSpacing + additionalPadding;
            }
          } else {
            // Subsequent levels: position based on priority and predecessor positions
            const positionCandidates: Array<{
              id: string;
              priority: number;
              desiredY: number;
              fanIn: number;
              flexibility: number; // how much this node can be moved
            }> = [];

            for (const node of nodeObjects) {
              const priority = priorityFunction(node);
              const incomingEdges = edges.filter((e) => e.target === node.id);
              const fanIn = incomingCount.get(node.id) ?? 0;
              
              // Calculate desired position based on predecessors
              const predPositions: number[] = incomingEdges.map((e) => {
                const predY = yPos.get(e.source);
                if (predY == null) return startY;
                const inputIndex = getHandleIndex(e.targetHandle);
                return predY + (inputIndex * 12); // small nudge for handle ordering
              });
              
              const desiredY = predPositions.length ? median(predPositions) : startY;
              
              // Higher priority nodes have less flexibility (resist movement)
              const flexibility = Math.max(0.1, 1 - (priority / 100));
              
              positionCandidates.push({
                id: node.id,
                priority,
                desiredY,
                fanIn,
                flexibility
              });
            }

            // Sort by priority first, then by desired position
            positionCandidates.sort((a, b) => {
              if (Math.abs(a.priority - b.priority) > 5) {
                return b.priority - a.priority; // Higher priority first
              }
              return a.desiredY - b.desiredY; // Then by desired position
            });

            // Position nodes with conflict resolution
            const positioned = new Set<string>();
            let minY = startY;

            for (const candidate of positionCandidates) {
              const node = nodes.find(n => n.id === candidate.id)!;
              const predecessorNodes = edges
                .filter(e => e.target === candidate.id)
                .map(e => nodes.find(n => n.id === e.source)!)
                .filter(Boolean);
              
              const adaptiveSpacing = calculateAdaptiveSpacing(
                node, 
                predecessorNodes, 
                baseSpacing, 
                fanInPaddingPerEdge
              );
              
              let proposedY = Math.max(candidate.desiredY, minY);
              
              // Check for conflicts with already positioned nodes
              let hasConflict = true;
              let attempts = 0;
              const maxAttempts = 10;
              
              while (hasConflict && attempts < maxAttempts) {
                hasConflict = false;
                
                for (const positionedId of positioned) {
                  const positionedY = yPos.get(positionedId);
                  if (positionedY != null && Math.abs(proposedY - positionedY) < adaptiveSpacing) {
                    // Conflict detected - adjust position based on priority
                    const positionedNode = nodes.find(n => n.id === positionedId)!;
                    const positionedPriority = priorityFunction(positionedNode);
                    
                    if (candidate.priority > positionedPriority) {
                      // Current candidate has higher priority, try to maintain position
                      const adjustment = adaptiveSpacing * 0.5;
                      proposedY = positionedY > proposedY 
                        ? positionedY - adjustment 
                        : positionedY + adjustment;
                    } else {
                      // Positioned node has higher priority, move further away
                      proposedY = positionedY > proposedY 
                        ? positionedY - adaptiveSpacing 
                        : positionedY + adaptiveSpacing;
                    }
                    hasConflict = true;
                    break;
                  }
                }
                attempts++;
              }
              
              yPos.set(candidate.id, proposedY);
              positioned.add(candidate.id);
              minY = Math.max(minY, proposedY + adaptiveSpacing);
            }
          }
        }
      } else if (distribution === 'even') {
        // Equal spacing within each level
        for (const lvl of levels) {
          const ids = ordered.get(lvl) ?? [];
          for (let i = 0; i < ids.length; i++) {
            yPos.set(ids[i], startY + (i * baseSpacing));
          }
        }
      } else {
        // Compact: crossing-aware median placement + compaction (enhanced)
        const fanInPaddingPerEdge = Math.max(0, opts?.fanInPaddingPerEdge ?? 10);
        const incomingCount = new Map<string, number>();
        nodes.forEach((n) => incomingCount.set(n.id, 0));
        edges.forEach((e) => incomingCount.set(e.target, (incomingCount.get(e.target) ?? 0) + 1));

        // Level 0: sequential spacing for source nodes
        const lvl0 = ordered.get(levels[0]) ?? [];
        for (let i = 0; i < lvl0.length; i++) {
          const id = lvl0[i];
          const fanIn = incomingCount.get(id) ?? 0;
          const additionalPadding = fanIn * fanInPaddingPerEdge;
          yPos.set(id, startY + (i * baseSpacing) + additionalPadding);
        }

        // Subsequent levels with enhanced positioning
        for (let li = 1; li < levels.length; li++) {
          const curLevel = levels[li];
          const curIds = ordered.get(curLevel) ?? [];

          const desired: { id: string; desiredY: number; fanIn: number; priority: number }[] = curIds.map((id, idx) => {
            const node = nodes.find(n => n.id === id)!;
            const priority = priorityFunction(node);
            const incomingEdges = edges.filter((e) => e.target === id);
            const predDesireds: number[] = incomingEdges.map((e) => {
              const predY = yPos.get(e.source);
              if (predY == null) return startY + idx * baseSpacing;
              const inputIndex = getHandleIndex(e.targetHandle);
              const nudge = inputIndex * 12;
              return predY + nudge;
            });
            const dY = predDesireds.length ? median(predDesireds) : startY + idx * baseSpacing;
            return { id, desiredY: dY, fanIn: incomingCount.get(id) ?? 0, priority };
          });

          // Sort by priority first, then by desired position
          desired.sort((a, b) => {
            if (Math.abs(a.priority - b.priority) > 5) {
              return b.priority - a.priority;
            }
            return a.desiredY - b.desiredY || a.id.localeCompare(b.id);
          });

          // Assign with min gap compaction
          let y = startY;
          for (const item of desired) {
            const minGap = baseSpacing + item.fanIn * fanInPaddingPerEdge;
            const placed = Math.max(item.desiredY, y);
            yPos.set(item.id, placed);
            y = placed + minGap;
          }
        }
      }

      // Create initial positions
      let positions = new Map<string, { x: number; y: number }>();
      nodes.forEach((node) => {
        const level = nodeLevels.get(node.id) ?? 0;
        const x = startX + level * levelWidth;
        const y = yPos.get(node.id) ?? startY;
        positions.set(node.id, { x, y });
      });

      // Apply overlap prevention if enabled
      if (overlapPrevention) {
        positions = resolveOverlaps(positions, nodes, minNodeGap);
      }

      // Create final node positions
      const newNodes = nodes.map((node) => {
        const position = positions.get(node.id) ?? { x: startX, y: startY };
        return { ...node, position } as Node;
      });

      updateNodes(newNodes, edges);
      setTimeout(() => {
        if (opts?.fitView !== false) doFitView(opts?.fitViewOptions);
      }, 30);
    },
    [nodes, edges, updateNodes, buildLevels, orderLevelsForHorizontal, doFitView]
  );

  const alignVertical = useCallback(
    (opts?: AlignVerticalOptions) => {
      if (!nodes || nodes.length === 0) return;
      const startX = opts?.startX ?? 50;
      const startY = opts?.startY ?? 50;
      const levelHeight = Math.max(80, opts?.levelHeight ?? 180);
      const nodeSpacing = Math.max(60, opts?.nodeSpacing ?? 150);

      const { nodeLevels, nodesByLevel } = buildLevels();
      const ordered = orderLevelsForVertical(new Map(nodesByLevel));

      const newNodes = nodes.map((node) => {
        const level = nodeLevels.get(node.id) ?? 0;
        const ids = ordered.get(level) ?? [];
        const index = ids.indexOf(node.id);
        return {
          ...node,
          position: { x: startX + index * nodeSpacing, y: startY + level * levelHeight },
        } as Node;
      });

      updateNodes(newNodes, edges);
      setTimeout(() => {
        if (opts?.fitView !== false) doFitView(opts?.fitViewOptions);
      }, 30);
    },
    [nodes, edges, updateNodes, buildLevels, orderLevelsForVertical, doFitView]
  );

  const alignTopLeftGrid = useCallback(
    (opts?: AlignGridOptions) => {
      if (!nodes || nodes.length === 0) return;
      const startX = opts?.startX ?? 0;
      const startY = opts?.startY ?? 0;
      const spacing = Math.max(60, opts?.spacing ?? 140);
      const columns = Math.max(1, opts?.columns ?? 4);

      const newNodes = nodes.map((node, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        return { ...node, position: { x: startX + col * spacing, y: startY + row * spacing } } as Node;
      });

      updateNodes(newNodes, edges);
      setTimeout(() => {
        if (opts?.fitView !== false) doFitView(opts?.fitViewOptions);
      }, 30);
    },
    [nodes, edges, updateNodes, doFitView]
  );

  const alignTopLeftHierarchical = useCallback(
    async (opts?: AlignHierarchicalOptions) => {
      if (!nodes || nodes.length === 0) return;
      const startX = opts?.startX ?? 0;
      const startY = opts?.startY ?? 0;
      const nodeNodeSpacing = Math.max(40, opts?.nodeNodeSpacing ?? 120);
      const layerSpacing = Math.max(60, opts?.layerSpacing ?? 180);
      const direction = opts?.direction ?? 'RIGHT';
      const defaultSize = opts?.defaultNodeSize ?? { width: 220, height: 100 };

      try {
        const elk = new ELK();
        
        // Enhanced ELK nodes with proper port handling
        const elkNodes = nodes.map((node) => {
          const nodeData = node.data || {};
          const nodeType = (node.type || '').toLowerCase();
          
          // Determine input/output port counts based on node type and edges
          const incomingEdges = edges.filter(e => e.target === node.id);
          const outgoingEdges = edges.filter(e => e.source === node.id);
          
          const inCount = Math.max(1, incomingEdges.length || (nodeType.includes('input') ? 0 : 1));
          const outCount = Math.max(1, outgoingEdges.length || (nodeType.includes('output') ? 0 : 1));
          
          // Create input ports
          const inPorts = Array.from({ length: inCount }).map((_, i) => ({
            id: `${node.id}:in-${i}`,
            properties: {
              'elk.port.side': direction === 'RIGHT' ? 'WEST' : 'NORTH',
              'elk.port.index': String(i),
            },
          }));
          
          // Create output ports
          const outPorts = Array.from({ length: outCount }).map((_, i) => ({
            id: `${node.id}:out-${i}`,
            properties: {
              'elk.port.side': direction === 'RIGHT' ? 'EAST' : 'SOUTH',
              'elk.port.index': String(i),
            },
          }));

          return {
            id: node.id,
            width: getNodeDimensions(node).width,
            height: getNodeDimensions(node).height,
            properties: {
              'elk.portConstraints': 'FIXED_POS',
            },
            ports: [...inPorts, ...outPorts],
          };
        });

        // Enhanced edge mapping with proper port connections
        const elkEdges = edges.map((edge) => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          
          // Use handle IDs if available, otherwise default to first ports
          const sourcePort = edge.sourceHandle ? `${edge.source}:${edge.sourceHandle}` : `${edge.source}:out-0`;
          const targetPort = edge.targetHandle ? `${edge.target}:${edge.targetHandle}` : `${edge.target}:in-0`;
          
          return {
            id: edge.id,
            sources: [sourcePort],
            targets: [targetPort],
          };
        });

        const elkGraph = {
          id: 'root',
          layoutOptions: {
            'elk.algorithm': 'layered',
            'elk.direction': direction,
            'elk.spacing.nodeNode': String(nodeNodeSpacing),
            'elk.layered.spacing.nodeNodeBetweenLayers': String(layerSpacing),
            
            // Enhanced edge routing for cleaner layouts
            'elk.edge.routing': 'ORTHOGONAL',
            'elk.spacing.edgeNode': '50',
            'elk.spacing.edgeEdge': '28',
            'elk.layered.spacing.edgeNodeBetweenLayers': '34',
            'elk.layered.spacing.edgeEdgeBetweenLayers': '16',
            
            // Better crossing minimization and node placement
            'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
            'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
            'elk.layered.cycleBreaking.strategy': 'GREEDY',
            'elk.layered.thoroughness': '10',
            'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
            'elk.layered.unnecessaryBendpoints': 'true',
            
            // Additional quality improvements
            'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',
            'elk.layered.compaction.postCompaction.strategy': 'EDGE_LENGTH',
            'elk.layered.compaction.postCompaction.constraints': 'SEQUENCE',
          },
          children: elkNodes,
          edges: elkEdges,
        };

        const layouted = await elk.layout(elkGraph);
        
        const newNodes = nodes.map((node) => {
          const layoutedNode = layouted.children?.find((n) => n.id === node.id);
          return {
            ...node,
            position: {
              x: startX + (layoutedNode?.x ?? 0),
              y: startY + (layoutedNode?.y ?? 0)
            }
          } as Node;
        });

        updateNodes(newNodes, edges);
        setTimeout(() => {
          if (opts?.fitView !== false) doFitView(opts?.fitViewOptions);
        }, 30);
      } catch (err) {
        console.error('Enhanced ELK layout failed, falling back to horizontal alignment', err);
        alignHorizontal({ startX, startY, fitView: opts?.fitView, fitViewOptions: opts?.fitViewOptions });
      }
    },
    [nodes, edges, updateNodes, doFitView, alignHorizontal]
  );

  return {
    alignHorizontal,
    alignVertical,
    alignTopLeftGrid,
    alignTopLeftHierarchical,
  };
}