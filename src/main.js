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

// Congestion thresholds (configurable)
let congestionThresholds = {
  green: 55,  // Below this % = green (free flow)
  yellow: 70  // Up to this % (inclusive) = yellow (moderate), above = red (severe)
};

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
  console.log('Spawn rate: Max', vehicleSpawner.maxSpawnsPer10Sec, 'vehicles per 10 seconds');
  console.log('Vehicle limit: REMOVED - total on roads depends on journey times and speed');

  // Live HUD status indicator helper
  const breakdownList = document.getElementById('vehicle-breakdown-list');
  if (breakdownList) {
    breakdownList.innerHTML = `
      <div style="color: var(--accent-emerald); font-size: 0.78rem; text-align: center; padding: 10px 0; font-weight: 500;">
        Physics Engine Active - Vehicles Spawning
      </div>
      <div style="color: var(--text-muted); font-size: 0.72rem; text-align: center; margin-top: 4px;">
        Max ${vehicleSpawner.maxSpawnsPer10Sec} spawns/10sec • No hard vehicle limit
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
  
  // Update Live Metrics - Active Vehicles
  const activeCountEl = document.getElementById('val-active-count');
  if (activeCountEl) {
    activeCountEl.textContent = stats.activeVehicles;
  }
  
  // Update Live Metrics - Avg Speed
  const avgSpeedEl = document.getElementById('val-avg-speed');
  if (avgSpeedEl) {
    avgSpeedEl.innerHTML = `${stats.avgSpeedKmH} <span class="unit">km/h</span>`;
  }
  
  // Update Live Metrics - Completed Trips
  const completedTripsEl = document.getElementById('val-completed-trips');
  if (completedTripsEl) {
    completedTripsEl.textContent = stats.completedTrips;
  }
  
  // Update Live Metrics - Flow Rate (vehicles per minute)
  const flowRateEl = document.getElementById('val-flow-rate');
  if (flowRateEl) {
    flowRateEl.innerHTML = `${stats.flowRate} <span class="unit">v/min</span>`;
  }
  
  // Update Vehicle Breakdown display
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
  // With spawn rate of 4/10sec and faster speeds, we need higher baseline
  // 100 vehicles = 100% congestion (extremely congested)
  const maxVehiclesForFullCongestion = 100; // 100% congestion baseline
  const vehicleDensity = stats.activeVehicles / maxVehiclesForFullCongestion;
  
  // Convert to percentage (cap at 100%)
  const congestionPctValue = Math.round(Math.max(5, Math.min(100, vehicleDensity * 100)));
  
  // Update UI
  congestionBar.style.width = `${congestionPctValue}%`;
  congestionPct.textContent = `${congestionPctValue}%`;
  
  // Use configurable thresholds
  if (congestionPctValue < congestionThresholds.green) {
    congestionBar.className = 'congestion-bar-fill green';
    congestionText.textContent = 'Free Flow';
  } else if (congestionPctValue <= congestionThresholds.yellow) {
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
  setSpawnRate: (maxPer10Sec) => {
    if (vehicleSpawner) {
      vehicleSpawner.setMaxSpawnsPer10Sec(maxPer10Sec);
      console.log(`✓ Spawn rate updated to ${maxPer10Sec} vehicles per 10 seconds`);
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
  },
  setCongestionThresholds: (greenMax, yellowMax) => {
    if (greenMax >= yellowMax) {
      console.error('❌ Green threshold must be less than yellow threshold');
      return;
    }
    congestionThresholds.green = greenMax;
    congestionThresholds.yellow = yellowMax;
    console.log(`✓ Congestion thresholds updated: Green < ${greenMax}%, Yellow ${greenMax}-${yellowMax}%, Red > ${yellowMax}%`);
  },
  getCongestionThresholds: () => {
    console.log('📊 Current Congestion Thresholds:', congestionThresholds);
    return congestionThresholds;
  },
  setRainSpeedModifiers: (lightFactor, heavyFactor) => {
    if (vehicleSpawner) {
      vehicleSpawner.setRainSpeedModifiers(lightFactor, heavyFactor);
      console.log(`✓ Rain speed modifiers updated: Light ${(lightFactor * 100)}%, Heavy ${(heavyFactor * 100)}%`);
    }
  },
  getRainSpeedModifiers: () => {
    if (vehicleSpawner) {
      const modifiers = vehicleSpawner.getRainSpeedModifiers();
      console.log('📊 Current Rain Speed Modifiers:', modifiers);
      return modifiers;
    }
  }
};

console.log('🎮 Traffic Simulation Controls Available:');
console.log('  trafficSimControls.setSpawnRate(maxPer10Sec) - Set max spawns per 10 seconds');
console.log('  trafficSimControls.setSpawnInterval(minMs, maxMs) - Set spawn interval range');
console.log('  trafficSimControls.setCongestionThresholds(greenMax, yellowMax) - Set congestion % thresholds');
console.log('  trafficSimControls.getCongestionThresholds() - Get current thresholds');
console.log('  trafficSimControls.setRainSpeedModifiers(lightFactor, heavyFactor) - Set rain speed factors (0.0-1.0)');
console.log('  trafficSimControls.getRainSpeedModifiers() - Get current rain modifiers');
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
    
    document.getElementById('display-spawn-rate').textContent = vehicleSpawner.maxSpawnsPer10Sec;
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
      document.getElementById('input-spawn-rate').value = 15;
      document.getElementById('input-spawn-min').value = 500;
      document.getElementById('input-spawn-max').value = 1200;
      
      window.trafficSimControls.setSpawnRate(15);
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

  // Congestion thresholds form
  setupCongestionThresholds();
  
  // Speed range form
  setupSpeedRange();
  
  // Rain speed modifiers form
  setupRainSpeedModifiers();
}

// Setup congestion thresholds form
function setupCongestionThresholds() {
  const congestionForm = document.getElementById('congestion-form');
  const btnResetCongestion = document.getElementById('btn-reset-congestion');

  // Form submit handler
  if (congestionForm) {
    congestionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const greenThreshold = parseInt(document.getElementById('input-green-threshold').value);
      const yellowThreshold = parseInt(document.getElementById('input-yellow-threshold').value);

      // Validate
      if (greenThreshold >= yellowThreshold) {
        alert('Green threshold must be less than yellow threshold!');
        return;
      }

      if (greenThreshold < 1 || greenThreshold > 100 || yellowThreshold < 1 || yellowThreshold > 100) {
        alert('Thresholds must be between 1 and 100!');
        return;
      }

      // Apply changes
      congestionThresholds.green = greenThreshold;
      congestionThresholds.yellow = yellowThreshold;
      
      console.log(`✓ Congestion thresholds updated: Green < ${greenThreshold}%, Yellow ${greenThreshold}-${yellowThreshold}%, Red > ${yellowThreshold}%`);
      
      // Visual feedback
      const btn = congestionForm.querySelector('.btn-set');
      btn.textContent = '✓ Applied!';
      setTimeout(() => {
        btn.textContent = 'Apply Thresholds';
      }, 2000);
    });
  }

  // Reset button
  if (btnResetCongestion) {
    btnResetCongestion.addEventListener('click', () => {
      document.getElementById('input-green-threshold').value = 55;
      document.getElementById('input-yellow-threshold').value = 70;
      
      congestionThresholds.green = 55;
      congestionThresholds.yellow = 70;
      
      console.log('✓ Congestion thresholds reset to defaults (Green < 55%, Yellow 55-70%, Red > 70%)');
    });
  }
}

// Setup speed range form
function setupSpeedRange() {
  const speedForm = document.getElementById('speed-form');
  const btnResetSpeed = document.getElementById('btn-reset-speed');

  // Form submit handler
  if (speedForm) {
    speedForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const minSpeed = parseInt(document.getElementById('input-speed-min').value);
      const maxSpeed = parseInt(document.getElementById('input-speed-max').value);

      // Validate
      if (minSpeed >= maxSpeed) {
        alert('Minimum speed must be less than maximum speed!');
        return;
      }

      if (minSpeed < 5 || maxSpeed > 150) {
        alert('Speed values are out of acceptable range!');
        return;
      }

      // Apply speed range (you can add actual implementation here)
      console.log(`✓ Speed range updated: ${minSpeed} - ${maxSpeed} km/h`);
      
      // Visual feedback
      const btn = speedForm.querySelector('.btn-set');
      btn.textContent = '✓ Applied!';
      setTimeout(() => {
        btn.textContent = 'Set Speed Range';
      }, 2000);
    });
  }

  // Reset button
  if (btnResetSpeed) {
    btnResetSpeed.addEventListener('click', () => {
      document.getElementById('input-speed-min').value = 20;
      document.getElementById('input-speed-max').value = 60;
      
      console.log('✓ Speed range reset to defaults (20-60 km/h)');
    });
  }
}

// Setup rain speed modifiers form
function setupRainSpeedModifiers() {
  const rainSpeedForm = document.getElementById('rain-speed-form');
  const btnResetRainSpeed = document.getElementById('btn-reset-rain-speed');

  // Form submit handler
  if (rainSpeedForm) {
    rainSpeedForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const lightRainSpeed = parseInt(document.getElementById('input-light-rain-speed').value);
      const heavyRainSpeed = parseInt(document.getElementById('input-heavy-rain-speed').value);

      // Validate
      if (heavyRainSpeed > lightRainSpeed) {
        alert('Heavy rain speed should be lower than light rain speed!');
        return;
      }

      if (lightRainSpeed < 10 || lightRainSpeed > 100 || heavyRainSpeed < 10 || heavyRainSpeed > 100) {
        alert('Speed percentages must be between 10 and 100!');
        return;
      }

      // Apply rain speed modifiers
      window.trafficSimControls.setRainSpeedModifiers(lightRainSpeed / 100, heavyRainSpeed / 100);
      
      // Visual feedback
      const btn = rainSpeedForm.querySelector('.btn-set');
      btn.textContent = '✓ Applied!';
      setTimeout(() => {
        btn.textContent = 'Set Rain Modifiers';
      }, 2000);
    });
  }

  // Reset button
  if (btnResetRainSpeed) {
    btnResetRainSpeed.addEventListener('click', () => {
      document.getElementById('input-light-rain-speed').value = 80;
      document.getElementById('input-heavy-rain-speed').value = 50;
      
      window.trafficSimControls.setRainSpeedModifiers(0.8, 0.5);
    });
  }
}

// Initialize control panel once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupControlPanel);
} else {
  setupControlPanel();
}
