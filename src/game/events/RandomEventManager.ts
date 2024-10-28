import { Vector2D } from '../types';
import { Tank } from '../entities/Tank';
import { GameEngine } from '../GameEngine';

export type EventType = 
  | 'supply_drop'
  | 'enemy_reinforcement'
  | 'weather_change'
  | 'earthquake'
  | 'airstrike';

interface GameEvent {
  type: EventType;
  position?: Vector2D;
  duration?: number;
  startTime?: number;
}

export class RandomEventManager {
  private activeEvents: GameEvent[] = [];
  private lastEventTime: number = 0;
  private eventCooldown: number = 30000; // 30 seconds between events
  private gameEngine: GameEngine;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  public update() {
    const currentTime = Date.now();

    // Check if we should trigger a new event
    if (currentTime - this.lastEventTime > this.eventCooldown) {
      if (Math.random() < 0.3) { // 30% chance to trigger an event
        this.triggerRandomEvent();
        this.lastEventTime = currentTime;
      }
    }

    // Update active events
    this.activeEvents = this.activeEvents.filter(event => {
      if (event.startTime && event.duration) {
        return currentTime - event.startTime < event.duration;
      }
      return false;
    });
  }

  private triggerRandomEvent() {
    const events: EventType[] = [
      'supply_drop',
      'enemy_reinforcement',
      'weather_change',
      'earthquake',
      'airstrike'
    ];

    const eventType = events[Math.floor(Math.random() * events.length)];
    const worldSize = this.gameEngine.getWorldSize();
    const randomPosition = {
      x: Math.random() * worldSize.width,
      y: Math.random() * worldSize.height
    };

    const event: GameEvent = {
      type: eventType,
      position: randomPosition,
      startTime: Date.now(),
      duration: this.getEventDuration(eventType)
    };

    this.activeEvents.push(event);
    this.handleEvent(event);
  }

  private getEventDuration(eventType: EventType): number {
    switch (eventType) {
      case 'supply_drop': return 30000; // 30 seconds
      case 'enemy_reinforcement': return 0; // Instant
      case 'weather_change': return 60000; // 1 minute
      case 'earthquake': return 15000; // 15 seconds
      case 'airstrike': return 10000; // 10 seconds
      default: return 30000;
    }
  }

  private handleEvent(event: GameEvent) {
    switch (event.type) {
      case 'supply_drop':
        this.handleSupplyDrop(event.position!);
        break;
      case 'enemy_reinforcement':
        this.handleEnemyReinforcement(event.position!);
        break;
      case 'weather_change':
        this.handleWeatherChange();
        break;
      case 'earthquake':
        this.handleEarthquake();
        break;
      case 'airstrike':
        this.handleAirstrike(event.position!);
        break;
    }
  }

  private handleSupplyDrop(position: Vector2D) {
    // Create supply crate at position
    this.gameEngine.createSupplyCrate(position);
  }

  private handleEnemyReinforcement(position: Vector2D) {
    // Spawn 2-3 enemy tanks
    const count = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < count; i++) {
      const offset = {
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100
      };
      this.gameEngine.spawnEnemyTank({
        x: position.x + offset.x,
        y: position.y + offset.y
      });
    }
  }

  private handleWeatherChange() {
    const weathers = ['晴朗', '下雨', '下雪', '雾天'];
    const newWeather = weathers[Math.floor(Math.random() * weathers.length)];
    this.gameEngine.changeWeather(newWeather);
  }

  private handleEarthquake() {
    // Damage all tanks and create screen shake effect
    this.gameEngine.applyEarthquakeEffect();
  }

  private handleAirstrike(position: Vector2D) {
    // Create airstrike effect and damage
    this.gameEngine.createAirstrike(position);
  }

  public getActiveEvents(): GameEvent[] {
    return this.activeEvents;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    this.activeEvents.forEach(event => {
      if (event.position) {
        ctx.save();
        ctx.translate(event.position.x, event.position.y);

        switch (event.type) {
          case 'supply_drop':
            this.drawSupplyDrop(ctx);
            break;
          case 'airstrike':
            this.drawAirstrike(ctx);
            break;
        }

        ctx.restore();
      }
    });
  }

  private drawSupplyDrop(ctx: CanvasRenderingContext2D) {
    // Draw supply crate
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-15, -15, 30, 30);
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2;
    ctx.strokeRect(-15, -15, 30, 30);
  }

  private drawAirstrike(ctx: CanvasRenderingContext2D) {
    // Draw airstrike warning
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.fill();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}