export class RainRenderer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.raindrops = [];
    this.weatherState = 'none';
    
    // Rain particle configuration
    this.maxDrops = {
      none: 0,
      light: 150,
      heavy: 400
    };
    
    this.dropSpeed = {
      none: 0,
      light: 8,
      heavy: 15
    };
    
    this.dropLength = {
      none: 0,
      light: 15,
      heavy: 25
    };
    
    this.dropOpacity = {
      none: 0,
      light: 0.25,
      heavy: 0.4
    };
  }
  
  setWeatherState(state) {
    this.weatherState = state;
    
    // Adjust number of raindrops based on weather
    const targetDrops = this.maxDrops[state];
    
    // Add drops if needed
    while (this.raindrops.length < targetDrops) {
      this.addRaindrop();
    }
    
    // Remove excess drops
    if (this.raindrops.length > targetDrops) {
      this.raindrops = this.raindrops.slice(0, targetDrops);
    }
  }
  
  addRaindrop() {
    this.raindrops.push({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      speed: this.dropSpeed[this.weatherState] + Math.random() * 3,
      length: this.dropLength[this.weatherState] + Math.random() * 5
    });
  }
  
  update(deltaMs) {
    if (this.weatherState === 'none') return;
    
    const deltaSeconds = deltaMs / 1000;
    
    // Update raindrop positions
    this.raindrops.forEach(drop => {
      drop.y += drop.speed * deltaSeconds * 60; // Normalize to 60fps
      
      // Wrap around when drop goes off screen
      if (drop.y > this.canvas.height + drop.length) {
        drop.y = -drop.length;
        drop.x = Math.random() * this.canvas.width;
      }
    });
  }
  
  render() {
    if (this.weatherState === 'none' || this.raindrops.length === 0) return;
    
    const ctx = this.ctx;
    const opacity = this.dropOpacity[this.weatherState];
    
    ctx.save();
    
    // Draw rain overlay/haze first
    if (this.weatherState === 'heavy') {
      ctx.fillStyle = 'rgba(100, 120, 150, 0.08)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else if (this.weatherState === 'light') {
      ctx.fillStyle = 'rgba(100, 120, 150, 0.03)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Draw raindrops as lines
    ctx.strokeStyle = `rgba(174, 194, 224, ${opacity})`;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    
    this.raindrops.forEach(drop => {
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x, drop.y + drop.length);
      ctx.stroke();
    });
    
    ctx.restore();
  }
  
  clear() {
    this.raindrops = [];
  }
}
