export interface MissionRewards {
  experience: number;
  upgrades: string[];
}

export interface Mission {
  id: number;
  name: string;
  description: string;
  rewards: MissionRewards;
}

export class MissionManager {
  private missions: Mission[] = [
    {
      id: 1,
      name: "森林遭遇战",
      description: "在森林中消灭敌方坦克，小心伏击！",
      rewards: {
        experience: 1000,
        upgrades: ["armor_boost"]
      }
    },
    {
      id: 2,
      name: "暴风雪突击",
      description: "在暴风雪中突破敌方防线，到达指定检查点",
      rewards: {
        experience: 1500,
        upgrades: ["speed_boost"]
      }
    },
    {
      id: 3,
      name: "沙漠护航",
      description: "在沙漠中护送补给车队穿过敌方封锁",
      rewards: {
        experience: 2000,
        upgrades: ["damage_boost", "energy_boost"]
      }
    },
    {
      id: 4,
      name: "城市防御",
      description: "防御敌人的全面进攻，保护城市中的重要建筑",
      rewards: {
        experience: 2500,
        upgrades: ["repair_boost"]
      }
    }
  ];

  private currentMissionIndex: number = 0;

  constructor() {}

  public getCurrentMission(): Mission {
    return this.missions[this.currentMissionIndex];
  }

  public startNextMission() {
    if (this.currentMissionIndex < this.missions.length - 1) {
      this.currentMissionIndex++;
    }
  }

  public getMissionCount(): number {
    return this.missions.length;
  }

  public getCurrentMissionIndex(): number {
    return this.currentMissionIndex;
  }
}