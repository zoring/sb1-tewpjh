import { Vector2D } from '../types';

export interface ProjectileConfig {
  speed: number;
  damage: number;
  size: number;
  color: string;
  trailEffect?: boolean;
}

export const WEAPON_TYPES = {
  STANDARD: {
    speed: 10,
    damage: 20,
    size: 3,
    color: '#fbbf24'
  },
  HEAVY: {
    speed: 7,
    damage: 35,
    size: 5,
    color: '#ef4444',
    trailEffect: true
  },
  RAPID: {
    speed: 15,
    damage: 10,
    size: 2,
    color: '#60a5fa'
  }
} as const;

export class Projectile {
  position: Vector2D;
  velocity: Vector2D;
  damage: number;
  speed: number;
  active: boolean;
  private config: ProjectileConfig;
  private trail: Vector2D[] = [];

  constructor(position: Vector2D, angle: number, config: ProjectileConfig = WEAPON_TYPES.STANDARD) {
    this.position = { ...position };
    this.config = config;
    this.speed = config.speed;
    this.damage = config.damage;
    this.active = true;
    this.velocity = {
      x: Math.cos(angle) * this.speed,
      y: Math.sin(angle) * this.speed,
    };
  }

  update() {
    if (this.config.trailEffect) {
      this.trail.push({ ...this.position });
      if (this.trail.length > 10) {
        this.trail.shift();
      }
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Draw trail if enabled
    if (this.config.trailEffect && this.trail.length > 0) {
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      this.trail.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.strokeStyle = this.config.color + '80'; // Add transparency
      ctx.lineWidth = this.config.size / 2;
      ctx.stroke();
    }

    // Draw projectile
    ctx.translate(this.position.x, this.position.y);
    ctx.fillStyle = this.config.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.config.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}