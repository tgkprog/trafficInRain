export class MapRenderer {
  constructor(canvas, ctx, roadNetwork) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.network = roadNetwork;
  }

  // Draw the entire static road map
  render() {
    this.clear();
    this.drawBackground();
    this.drawRoads();
    this.drawLocations();
    console.log('Map rendered - Locations:', this.network.getLocations().length, 'Roads:', this.network.getRoads().length);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawBackground() {
    // Fill canvas background
    this.ctx.fillStyle = '#090d16';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw subtle grid overlay
    this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.04)';
    this.ctx.lineWidth = 1;
    const gridSize = 40;
    
    for (let x = 0; x < this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  drawRoads() {
    const roads = this.network.getRoads();

    // Pass 1: Draw the solid road surface asphalt
    roads.forEach(road => {
      this.ctx.beginPath();
      this.ctx.strokeStyle = '#1e293b'; // Slate gray asphalt color
      this.ctx.lineWidth = road.widthPixels;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      road.waypoints.forEach((wp, index) => {
        if (index === 0) {
          this.ctx.moveTo(wp.x, wp.y);
        } else {
          this.ctx.lineTo(wp.x, wp.y);
        }
      });
      this.ctx.stroke();
    });

    // Pass 2: Draw inner lane markings
    roads.forEach(road => {
      // Draw road outlines/edges in thin dark slate
      this.ctx.beginPath();
      this.ctx.strokeStyle = '#334155';
      this.ctx.lineWidth = road.widthPixels + 2;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      
      road.waypoints.forEach((wp, index) => {
        if (index === 0) {
          this.ctx.moveTo(wp.x, wp.y);
        } else {
          this.ctx.lineTo(wp.x, wp.y);
        }
      });
      // Temporarily draw outline behind lanes by changing composite operation or using redrawing
      // But we can just draw thin white/yellow dashed markings inside.
    });

    // Pass 3: Draw internal lane markings (dashed/yellow separators)
    roads.forEach(road => {
      const numLanes = road.lanes;
      if (numLanes <= 1) return; // Single-lane narrow roads don't have lane markings

      this.ctx.save();
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      // Draw center double yellow lines for 4-lane wide roads, or simple divider for 2-lane medium roads
      if (numLanes === 4) {
        // Draw dashed lane separators (white)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        this.ctx.lineWidth = 1;
        
        // Left lane separator
        this.ctx.setLineDash([8, 12]);
        this.drawOffsetRoadLine(road, -road.widthPixels / 4);
        
        // Right lane separator
        this.drawOffsetRoadLine(road, road.widthPixels / 4);

        // Center line (Double solid yellow lines)
        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)'; // Amber/yellow
        this.ctx.lineWidth = 1.5;
        this.drawOffsetRoadLine(road, -1.5);
        this.drawOffsetRoadLine(road, 1.5);
      } else if (numLanes === 2) {
        // Simple dashed white line separating the two lanes
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([10, 15]);
        this.drawOffsetRoadLine(road, 0);
      }

      this.ctx.restore();
    });
  }

  // Helper to draw offset lines parallel to the road waypoints
  drawOffsetRoadLine(road, offset) {
    this.ctx.beginPath();
    
    for (let i = 0; i < road.waypoints.length - 1; i++) {
      const p1 = road.waypoints[i];
      const p2 = road.waypoints[i+1];
      
      // Calculate perpendicular offset vector
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx*dx + dy*dy);
      if (len === 0) continue;
      
      const nx = -dy / len;
      const ny = dx / len;
      
      const offsetP1x = p1.x + nx * offset;
      const offsetP1y = p1.y + ny * offset;
      const offsetP2x = p2.x + nx * offset;
      const offsetP2y = p2.y + ny * offset;
      
      if (i === 0) {
        this.ctx.moveTo(offsetP1x, offsetP1y);
      }
      this.ctx.lineTo(offsetP2x, offsetP2y);
    }
    
    this.ctx.stroke();
  }

  drawLocations() {
    const locations = this.network.getLocations();

    locations.forEach(loc => {
      this.ctx.save(); // Save context state
      
      // Determine color code by type
      let glowColor = '#10b981'; // green for residential
      let coreColor = '#34d399';
      
      if (loc.type === 'commercial') {
        glowColor = '#f59e0b'; // amber
        coreColor = '#fbbf24';
      } else if (loc.type === 'school') {
        glowColor = '#8b5cf6'; // violet
        coreColor = '#a78bfa';
      }

      // Draw outer glowing halo
      this.ctx.shadowColor = glowColor;
      this.ctx.shadowBlur = 12;
      this.ctx.fillStyle = `rgba(${this.hexToRgb(glowColor)}, 0.15)`;
      this.ctx.beginPath();
      this.ctx.arc(loc.x, loc.y, 20, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw center core dot
      this.ctx.fillStyle = coreColor;
      this.ctx.shadowBlur = 0; // disable shadow for clean dot
      this.ctx.beginPath();
      this.ctx.arc(loc.x, loc.y, 6, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw concentric circle borders
      this.ctx.strokeStyle = `rgba(${this.hexToRgb(glowColor)}, 0.4)`;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(loc.x, loc.y, 12, 0, Math.PI * 2);
      this.ctx.stroke();

      // Draw place label text
      this.ctx.fillStyle = '#f1f5f9';
      this.ctx.font = '500 11px Inter, sans-serif';
      this.ctx.textAlign = 'center';
      
      // Determine vertical offset for labels based on type to prevent overlapping
      let textOffset = 32;
      if (loc.id === 'surabhi_d_block' || loc.id === 'neuron_school') {
        textOffset = -22; // Draw above
      }

      // Draw subtle dark background bubble behind text for readability
      const textWidth = this.ctx.measureText(loc.name).width;
      this.ctx.fillStyle = 'rgba(11, 15, 26, 0.75)';
      this.ctx.fillRect(loc.x - textWidth / 2 - 6, loc.y + textOffset - 9, textWidth + 12, 16);

      // Draw label
      this.ctx.fillStyle = '#f1f5f9';
      this.ctx.fillText(loc.name, loc.x, loc.y + textOffset + 2);
      
      this.ctx.restore(); // Restore context state
    });
  }

  // Utility to convert hex strings to rgb values
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '255, 255, 255';
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
}
