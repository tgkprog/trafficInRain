import { Vehicle } from '../entities/Vehicle.js';
import { PathPlanner } from '../map/PathPlanner.js';
import vehiclesConfig from '../config/vehicles.json';

export class VehicleSpawner {
  constructor(roadNetwork) {
    this.roadNetwork = roadNetwork;
    this.vehicles = [];
    this.nextVehicleId = 1;
    
    // Initialize path planner
    this.pathPlanner = new PathPlanner(roadNetwork);
    
    // Spawn configuration
    this.spawnRateMin = 300;  // Min interval between spawns (ms)
    this.spawnRateMax = 800; // Max interval between spawns (ms)
    this.maxSpawnsPer10Sec = 15; // Maximum vehicles to spawn in any 10-second window
    this.spawnHistory = []; // Track recent spawns for rate limiting
    this.nextSpawnTime = 0;
    this.lastSpawnTime = 0;
    
    // Weather state
    this.weatherState = 'none';
    
    // Rain speed modifiers (default values matching config)
    this.rainSpeedModifiers = {
      light: 0.8,  // 80% speed in light rain
      heavy: 0.5   // 50% speed in heavy rain
    };
    
    // Build weighted distribution table
    this.vehicleTypes = this.buildWeightedTypes();
    
    console.log('VehicleSpawner initialized with', this.vehicleTypes.length, 'vehicle type entries');
  }

  // Build a weighted distribution array based on vehicle spawn rates
  buildWeightedTypes() {
    const weighted = [];
    
    // Convert object to array of vehicles with their type as ID
    Object.entries(vehiclesConfig).forEach(([type, vehicle]) => {
      const vehicleData = { ...vehicle, type };
      const weight = vehicle.spawnWeight || 10;
      
      for (let i = 0; i < weight; i++) {
        weighted.push(vehicleData);
      }
    });
    
    return weighted;
  }

  // Select random vehicle type based on weighted distribution
  selectRandomVehicleType() {
    const index = Math.floor(Math.random() * this.vehicleTypes.length);
    return this.vehicleTypes[index];
  }

  // Select random origin and destination locations
  selectRandomRoute() {
    const locations = this.roadNetwork.getLocations();
    if (locations.length < 2) return null;
    
    // Pick two different locations
    const originIndex = Math.floor(Math.random() * locations.length);
    let destIndex = Math.floor(Math.random() * locations.length);
    
    // Ensure destination is different from origin
    while (destIndex === originIndex && locations.length > 1) {
      destIndex = Math.floor(Math.random() * locations.length);
    }
    
    return {
      origin: locations[originIndex],
      destination: locations[destIndex]
    };
  }

  // Set weather state
  setWeatherState(state) {
    this.weatherState = state;
    
    // Update all active vehicles with new weather state and rain modifiers
    this.vehicles.forEach(vehicle => {
      if (vehicle.isActive) {
        vehicle.setWeatherState(state, this.rainSpeedModifiers);
      }
    });
  }
  
  // Set rain speed modifiers
  setRainSpeedModifiers(lightFactor, heavyFactor) {
    this.rainSpeedModifiers.light = lightFactor;
    this.rainSpeedModifiers.heavy = heavyFactor;
    
    // Update all active vehicles with new modifiers
    this.vehicles.forEach(vehicle => {
      if (vehicle.isActive) {
        vehicle.setWeatherState(this.weatherState, this.rainSpeedModifiers);
      }
    });
    
    console.log(`Rain speed modifiers updated - Light: ${(lightFactor * 100)}%, Heavy: ${(heavyFactor * 100)}%`);
  }
  
  // Get current rain speed modifiers
  getRainSpeedModifiers() {
    return {
      light: this.rainSpeedModifiers.light,
      heavy: this.rainSpeedModifiers.heavy,
      lightPercent: Math.round(this.rainSpeedModifiers.light * 100),
      heavyPercent: Math.round(this.rainSpeedModifiers.heavy * 100)
    };
  }
  
  // Check if we can spawn based on 10-second rate limit
  canSpawnVehicle(currentTime) {
    // Clean up spawn history older than 10 seconds
    const tenSecondsAgo = currentTime - 10000;
    this.spawnHistory = this.spawnHistory.filter(time => time > tenSecondsAgo);
    
    // Check if we're under the limit
    return this.spawnHistory.length < this.maxSpawnsPer10Sec;
  }
  
