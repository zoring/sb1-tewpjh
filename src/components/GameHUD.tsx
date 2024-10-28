import React from 'react';
import { Shield, Heart, Zap, Target } from 'lucide-react';
import { useGame } from '../context/GameContext';
import LevelInfo from './LevelInfo';

const GameHUD: React.FC = () => {
  const { gameState } = useGame();

  return (
    <div className="space-y-4">
      {/* Level Info */}
      <LevelInfo objectives={[]} /> {/* Will be populated by GameEngine */}

      {/* Player Status */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h2 className="text-lg font-bold mb-3">坦克状态</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="text-blue-400" />
              <span>装甲</span>
            </div>
            <div className="w-32 bg-slate-700 rounded-full h-2">
              <div 
                className="bg-blue-400 rounded-full h-2 transition-all duration-300" 
                style={{ width: `${gameState.playerArmor}%` }} 
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="text-red-400" />
              <span>生命值</span>
            </div>
            <div className="w-32 bg-slate-700 rounded-full h-2">
              <div 
                className="bg-red-400 rounded-full h-2 transition-all duration-300" 
                style={{ width: `${gameState.playerHealth}%` }} 
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="text-yellow-400" />
              <span>能量</span>
            </div>
            <div className="w-32 bg-slate-700 rounded-full h-2">
              <div 
                className="bg-yellow-400 rounded-full h-2 transition-all duration-300" 
                style={{ width: `${gameState.playerEnergy}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h2 className="text-lg font-bold mb-3">操作说明</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>WASD键</div>
          <div>移动坦克</div>
          <div>鼠标</div>
          <div>瞄准炮塔</div>
          <div>左键点击</div>
          <div>发射主炮</div>
          <div>空格键</div>
          <div>特殊技能</div>
        </div>
      </div>

      {/* Score */}
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">得分</span>
          <span className="text-2xl font-bold text-yellow-400">{gameState.score}</span>
        </div>
      </div>
    </div>
  );
};

export default GameHUD;