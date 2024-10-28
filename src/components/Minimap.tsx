import React, { useEffect, useRef } from 'react';
import { Tank } from '../game/entities/Tank';
import { Vector2D } from '../game/types';

interface MinimapProps {
  worldSize: { width: number; height: number };
  playerTank: Tank;
  enemyTanks: Tank[];
  playerPosition: Vector2D;
  viewportSize: { width: number; height: number };
  cameraPosition: Vector2D;
}

const Minimap: React.FC<MinimapProps> = ({
  worldSize,
  playerTank,
  enemyTanks,
  viewportSize,
  cameraPosition,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minimapSize = 200; // Size of the minimap
  const scale = minimapSize / Math.max(worldSize.width, worldSize.height);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Clear minimap
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, minimapSize, minimapSize);

    // Draw world border
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(0, 0, worldSize.width * scale, worldSize.height * scale);

    // Draw viewport rectangle
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(
      cameraPosition.x * scale,
      cameraPosition.y * scale,
      viewportSize.width * scale,
      viewportSize.height * scale
    );

    // Draw enemy tanks (red dots)
    ctx.fillStyle = '#ef4444';
    enemyTanks.forEach(tank => {
      ctx.beginPath();
      ctx.arc(
        tank.position.x * scale,
        tank.position.y * scale,
        3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    // Draw player tank (blue dot)
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(
      playerTank.position.x * scale,
      playerTank.position.y * scale,
      4,
      0,
      Math.PI * 2
    );
    ctx.fill();

  }, [worldSize, playerTank, enemyTanks, viewportSize, cameraPosition, scale]);

  return (
    <div className="absolute bottom-4 right-4 bg-slate-800/80 backdrop-blur-sm rounded-lg p-2 border border-slate-700">
      <canvas
        ref={canvasRef}
        width={minimapSize}
        height={minimapSize}
        className="rounded"
      />
    </div>
  );
};

export default Minimap;