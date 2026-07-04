import { RoadNetwork } from './map/RoadNetwork.js';
import { MapRenderer } from './map/MapRenderer.js';
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

// Initialize spawner and renderers
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
  vehicleSpawner = new VehicleSpawner(roadNetwork);
  
  console.log('Vehicle spawner and rain renderer initialized.');
  console.log('Locations:', roadNetwork.getLocations().length);
  console.log('Roads:', roadNetwork.getRoads().length);
  console.log('Spawn rate: Max', vehicleSpawner.maxSpawnsPer5Sec, 'vehicles per 5 seconds');
  console.log('Vehicle limit: REMOVED - total on roads depends on journey times and speed');

  // Live HUD status indicator helper
  const breakdownList = document.getElementById('vehicle-breakdown-list');
  if (breakdownList) {
    breakdownList.innerHTML = `
      <div style="color: var(--accent-emerald); font-size: 0.78rem; text-align: center; padding: 10px 0; font-weight: 500;">
        Physics Engine Active - Vehicles Spawning
      </div>
      <div style="color: var(--text-muted); font-size: 0.72rem; text-align: center; margin-top: 4px;">
        Max ${vehicleSpawner.maxSpawnsPer5Sec} spawns/5sec • No hard vehicle limit
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
  
  // Update average speed display
  const avgSpeed = document.getElementById('val-avg-speed');
  if (avgSpeed && stats.avgSpeedKmH > 0) {
    avgSpeed.innerHTML = `${stats.avgSpeedKmH} <span class="unit">km/h</span>`;
  }
  
  // Update congestion based on actual data
  updateCongestionIndicator(stats);
}

// Update congestion indicator based on vehicle count ONLY
function updateCongestionIndicator(stats) {
  const congestionBar = document.getElementById('congestion-bar');
  const congestionText = document.getElementById('val-congestion-text');
  const congestionPct = document.getElementById('val-congestion-pct');
  
  if (!congestionBar || !congestionText || !congestionPct) return;
  
  // Congestion is ONLY based on number of vehicles on road
  // NOT based on speed - speed changes instantly, vehicles accumulate over time
  // Ideal: 8 vehicles/5sec in clear weather = ~16-20 vehicles on road = 50% congestion
  const idealVehiclesForMediumCongestion = 32; // 50% congestion baseline
  const vehicleDensity = stats.activeVehicles / idealVehiclesForMediumCongestion;
  
  // Convert to percentage (cap at 100%)
  const congestionPctValue = Math.round(Math.max(5, Math.min(100, vehicleDensity * 100)));
  
  // Update UI
  congestionBar.style.width = `${congestionPctValue}%`;
  congestionPct.textContent = `${congestionPctValue}%`;
  
  if (congestionPctValue < 30) {
    congestionBar.className = 'congestion-bar-fill green';
    congestionText.textContent = 'Free Flow';
  } else if (congestionPctValue < 60) {
    congestionBar.className = 'congestion-bar-fill yellow';
    congestionText.textContent = 'Moderate Traffic';
  } else {
    congestionBar.className = 'congestion-bar-fill red';
    congestionText.textContent = 'Severe Congestion';
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

// Expose controls to global scope for console access
window.trafficSimControls = {
  setSpawnRate: (maxPer5Sec) => {
    if (vehicleSpawner) {
      vehicleSpawner.setMaxSpawnsPer5Sec(maxPer5Sec);
      console.log(`✓ Spawn rate updated to ${maxPer5Sec} vehicles per 5 seconds`);
    }
  },
  setSpawnInterval: (minMs, maxMs) => {
    if (vehicleSpawner) {
      vehicleSpawner.setSpawnRate(minMs, maxMs);
      console.log(`✓ Spawn interval updated to ${minMs}-${maxMs}ms`);
    }
  },
  getStats: () => {
    if (vehicleSpawner) {
      const stats = vehicleSpawner.getStats();
      console.log('📊 Current Stats:', stats);
      return stats;
    }
  },
  clearVehicles: () => {
    if (vehicleSpawner) {
      vehicleSpawner.clear();
      console.log('✓ All vehicles cleared');
    }
  }
};

console.log('🎮 Traffic Simulation Controls Available:');
console.log('  trafficSimControls.setSpawnRate(maxPer5Sec) - Set max spawns per 5 seconds');
console.log('  trafficSimControls.setSpawnInterval(minMs, maxMs) - Set spawn interval range');
console.log('  trafficSimControls.getStats() - Get current statistics');
console.log('  trafficSimControls.clearVehicles() - Clear all vehicles');

// Setup control panel UI handlers
function setupControlPanel() {
  const form = document.getElementById('control-form');
  const btnReset = document.getElementById('btn-reset');
  const btnClear = document.getElementById('btn-clear-vehicles');
  const btnStats = document.getElementById('btn-show-stats');

  // Update display values
  function updateDisplayValues() {
    if (!vehicleSpawner) return;
    
    const stats = vehicleSpawner.getStats();
    
    document.getElementById('display-spawn-rate').textContent = vehicleSpawner.maxSpawnsPer5Sec;
    document.getElementById('display-spawn-interval').textContent = 
      `${vehicleSpawner.spawnRateMin}-${vehicleSpawner.spawnRateMax}`;
    document.getElementById('display-active-vehicles').textContent = stats.activeVehicles;
    document.getElementById('display-total-spawned').textContent = stats.totalSpawned;
  }

  // Update display every second
  setInterval(updateDisplayValues, 1000);
  updateDisplayValues();

  // Form submit handler
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const spawnRate = parseInt(document.getElementById('input-spawn-rate').value);
      const spawnMin = parseInt(document.getElementById('input-spawn-min').value);
      const spawnMax = parseInt(document.getElementById('input-spawn-max').value);

      // Validate
      if (spawnMin >= spawnMax) {
        alert('Min interval must be less than max interval!');
        return;
      }

      // Apply changes
      window.trafficSimControls.setSpawnRate(spawnRate);
      window.trafficSimControls.setSpawnInterval(spawnMin, spawnMax);
      
      updateDisplayValues();
      
      // Visual feedback
      const btn = form.querySelector('.btn-set');
      btn.textContent = '✓ Applied!';
      setTimeout(() => {
        btn.textContent = 'Set Values';
      }, 2000);
    });
  }

  // Reset button
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      document.getElementById('input-spawn-rate').value = 8;
      document.getElementById('input-spawn-min').value = 500;
      document.getElementById('input-spawn-max').value = 1200;
      
      window.trafficSimControls.setSpawnRate(8);
      window.trafficSimControls.setSpawnInterval(500, 1200);
      
      updateDisplayValues();
    });
  }

  // Clear vehicles button
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (confirm('Clear all vehicles from the simulation?')) {
        window.trafficSimControls.clearVehicles();
        updateDisplayValues();
      }
    });
  }

  // Show stats button
  if (btnStats) {
    btnStats.addEventListener('click', () => {
      window.trafficSimControls.getStats();
    });
  }
}

// Initialize control panel once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupControlPanel);
} else {
  setupControlPanel();
}
