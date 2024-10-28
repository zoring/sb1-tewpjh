import React from 'react';
import { Clock, Flag, Shield, Target } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { LevelObjective } from '../game/levels/LevelConfig';

const LevelInfo: React.FC<{ objectives: LevelObjective[] }> = ({ objectives }) => {
  const { gameState } = useGame();

  const getObjectiveIcon = (type: string) => {
    switch (type) {
      case 'destroy_enemies': return <Target className="text-red-400" />;
      case 'reach_checkpoint': return <Flag className="text-green-400" />;
      case 'survive_time': return <Clock className="text-blue-400" />;
      case 'escort': return <Shield className="text-purple-400" />;
      default: return null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getObjectiveText = (objective: LevelObjective) => {
    switch (objective.type) {
      case 'destroy_enemies':
        return `消灭敌方坦克 (${objective.current}/${objective.required})`;
      case 'reach_checkpoint':
        return `到达检查点 (${objective.current}/${objective.required})`;
      case 'survive_time':
        return `生存时间 ${formatTime(objective.current)}/${formatTime(objective.required)}`;
      case 'escort':
        return `护送任务 (${objective.current}/${objective.required})`;
      default:
        return '';
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 mb-4">
      <h2 className="text-lg font-bold mb-3">第{gameState.level}关目标</h2>
      <div className="space-y-2">
        {objectives.map((objective, index) => (
          <div key={index} className="flex items-center gap-2">
            {getObjectiveIcon(objective.type)}
            <span className="flex-1">{getObjectiveText(objective)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LevelInfo;