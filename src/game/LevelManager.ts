import { LevelConfig, LevelObjective, LEVELS } from './levels/LevelConfig';
import { Vector2D } from './types';
import { Dispatch } from 'react';
import { GameAction } from '../context/GameContext';

export class LevelManager {
  private currentLevel: LevelConfig;
  private objectives: LevelObjective[];
  private dispatch: Dispatch<GameAction>;
  private levelStartTime: number;
  private checkpoints: Vector2D[] = [];
  private nextCheckpointIndex: number = 0;

  constructor(levelId: number, dispatch: Dispatch<GameAction>) {
    this.currentLevel = LEVELS.find(level => level.id === levelId) || LEVELS[0];
    this.objectives = JSON.parse(JSON.stringify(this.currentLevel.objectives));
    this.dispatch = dispatch;
    this.levelStartTime = Date.now();
    this.initializeCheckpoints();
  }

  private initializeCheckpoints() {
    const checkpointObjective = this.objectives.find(obj => 
      obj.type === 'reach_checkpoint' || obj.type === 'escort');
    
    if (checkpointObjective && checkpointObjective.checkpoints) {
      this.checkpoints = checkpointObjective.checkpoints;
    }
  }

  public getCurrentLevel(): LevelConfig {
    return this.currentLevel;
  }

  public getNextCheckpoint(): Vector2D | null {
    return this.checkpoints[this.nextCheckpointIndex] || null;
  }

  public updateObjectives(playerPos: Vector2D, enemiesDestroyed: number) {
    let allObjectivesComplete = true;

    this.objectives.forEach(objective => {
      switch (objective.type) {
        case 'destroy_enemies':
          objective.current = enemiesDestroyed;
          break;
        
        case 'reach_checkpoint':
        case 'escort':
          const nextCheckpoint = this.getNextCheckpoint();
          if (nextCheckpoint) {
            const distance = Math.sqrt(
              Math.pow(playerPos.x - nextCheckpoint.x, 2) +
              Math.pow(playerPos.y - nextCheckpoint.y, 2)
            );
            
            if (distance < 50) { // Checkpoint reached
              objective.current++;
              this.nextCheckpointIndex++;
              this.dispatch({ 
                type: 'UPDATE_CHECKPOINT', 
                payload: objective.current 
              });
            }
          }
          break;
        
        case 'survive_time':
          const elapsed = Math.floor((Date.now() - this.levelStartTime) / 1000);
          objective.current = Math.min(elapsed, objective.required);
          break;
      }

      if (objective.current < objective.required) {
        allObjectivesComplete = false;
      }
    });

    if (allObjectivesComplete) {
      this.dispatch({ type: 'COMPLETE_LEVEL', payload: undefined });
    }

    return this.objectives;
  }

  public getObjectives(): LevelObjective[] {
    return this.objectives;
  }
}