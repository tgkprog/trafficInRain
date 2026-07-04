const fs = require('fs');
const path = require('path');

// Target directory
const configDir = path.join(__dirname, '../src/config');

// Ensure directories exist
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// 1. Locations list with coordinates
const rawLocations = [
  {
    id: "surabhi_d_block",
    name: "D Block Surabhi Township",
    type: "residential",
    lat: 18.5735,
    lng: 73.8965,
    spawnRate: 0.8,
    attractionWeight: 1.0
  },
  {
    id: "aero_mall",
    name: "Aero Mall (Entrance facing airport)",
    type: "commercial",
    lat: 18.5714,
    lng: 73.9150,
    spawnRate: 1.2,
    attractionWeight: 2.0
  },
  {
    id: "vibgyor_yerwada",
    name: "Vibgyor Yerwada School",
    type: "school",
    lat: 18.5582,
    lng: 73.9054,
    spawnRate: 1.0,
    attractionWeight: 1.5
  },
  {
    id: "planet_medical",
    name: "Planet Medical",
    type: "commercial",
    lat: 18.5726,
    lng: 73.8782,
    spawnRate: 0.7,
    attractionWeight: 1.0
  },
  {
    id: "momo_hub",
    name: "Momo Hub",
    type: "commercial",
    lat: 18.5704,
    lng: 73.9023,
    spawnRate: 0.9,
    attractionWeight: 1.2
  },
  {
    id: "kumar_samrudhi",
    name: "A7 Kumar Samrudhi Flats",
    type: "residential",
    lat: 18.5752,
    lng: 73.8860,
    spawnRate: 0.8,
    attractionWeight: 1.0
  },
  {
    id: "laxmi_township",
    name: "Laxmi Township 3 Kalas",
    type: "residential",
    lat: 18.5912,
    lng: 73.8765,
    spawnRate: 0.6,
    attractionWeight: 0.8
  },
  {
    id: "neuron_school",
    name: "Neuron School",
    type: "school",
    lat: 18.5753,
    lng: 73.8936,
    spawnRate: 1.0,
    attractionWeight: 1.5
  }
];

// Determine Bounding Box
const latVals = rawLocations.map(l => l.lat);
const lngVals = rawLocations.map(l => l.lng);
const BOUNDS = {
  minLat: Math.min(...latVals) - 0.003,
  maxLat: Math.max(...latVals) + 0.003,
  minLng: Math.min(...lngVals) - 0.003,
  maxLng: Math.max(...lngVals) + 0.003
};

const CANVAS_WIDTH = 1400;
const CANVAS_HEIGHT = 900;
const PADDING = 80;

// Projection function
function gpsToCanvas(lat, lng) {
  const nx = (lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng);
  const ny = (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat);
  const x = PADDING + nx * (CANVAS_WIDTH - 2 * PADDING);
  const y = PADDING + (1 - ny) * (CANVAS_HEIGHT - 2 * PADDING);
  return { x: Math.round(x), y: Math.round(y) };
}

function metersToPixels(meters) {
  // ~111,320 meters per degree lat at this latitude
  const degreesPerMeter = 1 / 111320;
  const latRange = BOUNDS.maxLat - BOUNDS.minLat;
  const pixelsPerDegree = (CANVAS_HEIGHT - 2 * PADDING) / latRange;
  return Math.round(meters * degreesPerMeter * pixelsPerDegree);
}

// 2. Compute Projected Locations
const locations = rawLocations.map(loc => {
  const proj = gpsToCanvas(loc.lat, loc.lng);
  return {
    ...loc,
    x: proj.x,
    y: proj.y
  };
});

