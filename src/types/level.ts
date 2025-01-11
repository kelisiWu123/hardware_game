import type { Device, DeviceType } from './device'

// 关卡目标类型
export type LevelObjectiveType = 'connect_devices' | 'send_packets' | 'build_topology' | 'achieve_throughput'

// 关卡目标
export interface LevelObjective {
  type: LevelObjectiveType
  description: string
  required: number
  current: number
  completed: boolean
}

// 关卡配置中的设备要求
export interface DeviceRequirement {
  type: DeviceType
  count: number
  minConnections?: number
  maxConnections?: number
  mustConnectTo?: DeviceType[]
}

// 关卡配置
export interface LevelConfig {
  id: string
  name: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  objectives: LevelObjective[]
  requiredDevices: DeviceRequirement[]
  initialDevices?: Device[] // 预置的设备
  maxDevices?: number // 最大可放置设备数
  timeLimit?: number // 时间限制（秒）
  minScore: number // 通关最低分数
}

// 关卡状态
export interface LevelState {
  id: string
  isCompleted: boolean
  highScore: number
  stars: number // 1-3星评价
  completionTime?: number
  unlockedDevices: DeviceType[]
}

// 评分标准
export interface ScoringCriteria {
  timeBonus: number // 时间奖励系数
  connectionAccuracy: number // 连接准确度系数
  packetDelivery: number // 数据包传输成功率系数
  deviceUtilization: number // 设备利用率系数
}

// 关卡进度
export interface LevelProgress {
  currentLevel: string
  completedLevels: Record<string, LevelState>
  totalStars: number
  unlockedLevels: string[]
}
