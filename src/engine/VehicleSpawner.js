import { Vehicle } from '../entities/Vehicle.js';
import { PathPlanner } from '../map/PathPlanner.js';
import vehiclesConfig from '../config/vehicles.json';

export class VehicleSpawner {
  constructor(physicsWorld, roadNetwork) {
    this.physicsWorld = physicsWorld;
    this.roadNetwork = roadNetwork;
    this.vehicles = [];
    this.nextVehicleId = 1;
    
    // Initialize path planner
    this.pathPlanner = new PathPlanner(roadNetwork);
    
    // Spawn configuration
    this.spawnRate = 2000; // milliseconds between spawns
    this.lastSpawnTime = 0;
    this.maxVehicles = 50;
    
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

  // Update spawner (call each frame)
  update(currentTime, deltaMs) {
    // Check if we should spawn a new vehicle
    if (currentTime - this.lastSpawnTime > this.spawnRate && 
        this.vehicles.length < this.maxVehicles) {
      this.spawnVehicle();
      this.lastSpawnTime = currentTime;
    }
    
    // Update all active vehicles
    this.vehicles.forEach(vehicle => {
      if (vehicle.isActive) {
        vehicle.update(deltaMs);
      }
    });
    
    // Remove inactive vehicles
    this.removeInactiveVehicles();
  }

  // Spawn a new vehicle
  spawnVehicle() {
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
      this.nextVehicleId++
    );
    
    // Generate path following roads using PathPlanner
    const waypoints = this.pathPlanner.findPath(route.origin.id, route.destination.id);
    vehicle.path = waypoints;
    
    this.vehicles.push(vehicle);
    
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
    return {
      activeVehicles: this.vehicles.length,
      totalSpawned: this.nextVehicleId - 1
    };
  }

  // Adjust spawn rate (vehicles per second)
  setSpawnRate(vehiclesPerSecond) {
    this.spawnRate = 1000 / vehiclesPerSecond;
  }

  // Clear all vehicles
  clear() {
    this.vehicles.forEach(vehicle => {
      vehicle.destroy();
    });
    this.vehicles = [];
  }
}
