import Matter from 'matter-js';

export class PhysicsWorld {
  constructor() {
    // Create Matter.js engine with zero gravity (top-down 2D simulation)
    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: 0 }
    });
    
    this.world = this.engine.world;
    this.bodies = [];
    
    console.log('PhysicsWorld initialized with Matter.js');
  }

  // Add a body to the physics world
  addBody(body) {
    Matter.World.add(this.world, body);
    this.bodies.push(body);
  }

  // Remove a body from the physics world
  removeBody(body) {
    Matter.World.remove(this.world, body);
    this.bodies = this.bodies.filter(b => b !== body);
  }

  // Update the physics simulation
  update(delta = 16.67) {
    // Step the engine forward by delta milliseconds (default ~60fps)
    Matter.Engine.update(this.engine, delta);
  }

  // Apply dynamic friction updates based on weather conditions
  applyWeatherFriction(weatherState) {
    // Weather states: 'none', 'light', 'heavy'
    let frictionCoefficient = 0.8; // Default dry conditions
    
    if (weatherState === 'light') {
      frictionCoefficient = 0.6;
    } else if (weatherState === 'heavy') {
      frictionCoefficient = 0.4;
    }

    // Update friction for all bodies in the simulation
    this.bodies.forEach(body => {
      if (body.frictionAir !== undefined) {
        body.frictionAir = frictionCoefficient * 0.05;
      }
    });
  }

  // Get all bodies currently in simulation
  getBodies() {
    return this.bodies;
  }

  // Clear all bodies from the world
  clear() {
    Matter.World.clear(this.world, false);
    this.bodies = [];
  }
}
