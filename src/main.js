import { RoadNetwork } from './map/RoadNetwork.js';
import { MapRenderer } from './map/MapRenderer.js';
import { PhysicsWorld } from './engine/PhysicsWorld.js';
import { VehicleSpawner } from './engine/VehicleSpawner.js';
import { RainRenderer } from './weather/RainRenderer.js';

// Import configuration data to ensure module bundler tracking
import locations from './config/locations.json';
import roads from './config/roads.json';
import vehicles from './config/vehicles.json';
import weather from './config/weather.json';

console.log('--- Traffic in Rain Simulation: Phase 2 Online ---');

// Initialize road network mapping
const roadNetwork = new RoadNetwork();

// Initialize physics world and spawner
const physicsWorld = new PhysicsWorld();
let vehicleSpawner;
let mapRenderer;
let rainRenderer;
let canvas, ctx;

// Animation state
let lastTime = 0;
let weatherState = 'none';

document.addEventListener('DOMContentLoaded', () => {
  // Get canvas elements and context
  canvas = document.getElementById('sim-canvas');
  if (!canvas) {
    console.error('Canvas element #sim-canvas not found!');
    return;
  }

  ctx = canvas.getContext('2d');
  console.log('Canvas found:', canvas.width, 'x', canvas.height);
  
  // Initialize renderers and spawner
  mapRenderer = new MapRenderer(canvas, ctx, roadNetwork);
  rainRenderer = new RainRenderer(canvas, ctx);
  vehicleSpawner = new VehicleSpawner(physicsWorld, roadNetwork);
  
  console.log('Physics world, vehicle spawner, and rain renderer initialized.');
  console.log('Locations:', roadNetwork.getLocations().length);
  console.log('Roads:', roadNetwork.getRoads().length);

  // Live HUD status indicator helper
  const breakdownList = document.getElementById('vehicle-breakdown-list');
  if (breakdownList) {
    breakdownList.innerHTML = `
      <div style="color: var(--accent-emerald); font-size: 0.78rem; text-align: center; padding: 10px 0; font-weight: 500;">
        Physics Engine Active - Vehicles Spawning
      </div>
      <div style="color: var(--text-muted); font-size: 0.72rem; text-align: center; margin-top: 4px;">
        Watch the simulation and test weather controls.
      </div>
    `;
  }

  // Bind Weather tabs triggers
  setupWeatherButtons();
  
  // Start animation loop
  requestAnimationFrame(animate);
});

// Animation loop
function animate(currentTime) {
  // Initialize lastTime on first frame
  if (lastTime === 0) {
    lastTime = currentTime;
  }
  
  const delta = currentTime - lastTime;
  lastTime = currentTime;
  
  // Update rain particles
  rainRenderer.update(delta);
  
  // Update vehicle spawner (no physics engine needed)
  vehicleSpawner.update(currentTime, delta);
  
  // Render scene
  render();
  
  // Update HUD stats
  updateHUDStats();
  
  requestAnimationFrame(animate);
}

// Render function
function render() {
  // Draw static map
  mapRenderer.render();
  
  // Draw all vehicles
  vehicleSpawner.render(ctx);
  
  // Draw rain on top
  rainRenderer.render();
}

// Weather selection triggers
function setupWeatherButtons() {
  const weatherBtns = {
    none: document.getElementById('btn-weather-none'),
    light: document.getElementById('btn-weather-light'),
    heavy: document.getElementById('btn-weather-heavy')
  };

  Object.entries(weatherBtns).forEach(([mode, btn]) => {
    if (!btn) return;
    
    btn.addEventListener('click', () => {
      // Toggle active classes
      Object.values(weatherBtns).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      weatherState = mode;
      physicsWorld.applyWeatherFriction(weatherState);
      rainRenderer.setWeatherState(weatherState);
      vehicleSpawner.setWeatherState(weatherState);
      
      console.log(`Weather mode toggled: ${mode.toUpperCase()}`);
      
      // Update UI helper elements (e.g. status bar values as a demo)
      updateHUDDemo(mode);
    });
  });
}

// Update HUD with live statistics
function updateHUDStats() {
  const stats = vehicleSpawner.getStats();
  
  // Update vehicle count display
  const breakdownList = document.getElementById('vehicle-breakdown-list');
  if (breakdownList) {
    breakdownList.innerHTML = `
      <div style="display: flex; justify-content: space-between; padding: 6px 12px; border-bottom: 1px solid rgba(255,255,255,0.05);">
        <span style="color: var(--text-muted); font-size: 0.75rem;">Active Vehicles:</span>
        <span style="color: var(--accent-cyan); font-weight: 600; font-size: 0.75rem;">${stats.activeVehicles}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 6px 12px;">
        <span style="color: var(--text-muted); font-size: 0.75rem;">Total Spawned:</span>
        <span style="color: var(--text-secondary); font-weight: 500; font-size: 0.75rem;">${stats.totalSpawned}</span>
      </div>
    `;
  }
}

// Simple temporary HUD update to demonstrate click reactions
function updateHUDDemo(mode) {
  const congestionBar = document.getElementById('congestion-bar');
  const congestionText = document.getElementById('val-congestion-text');
  const congestionPct = document.getElementById('val-congestion-pct');
  const avgSpeed = document.getElementById('val-avg-speed');

  if (!congestionBar || !congestionText || !congestionPct || !avgSpeed) return;

  if (mode === 'none') {
    congestionBar.style.width = '10%';
    congestionBar.className = 'congestion-bar-fill green';
    congestionText.textContent = 'Free Flow';
    congestionPct.textContent = '10%';
    avgSpeed.innerHTML = '45 <span class="unit">km/h</span>';
  } else if (mode === 'light') {
    congestionBar.style.width = '42%';
    congestionBar.className = 'congestion-bar-fill yellow';
    congestionText.textContent = 'Moderate Traffic';
    congestionPct.textContent = '42%';
    avgSpeed.innerHTML = '32 <span class="unit">km/h</span>';
  } else if (mode === 'heavy') {
    congestionBar.style.width = '85%';
    congestionBar.className = 'congestion-bar-fill red';
    congestionText.textContent = 'Severe Congestion';
    congestionPct.textContent = '85%';
    avgSpeed.innerHTML = '14 <span class="unit">km/h</span>';
  }
}
