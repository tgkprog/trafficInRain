# Traffic in Rain Simulation

A web-based traffic simulation demonstrating how rainfall affects traffic flow in Pune, India (Vishrantwadi & Viman Nagar area). This project visualizes the impact of weather conditions on vehicle movement and congestion patterns through an interactive 2D simulation.

## 🎯 Project Overview

This simulation aims to show why traffic slows down during rain (as observed in Bangalore and Pune) by modeling realistic vehicle behavior under different weather conditions:

- **No Rain**: Normal traffic flow with optimal speeds
- **Light Rain**: Moderate speed reduction and increased following distances
- **Heavy Rain**: Significant slowdown, reduced visibility, and heightened congestion

## 🚗 Features

### Current Implementation (~75% Complete)

- ✅ **Real Map Data**: Accurate GPS coordinates for 8 key locations in Pune
- ✅ **Road Network**: Realistic road topology with varying widths (4-14m)
- ✅ **12 Vehicle Types**: Cars, SUVs, motorcycles, buses, trucks, auto-rickshaws, cycles, and pedestrians
- ✅ **Waypoint Navigation**: Direct vehicle movement along predefined paths
- ✅ **Pathfinding**: BFS-based routing between locations
- ✅ **Dynamic Spawning**: Rate-limited spawning (max 4 vehicles per 10 seconds)
- ✅ **Smooth Animation**: 60 FPS rendering with requestAnimationFrame
- ✅ **Weather System**: Rain particle rendering with 150-400 animated drops
- ✅ **Speed Modifiers**: Weather-based speed changes (Clear 100%, Light 80%, Heavy 50%)
- ✅ **Visual Effects**: Rain haze overlay and dynamic weather transitions
- ✅ **Left-Side Driving**: Indian traffic convention with vehicles on left side of road
- ✅ **Traffic-Aware Speed**: Vehicles slow down when near others ahead
- ✅ **Congestion Modeling**: Natural vehicle accumulation during rain
- ✅ **Control Panel UI**: Scrollable form to adjust spawn rates in real-time

### Locations Modeled

1. D Block Surabhi Township
2. Aero Mall (Airport Road entrance)
3. Vibgyor Yerwada School
4. Planet Medical
5. Momo Hub
6. A7 Kumar Samrudhi Flats
7. Laxmi Township 3 Kalas
8. Neuron School

## 🛠️ Technology Stack

- **Bundler/Server**: Vite
- **Rendering**: HTML5 Canvas
- **UI Controls**: Native HTML controls
- **Language**: JavaScript (ES6 Modules)

## 📦 Installation & Setup

### Prerequisites
- **Node.js** 22.21.1 or higher

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd trafficInRain

# Install dependencies (Vite only)
npm install
```

### Initialize Configuration Data (Optional)
Configuration files have been pre-generated in `src/config/`. To regenerate:
```bash
node scripts/initializeData.js
```

### Running the Simulation

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open your browser to the address shown (usually `http://localhost:5173`)

## 🎮 Usage

1. Open the application in your browser
2. Watch vehicles spawn and navigate between locations
3. **Weather Controls** (top bar): Switch between:
   - **No Rain**: Clear conditions
   - **Light Rain**: Moderate speed reduction
   - **Heavy Rain**: Severe slowdown and congestion buildup
4. **Scroll down** to access the Control Panel:
   - Adjust spawn rate (vehicles per 10 seconds)
   - Modify spawn intervals (300-800ms)
   - Clear all vehicles
   - View real-time statistics
5. Observe how traffic patterns change with different weather states

### Key Behaviors:
- **Left-Side Driving**: Vehicles follow Indian traffic convention, traveling on left side of road
- **Traffic-Aware**: Vehicles slow down when near others ahead
- **Natural Congestion**: More vehicles accumulate during rain due to slower speeds (50% reduction in heavy rain)
- **No Hard Limit**: Total vehicles on road depends on spawn rate and journey completion times
- **Pass-Through Movement**: Vehicles can overlap (simplified model for demonstration purposes)

