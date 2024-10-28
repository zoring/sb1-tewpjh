import { Vector2D } from '../types';

export interface LevelObjective {
  type: 'destroy_enemies' | 'reach_checkpoint' | 'survive_time' | 'escort';
  required: number;
  current: number;
  checkpoints?: Vector2D[];
  timeLimit?: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  enemyCount: number;
  weather: '晴朗' | '下雨' | '下雪' | '雾天';
  terrain: '森林' | '沙漠' | '雪地' | '城市';
  objectives: LevelObjective[];
  enemyTypes: ('normal' | 'fast' | 'heavy')[];
  playerStart: Vector2D;
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: '森林遭遇战',
    description: '在森林中消灭敌方坦克，小心伏击！',
    enemyCount: 5,
    weather: '晴朗',
    terrain: '森林',
    objectives: [
      {
        type: 'destroy_enemies',
        required: 5,
        current: 0
      }
    ],
    enemyTypes: ['normal', 'normal', 'normal', 'fast', 'normal'],
    playerStart: { x: 300, y: 300 }
  },
  {
    id: 2,
    name: '暴风雪突击',
    description: '在暴风雪中突破敌方防线，到达指定检查点',
    enemyCount: 3,
    weather: '下雪',
    terrain: '雪地',
    objectives: [
      {
        type: 'reach_checkpoint',
        required: 3,
        current: 0,
        checkpoints: [
          { x: 500, y: 500 },
          { x: 1500, y: 1500 },
          { x: 2500, y: 2500 }
        ]
      }
    ],
    enemyTypes: ['heavy', 'normal', 'heavy'],
    playerStart: { x: 150, y: 150 }
  },
  {
    id: 3,
    name: '沙漠护航',
    description: '在沙漠中护送补给车队穿过敌方封锁',
    enemyCount: 4,
    weather: '晴朗',
    terrain: '沙漠',
    objectives: [
      {
        type: 'escort',
        required: 1,
        current: 0,
        checkpoints: [
          { x: 300, y: 300 },
          { x: 1000, y: 1000 },
          { x: 2000, y: 2000 },
          { x: 2700, y: 2700 }
        ]
      },
      {
        type: 'survive_time',
        required: 180, // 3 minutes
        current: 0,
        timeLimit: 180
      }
    ],
    enemyTypes: ['fast', 'fast', 'normal', 'heavy'],
    playerStart: { x: 200, y: 200 }
  }
];