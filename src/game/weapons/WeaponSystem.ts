import { Vector2D } from '../types';

export interface WeaponStats {
  damage: number;
  reloadTime: number;
  spread: number;
  projectileSpeed: number;
  projectileCount: number;
  range: number;
  energyCost: number;
}

export type WeaponType = 
  | 'cannon'        // 标准主炮
  | 'machinegun'    // 机枪
  | 'plasma'        // 等离子炮
  | 'missile'       // 导弹
  | 'railgun'       // 轨道炮
  | 'shotgun';      // 霰弹枪

export class WeaponSystem {
  private weaponType: WeaponType;
  private stats: WeaponStats;
  private lastFireTime: number = 0;
  private isReloading: boolean = false;
  private level: number = 1;

  constructor(type: WeaponType = 'cannon') {
    this.weaponType = type;
    this.stats = this.getBaseStats(type);
  }

  private getBaseStats(type: WeaponType): WeaponStats {
    switch (type) {
      case 'machinegun':
        return {
          damage: 10,
          reloadTime: 100,
          spread: 0.1,
          projectileSpeed: 15,
          projectileCount: 1,
          range: 400,
          energyCost: 5
        };
      case 'plasma':
        return {
          damage: 40,
          reloadTime: 1000,
          spread: 0.05,
          projectileSpeed: 8,
          projectileCount: 1,
          range: 300,
          energyCost: 30
        };
      case 'missile':
        return {
          damage: 50,
          reloadTime: 2000,
          spread: 0.02,
          projectileSpeed: 6,
          projectileCount: 1,
          range: 500,
          energyCost: 40
        };
      case 'railgun':
        return {
          damage: 80,
          reloadTime: 3000,
          spread: 0,
          projectileSpeed: 20,
          projectileCount: 1,
          range: 800,
          energyCost: 50
        };
      case 'shotgun':
        return {
          damage: 15,
          reloadTime: 1500,
          spread: 0.3,
          projectileSpeed: 12,
          projectileCount: 6,
          range: 200,
          energyCost: 35
        };
      default: // cannon
        return {
          damage: 30,
          reloadTime: 800,
          spread: 0.03,
          projectileSpeed: 10,
          projectileCount: 1,
          range: 400,
          energyCost: 20
        };
    }
  }

  public canFire(currentTime: number, energy: number): boolean {
    return !this.isReloading && 
           currentTime - this.lastFireTime >= this.stats.reloadTime &&
           energy >= this.stats.energyCost;
  }

  public fire(position: Vector2D, angle: number): Array<{
    position: Vector2D;
    angle: number;
    stats: WeaponStats;
    type: WeaponType;
  }> {
    this.lastFireTime = Date.now();
    const projectiles = [];

    for (let i = 0; i < this.stats.projectileCount; i++) {
      const spread = (Math.random() - 0.5) * this.stats.spread;
      const projectileAngle = angle + spread;
      
      projectiles.push({
        position: { ...position },
        angle: projectileAngle,
        stats: { ...this.stats },
        type: this.weaponType
      });
    }

    return projectiles;
  }

  public upgrade(): void {
    this.level++;
    this.stats.damage *= 1.2;
    this.stats.reloadTime *= 0.9;
    this.stats.spread *= 0.9;
    this.stats.range *= 1.1;
  }

  public getStats(): WeaponStats {
    return { ...this.stats };
  }

  public getType(): WeaponType {
    return this.weaponType;
  }

  public getLevel(): number {
    return this.level;
  }
}