## 🏗️ Project Structure

```
trafficInRain/
├── docs/                    # Documentation and planning
│   ├── req.prompt           # Project requirements
│   ├── plan2.html           # Execution tracker dashboard
│   ├── roadsLocations.html  # Coordinates lookup guide
│   └── aiDataInitialization.html
├── scripts/
│   └── initializeData.js    # Data generation script
├── src/
│   ├── config/              # JSON configuration files
│   │   ├── locations.json   # GPS coordinates & canvas positions
│   │   ├── roads.json       # Road network topology
│   │   ├── vehicles.json    # Vehicle specifications
│   │   └── weather.json     # Weather effect coefficients
│   ├── engine/              # Core simulation engine
│   │   └── VehicleSpawner.js
│   ├── entities/
│   │   └── Vehicle.js       # Vehicle entity class
│   ├── map/
│   │   ├── MapRenderer.js   # Canvas rendering
│   │   ├── PathPlanner.js   # BFS pathfinding
│   │   └── RoadNetwork.js   # Network graph management
│   └── main.js              # Application entry point
├── index.html               # Main interface
├── style.css                # Dark-themed UI styles
├── package.json
├── vite.config.js
├── .gitignore
├── LICENSE                  # Mozilla Public License 2.0
└── README.md
```

## 🎯 Animation & Tick System

The simulation runs on a standard game loop with weather-aware dynamics:

- **Main Loop**: ~60 FPS via `requestAnimationFrame()`
- **Delta Time**: Calculated each frame for smooth interpolation
- **Vehicle Updates**: Position updated every frame with traffic awareness
- **Spawn Control**: Rate-limited to max 4 vehicles per 10-second window (default)
- **Rain Particles**: 150 (light) to 400 (heavy) animated drops
- **Lane Positioning**: 8-pixel left offset from road centerline
- **No Hard Vehicle Limit**: Vehicles accumulate based on journey times

### Weather Impact on Speed & Congestion

| Condition | Speed Factor | Avg Speed (base 50 km/h) | Journey Time | Vehicles on Road |
|-----------|--------------|--------------------------|--------------|------------------|
| Clear     | 115% (1.15)  | 57.5 km/h               | 1.7 minutes  | ~10 vehicles     |
| Light Rain | 92% (0.92)  | 46 km/h                 | 2.2 minutes  | ~13 vehicles     |
| Heavy Rain | 57.5% (0.575)| 28.75 km/h             | 3.5 minutes  | ~20 vehicles     |

*Same spawn rate (4 per 10 sec) produces different accumulation due to variable journey times. Speed increased 15% from previous baseline.*

### Vehicle Behavior

- **Left-Side Driving**: Vehicles travel 8 pixels left of road centerline (Indian traffic)
- **Waypoint Navigation**: Direct movement from waypoint to waypoint (no physics)
- **Following Distance**: Dynamic slowdown when within 80 pixels of vehicle ahead
- **Speed Modulation**: 
  - Base speed from vehicle config
  - Weather modifier (Clear 100%, Light 80%, Heavy 50%)
  - Random slowdowns (2% chance per frame during rain for realism)
  - Traffic-based reduction (proximity to vehicles ahead)

### Performance Specs
- Target: 60 FPS with 50+ concurrent vehicles
- Rain rendering: <3% CPU overhead
- Automatic cleanup of inactive vehicles (completed journeys)
- Canvas-based rendering for optimal performance

## 🚧 Roadmap

### Phase 3 - Steering AI ✅ COMPLETED
- [x] BFS pathfinding along road network
- [x] Waypoint-following movement
- [x] Basic lane discipline (left lane positioning)
- [x] Traffic-aware speed modulation
- [x] Dynamic slowdown based on nearby vehicles
- [x] Weather-based random speed variations

**Note**: Vehicle collision detection is simplified - vehicles may pass through each other during overtaking. This is intentional for the current phase to focus on congestion patterns rather than precise collision physics.

