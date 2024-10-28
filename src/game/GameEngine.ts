import { Tank, TANK_TYPES } from './entities/Tank';
import { Projectile } from './entities/Projectile';
import { TerrainEffect } from './effects/TerrainEffect';
import { WeatherEffect } from './effects/WeatherEffect';
import { TankAI } from './ai/TankAI';
import { Camera } from './Camera';
import { GameInput, Vector2D } from './types';
import { Dispatch } from 'react';
import { GameAction } from '../context/GameContext';
import { LevelManager } from './LevelManager';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private playerTank: Tank;
  private enemyTanks: { tank: Tank; ai: TankAI }[];
  private projectiles: Projectile[];
  private lastShot: number;
  private input: GameInput;
  private terrainEffect: TerrainEffect;
  private weatherEffect: WeatherEffect;
  private camera: Camera;
  private worldSize = { width: 3000, height: 3000 };
  private specialAbilityCooldown: number = 0;
  private dispatch: Dispatch<GameAction>;
  private lastUpdateTime: number = 0;
  private currentTime: number = 0;
  private levelManager: LevelManager;
  private enemiesDestroyed: number = 0;
  private boundHandleKeyDown: (e: KeyboardEvent) => void;
  private boundHandleKeyUp: (e: KeyboardEvent) => void;
  private boundHandleMouseMove: (e: MouseEvent) => void;

  constructor(canvas: HTMLCanvasElement, dispatch: Dispatch<GameAction>) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.dispatch = dispatch;
    this.currentTime = Date.now();
    this.levelManager = new LevelManager(1, dispatch);
    
    const currentLevel = this.levelManager.getCurrentLevel();
    this.playerTank = new Tank(
      currentLevel.playerStart.x, 
      currentLevel.playerStart.y, 
      true,
      'PLAYER'
    );
    
    this.camera = new Camera(canvas, this.playerTank, this.worldSize);
    this.enemyTanks = this.initializeEnemyTanks();
    this.projectiles = [];
    this.lastShot = 0;
    
    this.input = {
      up: false,
      down: false,
      left: false,
      right: false,
      shoot: false,
      mouseX: 0,
      mouseY: 0,
    };
    
    this.terrainEffect = new TerrainEffect(this.ctx, currentLevel.terrain, this.worldSize);
    this.weatherEffect = new WeatherEffect(this.ctx, currentLevel.weather);

    // Bind event handlers
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleKeyUp = this.handleKeyUp.bind(this);
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);

    this.setupEventListeners();
    this.updateGameState();
  }

  private initializeEnemyTanks() {
    const tanks: { tank: Tank; ai: TankAI }[] = [];
    const currentLevel = this.levelManager.getCurrentLevel();

    for (let i = 0; i < currentLevel.enemyCount; i++) {
      const x = Math.random() * (this.worldSize.width - 200) + 100;
      const y = Math.random() * (this.worldSize.height - 200) + 100;
      const tankType = currentLevel.enemyTypes[i] === 'heavy' ? 'HEAVY' : 
                      currentLevel.enemyTypes[i] === 'fast' ? 'LIGHT' : 'PLAYER';
      
      const tank = new Tank(x, y, false, tankType);
      tanks.push({
        tank,
        ai: new TankAI(tank, this.playerTank, this.worldSize.width, this.worldSize.height)
      });
    }

    return tanks;
  }

  private setupEventListeners() {
    window.addEventListener('keydown', this.boundHandleKeyDown);
    window.addEventListener('keyup', this.boundHandleKeyUp);
    this.canvas.addEventListener('mousemove', this.boundHandleMouseMove);
    this.canvas.addEventListener('mousedown', () => this.input.shoot = true);
    this.canvas.addEventListener('mouseup', () => this.input.shoot = false);
  }

  private handleKeyDown(e: KeyboardEvent) {
    switch (e.key.toLowerCase()) {
      case 'w': this.input.up = true; break;
      case 's': this.input.down = true; break;
      case 'a': this.input.left = true; break;
      case 'd': this.input.right = true; break;
      case ' ':
        if (this.currentTime - this.specialAbilityCooldown > 10000) {
          this.playerTank.activateSpecialAbility();
          this.specialAbilityCooldown = this.currentTime;
        }
        break;
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    switch (e.key.toLowerCase()) {
      case 'w': this.input.up = false; break;
      case 's': this.input.down = false; break;
      case 'a': this.input.left = false; break;
      case 'd': this.input.right = false; break;
    }
  }

  private handleMouseMove(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    this.input.mouseX = e.clientX - rect.left;
    this.input.mouseY = e.clientY - rect.top;
  }

  public update() {
    this.currentTime = Date.now();
    const deltaTime = (this.currentTime - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = this.currentTime;

    this.updatePlayerTank(deltaTime);
    this.updateEnemyTanks(deltaTime);
    this.updateProjectiles(deltaTime);
    this.handleCollisions();
    this.camera.update();
    this.weatherEffect.update();
    this.updateGameState();
    
    this.levelManager.updateObjectives(
      this.playerTank.position,
      this.enemiesDestroyed
    );
  }

  private updatePlayerTank(deltaTime: number) {
    const direction = { x: 0, y: 0 };
    if (this.input.up) direction.y -= 1;
    if (this.input.down) direction.y += 1;
    if (this.input.left) direction.x -= 1;
    if (this.input.right) direction.x += 1;

    if (direction.x !== 0 || direction.y !== 0) {
      const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
      direction.x /= length;
      direction.y /= length;
      
      const terrainModifier = this.terrainEffect.getMovementModifier(this.playerTank.position);
      direction.x *= terrainModifier;
      direction.y *= terrainModifier;

      this.playerTank.move(direction);
      this.playerTank.rotation = Math.atan2(direction.y, direction.x);
    }

    const cameraPos = this.camera.getPosition();
    const mouseWorldPos = {
      x: this.input.mouseX + cameraPos.x,
      y: this.input.mouseY + cameraPos.y
    };

    const dx = mouseWorldPos.x - this.playerTank.position.x;
    const dy = mouseWorldPos.y - this.playerTank.position.y;
    this.playerTank.rotateTurret(Math.atan2(dy, dx));

    if (this.input.shoot) {
      this.shoot(this.playerTank);
    }

    this.playerTank.update();
  }

  private updateEnemyTanks(deltaTime: number) {
    this.enemyTanks.forEach(({ tank, ai }) => {
      const command = ai.update();
      if (command?.shoot) {
        this.shoot(tank);
      }
      tank.update();
    });
  }

  private updateProjectiles(deltaTime: number) {
    this.projectiles = this.projectiles.filter(projectile => {
      projectile.update();
      
      if (projectile.position.x < 0 || projectile.position.x > this.worldSize.width ||
          projectile.position.y < 0 || projectile.position.y > this.worldSize.height) {
        return false;
      }
      
      return projectile.active;
    });
  }

  private handleCollisions() {
    this.projectiles.forEach(projectile => {
      if (this.checkCollision(projectile, this.playerTank)) {
        projectile.active = false;
        const destroyed = this.playerTank.takeDamage(projectile.damage);
        if (destroyed) {
          this.dispatch({ type: 'UPDATE_HEALTH', payload: 0 });
        }
      }

      this.enemyTanks = this.enemyTanks.filter(({ tank }) => {
        if (this.checkCollision(projectile, tank)) {
          projectile.active = false;
          const destroyed = tank.takeDamage(projectile.damage);
          if (destroyed) {
            this.enemiesDestroyed++;
            this.dispatch({ type: 'ENEMY_DESTROYED', payload: undefined });
            this.dispatch({ type: 'UPDATE_SCORE', payload: 100 });
            return false;
          }
        }
        return true;
      });
    });
  }

  private checkCollision(projectile: Projectile, tank: Tank): boolean {
    const dx = projectile.position.x - tank.position.x;
    const dy = projectile.position.y - tank.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 25;
  }

  private shoot(tank: Tank) {
    if (!tank.canFire()) return;

    const offset = 30;
    const startPos = {
      x: tank.position.x + Math.cos(tank.turretRotation) * offset,
      y: tank.position.y + Math.sin(tank.turretRotation) * offset
    };
    
    this.projectiles.push(new Projectile(
      startPos, 
      tank.turretRotation,
      tank.getWeaponConfig()
    ));
    
    tank.lastFireTime = Date.now();
  }

  public draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.camera.applyTransform(this.ctx);
    
    this.terrainEffect.draw();
    this.playerTank.draw(this.ctx);
    this.enemyTanks.forEach(({ tank }) => tank.draw(this.ctx));
    this.projectiles.forEach(projectile => projectile.draw(this.ctx));
    
    this.camera.resetTransform(this.ctx);
    
    this.weatherEffect.draw();
  }

  private updateGameState() {
    this.dispatch({ type: 'UPDATE_HEALTH', payload: this.playerTank.health });
    this.dispatch({ type: 'UPDATE_ARMOR', payload: this.playerTank.armor });
    this.dispatch({ type: 'UPDATE_ENERGY', payload: this.playerTank.energy });
  }

  public handleResize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.camera.updateViewport(width, height);
  }

  public getPlayerTank() {
    return this.playerTank;
  }

  public getEnemyTanks() {
    return this.enemyTanks.map(({ tank }) => tank);
  }

  public getCameraPosition() {
    return this.camera.getPosition();
  }

  public getLevelObjectives() {
    return this.levelManager.getObjectives();
  }

  public cleanup() {
    window.removeEventListener('keydown', this.boundHandleKeyDown);
    window.removeEventListener('keyup', this.boundHandleKeyUp);
    this.canvas.removeEventListener('mousemove', this.boundHandleMouseMove);
  }
}