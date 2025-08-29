export const checkConnectionExists = (edges, connection) => {
    return edges.some(
        edge => edge.source === connection.source && edge.target === connection.target
    );
};

export const buildGraphFromEdges = (edges) => {
    const graph = {};
    edges.forEach(edge => {
        if (!graph[edge.source]) graph[edge.source] = [];
        graph[edge.source].push(edge.target);
    });
    return graph;
};

export const hasCycle = (graph, startNode, targetNode) => {
    const visited = new Set();
    const stack = [startNode];
    while (stack.length > 0) {
        const currentNode = stack.pop();
        if (currentNode === targetNode) {
            return true;
        }
        visited.add(currentNode);
        if (graph[currentNode]) {
            graph[currentNode].forEach(neighbor => {
                if (!visited.has(neighbor)) {
                    stack.push(neighbor);
                }
            });
        }
    }
    return false;
};

export const checkForCircularDependency = (edges, source, target) => {
    const graph = buildGraphFromEdges(edges);
    return hasCycle(graph, source, target);
};