import React from 'react';
import { useGame } from '../context/GameContext';
import { WeaponType } from '../game/weapons/WeaponSystem';
import '../styles/weapons.css';

interface WeaponHUDProps {
  currentWeapon: WeaponType;
  onWeaponSelect: (weapon: WeaponType) => void;
  weapons: WeaponType[];
}

const WeaponHUD: React.FC<WeaponHUDProps> = ({
  currentWeapon,
  onWeaponSelect,
  weapons
}) => {
  const { gameState } = useGame();

  const getWeaponName = (type: WeaponType): string => {
    const names: Record<WeaponType, string> = {
      cannon: '主炮',
      machinegun: '机枪',
      plasma: '等离子炮',
      missile: '导弹',
      railgun: '轨道炮',
      shotgun: '霰弹枪'
    };
    return names[type];
  };

  return (
    <div className="weapon-hud">
      {weapons.map((weapon, index) => (
        <div
          key={weapon}
          className="group relative"
          onClick={() => onWeaponSelect(weapon)}
        >
          <div
            className={`weapon-icon weapon-${weapon} ${
              currentWeapon === weapon ? 'active' : ''
            }`}
          >
            <span className="absolute -top-1 -right-1 bg-slate-700 rounded-full w-5 h-5 
                           flex items-center justify-center text-xs">
              {index + 1}
            </span>
          </div>
          
          <div className="weapon-stats">
            <div className="text-sm font-medium mb-2">{getWeaponName(weapon)}</div>
            
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">伤害</span>
                  <span className="text-red-400">★★★☆☆</span>
                </div>
                <div className="weapon-stat-bar">
                  <div className="weapon-stat-fill stat-damage" style={{ width: '60%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">装填速度</span>
                  <span className="text-blue-400">★★★★☆</span>
                </div>
                <div className="weapon-stat-bar">
                  <div className="weapon-stat-fill stat-reload" style={{ width: '80%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">射程</span>
                  <span className="text-green-400">★★☆☆☆</span>
                </div>
                <div className="weapon-stat-bar">
                  <div className="weapon-stat-fill stat-range" style={{ width: '40%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">能量消耗</span>
                  <span className="text-yellow-400">★★★☆☆</span>
                </div>
                <div className="weapon-stat-bar">
                  <div className="weapon-stat-fill stat-energy" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeaponHUD;