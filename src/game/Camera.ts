import { Vector2D } from './types';
import { Tank } from './entities/Tank';

export class Camera {
  private position: Vector2D;
  private target: Tank;
  private canvas: HTMLCanvasElement;
  private smoothing: number = 0.1;
  private bounds: { min: Vector2D; max: Vector2D };
  private viewportWidth: number;
  private viewportHeight: number;

  constructor(canvas: HTMLCanvasElement, target: Tank, worldSize: { width: number; height: number }) {
    this.canvas = canvas;
    this.target = target;
    this.position = { ...target.position };
    this.viewportWidth = canvas.width;
    this.viewportHeight = canvas.height;
    
    this.bounds = {
      min: { x: canvas.width / 2, y: canvas.height / 2 },
      max: { 
        x: worldSize.width - canvas.width / 2,
        y: worldSize.height - canvas.height / 2
      }
    };
  }

  updateViewport(width: number, height: number) {
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.bounds.min = { x: width / 2, y: height / 2 };
  }

  update() {
    const desiredX = this.target.position.x - this.viewportWidth / 2;
    const desiredY = this.target.position.y - this.viewportHeight / 2;

    this.position.x += (desiredX - this.position.x) * this.smoothing;
    this.position.y += (desiredY - this.position.y) * this.smoothing;

    this.position.x = Math.max(0, Math.min(this.position.x, this.bounds.max.x - this.viewportWidth));
    this.position.y = Math.max(0, Math.min(this.position.y, this.bounds.max.y - this.viewportHeight));
  }

  applyTransform(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(-this.position.x, -this.position.y);
  }

  resetTransform(ctx: CanvasRenderingContext2D) {
    ctx.restore();
  }

  getPosition(): Vector2D {
    return { ...this.position };
  }

  screenToWorld(screenPos: Vector2D): Vector2D {
    return {
      x: screenPos.x + this.position.x,
      y: screenPos.y + this.position.y
    };
  }
}