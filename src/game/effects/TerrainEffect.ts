import { Vector2D } from '../types';

export class TerrainEffect {
  private terrainType: string;
  private context: CanvasRenderingContext2D;
  private tiles: { type: string; position: Vector2D; variant: number }[] = [];
  private obstacles: { type: string; position: Vector2D; health: number }[] = [];
  private worldSize: { width: number; height: number };

  constructor(ctx: CanvasRenderingContext2D, type: string, worldSize: { width: number; height: number }) {
    this.context = ctx;
    this.terrainType = type;
    this.worldSize = worldSize;
    this.generateTerrain();
    this.generateObstacles();
  }

  private generateTerrain() {
    const tileSize = 100;
    const cols = Math.ceil(this.worldSize.width / tileSize);
    const rows = Math.ceil(this.worldSize.height / tileSize);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (Math.random() > 0.5) {
          this.tiles.push({
            type: this.terrainType,
            position: { 
              x: i * tileSize + Math.random() * 40 - 20,
              y: j * tileSize + Math.random() * 40 - 20
            },
            variant: Math.floor(Math.random() * 3)
          });
        }
      }
    }
  }

  private generateObstacles() {
    const obstacleCount = Math.floor(Math.random() * 20) + 10;
    const obstacleTypes = {
      '森林': ['tree', 'rock', 'bush'],
      '沙漠': ['cactus', 'dune', 'rock'],
      '雪地': ['ice', 'rock', 'snowdrift'],
      '城市': ['rubble', 'barrier', 'wall']
    };

    for (let i = 0; i < obstacleCount; i++) {
      const types = obstacleTypes[this.terrainType as keyof typeof obstacleTypes];
      this.obstacles.push({
        type: types[Math.floor(Math.random() * types.length)],
        position: {
          x: Math.random() * this.worldSize.width,
          y: Math.random() * this.worldSize.height
        },
        health: 100
      });
    }
  }

  public getMovementModifier(position: Vector2D): number {
    // Check for nearby obstacles
    const nearbyObstacle = this.obstacles.find(obstacle => {
      const dx = obstacle.position.x - position.x;
      const dy = obstacle.position.y - position.y;
      return Math.sqrt(dx * dx + dy * dy) < 40;
    });

    if (nearbyObstacle) return 0.4;

    // Check terrain effects
    const nearbyTile = this.tiles.find(tile => {
      const dx = tile.position.x - position.x;
      const dy = tile.position.y - position.y;
      return Math.sqrt(dx * dx + dy * dy) < 30;
    });

    if (!nearbyTile) return 1;

    switch (this.terrainType) {
      case '森林': return 0.7;
      case '沙漠': return 0.8;
      case '雪地': return 0.6;
      case '城市': return 0.9;
      default: return 1;
    }
  }

  public handleProjectileCollision(position: Vector2D): boolean {
    const hitObstacle = this.obstacles.find(obstacle => {
      const dx = obstacle.position.x - position.x;
      const dy = obstacle.position.y - position.y;
      return Math.sqrt(dx * dx + dy * dy) < 20;
    });

    if (hitObstacle) {
      hitObstacle.health -= 20;
      if (hitObstacle.health <= 0) {
        this.obstacles = this.obstacles.filter(o => o !== hitObstacle);
      }
      return true;
    }

    return false;
  }

  public draw() {
    // Draw base terrain
    this.tiles.forEach(tile => {
      this.context.save();
      this.context.translate(tile.position.x, tile.position.y);
      
      switch (this.terrainType) {
        case '森林':
          this.drawForestTerrain(tile.variant);
          break;
        case '沙漠':
          this.drawDesertTerrain(tile.variant);
          break;
        case '雪地':
          this.drawSnowTerrain(tile.variant);
          break;
        case '城市':
          this.drawCityTerrain(tile.variant);
          break;
      }
      
      this.context.restore();
    });

    // Draw obstacles
    this.obstacles.forEach(obstacle => {
      this.context.save();
      this.context.translate(obstacle.position.x, obstacle.position.y);
      this.drawObstacle(obstacle);
      this.context.restore();
    });
  }

  private drawForestTerrain(variant: number) {
    const colors = ['#2d5a27', '#1e4620', '#3b7a33'];
    this.context.fillStyle = colors[variant];
    this.context.beginPath();
    this.context.arc(0, 0, 20, 0, Math.PI * 2);
    this.context.fill();
  }

  private drawDesertTerrain(variant: number) {
    const colors = ['#d4b483', '#c19a6b', '#e6c899'];
    this.context.fillStyle = colors[variant];
    this.context.beginPath();
    this.context.arc(0, 0, 25, 0, Math.PI * 2);
    this.context.fill();
  }

  private drawSnowTerrain(variant: number) {
    const colors = ['#e5e7eb', '#d1d5db', '#f3f4f6'];
    this.context.fillStyle = colors[variant];
    this.context.beginPath();
    this.context.arc(0, 0, 22, 0, Math.PI * 2);
    this.context.fill();
  }

  private drawCityTerrain(variant: number) {
    const colors = ['#4b5563', '#374151', '#6b7280'];
    this.context.fillStyle = colors[variant];
    this.context.fillRect(-15, -15, 30, 30);
  }

  private drawObstacle(obstacle: { type: string; position: Vector2D; health: number }) {
    const healthPercent = obstacle.health / 100;
    
    switch (obstacle.type) {
      case 'tree':
        this.context.fillStyle = `rgba(45, 90, 39, ${healthPercent})`;
        this.context.fillRect(-4, -20, 8, 40);
        this.context.beginPath();
        this.context.fillStyle = `rgba(34, 197, 94, ${healthPercent})`;
        this.context.arc(0, -25, 15, 0, Math.PI * 2);
        this.context.fill();
        break;

      case 'rock':
        this.context.fillStyle = `rgba(71, 85, 105, ${healthPercent})`;
        this.context.beginPath();
        this.context.moveTo(-15, 15);
        this.context.lineTo(0, -15);
        this.context.lineTo(15, 15);
        this.context.closePath();
        this.context.fill();
        break;

      case 'wall':
        this.context.fillStyle = `rgba(71, 85, 105, ${healthPercent})`;
        this.context.fillRect(-25, -10, 50, 20);
        break;

      // Add more obstacle types as needed
    }
  }
}