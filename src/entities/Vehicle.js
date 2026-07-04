import Matter from 'matter-js';

export class Vehicle {
  constructor(config, spawnPosition, destination, id) {
    this.id = id;
    this.type = config.type;
    this.config = config;
    this.destination = destination;
    
    // Physical properties from config
    const pixelScale = 3.5;
    const speedScale = 0.5; // Speed multiplier
    this.width = (config.widthMeters || 2) * pixelScale;
    this.height = (config.lengthMeters || 4) * pixelScale;
    this.maxSpeed = ((config.maxSpeedKmH || 40) * 1000) / 3600 * pixelScale * speedScale; // pixels/second
    
    // Position and movement
    this.position = { x: spawnPosition.x, y: spawnPosition.y };
    this.velocity = { x: 0, y: 0 };
    this.angle = 0;
    
    // We don't need Matter.js physics anymore - using direct position control
    this.body = null;
    
    // Navigation state
    this.currentWaypointIndex = 0;
    this.path = []; // Will be set by PathPlanner
    
    // Vehicle state
    this.isActive = true;
    this.distanceTraveled = 0;
    
    // Visual properties
    this.color = config.color || this.getColorByType();
  }

  getColorByType() {
    const colorMap = {
      'car': '#3b82f6',           // blue
      'suv': '#8b5cf6',            // violet
      'motorcycle': '#f59e0b',     // amber
      'scooter': '#fbbf24',        // yellow
      'auto': '#10b981',           // emerald
      'bus': '#ef4444',            // red
      'schoolBus': '#f97316',      // orange
      'truck': '#64748b',          // gray
      'van': '#475569',            // slate
      'cycle': '#22c55e',          // green
      'pedestrian': '#a78bfa'      // purple
    };
    
    return colorMap[this.type] || '#94a3b8';
  }

  // Update vehicle position - simple waypoint following
  update(deltaMs) {
    if (!this.isActive || this.path.length === 0) return;
    
    const target = this.getCurrentTarget();
    if (!target) {
      this.isActive = false;
      return;
    }
    
    // Calculate direction to target
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if reached waypoint
    if (distance < 20) {
      this.advanceWaypoint();
      return;
    }
    
    // Move toward target at constant speed
    const moveSpeed = this.maxSpeed * (deltaMs / 1000); // pixels per frame
    const moveAmount = Math.min(moveSpeed, distance);
    
    this.position.x += (dx / distance) * moveAmount;
    this.position.y += (dy / distance) * moveAmount;
    
    // Update angle to face direction
    this.angle = Math.atan2(dy, dx);
    
    // Update distance traveled
    this.distanceTraveled += moveAmount;
  }

  // Get current waypoint target
  getCurrentTarget() {
    if (this.path.length === 0 || this.currentWaypointIndex >= this.path.length) {
      return null;
    }
    return this.path[this.currentWaypointIndex];
  }

  // Advance to next waypoint
  advanceWaypoint() {
    this.currentWaypointIndex++;
    if (this.currentWaypointIndex >= this.path.length) {
      this.isActive = false; // Vehicle reached destination
    }
  }

  // Check if vehicle reached current waypoint
  hasReachedWaypoint() {
    const target = this.getCurrentTarget();
    if (!target) return false;
    
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < 20;
  }

  // Render vehicle on canvas
  render(ctx) {
    if (!this.isActive) return;
    
    ctx.save();
    
    // Translate to vehicle position
    ctx.translate(this.position.x, this.position.y);
    
    // Rotate to face direction (add 90 degrees for visual orientation)
    ctx.rotate(this.angle + Math.PI / 2);
    
    // Draw vehicle body
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    // Draw front indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(-this.width / 4, -this.height / 2 - 1, this.width / 2, 2);
    
    ctx.restore();
  }

  // Cleanup
  destroy() {
    this.isActive = false;
  }
}