// 3. Setup Roads with GPS Waypoints
const rawRoads = [
  {
    id: "airport_road_east",
    name: "Airport Road East",
    from: "momo_hub",
    to: "aero_mall",
    widthMeters: 14,
    widthClass: "wide",
    lanes: 4,
    speedLimit: 50,
    bidirectional: true,
    waypoints: [
      { lat: 18.5704, lng: 73.9023 },
      { lat: 18.5710, lng: 73.9100 },
      { lat: 18.5714, lng: 73.9150 }
    ]
  },
  {
    id: "tingre_nagar_road",
    name: "Tingre Nagar Road",
    from: "momo_hub",
    to: "neuron_school",
    widthMeters: 8,
    widthClass: "medium",
    lanes: 2,
    speedLimit: 40,
    bidirectional: true,
    waypoints: [
      { lat: 18.5704, lng: 73.9023 },
      { lat: 18.5720, lng: 73.8980 },
      { lat: 18.5753, lng: 73.8936 }
    ]
  },
  {
    id: "tingre_nagar_lane_11",
    name: "Tingre Nagar Lane 11",
    from: "neuron_school",
    to: "surabhi_d_block",
    widthMeters: 5,
    widthClass: "narrow",
    lanes: 1,
    speedLimit: 30,
    bidirectional: true,
    waypoints: [
      { lat: 18.5753, lng: 73.8936 },
      { lat: 18.5745, lng: 73.8950 },
      { lat: 18.5735, lng: 73.8965 }
    ]
  },
  {
    id: "tingre_nagar_lane_1",
    name: "Tingre Nagar Lane 1",
    from: "surabhi_d_block",
    to: "kumar_samrudhi",
    widthMeters: 5,
    widthClass: "narrow",
    lanes: 1,
    speedLimit: 30,
    bidirectional: true,
    waypoints: [
      { lat: 18.5735, lng: 73.8965 },
      { lat: 18.5740, lng: 73.8910 },
      { lat: 18.5752, lng: 73.8860 }
    ]
  },
  {
    id: "siddheshwar_nagar_road",
    name: "Siddheshwar Nagar Road",
    from: "kumar_samrudhi",
    to: "planet_medical",
    widthMeters: 8,
    widthClass: "medium",
    lanes: 2,
    speedLimit: 40,
    bidirectional: true,
    waypoints: [
      { lat: 18.5752, lng: 73.8860 },
      { lat: 18.5740, lng: 73.8820 },
      { lat: 18.5726, lng: 73.8782 }
    ]
  },
  {
    id: "alandi_road",
    name: "Alandi Road",
    from: "planet_medical",
    to: "laxmi_township",
    widthMeters: 12,
    widthClass: "wide",
    lanes: 4,
    speedLimit: 50,
    bidirectional: true,
    waypoints: [
      { lat: 18.5726, lng: 73.8782 },
      { lat: 18.5820, lng: 73.8770 },
      { lat: 18.5912, lng: 73.8765 }
    ]
  },
  {
    id: "airport_road_west",
    name: "Airport Road West",
    from: "planet_medical",
    to: "vibgyor_yerwada",
    widthMeters: 14,
    widthClass: "wide",
    lanes: 4,
    speedLimit: 50,
    bidirectional: true,
    waypoints: [
      { lat: 18.5726, lng: 73.8782 },
      { lat: 18.5680, lng: 73.8850 },
      { lat: 18.5620, lng: 73.8950 },
      { lat: 18.5582, lng: 73.9054 }
    ]
  },
  {
    id: "samrat_ashoka_path",
    name: "Samrat Ashoka Path",
    from: "aero_mall",
    to: "vibgyor_yerwada",
    widthMeters: 14,
    widthClass: "wide",
    lanes: 4,
    speedLimit: 50,
    bidirectional: true,
    waypoints: [
      { lat: 18.5714, lng: 73.9150 },
      { lat: 18.5660, lng: 73.9100 },
      { lat: 18.5582, lng: 73.9054 }
    ]
  },
  {
    id: "commerzone_link_road",
    name: "Commerzone Link Road",
    from: "momo_hub",
    to: "vibgyor_yerwada",
    widthMeters: 8,
    widthClass: "medium",
    lanes: 2,
    speedLimit: 45,
    bidirectional: true,
    waypoints: [
      { lat: 18.5704, lng: 73.9023 },
      { lat: 18.5640, lng: 73.9040 },
      { lat: 18.5582, lng: 73.9054 }
    ]
  }
];