### Phase 4 - Weather Engine ✅ COMPLETED
- [x] Rain particle rendering (150-400 drops)
- [x] Dynamic friction adjustments
- [x] Per-vehicle speed modifiers (10-35% reduction)
- [x] Visual haze overlay
- [x] Weather state propagation

### Phase 5 - Analytics & UI ✅ COMPLETED
- [x] Real-time statistics display
- [x] Average speed tracking (km/h)
- [x] Congestion level indicator
- [x] Control panel for spawn rate adjustment
- [x] Live vehicle count display

### Future Enhancements
- [ ] Precise collision avoidance (prevent overlap)
- [ ] Multiple lane support per road
- [ ] Traffic lights at intersections
- [ ] Historic data tracking and charts
- [ ] Adaptive spawn rates based on congestion

## 🔧 Configuration

### Vehicle Types
Each vehicle type includes:
- Physical dimensions (width, length in meters)
- Maximum speed (km/h)
- Spawn weight (probability distribution)
- Visual color

### Weather Modifiers
- **Dry**: friction = 0.8, normal spacing
- **Light Rain**: friction = 0.6, increased spacing
- **Heavy Rain**: friction = 0.4, maximum spacing

### Spawn Settings
```javascript
spawnRateMin: 300,           // Minimum ms between spawns
spawnRateMax: 800,           // Maximum ms between spawns
maxSpawnsPer10Sec: 4,        // Rate limit (no hard vehicle cap)
// Total vehicles on road = spawn rate × average journey time
```

### Lane Behavior
```javascript
laneOffset: 8,               // Pixels to left of road centerline
// Simplified model: vehicles may overlap during overtaking
// Focus on congestion patterns, not collision precision
```

### Weather Effects
Each vehicle type responds differently to rain:
```javascript
// Example: Car in heavy rain
speedFactor: 0.75,           // 25% slower (base modifier)
rainParticles: 400,          // Dense rain
haze: 8%,                    // Visibility reduction
randomSlowdowns: 2%,         // Per-frame chance of additional slowdown
trafficSlowdown: dynamic,    // Based on nearby vehicles
```

### Runtime Controls
Adjust via browser console or UI control panel:
```javascript
// Via console
trafficSimControls.setSpawnRate(12);        // Higher traffic
trafficSimControls.setSpawnInterval(300, 800);  // Faster spawns
trafficSimControls.getStats();              // View metrics
trafficSimControls.clearVehicles();         // Reset simulation

// Via UI: Scroll down below map to access control panel
```

## 🤝 Contributing

Contributions welcome! Priority areas:
1. ~~Collision avoidance algorithms~~ (Basic implementation complete, precision TBD)
2. ~~Lane discipline implementation~~ ✅ COMPLETED (Simplified left-lane model)
3. ~~Weather effect rendering~~ ✅ COMPLETED
4. ~~Dynamic speed modulation~~ ✅ COMPLETED
5. ~~UI controls for spawn rates~~ ✅ COMPLETED
6. Performance optimizations
7. Historic data tracking and visualization
8. Multiple lane support
9. Traffic light simulation

## 📄 License

This project is licensed under the **Mozilla Public License Version 2.0** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Road data based on OpenStreetMap and Google Maps
- Physics simulation powered by Matter.js
- Inspired by real traffic patterns in Pune, India

## 📞 Support & Documentation

- **Execution Tracker**: `docs/plan2.html` (75% complete)
- **Requirements**: `docs/req.prompt`
- **Weather Implementation**: `WEATHER_IMPLEMENTATION.md`
- **Dynamic Speed Modulation**: `DYNAMIC_SPEED_IMPLEMENTATION.md`
- **Spawn Control System**: `SPAWN_CONTROL_UPDATE.md`
- **Control Panel UI**: `CONTROL_PANEL_UI.md`
- **Technical Guides**: `docs/` directory

---

**Status**: Active Development | **Version**: 1.0.0 | **Last Updated**: July 4, 2026
