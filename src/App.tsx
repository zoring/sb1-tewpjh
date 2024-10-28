import React from 'react';
import { Shield, Crosshair, Cloud, Mountain } from 'lucide-react';
import Game from './components/Game';
import GameHUD from './components/GameHUD';
import { GameProvider } from './context/GameContext';

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-slate-900 text-white">
        {/* 页头 */}
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-amber-500" />
              <h1 className="text-xl font-bold">坦克大战：变幻战场</h1>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Crosshair className="text-red-500" />
                <span>第1关</span>
              </div>
              <div className="flex items-center gap-2">
                <Cloud className="text-blue-400" />
                <span>晴朗天气</span>
              </div>
              <div className="flex items-center gap-2">
                <Mountain className="text-green-500" />
                <span>森林地形</span>
              </div>
            </div>
          </div>
        </header>

        {/* 主游戏区域 */}
        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                <Game />
              </div>
            </div>
            <div className="lg:col-span-1">
              <GameHUD />
            </div>
          </div>
        </main>
      </div>
    </GameProvider>
  );
}

export default App;