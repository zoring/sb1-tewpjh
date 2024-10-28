import React, { createContext, useContext, useReducer } from 'react';

interface GameState {
  level: number;
  playerHealth: number;
  playerArmor: number;
  playerEnergy: number;
  score: number;
  weather: '晴朗' | '下雨' | '下雪' | '雾天';
  terrain: '森林' | '沙漠' | '雪地' | '城市';
  checkpointProgress: number;
  enemiesDestroyed: number;
  showLevelTransition: boolean;
}

interface GameContextType {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export type GameAction =
  | { type: 'UPDATE_HEALTH'; payload: number }
  | { type: 'UPDATE_ARMOR'; payload: number }
  | { type: 'UPDATE_ENERGY'; payload: number }
  | { type: 'UPDATE_SCORE'; payload: number }
  | { type: 'CHANGE_WEATHER'; payload: GameState['weather'] }
  | { type: 'CHANGE_TERRAIN'; payload: GameState['terrain'] }
  | { type: 'COMPLETE_LEVEL'; payload: undefined }
  | { type: 'START_NEXT_LEVEL'; payload: undefined }
  | { type: 'UPDATE_CHECKPOINT'; payload: number }
  | { type: 'ENEMY_DESTROYED'; payload: undefined }
  | { type: 'SHOW_LEVEL_TRANSITION'; payload: boolean };

const initialState: GameState = {
  level: 1,
  playerHealth: 100,
  playerArmor: 100,
  playerEnergy: 100,
  score: 0,
  weather: '晴朗',
  terrain: '森林',
  checkpointProgress: 0,
  enemiesDestroyed: 0,
  showLevelTransition: false
};

const GameContext = createContext<GameContextType | undefined>(undefined);

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'UPDATE_HEALTH':
      return { ...state, playerHealth: action.payload };
    case 'UPDATE_ARMOR':
      return { ...state, playerArmor: action.payload };
    case 'UPDATE_ENERGY':
      return { ...state, playerEnergy: action.payload };
    case 'UPDATE_SCORE':
      return { ...state, score: state.score + action.payload };
    case 'CHANGE_WEATHER':
      return { ...state, weather: action.payload };
    case 'CHANGE_TERRAIN':
      return { ...state, terrain: action.payload };
    case 'COMPLETE_LEVEL':
      return { 
        ...state,
        showLevelTransition: true
      };
    case 'START_NEXT_LEVEL':
      return { 
        ...state, 
        level: state.level + 1,
        checkpointProgress: 0,
        enemiesDestroyed: 0,
        showLevelTransition: false
      };
    case 'UPDATE_CHECKPOINT':
      return { ...state, checkpointProgress: action.payload };
    case 'ENEMY_DESTROYED':
      return { ...state, enemiesDestroyed: state.enemiesDestroyed + 1 };
    case 'SHOW_LEVEL_TRANSITION':
      return { ...state, showLevelTransition: action.payload };
    default:
      return state;
  }
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ gameState, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};