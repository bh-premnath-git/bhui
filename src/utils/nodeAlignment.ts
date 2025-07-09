/**
 * Utility function to align all nodes to top-left in a grid layout
 */
export const alignNodesToTopLeft = (
  nodes: any[],
  edges: any[],
  updateSetNode: (nodes: any[], edges: any[]) => void,
  reactFlowInstance?: any
) => {
  console.log("Aligning nodes to top-left");
  
  try {
    if (!nodes || nodes.length === 0) {
      console.log("No nodes to align");
      return;
    }
    
    // Simple grid layout starting from top-left
    const startX = -250; // Move nodes more to the right
    const startY = -120; // Move nodes even higher up (can go negative)
    const gridSpacing = 150; // Space between nodes
    const nodesPerRow = 4; // Number of nodes per row
    
    const newNodes = nodes.map((node, index) => {
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;
      
      return {
        ...node,
        position: {
          x: startX + (col * gridSpacing),
          y: startY + (row * gridSpacing)
        }
      };
    });

    // Update nodes with new positions
    updateSetNode(newNodes, edges);

    // Center the view after a short delay
    setTimeout(() => {
      if (reactFlowInstance && reactFlowInstance.setCenter) {
        // Calculate the center of the grid
        const rows = Math.ceil(nodes.length / nodesPerRow);
        const centerX = startX + ((nodesPerRow - 1) * gridSpacing) / 2;
        const centerY = startY + ((rows - 1) * gridSpacing) / 2;
        
        reactFlowInstance.setCenter(centerX, centerY, { duration: 800 });
      }
      
      // Try to click the fitView button directly as a fallback
      const fitViewButton = document.querySelector('.react-flow__controls-fitview');
      if (fitViewButton instanceof HTMLElement) {
        console.log("Clicking fitView button after top-left alignment");
        fitViewButton.click();
      }
    }, 100);
    
  } catch (error) {
    console.error("Error in align top left:", error);
  }
};