import locationsData from '../config/locations.json';
import roadsData from '../config/roads.json';

export class RoadNetwork {
  constructor() {
    this.locations = locationsData;
    this.roads = roadsData.edges;
    this.bounds = roadsData.bounds;
    
    // Create lookup maps
    this.locationMap = new Map(this.locations.map(loc => [loc.id, loc]));
    this.roadMap = new Map(this.roads.map(road => [road.id, road]));
  }

  getLocations() {
    return this.locations;
  }

  getRoads() {
    return this.roads;
  }

  getLocation(id) {
    return this.locationMap.get(id);
  }

  getRoad(id) {
    return this.roadMap.get(id);
  }
}
