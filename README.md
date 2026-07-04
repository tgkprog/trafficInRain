# Traffic in Rain Simulation

A web-based traffic simulation demonstrating how rainfall affects traffic flow in Pune, India (Vishrantwadi & Viman Nagar area). This project visualizes the impact of weather conditions on vehicle movement and congestion patterns through an interactive 2D physics-based simulation.

## 🎯 Project Overview

This simulation aims to show why traffic slows down during rain (as observed in Bangalore and Pune) by modeling realistic vehicle behavior under different weather conditions:

- **No Rain**: Normal traffic flow with optimal speeds
- **Light Rain**: Moderate speed reduction and increased following distances
- **Heavy Rain**: Significant slowdown, reduced visibility, and heightened congestion

## 🚗 Features

### Current Implementation (~55% Complete)

- ✅ **Real Map Data**: Accurate GPS coordinates for 8 key locations in Pune
- ✅ **Road Network**: Realistic road topology with varying widths (4-14m)
- ✅ **12 Vehicle Types**: Cars, SUVs, motorcycles, buses, trucks, auto-rickshaws, cycles, and pedestrians
- ✅ **Physics Engine**: Matter.js integration for realistic movement
- ✅ **Pathfinding**: BFS-based routing between locations
- ✅ **Vehicle Spawning**: Weighted distribution system spawning vehicles at realistic rates
- ✅ **Smooth Animation**: 60 FPS rendering with requestAnimationFrame
- ✅ **Weather Controls**: UI for toggling between weather states

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
- **Physics Engine**: Matter.js (2D Top-Down)
- **Rendering**: HTML5 Canvas
- **UI Controls**: lil-gui (planned)
- **Language**: JavaScript (ES6 Modules)

## 📦 Installation & Setup

### Prerequisites
- **Node.js** 22.21.1 or higher

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd trafficInRain

# Install dependencies (Vite, Matter.js, lil-gui)
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
3. Use the weather control panel to switch between:
   - **No Rain**: Clear conditions (friction: 0.8)
   - **Light Rain**: Moderate effects (friction: 0.6)
   - **Heavy Rain**: Severe conditions (friction: 0.4)
4. Observe how traffic patterns change with different weather states

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
│   │   ├── PhysicsWorld.js  # Matter.js wrapper
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

The simulation runs on a standard game loop:

- **Main Loop**: ~60 FPS via `requestAnimationFrame()`
- **Delta Time**: Calculated each frame for smooth interpolation
- **Vehicle Updates**: Position updated every frame based on velocity
- **Spawn Interval**: New vehicles spawn every 2000ms (configurable)

### Performance Specs
- Target: 60 FPS with 50 concurrent vehicles
- Automatic cleanup of inactive vehicles
- Canvas-based rendering for optimal performance

## 🚧 Roadmap

### Phase 3 - Steering AI (In Progress)
- [ ] Collision avoidance between vehicles
- [ ] Lane-keeping behavior
- [ ] Dynamic speed modulation
- [ ] Vehicle-to-vehicle spacing

### Phase 4 - Weather Engine
- [ ] Rain particle rendering
- [ ] Dynamic friction adjustments
- [ ] Waterlogged zone slowdowns
- [ ] Visibility reduction effects

### Phase 5 - Analytics & UI
- [ ] Real-time statistics dashboard
- [ ] Average speed charts
- [ ] Congestion heatmaps
- [ ] Interactive lil-gui controls

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
spawnRate: 2000,        // ms between spawns
maxVehicles: 50,        // concurrent vehicle limit
```

## 🤝 Contributing

Contributions welcome! Priority areas:
1. Collision avoidance algorithms
2. Lane discipline implementation
3. Weather effect rendering
4. Performance optimizations
5. UI/UX enhancements

## 📄 License

This project is licensed under the **Mozilla Public License Version 2.0** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Road data based on OpenStreetMap and Google Maps
- Physics simulation powered by Matter.js
- Inspired by real traffic patterns in Pune, India

## 📞 Support & Documentation

- **Execution Tracker**: `docs/plan2.html`
- **Requirements**: `docs/req.prompt`
- **Technical Guides**: `docs/` directory

---

**Status**: Active Development | **Version**: 1.0.0 | **Last Updated**: July 4, 2026