// Project roads to canvas
const roads = {
  bounds: BOUNDS,
  edges: rawRoads.map(road => {
    return {
      ...road,
      widthPixels: metersToPixels(road.widthMeters),
      waypoints: road.waypoints.map(wp => {
        const proj = gpsToCanvas(wp.lat, wp.lng);
        return {
          lat: wp.lat,
          lng: wp.lng,
          x: proj.x,
          y: proj.y
        };
      })
    };
  })
};

// 4. Vehicles configurations (12 types)
const vehicles = {
  pedestrian: {
    label: "Pedestrian",
    widthMeters: 0.5,
    lengthMeters: 0.5,
    maxSpeedKmH: 5,
    acceleration: 1.5,
    color: "#a78bfa",
    spawnWeight: 10,
    rainModifiers: {
      light: { speedFactor: 0.7, spawnFactor: 0.5 },
      heavy: { speedFactor: 0.4, spawnFactor: 0.15 }
    }
  },
  cycle: {
    label: "Cycle",
    widthMeters: 0.6,
    lengthMeters: 1.8,
    maxSpeedKmH: 18,
    acceleration: 2.0,
    color: "#34d399",
    spawnWeight: 8,
    rainModifiers: {
      light: { speedFactor: 0.75, spawnFactor: 0.4 },
      heavy: { speedFactor: 0.5, spawnFactor: 0.1 }
    }
  },
  auto: {
    label: "Three Wheeler Auto",
    widthMeters: 1.4,
    lengthMeters: 2.6,
    maxSpeedKmH: 40,
    acceleration: 2.5,
    color: "#fbbf24",
    spawnWeight: 15,
    rainModifiers: {
      light: { speedFactor: 0.85, spawnFactor: 1.1 }, // Autos might increase in rain as people seek rides!
      heavy: { speedFactor: 0.65, spawnFactor: 0.8 }
    }
  },
  car: {
    label: "Car",
    widthMeters: 1.8,
    lengthMeters: 4.2,
    maxSpeedKmH: 50,
    acceleration: 3.0,
    color: "#60a5fa",
    spawnWeight: 20,
    rainModifiers: {
      light: { speedFactor: 0.9, spawnFactor: 1.2 }, // Car count increases in rain
      heavy: { speedFactor: 0.75, spawnFactor: 1.0 }
    }
  },
  small_truck: {
    label: "Small Truck (4W)",
    widthMeters: 2.0,
    lengthMeters: 5.0,
    maxSpeedKmH: 40,
    acceleration: 1.8,
    color: "#fb923c",
    spawnWeight: 6,
    rainModifiers: {
      light: { speedFactor: 0.88, spawnFactor: 0.9 },
      heavy: { speedFactor: 0.7, spawnFactor: 0.6 }
    }
  },
  large_truck: {
    label: "Large Truck (6W)",
    widthMeters: 2.5,
    lengthMeters: 7.5,
    maxSpeedKmH: 35,
    acceleration: 1.2,
    color: "#f87171",
    spawnWeight: 3,
    rainModifiers: {
      light: { speedFactor: 0.9, spawnFactor: 0.8 },
      heavy: { speedFactor: 0.75, spawnFactor: 0.5 }
    }
  },
  matador: {
    label: "Matador Van (10 seater)",
    widthMeters: 2.0,
    lengthMeters: 5.5,
    maxSpeedKmH: 45,
    acceleration: 2.2,
    color: "#c084fc",
    spawnWeight: 7,
    rainModifiers: {
      light: { speedFactor: 0.88, spawnFactor: 1.0 },
      heavy: { speedFactor: 0.72, spawnFactor: 0.8 }
    }
  },
  luggage_auto: {
    label: "Small Luggage Auto",
    widthMeters: 1.3,
    lengthMeters: 2.8,
    maxSpeedKmH: 35,
    acceleration: 2.0,
    color: "#fcd34d",
    spawnWeight: 8,
    rainModifiers: {
      light: { speedFactor: 0.85, spawnFactor: 0.9 },
      heavy: { speedFactor: 0.65, spawnFactor: 0.6 }
    }
  },
  small_bus: {
    label: "Small Bus",
    widthMeters: 2.3,
    lengthMeters: 7.0,
    maxSpeedKmH: 40,
    acceleration: 1.5,
    color: "#2dd4bf",
    spawnWeight: 4,
    rainModifiers: {
      light: { speedFactor: 0.9, spawnFactor: 1.0 },
      heavy: { speedFactor: 0.78, spawnFactor: 0.9 }
    }
  },
  medium_bus: {
    label: "Medium Bus",
    widthMeters: 2.5,
    lengthMeters: 9.0,
    maxSpeedKmH: 38,
    acceleration: 1.2,
    color: "#38bdf8",
    spawnWeight: 3,
    rainModifiers: {
      light: { speedFactor: 0.9, spawnFactor: 1.0 },
      heavy: { speedFactor: 0.78, spawnFactor: 0.9 }
    }
  },
  large_bus: {
    label: "Large Bus",
    widthMeters: 2.5,
    lengthMeters: 12.0,
    maxSpeedKmH: 35,
    acceleration: 1.0,
    color: "#818cf8",
    spawnWeight: 2,
    rainModifiers: {
      light: { speedFactor: 0.92, spawnFactor: 1.0 },
      heavy: { speedFactor: 0.8, spawnFactor: 0.9 }
    }
  },
  disabled_3w: {
    label: "Disabled 3-Wheeler",
    widthMeters: 1.2,
    lengthMeters: 2.0,
    maxSpeedKmH: 20,
    acceleration: 1.5,
    color: "#fb7185",
    spawnWeight: 2,
    rainModifiers: {
      light: { speedFactor: 0.8, spawnFactor: 0.7 },
      heavy: { speedFactor: 0.55, spawnFactor: 0.3 }
    }
  }
};

