import { Vector2D } from '../types';
import { WEAPON_TYPES, ProjectileConfig } from './Projectile';

export interface TankConfig {
  maxHealth: number;
  maxArmor: number;
  maxEnergy: number;
  baseSpeed: number;
  weaponType: keyof typeof WEAPON_TYPES;
  fireRate: number;
}

export const TANK_TYPES = {
  PLAYER: {
    maxHealth: 100,
    maxArmor: 100,
    maxEnergy: 100,
    baseSpeed: 5,
    weaponType: 'STANDARD',
    fireRate: 500
  } as TankConfig,
  LIGHT: {
    maxHealth: 70,
    maxArmor: 60,
    maxEnergy: 80,
    baseSpeed: 6,
    weaponType: 'RAPID',
    fireRate: 300
  } as TankConfig,
  HEAVY: {
    maxHealth: 120,
    maxArmor: 120,
    maxEnergy: 60,
    baseSpeed: 3,
    weaponType: 'HEAVY',
    fireRate: 1000
  } as TankConfig
};

export class Tank {
  position: Vector2D;
  rotation: number;
  turretRotation: number;
  speed: number;
  health: number;
  armor: number;
  energy: number;
  isPlayer: boolean;
  isInvulnerable: boolean;
  specialAbilityDuration: number;
  normalSpeed: number;
  config: TankConfig;
  weaponConfig: ProjectileConfig;
  lastFireTime: number;
  
  constructor(x: number, y: number, isPlayer: boolean = false, type: keyof typeof TANK_TYPES = 'PLAYER') {
    this.position = { x, y };
    this.rotation = 0;
    this.turretRotation = 0;
    this.config = TANK_TYPES[type];
    this.normalSpeed = this.config.baseSpeed;
    this.speed = this.normalSpeed;
    this.health = this.config.maxHealth;
    this.armor = this.config.maxArmor;
    this.energy = this.config.maxEnergy;
    this.isPlayer = isPlayer;
    this.isInvulnerable = false;
    this.specialAbilityDuration = 0;
    this.weaponConfig = WEAPON_TYPES[this.config.weaponType];
    this.lastFireTime = 0;
  }

  canFire(): boolean {
    const now = Date.now();
    return now - this.lastFireTime >= this.config.fireRate;
  }

  move(direction: Vector2D) {
    this.position.x += direction.x * this.speed;
    this.position.y += direction.y * this.speed;
  }

  rotateTurret(angle: number) {
    this.turretRotation = angle;
  }

  takeDamage(amount: number): boolean {
    if (this.isInvulnerable) return false;
    
    const damageReduction = this.armor / this.config.maxArmor;
    const actualDamage = amount * (1 - damageReduction);
    this.health = Math.max(0, this.health - actualDamage);
    return this.health <= 0;
  }

  activateSpecialAbility() {
    if (this.energy >= 30) {
      this.isInvulnerable = true;
      this.speed = this.normalSpeed * 1.5;
      this.specialAbilityDuration = Date.now() + 3000;
      this.energy -= 30;
    }
  }

  update() {
    if (this.specialAbilityDuration > 0 && Date.now() > this.specialAbilityDuration) {
      this.isInvulnerable = false;
      this.speed = this.normalSpeed;
      this.specialAbilityDuration = 0;
    }

    // Energy regeneration
    if (this.energy < this.config.maxEnergy) {
      this.energy = Math.min(this.config.maxEnergy, this.energy + 0.1);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);

    // Special ability effect
    if (this.isInvulnerable) {
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.fill();
    }

    // Tank body
    ctx.fillStyle = this.isPlayer ? '#4a5568' : '#991b1b';
    ctx.fillRect(-20, -15, 40, 30);

    // Tracks
    ctx.fillStyle = this.isPlayer ? '#2d3748' : '#7f1d1d';
    ctx.fillRect(-22, -18, 44, 6);
    ctx.fillRect(-22, 12, 44, 6);

    // Turret
    ctx.rotate(this.turretRotation - this.rotation);
    ctx.fillStyle = this.isPlayer ? '#4a5568' : '#991b1b';
    ctx.fillRect(-8, -8, 16, 16);
    ctx.fillRect(8, -3, 20, 6);

    // Health bar
    ctx.rotate(-(this.turretRotation - this.rotation));
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(-20, -25, 40, 4);
    ctx.fillStyle = this.health > 50 ? '#22c55e' : '#ef4444';
    ctx.fillRect(-20, -25, (40 * this.health) / this.config.maxHealth, 4);

    // Energy bar (only for player)
    if (this.isPlayer) {
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(-20, -30, 40, 3);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(-20, -30, (40 * this.energy) / this.config.maxEnergy, 3);
    }

    ctx.restore();
  }

  getWeaponConfig(): ProjectileConfig {
    return this.weaponConfig;
  }
}