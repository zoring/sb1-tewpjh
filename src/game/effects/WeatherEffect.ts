import { Vector2D } from '../types';

export class WeatherEffect {
  private context: CanvasRenderingContext2D;
  private weatherType: string;
  private particles: Array<{
    position: Vector2D;
    speed: number;
    size: number;
    opacity: number;
  }> = [];
  private time: number = 0;
  private lightningTime: number = 0;
  private isNight: boolean = false;

  constructor(ctx: CanvasRenderingContext2D, type: string) {
    this.context = ctx;
    this.weatherType = type;
    this.isNight = Math.random() > 0.7;
    this.initializeParticles();
  }

  private initializeParticles() {
    const particleCount = this.getParticleCount();
    
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        position: {
          x: Math.random() * this.context.canvas.width,
          y: Math.random() * this.context.canvas.height
        },
        speed: Math.random() * 2 + 1,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.5
      });
    }
  }

  private getParticleCount(): number {
    switch (this.weatherType) {
      case '下雨': return 200;
      case '下雪': return 150;
      case '雾天': return 100;
      default: return 50;
    }
  }

  public getVisibilityModifier(): number {
    let baseModifier = 1;
    
    switch (this.weatherType) {
      case '下雨': baseModifier = 0.8; break;
      case '下雪': baseModifier = 0.7; break;
      case '雾天': baseModifier = 0.5; break;
    }

    if (this.isNight) {
      baseModifier *= 0.7;
    }

    return baseModifier;
  }

  public getMovementModifier(): number {
    switch (this.weatherType) {
      case '下雨': return 0.9;
      case '下雪': return 0.7;
      case '雾天': return 0.95;
      default: return 1;
    }
  }

  public update() {
    this.time += 0.016;
    
    this.particles.forEach(particle => {
      switch (this.weatherType) {
        case '下雨':
          particle.position.y += particle.speed * 15;
          particle.position.x += particle.speed * 2;
          break;
          
        case '下雪':
          particle.position.y += particle.speed * 2;
          particle.position.x += Math.sin(this.time + particle.position.y * 0.1) * 2;
          break;
          
        case '雾天':
          particle.position.x += Math.sin(this.time + particle.position.y * 0.1) * 0.5;
          particle.opacity = Math.sin(this.time * 0.5 + particle.position.x * 0.01) * 0.3 + 0.7;
          break;
      }

      // Reset particles that go off screen
      if (particle.position.y > this.context.canvas.height) {
        particle.position.y = -10;
        particle.position.x = Math.random() * this.context.canvas.width;
      }
      if (particle.position.x > this.context.canvas.width) {
        particle.position.x = 0;
      }
    });

    // Handle lightning in rain
    if (this.weatherType === '下雨' && Math.random() < 0.001) {
      this.lightningTime = this.time;
    }
  }

  public draw() {
    this.context.save();

    // Apply night effect
    if (this.isNight) {
      this.context.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    }

    // Draw lightning effect
    if (this.weatherType === '下雨' && this.time - this.lightningTime < 0.1) {
      this.context.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    }

    switch (this.weatherType) {
      case '下雨':
        this.drawRain();
        break;
      case '下雪':
        this.drawSnow();
        break;
      case '雾天':
        this.drawFog();
        break;
    }

    this.context.restore();
  }

  private drawRain() {
    this.context.strokeStyle = '#60a5fa';
    this.context.lineWidth = 1;
    
    this.particles.forEach(particle => {
      const length = particle.speed * 10;
      this.context.globalAlpha = particle.opacity;
      
      this.context.beginPath();
      this.context.moveTo(particle.position.x, particle.position.y);
      this.context.lineTo(
        particle.position.x - particle.speed * 2,
        particle.position.y + length
      );
      this.context.stroke();
    });
  }

  private drawSnow() {
    this.particles.forEach(particle => {
      this.context.globalAlpha = particle.opacity;
      this.context.fillStyle = '#e5e7eb';
      
      this.context.beginPath();
      this.context.arc(
        particle.position.x,
        particle.position.y,
        particle.size,
        0,
        Math.PI * 2
      );
      this.context.fill();
    });
  }

  private drawFog() {
    // Base fog layer
    const gradient = this.context.createRadialGradient(
      this.context.canvas.width / 2,
      this.context.canvas.height / 2,
      0,
      this.context.canvas.width / 2,
      this.context.canvas.height / 2,
      this.context.canvas.width
    );
    
    gradient.addColorStop(0, 'rgba(148, 163, 184, 0.1)');
    gradient.addColorStop(1, 'rgba(148, 163, 184, 0.4)');
    this.context.fillStyle = gradient;
    this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);

    // Animated fog particles
    this.particles.forEach(particle => {
      this.context.globalAlpha = particle.opacity * 0.3;
      this.context.fillStyle = '#e2e8f0';
      
      this.context.beginPath();
      this.context.arc(
        particle.position.x,
        particle.position.y,
        particle.size * 5,
        0,
        Math.PI * 2
      );
      this.context.fill();
    });
  }
}