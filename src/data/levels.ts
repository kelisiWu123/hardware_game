import type { LevelConfig } from '../types/level'

export const levels: LevelConfig[] = [
  {
    id: 'level-1',
    name: '初识网络',
    description: '欢迎来到网络世界！在这一关，你将学习如何连接计算机和交换机。',
    difficulty: 'easy',
    objectives: [
      {
        type: 'connect_devices',
        description: '将两台计算机连接到交换机',
        required: 2,
        current: 0,
      },
      {
        type: 'send_packets',
        description: '在计算机之间成功传输3个数据包',
        required: 3,
        current: 0,
      },
    ],
    requiredDevices: [
      { type: 'switch', count: 1, minConnections: 2 },
      { type: 'computer', count: 2, mustConnectTo: ['switch'] },
    ],
    maxDevices: 3,
    timeLimit: 300,
    minScore: 70,
  },
  {
    id: 'level-2',
    name: '路由之道',
    description: '让我们添加一个路由器，学习如何连接不同的网络。',
    difficulty: 'easy',
    objectives: [
      {
        type: 'build_topology',
        description: '创建包含路由器和两个交换机的网络',
        required: 1,
        current: 0,
      },
      {
        type: 'connect_devices',
        description: '将计算机连接到各自的交换机',
        required: 4,
        current: 0,
      },
      {
        type: 'send_packets',
        description: '通过路由器在不同网络的计算机之间传输数据包',
        required: 5,
        current: 0,
      },
    ],
    requiredDevices: [
      { type: 'router', count: 1, minConnections: 2 },
      { type: 'switch', count: 2, minConnections: 2, mustConnectTo: ['router'] },
      { type: 'computer', count: 4, mustConnectTo: ['switch'] },
    ],
    maxDevices: 7,
    timeLimit: 600,
    minScore: 75,
  },
  {
    id: 'level-3',
    name: '网关互联',
    description: '使用网关连接不同类型的网络，实现更复杂的网络拓扑。',
    difficulty: 'medium',
    objectives: [
      {
        type: 'build_topology',
        description: '创建包含网关的完整网络拓扑',
        required: 1,
        current: 0,
      },
      {
        type: 'achieve_throughput',
        description: '保持网络吞吐量在指定水平',
        required: 100,
        current: 0,
      },
    ],
    requiredDevices: [
      { type: 'gateway', count: 1, minConnections: 2 },
      { type: 'router', count: 2, minConnections: 2 },
      { type: 'switch', count: 2, minConnections: 2 },
      { type: 'computer', count: 4, minConnections: 1 },
    ],
    maxDevices: 10,
    timeLimit: 900,
    minScore: 80,
  },
]

// 评分标准
export const scoringCriteria = {
  timeBonus: 1.5, // 提前完成的时间奖励系数
  connectionAccuracy: 2.0, // 连接准确度系数
  packetDelivery: 1.0, // 数据包传输成功率系数
  deviceUtilization: 1.2, // 设备利用率系数
}

// 计算得分
export const calculateScore = (
  level: LevelConfig,
  completionTime: number,
  successfulConnections: number,
  totalConnections: number,
  successfulPackets: number,
  totalPackets: number,
  devicesUsed: number
): number => {
  // 基础分数
  let score = 50

  // 时间奖励
  if (level.timeLimit && completionTime < level.timeLimit) {
    const timeBonus = ((level.timeLimit - completionTime) / level.timeLimit) * 20 * scoringCriteria.timeBonus
    score += timeBonus
  }

  // 连接准确度
  const connectionAccuracy = (successfulConnections / totalConnections) * 100
  score += connectionAccuracy * scoringCriteria.connectionAccuracy

  // 数据包传输成功率
  const packetDeliveryRate = (successfulPackets / totalPackets) * 100
  score += packetDeliveryRate * scoringCriteria.packetDelivery

  // 设备利用率
  if (level.maxDevices) {
    const utilizationRate = (devicesUsed / level.maxDevices) * 100
    score += utilizationRate * scoringCriteria.deviceUtilization
  }

  return Math.min(100, Math.round(score))
}

// 计算星级
export const calculateStars = (score: number): number => {
  if (score >= 95) return 3
  if (score >= 80) return 2
  if (score >= 60) return 1
  return 0
}
