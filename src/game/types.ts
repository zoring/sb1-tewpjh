export interface Vector2D {
  x: number;
  y: number;
}

export interface GameInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shoot: boolean;
  mouseX: number;
  mouseY: number;
}