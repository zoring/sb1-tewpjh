import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { GameEngine } from '../game/GameEngine';
import Minimap from './Minimap';
import { Vector2D } from '../game/types';
import { LevelObjective } from '../game/levels/LevelConfig';
import LevelInfo from './LevelInfo';

interface MinimapState {
  playerTank: any;
  enemyTanks: any[];
  cameraPosition: Vector2D;
}

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const animationFrameRef = useRef<number>();
  const { gameState, dispatch } = useGame();
  const [minimapData, setMinimapData] = useState<MinimapState | null>(null);
  const [objectives, setObjectives] = useState<LevelObjective[]>([]);

  const gameLoop = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.update();
      engineRef.current.draw();

      const currentPlayerTank = engineRef.current.getPlayerTank();
      const currentEnemyTanks = engineRef.current.getEnemyTanks();
      const currentCameraPosition = engineRef.current.getCameraPosition();
      const currentObjectives = engineRef.current.getLevelObjectives();

      setObjectives(currentObjectives);

      setMinimapData(prev => {
        if (!prev) return {
          playerTank: currentPlayerTank,
          enemyTanks: currentEnemyTanks,
          cameraPosition: currentCameraPosition
        };

        const hasChanged = 
          prev.playerTank.position.x !== currentPlayerTank.position.x ||
          prev.playerTank.position.y !== currentPlayerTank.position.y ||
          prev.enemyTanks.length !== currentEnemyTanks.length ||
          prev.cameraPosition.x !== currentCameraPosition.x ||
          prev.cameraPosition.y !== currentCameraPosition.y;

        return hasChanged ? {
          playerTank: currentPlayerTank,
          enemyTanks: currentEnemyTanks,
          cameraPosition: currentCameraPosition
        } : prev;
      });
    }
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    if (!engineRef.current) {
      engineRef.current = new GameEngine(canvas, dispatch);
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop, dispatch]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      if (engineRef.current) {
        engineRef.current.handleResize(canvas.width, canvas.height);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full aspect-video bg-slate-800"
        style={{ imageRendering: 'pixelated' }}
      />
      {minimapData && (
        <Minimap
          worldSize={{ width: 3000, height: 3000 }}
          playerTank={minimapData.playerTank}
          enemyTanks={minimapData.enemyTanks}
          viewportSize={{
            width: canvasRef.current?.width || 800,
            height: canvasRef.current?.height || 600,
          }}
          playerPosition={minimapData.playerTank.position}
          cameraPosition={minimapData.cameraPosition}
        />
      )}
      <div className="absolute top-4 right-4">
        <LevelInfo objectives={objectives} />
      </div>
    </div>
  );
};

export default Game;