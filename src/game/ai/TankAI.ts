import { Tank } from '../entities/Tank';
import { Vector2D } from '../types';

export class TankAI {
  private tank: Tank;
  private target: Tank;
  private state: 'patrol' | 'chase' | 'attack' = 'patrol';
  private patrolPoints: Vector2D[] = [];
  private currentPatrolIndex = 0;
  private lastShot = 0;
  private detectionRange = 300;
  private attackRange = 200;

  constructor(tank: Tank, target: Tank, mapWidth: number, mapHeight: number) {
    this.tank = tank;
    this.target = target;
    this.generatePatrolPoints(mapWidth, mapHeight);
  }

  private generatePatrolPoints(mapWidth: number, mapHeight: number) {
    // 生成4个巡逻点，形成一个矩形路径
    const margin = 100;
    this.patrolPoints = [
      { x: margin, y: margin },
      { x: mapWidth - margin, y: margin },
      { x: mapWidth - margin, y: mapHeight - margin },
      { x: margin, y: mapHeight - margin }
    ];
  }

  private getDistanceToTarget(): number {
    const dx = this.target.position.x - this.tank.position.x;
    const dy = this.target.position.y - this.tank.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private moveTowards(target: Vector2D, speed: number = 1) {
    const dx = target.x - this.tank.position.x;
    const dy = target.y - this.tank.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 5) {
      const direction = {
        x: (dx / distance) * speed,
        y: (dy / distance) * speed
      };
      this.tank.move(direction);
      this.tank.rotation = Math.atan2(dy, dx);
    }
  }

  private aimAtTarget() {
    const dx = this.target.position.x - this.tank.position.x;
    const dy = this.target.position.y - this.tank.position.y;
    this.tank.rotateTurret(Math.atan2(dy, dx));
  }

  public update(): { shoot: boolean; angle: number } | null {
    const distanceToTarget = this.getDistanceToTarget();
    let shootCommand = null;

    // 状态机更新
    if (distanceToTarget <= this.attackRange) {
      this.state = 'attack';
    } else if (distanceToTarget <= this.detectionRange) {
      this.state = 'chase';
    } else {
      this.state = 'patrol';
    }

    // 根据状态执行行为
    switch (this.state) {
      case 'patrol':
        const currentPoint = this.patrolPoints[this.currentPatrolIndex];
        this.moveTowards(currentPoint, 2);
        
        const distanceToPoint = Math.sqrt(
          Math.pow(currentPoint.x - this.tank.position.x, 2) +
          Math.pow(currentPoint.y - this.tank.position.y, 2)
        );
        
        if (distanceToPoint < 20) {
          this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
        }
        break;

      case 'chase':
        this.moveTowards(this.target.position, 3);
        this.aimAtTarget();
        break;

      case 'attack':
        this.aimAtTarget();
        const now = Date.now();
        if (now - this.lastShot > 1000) {  // 每秒射击一次
          this.lastShot = now;
          shootCommand = {
            shoot: true,
            angle: this.tank.turretRotation
          };
        }
        // 保持一定距离
        if (distanceToTarget < this.attackRange * 0.7) {
          const escapeAngle = Math.atan2(
            this.tank.position.y - this.target.position.y,
            this.tank.position.x - this.target.position.x
          );
          this.moveTowards({
            x: this.tank.position.x + Math.cos(escapeAngle) * 50,
            y: this.tank.position.y + Math.sin(escapeAngle) * 50
          }, 2);
        }
        break;
    }

    return shootCommand;
  }
}