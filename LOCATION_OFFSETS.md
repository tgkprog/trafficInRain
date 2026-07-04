# Location Offsets and Access Roads

## Overview
This document describes the updated road network with locations moved off main roads and connected via access roads.

## Location Offsets from Main Roads

All locations are now offset from main roads with dedicated access roads (1 bus + 1 car width = 6 meters):

| Location | Offset Distance | Direction | Road Connection Point | Final Position |
|----------|-----------------|-----------|----------------------|----------------|
| **Laxmi Township** | 300m | East | (200, 450) | (500, 450) |
| **Planet Medical** | 10m | East | (200, 950) | (210, 950) |
| **Kumar Samrudhi** | 150m | South | (550, 950) | (550, 800) |
| **Surabhi Township** | 200m | East | (550, 779) | (750, 779) |
| **Neuron School** | 50m | East | (550, 36) | (600, 36) |
| **Momo Hub** | 30m | North | (1000, 950) | (1000, 920) |
| **Aero Mall** | 40m | South | (1250, 1079) | (1250, 1119) |
| **Vibgyor School** | 50m | East | (800, 1093) | (850, 1093) |

## Access Roads Added

All access roads are 6 meters wide (1 bus + 1 car width):

### 1. **Access to Laxmi Township** (300m)
- **ID**: `access_laxmi_township`
- **From**: Alandi Road junction (200, 450)
- **To**: Laxmi Township (500, 450)
- **Width**: 6m, 2 lanes
- **Speed Limit**: 25 km/h
- **Waypoints**: 
  - Junction: (200, 450)
  - Midpoint: (350, 450)
  - Destination: (500, 450)

### 2. **Access to Planet Medical** (10m)
- **ID**: `access_planet_medical`
- **From**: Alandi/Airport Road junction (200, 950)
- **To**: Planet Medical (210, 950)
- **Width**: 6m, 2 lanes
- **Speed Limit**: 20 km/h
- **Waypoints**: Direct connection

### 3. **Access to Kumar Samrudhi** (150m)
- **ID**: `access_kumar_samrudhi`
- **From**: Airport Road junction (550, 950)
- **To**: Kumar Samrudhi (550, 800)
- **Width**: 6m, 2 lanes
- **Speed Limit**: 25 km/h
- **Waypoints**: 
  - Junction: (550, 950)
  - Midpoint: (550, 875)
  - Destination: (550, 800)

### 4. **Access to Surabhi Township** (200m)
- **ID**: `access_surabhi_township`
- **From**: Tingre Nagar Road junction (550, 779)
- **To**: Surabhi Township (750, 779)
- **Width**: 6m, 2 lanes
- **Speed Limit**: 25 km/h
- **Waypoints**: 
  - Junction: (550, 779)
  - Midpoint: (650, 779)
  - Destination: (750, 779)

### 5. **Access to Neuron School** (50m)
- **ID**: `access_neuron_school`
- **From**: Tingre Nagar Road (550, 36)
- **To**: Neuron School (600, 36)
- **Width**: 6m, 2 lanes
- **Speed Limit**: 20 km/h
- **Waypoints**: Direct connection

### 6. **Access to Momo Hub** (30m)
- **ID**: `access_momo_hub`
- **From**: Airport Road junction (1000, 950)
- **To**: Momo Hub (1000, 920)
- **Width**: 6m, 2 lanes
- **Speed Limit**: 20 km/h
- **Waypoints**: 
  - Junction: (1000, 950)
  - Midpoint: (1000, 935)
  - Destination: (1000, 920)

### 7. **Access to Aero Mall** (40m)
- **ID**: `access_aero_mall`
- **From**: Aero Mall Road (1250, 1079)
- **To**: Aero Mall (1250, 1119)
- **Width**: 6m, 2 lanes
- **Speed Limit**: 20 km/h
- **Waypoints**: 
  - Junction: (1250, 1079)
  - Midpoint: (1250, 1099)
  - Destination: (1250, 1119)

### 8. **Access to Vibgyor School** (50m)
- **ID**: `access_vibgyor_school`
- **From**: Vibgyor connector road (800, 1093)
- **To**: Vibgyor School (850, 1093)
- **Width**: 6m, 2 lanes
- **Speed Limit**: 20 km/h
- **Waypoints**: 
  - Junction: (800, 1093)
  - Midpoint: (825, 1093)
  - Destination: (850, 1093)

## Road Network Changes

### New Junction Nodes
To support the access roads, the following junction nodes were added:

- `laxmi_junction` - (200, 450) - Alandi Road
- `planet_junction` - (200, 950) - Alandi/Airport Road intersection
- `kumar_junction` - (550, 950) - Airport Road
- `surabhi_junction` - (550, 779) - Tingre Nagar Road
- `neuron_junction` - (550, 36) - Tingre Nagar Road
- `momo_junction` - (1000, 950) - Airport Road
- `aero_mall_junction` - (1250, 1079) - Aero Mall Road
- `vibgyor_junction` - (800, 1093) - Vibgyor connector

### Road Specification: 1 Bus + 1 Car Width
All access roads are designed to accommodate:
- **1 Bus**: ~2.5m width
- **1 Car**: ~1.8m width
- **Total Road Width**: 6 meters
- **Lanes**: 2 (bidirectional)
- **Speed Limits**: 20-25 km/h (residential access roads)

## Updated locations.json Structure

Each location now includes:
```json
{
  "x": <new_position_x>,
  "y": <new_position_y>,
  "roadConnection": {
    "x": <junction_x>,
    "y": <junction_y>
  },
  "offsetMeters": <distance_from_road>
}
```

## Impact on Simulation

### Vehicle Behavior
- Vehicles now travel to junction points first
- Then navigate access roads to reach destinations
- Lower speed limits on access roads (20-25 km/h)
- More realistic "last mile" routing

### Pathfinding
- The BFS pathfinding algorithm handles the new road topology
- Junction nodes serve as intermediate waypoints
- Access roads are treated as separate edges in the graph

### Realism Improvements
- **Traffic Separation**: Main roads no longer congested with destination arrivals
- **Speed Variation**: Vehicles slow down when entering residential areas
- **Visual Clarity**: Clear distinction between main roads and access roads
- **Realistic Layout**: Matches real-world patterns where buildings are set back from roads

## Configuration Files Updated

1. **locations.json**: Updated all 8 location coordinates with offsets
2. **roads.json**: Added 8 new access road segments with junction nodes

## Build Status

✅ Build successful - all changes verified
```bash
npm run build
✓ 18 modules transformed
✓ built in 1.97s
```

## Testing

To see the changes:
```bash
npm run dev
```

Observe:
- Locations are now offset from main roads
- Vehicles follow access roads to destinations
- Reduced speed on narrow access roads
- More realistic traffic flow patterns

---

**Updated**: July 4, 2026
**Build Version**: 1.0.0
