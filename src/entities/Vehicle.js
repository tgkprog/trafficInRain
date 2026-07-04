export class Vehicle {
  constructor(config, spawnPosition, destination, id, weatherState = 'none') {
    this.id = id;
    this.type = config.type;
    this.config = config;
    this.destination = destination;
    this.weatherState = weatherState;
    
    // Physical properties from config
    const pixelScale = 3.5;
    const speedScale = 0.69; // Speed multiplier (increased by 15%)
    this.width = (config.widthMeters || 2) * pixelScale;
    this.height = (config.lengthMeters || 4) * pixelScale;
    this.baseMaxSpeed = ((config.maxSpeedKmH || 40) * 1000) / 3600 * pixelScale * speedScale; // pixels/second
    
    // Apply weather modifier to max speed
    this.maxSpeed = this.calculateWeatherModifiedSpeed();
    
    // Position and movement
    this.position = { x: spawnPosition.x, y: spawnPosition.y };
    this.velocity = { x: 0, y: 0 };
    this.angle = 0;
    
    // Navigation state
    this.currentWaypointIndex = 0;
    this.path = []; // Will be set by PathPlanner
    
    // Vehicle state
    this.isActive = true;
    this.distanceTraveled = 0;
    this.currentSpeed = 0; // Track current speed for analytics
    this.travelTime = 0; // Track total travel time in ms
    
    // Visual properties
    this.color = config.color || this.getColorByType();
  }
  
  // Calculate speed with weather modifiers
  calculateWeatherModifiedSpeed() {
    if (this.weatherState === 'none') {
      return this.baseMaxSpeed;
    }
    
    const rainModifier = this.config.rainModifiers?.[this.weatherState];
    const speedFactor = rainModifier?.speedFactor || 1.0;
    
    return this.baseMaxSpeed * speedFactor;
  }
  
  // Set weather state and update speed
  setWeatherState(state) {
    this.weatherState = state;
    this.maxSpeed = this.calculateWeatherModifiedSpeed();
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

  // Update vehicle position with dynamic speed modulation
  update(deltaMs, allVehicles = []) {
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
    
    // Dynamic speed calculation based on nearby vehicles
    const currentSpeed = this.calculateDynamicSpeed(allVehicles);
    this.currentSpeed = currentSpeed; // Store for analytics
    
    // Calculate movement direction (normalized)
    const directionX = dx / distance;
    const directionY = dy / distance;
    
    // Move toward target at dynamic speed
    const moveSpeed = currentSpeed * (deltaMs / 1000); // pixels per frame
    const moveAmount = Math.min(moveSpeed, distance);
    
    // Simple direct movement - no physics, just follow waypoints
    this.position.x += directionX * moveAmount;
    this.position.y += directionY * moveAmount;
    
    // Update angle to face direction
    this.angle = Math.atan2(dy, dx);
    
    // Update distance traveled and travel time
    this.distanceTraveled += moveAmount;
    this.travelTime += deltaMs;
  }
  
  // Calculate dynamic speed based on nearby vehicles and weather
  calculateDynamicSpeed(allVehicles) {
    let speedFactor = 1.0;
    
    // Check for nearby vehicles in front
    const checkDistance = 80; // Check vehicles within 80 pixels ahead
    const slowdownDistance = 50; // Start slowing down at 50 pixels
    
    for (const other of allVehicles) {
      if (other.id === this.id || !other.isActive) continue;
      
      // Calculate distance to other vehicle
      const dx = other.position.x - this.position.x;
      const dy = other.position.y - this.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < checkDistance) {
        // Check if vehicle is ahead (in same direction)
        const angleToOther = Math.atan2(dy, dx);
        const angleDiff = Math.abs(angleToOther - this.angle);
        
        // If vehicle is roughly ahead (within 60 degrees)
        if (angleDiff < Math.PI / 3 || angleDiff > (5 * Math.PI) / 3) {
          // Reduce speed based on distance
          if (dist < slowdownDistance) {
            const slowdownFactor = dist / slowdownDistance;
            speedFactor = Math.min(speedFactor, slowdownFactor * 0.6 + 0.2);
          } else {
            speedFactor = Math.min(speedFactor, 0.85);
          }
        }
      }
    }
    
    // Additional weather-based random slowdowns for congestion effect
    if (this.weatherState !== 'none') {
      // Random chance of slowdown (simulate caution, visibility issues)
      if (Math.random() < 0.02) { // 2% chance each frame
        speedFactor *= (this.weatherState === 'heavy' ? 0.6 : 0.8);
      }
    }
    
    return this.maxSpeed * speedFactor;
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
