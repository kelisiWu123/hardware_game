import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { Device, Connection } from '../types/device'
import type { Packet, PacketEvent } from '../types/packet'
import { processPacket, calculatePacketPosition } from '../utils/packetProcessing'
import PacketAnimation from './PacketAnimation'

interface PacketManagerProps {
  devices: Device[]
  connections: Connection[]
  onPacketEvent?: (event: PacketEvent) => void
}

export interface PacketManagerHandle {
  createPacket: (sourceId: string, targetId: string) => void
}

const PacketManager = forwardRef<PacketManagerHandle, PacketManagerProps>(({ devices, connections, onPacketEvent }, ref) => {
  const [packets, setPackets] = useState<Packet[]>([])
  const [isSimulating, setIsSimulating] = useState(false)

  // 创建新的数据包
  const createPacket = useCallback(
    (sourceId: string, targetId: string) => {
      console.log('PacketManager.createPacket:', { sourceId, targetId })
      const sourceDevice = devices.find((d) => d.id === sourceId)
      const targetDevice = devices.find((d) => d.id === targetId)

      if (!sourceDevice || !targetDevice) {
        console.warn('Source or target device not found:', { sourceDevice, targetDevice })
        return
      }

      // 计算初始路径和下一跳
      const result = processPacket(
        {
          id: `packet-${Date.now()}`,
          sourceId,
          targetId,
          currentDeviceId: sourceId,
          nextDeviceId: null,
          status: 'waiting',
          type: 'data',
          path: [sourceId],
          position: {
            x: sourceDevice.position.x + 64,
            y: sourceDevice.position.y + 64,
          },
        },
        sourceDevice,
        devices,
        connections
      )

      console.log('Process result:', result)

      if (result.error) {
        console.warn('Packet processing error:', result.error)
        onPacketEvent?.({
          type: 'error',
          packet: {
            id: `packet-${Date.now()}`,
            sourceId,
            targetId,
            currentDeviceId: sourceId,
            nextDeviceId: null,
            status: 'error',
            type: 'data',
            path: [sourceId],
            position: {
              x: sourceDevice.position.x + 64,
              y: sourceDevice.position.y + 64,
            },
          },
          timestamp: Date.now(),
          error: result.error,
        })
        return
      }

      const newPacket: Packet = {
        id: `packet-${Date.now()}`,
        sourceId,
        targetId,
        currentDeviceId: sourceId,
        nextDeviceId: result.nextDeviceId,
        status: 'transmitting',
        type: 'data',
        path: [sourceId],
        position: {
          x: sourceDevice.position.x + 64,
          y: sourceDevice.position.y + 64,
        },
      }

      console.log('Created new packet:', newPacket)

      setPackets((prev) => {
        console.log('Current packets:', prev)
        return [...prev, newPacket]
      })

      onPacketEvent?.({
        type: 'start',
        packet: newPacket,
        timestamp: Date.now(),
      })

      // 自动开始模拟
      setIsSimulating(true)
    },
    [devices, connections, onPacketEvent]
  )

  // 暴露方法给父组件
  useImperativeHandle(
    ref,
    () => ({
      createPacket,
    }),
    [createPacket]
  )

  // 更新数据包位置
  const updatePacketPosition = useCallback(
    (packet: Packet) => {
      const currentDevice = devices.find((d) => d.id === packet.currentDeviceId)
      const nextDevice = packet.nextDeviceId ? devices.find((d) => d.id === packet.nextDeviceId) : null

      if (!currentDevice || !nextDevice) return packet

      const progress = (Date.now() % 1000) / 1000 // 0-1之间的进度值
      const newPosition = calculatePacketPosition({ x: currentDevice.position.x + 64, y: currentDevice.position.y + 64 }, { x: nextDevice.position.x + 64, y: nextDevice.position.y + 64 }, progress)

      return {
        ...packet,
        position: newPosition,
      }
    },
    [devices]
  )

  // 处理数据包传输
  const processPackets = useCallback(() => {
    setPackets((prevPackets) => {
      return prevPackets.map((packet) => {
        if (packet.status !== 'transmitting') return packet

        // 更新位置
        const updatedPacket = updatePacketPosition(packet)

        // 检查是否到达下一个设备
        const progress = (Date.now() % 1000) / 1000
        if (progress < 0.1 && updatedPacket.nextDeviceId) {
          // 到达下一个设备
          const nextDevice = devices.find((d) => d.id === updatedPacket.nextDeviceId)
          if (nextDevice) {
            const result = processPacket(updatedPacket, nextDevice, devices, connections)

            // 更新数据包状态
            const newStatus = result.error ? 'error' : result.nextDeviceId ? 'transmitting' : 'received'
            const newPacket: Packet = {
              ...updatedPacket,
              currentDeviceId: updatedPacket.nextDeviceId,
              nextDeviceId: result.nextDeviceId,
              status: newStatus as Packet['status'],
              path: [...updatedPacket.path, updatedPacket.nextDeviceId],
            }

            // 触发事件
            onPacketEvent?.({
              type: newStatus === 'error' ? 'error' : newStatus === 'received' ? 'receive' : 'hop',
              packet: newPacket,
              timestamp: Date.now(),
            })

            return newPacket
          }
        }

        return updatedPacket
      })
    })
  }, [devices, connections, updatePacketPosition, onPacketEvent])

  // 启动模拟
  const startSimulation = useCallback(() => {
    setIsSimulating(true)
  }, [])

  // 停止模拟
  const stopSimulation = useCallback(() => {
    setIsSimulating(false)
  }, [])

  // 清除所有数据包
  const clearPackets = useCallback(() => {
    setPackets([])
  }, [])

  // 动画循环
  useEffect(() => {
    if (!isSimulating) return

    const intervalId = setInterval(processPackets, 16) // 约60fps
    return () => clearInterval(intervalId)
  }, [isSimulating, processPackets])

  // 清理完成的数据包
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPackets((prev) => prev.filter((p) => p.status === 'transmitting'))
    }, 2000)

    return () => clearTimeout(timeoutId)
  }, [packets])

  return (
    <>
      <div className="absolute top-4 left-4 flex space-x-2 z-10">
        <button
          className={`px-4 py-2 rounded-lg transition-colors ${isSimulating ? 'bg-red-500 hover:bg-red-600' : 'bg-primary-500 hover:bg-primary-600'} text-white`}
          onClick={isSimulating ? stopSimulation : startSimulation}
        >
          {isSimulating ? '停止模拟' : '开始模拟'}
        </button>
        <button className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors" onClick={clearPackets}>
          清除数据包
        </button>
      </div>

      <AnimatePresence>
        {packets.map((packet) => (
          <PacketAnimation key={packet.id} packet={packet} />
        ))}
      </AnimatePresence>
    </>
  )
})

export default PacketManager
