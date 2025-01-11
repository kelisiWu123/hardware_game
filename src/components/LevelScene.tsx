import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { LevelConfig, LevelObjective } from '../types/level'
import type { Device, Connection } from '../types/device'
import { useLevelProgressStore } from '../stores/levelProgressStore'
import GameCanvas from './GameCanvas'

interface LevelSceneProps {
  level: LevelConfig
  onComplete: () => void
  onExit: () => void
}

const LevelScene = ({ level, onComplete, onExit }: LevelSceneProps) => {
  // 游戏状态
  const [devices, setDevices] = useState<Device[]>(level.initialDevices || [])
  const [connections, setConnections] = useState<Connection[]>([])
  const [objectives, setObjectives] = useState<LevelObjective[]>(level.objectives)
  const [timeRemaining, setTimeRemaining] = useState(level.timeLimit || 0)
  const [isRunning, setIsRunning] = useState(false)
  const [message, setMessage] = useState('')

  // 游戏数据
  const successfulConnections = useRef(0)
  const totalConnections = useRef(0)
  const successfulPackets = useRef(0)
  const totalPackets = useRef(0)

  const { updateLevelProgress } = useLevelProgressStore()

  // 计时器
  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          handleLevelEnd()
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, timeRemaining])

  // 检查目标完成情况
  const checkObjectives = () => {
    let allCompleted = true
    const updatedObjectives = objectives.map((objective) => {
      let current = 0
      switch (objective.type) {
        case 'connect_devices':
          current = connections.length
          break
        case 'send_packets':
          current = successfulPackets.current
          break
        case 'build_topology':
          current = checkTopology() ? 1 : 0
          break
        case 'achieve_throughput':
          current = calculateThroughput()
          break
      }

      if (current < objective.required) {
        allCompleted = false
      }

      return { ...objective, current }
    })

    setObjectives(updatedObjectives)
    return allCompleted
  }

  // 检查网络拓扑是否符合要求
  const checkTopology = () => {
    // 检查是否满足设备数量和连接要求
    for (const requirement of level.requiredDevices) {
      const deviceCount = devices.filter((d) => d.type === requirement.type).length
      if (deviceCount < requirement.count) return false

      if (requirement.minConnections || requirement.maxConnections) {
        const devicesOfType = devices.filter((d) => d.type === requirement.type)
        for (const device of devicesOfType) {
          const connectionCount = connections.filter((c) => c.sourceId === device.id || c.targetId === device.id).length

          if (requirement.minConnections && connectionCount < requirement.minConnections) return false
          if (requirement.maxConnections && connectionCount > requirement.maxConnections) return false
        }
      }

      if (requirement.mustConnectTo) {
        const devicesOfType = devices.filter((d) => d.type === requirement.type)
        for (const device of devicesOfType) {
          const hasRequiredConnections = requirement.mustConnectTo.every((targetType) => {
            return connections.some((c) => {
              const connectedDevice = devices.find((d) => (c.sourceId === device.id && d.id === c.targetId) || (c.targetId === device.id && d.id === c.sourceId))
              return connectedDevice?.type === targetType
            })
          })
          if (!hasRequiredConnections) return false
        }
      }
    }
    return true
  }

  // 计算网络吞吐量
  const calculateThroughput = () => {
    // 简化的吞吐量计算，基于成功传输的数据包数量和时间
    const timeElapsed = level.timeLimit ? level.timeLimit - timeRemaining : 0
    return timeElapsed > 0 ? Math.floor((successfulPackets.current / timeElapsed) * 100) : 0
  }

  // 处理关卡结束
  const handleLevelEnd = () => {
    const timeTaken = level.timeLimit ? level.timeLimit - timeRemaining : 0
    updateLevelProgress(level.id, timeTaken, successfulConnections.current, totalConnections.current, successfulPackets.current, totalPackets.current, devices.length)
    onComplete()
  }

  // 处理设备更新
  const handleDevicesUpdate = (newDevices: Device[]) => {
    setDevices(newDevices)
    if (level.maxDevices && newDevices.length > level.maxDevices) {
      setMessage(`设备数量不能超过 ${level.maxDevices} 个`)
      return false
    }
    return true
  }

  // 处理连接更新
  const handleConnectionsUpdate = (newConnections: Connection[]) => {
    setConnections(newConnections)
    totalConnections.current++
    if (checkTopology()) {
      successfulConnections.current++
      if (!isRunning) setIsRunning(true)
    }
    checkObjectives()
  }

  // 处理数据包事件
  const handlePacketEvent = (event: { type: string }) => {
    if (event.type === 'start') {
      totalPackets.current++
    } else if (event.type === 'receive') {
      successfulPackets.current++
      checkObjectives()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 to-primary-50">
      {/* 顶部信息栏 */}
      <div className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary-800">{level.name}</h2>
          <div className="flex items-center space-x-4">
            <motion.div
              className={`px-4 py-2 rounded-full ${timeRemaining < 30 ? 'bg-red-100 text-red-800' : 'bg-primary-100 text-primary-800'}`}
              animate={{ scale: timeRemaining < 30 ? [1, 1.1, 1] : 1 }}
              transition={{ repeat: timeRemaining < 30 ? Infinity : 0, duration: 1 }}
            >
              ⏱️ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </motion.div>
            <button onClick={onExit} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-800 transition-colors">
              退出关卡
            </button>
          </div>
        </div>
      </div>

      {/* 目标列表 */}
      <div className="fixed left-4 top-24 bg-white rounded-lg shadow-lg p-4 w-64">
        <h3 className="text-lg font-bold text-primary-800 mb-2">关卡目标</h3>
        <div className="space-y-2">
          {objectives.map((objective, index) => (
            <motion.div key={index} className="flex items-center" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
              <div
                className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center text-sm
                  ${objective.current >= objective.required ? 'bg-green-500 text-white' : 'bg-primary-100 text-primary-800'}`}
              >
                {objective.current >= objective.required ? '✓' : `${objective.current}/${objective.required}`}
              </div>
              <span className="text-sm text-primary-700">{objective.description}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 游戏画布 */}
      <div className="p-4">
        <GameCanvas devices={devices} onDevicesChange={handleDevicesUpdate} connections={connections} onConnectionsChange={handleConnectionsUpdate} onPacketEvent={handlePacketEvent} />
      </div>

      {/* 消息提示 */}
      {message && (
        <motion.div
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-800 px-6 py-3 rounded-full shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          {message}
        </motion.div>
      )}
    </div>
  )
}

export default LevelScene