  // Get random spawn interval
  getRandomSpawnInterval() {
    return this.spawnRateMin + Math.random() * (this.spawnRateMax - this.spawnRateMin);
  }
  
  // Update spawner (call each frame)
  update(currentTime, deltaMs) {
    // Initialize next spawn time on first call
    if (this.nextSpawnTime === 0) {
      this.nextSpawnTime = currentTime + this.getRandomSpawnInterval();
    }
    
    // Check if we should spawn a new vehicle (random interval + rate limit)
    if (currentTime >= this.nextSpawnTime && this.canSpawnVehicle(currentTime)) {
      this.spawnVehicle(currentTime);
      this.nextSpawnTime = currentTime + this.getRandomSpawnInterval();
    }
    
    // Update all active vehicles with traffic awareness
    this.vehicles.forEach(vehicle => {
      if (vehicle.isActive) {
        vehicle.update(deltaMs, this.vehicles);
      }
    });
    
    // Remove inactive vehicles
    this.removeInactiveVehicles();
  }

  // Spawn a new vehicle
  spawnVehicle(currentTime) {
    // Select vehicle type and route
    const vehicleConfig = this.selectRandomVehicleType();
    const route = this.selectRandomRoute();
    
    if (!route) {
      console.warn('Could not generate route for vehicle spawn');
      return null;
    }
    
    // Create vehicle at origin position
    const spawnPosition = {
      x: route.origin.x + (Math.random() - 0.5) * 20,
      y: route.origin.y + (Math.random() - 0.5) * 20
    };
    
    const vehicle = new Vehicle(
      vehicleConfig,
      spawnPosition,
      route.destination,
      this.nextVehicleId++,
      this.weatherState,
      this.rainSpeedModifiers
    );
    
    // Generate path following roads using PathPlanner
    const waypoints = this.pathPlanner.findPath(route.origin.id, route.destination.id);
    vehicle.path = waypoints;
    
    this.vehicles.push(vehicle);
    
    // Record spawn time for rate limiting
    this.spawnHistory.push(currentTime);
    
    console.log(`Spawned ${vehicle.type} (ID: ${vehicle.id}) from ${route.origin.name} to ${route.destination.name}, waypoints: ${waypoints.length}`);
    
    return vehicle;
  }

  // Remove vehicles that have reached their destination
  removeInactiveVehicles() {
    this.vehicles = this.vehicles.filter(v => v.isActive);
  }

  // Render all vehicles
  render(ctx) {
    this.vehicles.forEach(vehicle => {
      vehicle.render(ctx);
    });
  }

  // Get statistics
  getStats() {
    // Calculate average speed of all active vehicles
    let totalSpeed = 0;
    let activeCount = 0;
    
    this.vehicles.forEach(vehicle => {
      if (vehicle.isActive && vehicle.currentSpeed) {
        totalSpeed += vehicle.currentSpeed;
        activeCount++;
      }
    });
    
    const avgSpeed = activeCount > 0 ? totalSpeed / activeCount : 0;
    
    // Convert from pixels/sec to km/h (approximate, using pixelScale)
    const pixelScale = 3.5;
    const speedScale = 0.5;
    const avgSpeedKmH = (avgSpeed / (pixelScale * speedScale)) * 3.6;
    
    return {
      activeVehicles: this.vehicles.length,
      totalSpawned: this.nextVehicleId - 1,
      avgSpeed: avgSpeed,
      avgSpeedKmH: Math.round(avgSpeedKmH)
    };
  }

  // Adjust spawn rate range (ms)
  setSpawnRate(minMs, maxMs) {
    this.spawnRateMin = minMs;
    this.spawnRateMax = maxMs;
  }
  
  // Set maximum spawns per 10 seconds
  setMaxSpawnsPer10Sec(max) {
    this.maxSpawnsPer10Sec = max;
    console.log(`Spawn rate limit set to ${max} vehicles per 10 seconds`);
  }

  // Clear all vehicles
  clear() {
    this.vehicles.forEach(vehicle => {
      vehicle.destroy();
    });
    this.vehicles = [];
    this.spawnHistory = [];
  }
}
