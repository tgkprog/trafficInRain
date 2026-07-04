export class PathPlanner {
  constructor(roadNetwork) {
    this.network = roadNetwork;
    this.buildGraph();
  }

  buildGraph() {
    // Build adjacency list from roads
    this.graph = new Map();
    const roads = this.network.getRoads();
    
    roads.forEach(road => {
      // Add connections in both directions (all roads are bidirectional)
      if (!this.graph.has(road.from)) {
        this.graph.set(road.from, []);
      }
      if (!this.graph.has(road.to)) {
        this.graph.set(road.to, []);
      }
      
      this.graph.get(road.from).push({ 
        to: road.to, 
        road: road,
        waypoints: road.waypoints 
      });
      
      this.graph.get(road.to).push({ 
        to: road.from, 
        road: road,
        waypoints: [...road.waypoints].reverse() 
      });
    });
    
    console.log('PathPlanner: Graph built with', this.graph.size, 'nodes');
  }

  // Find path using BFS (Breadth-First Search)
  findPath(fromId, toId) {
    if (fromId === toId) {
      const loc = this.network.getLocation(fromId);
      return [{ x: loc.x, y: loc.y }];
    }

    // BFS to find route
    const queue = [[fromId]];
    const visited = new Set([fromId]);
    
    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];
      
      if (current === toId) {
        // Found path! Convert to waypoints
        return this.pathToWaypoints(path);
      }
      
      const neighbors = this.graph.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.to)) {
          visited.add(neighbor.to);
          queue.push([...path, neighbor.to]);
        }
      }
    }
    
    // No path found, return direct line as fallback
    console.warn(`No path found from ${fromId} to ${toId}`);
    const from = this.network.getLocation(fromId);
    const to = this.network.getLocation(toId);
    return [
      { x: from.x, y: from.y },
      { x: to.x, y: to.y }
    ];
  }

  // Convert location IDs path to actual waypoints
  pathToWaypoints(locationPath) {
    const waypoints = [];
    
    for (let i = 0; i < locationPath.length - 1; i++) {
      const from = locationPath[i];
      const to = locationPath[i + 1];
      
      // Find the road connecting these locations
      const neighbors = this.graph.get(from) || [];
      const connection = neighbors.find(n => n.to === to);
      
      if (connection) {
        // Add all waypoints from this road segment
        connection.waypoints.forEach((wp, idx) => {
          // Skip first waypoint if it's duplicate of last waypoint
          if (waypoints.length > 0 && idx === 0) {
            const last = waypoints[waypoints.length - 1];
            if (Math.abs(last.x - wp.x) < 5 && Math.abs(last.y - wp.y) < 5) {
              return;
            }
          }
          waypoints.push({ x: wp.x, y: wp.y });
        });
      }
    }
    
    return waypoints;
  }
}