// 5. Weather modifiers configuration
const weather = {
  none: {
    roadFriction: 1.0,
    visibilityMeters: 1000,
    brakingDistanceMultiplier: 1.0,
    followingDistanceMultiplier: 1.0,
    waterloggingSlowdownFactor: 0.0
  },
  light: {
    roadFriction: 0.7,
    visibilityMeters: 200,
    brakingDistanceMultiplier: 1.5,
    followingDistanceMultiplier: 1.4,
    waterloggingSlowdownFactor: 0.05
  },
  heavy: {
    roadFriction: 0.4,
    visibilityMeters: 80,
    brakingDistanceMultiplier: 2.5,
    followingDistanceMultiplier: 2.0,
    waterloggingSlowdownFactor: 0.3
  }
};

// Write files
fs.writeFileSync(path.join(configDir, 'locations.json'), JSON.stringify(locations, null, 2));
fs.writeFileSync(path.join(configDir, 'roads.json'), JSON.stringify(roads, null, 2));
fs.writeFileSync(path.join(configDir, 'vehicles.json'), JSON.stringify(vehicles, null, 2));
fs.writeFileSync(path.join(configDir, 'weather.json'), JSON.stringify(weather, null, 2));

console.log("Configuration files initialized successfully in src/config/:");
console.log("- locations.json");
console.log("- roads.json");
console.log("- vehicles.json");
console.log("- weather.json");
console.log(`Canvas Bounding Box used: Lat [${BOUNDS.minLat}, ${BOUNDS.maxLat}], Lng [${BOUNDS.minLng}, ${BOUNDS.maxLng}]`);
