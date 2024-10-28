import React, { useEffect } from 'react';
import { Shield, Trophy, Star } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Mission } from '../game/mission/MissionManager';

interface LevelTransitionProps {
  mission: Mission;
  onContinue: () => void;
}

const LevelTransition: React.FC<LevelTransitionProps> = ({ mission, onContinue }) => {
  const { gameState } = useGame();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        onContinue();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [onContinue]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full mx-4 border border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h2 className="text-2xl font-bold">任务完成！</h2>
        </div>

        <div className="space-y-6">
          {/* Mission Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{mission.name}</h3>
            <p className="text-slate-400">{mission.description}</p>
          </div>

          {/* Rewards */}
          <div>
            <h4 className="text-sm font-semibold text-slate-400 mb-2">获得奖励</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-slate-700/50 p-2 rounded">
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-400 w-4 h-4" />
                  <span>经验值</span>
                </div>
                <span className="text-yellow-400">+{mission.rewards.experience}</span>
              </div>
              {mission.rewards.upgrades.map((upgrade, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-700/50 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <Shield className="text-blue-400 w-4 h-4" />
                    <span>{getUpgradeName(upgrade)}</span>
                  </div>
                  <span className="text-blue-400">已解锁</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 bg-slate-700/30 p-4 rounded-lg">
            <div>
              <div className="text-sm text-slate-400">总分</div>
              <div className="text-xl font-bold">{gameState.score}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">消灭敌人</div>
              <div className="text-xl font-bold">{gameState.enemiesDestroyed}</div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={onContinue}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            继续下一关 (空格)
          </button>
        </div>
      </div>
    </div>
  );
};

function getUpgradeName(upgrade: string): string {
  const names: Record<string, string> = {
    'armor_boost': '装甲强化',
    'speed_boost': '速度提升',
    'damage_boost': '火力增强',
    'energy_boost': '能量提升',
    'repair_boost': '修复强化'
  };
  return names[upgrade] || upgrade;
}

export default LevelTransition;