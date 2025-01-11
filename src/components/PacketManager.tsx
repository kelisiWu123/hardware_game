import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { Device, Connection } from '../types/device'
import type { Packet, PacketEvent } from '../types/packet'
import { processPacket } from '../utils/packetProcessing'
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

      // 设备尺寸常量
      const DEVICE_SIZE = 128 // 设备的宽高
      const DEVICE_CENTER_OFFSET = DEVICE_SIZE / 2 // 中心点偏移

      const newPacket: Packet = {
        id: `packet-${Date.now()}`,
        sourceId,
        targetId,
        currentDeviceId: sourceId,
        nextDeviceId: targetId, // 初始时直接指向目标设备
        status: 'waiting', // 使用waiting状态
        type: 'data',
        path: [sourceId],
        position: {
          x: sourceDevice.position.x + DEVICE_CENTER_OFFSET,
          y: sourceDevice.position.y + DEVICE_CENTER_OFFSET,
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
        sourceDevice,
        targetDevice,
      })

      // 自动开始模拟
      setIsSimulating(true)
    },
    [devices, onPacketEvent]
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

      // 设备尺寸常量
      const DEVICE_SIZE = 128 // 设备的宽高
      const DEVICE_CENTER_OFFSET = DEVICE_SIZE / 2 // 中心点偏移

      const progress = (Date.now() % 1000) / 1000 // 0-1之间的进度值

      // 线性插值计算当前位置
      const newPosition = {
        x: currentDevice.position.x + DEVICE_CENTER_OFFSET + (nextDevice.position.x - currentDevice.position.x) * progress,
        y: currentDevice.position.y + DEVICE_CENTER_OFFSET + (nextDevice.position.y - currentDevice.position.y) * progress,
      }

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

        // 检查是否到达下一个设备（增加判断窗口，使状态更新更平滑）
        const progress = (Date.now() % 1000) / 1000
        if (progress < 0.15 && updatedPacket.nextDeviceId) {
          // 到达下一个设备
          const nextDevice = devices.find((d) => d.id === updatedPacket.nextDeviceId)
          if (nextDevice) {
            const result = processPacket(updatedPacket, nextDevice, devices, connections)

            // 更新数据包状态，增加中间状态
            const newStatus = result.error ? 'error' : result.nextDeviceId ? 'transmitting' : updatedPacket.currentDeviceId === updatedPacket.targetId ? 'received' : 'transmitting'

            const newPacket: Packet = {
              ...updatedPacket,
              currentDeviceId: updatedPacket.nextDeviceId,
              nextDeviceId: result.nextDeviceId,
              status: newStatus as Packet['status'],
              path: [...updatedPacket.path, updatedPacket.nextDeviceId],
            }

            // 增加更详细的事件信息
            onPacketEvent?.({
              type: newStatus === 'error' ? 'error' : newStatus === 'received' ? 'receive' : 'hop',
              packet: newPacket,
              timestamp: Date.now(),
              error: result.error,
              sourceDevice: devices.find((d) => d.id === packet.sourceId),
              targetDevice: devices.find((d) => d.id === packet.targetId),
              currentDevice: nextDevice,
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
        {packets.map((packet) => {
          // 获取当前设备和下一个设备
          const currentDevice = devices.find((d) => d.id === packet.currentDeviceId)
          const nextDevice = packet.nextDeviceId ? devices.find((d) => d.id === packet.nextDeviceId) : null

          // 如果是等待状态，使用源设备和目标设备
          const sourceDevice = devices.find((d) => d.id === packet.sourceId)
          const targetDevice = devices.find((d) => d.id === packet.targetId)

          // 设备尺寸常量
          const DEVICE_SIZE = 128 // 设备的宽高
          const DEVICE_CENTER_OFFSET = DEVICE_SIZE / 2 // 中心点偏移

          // 根据状态决定起点和终点
          let start, end
          if (packet.status === 'waiting' && sourceDevice && targetDevice) {
            start = {
              x: sourceDevice.position.x + DEVICE_CENTER_OFFSET,
              y: sourceDevice.position.y + DEVICE_CENTER_OFFSET,
            }
            end = {
              x: targetDevice.position.x + DEVICE_CENTER_OFFSET,
              y: targetDevice.position.y + DEVICE_CENTER_OFFSET,
            }
          } else if (currentDevice && nextDevice) {
            start = {
              x: currentDevice.position.x + DEVICE_CENTER_OFFSET,
              y: currentDevice.position.y + DEVICE_CENTER_OFFSET,
            }
            end = {
              x: nextDevice.position.x + DEVICE_CENTER_OFFSET,
              y: nextDevice.position.y + DEVICE_CENTER_OFFSET,
            }
          } else {
            return null
          }

          return (
            <PacketAnimation
              key={packet.id}
              start={start}
              end={end}
              color={packet.type === 'error' ? '#EF4444' : packet.type === 'ack' ? '#10B981' : '#3B82F6'}
              size={8}
              duration={1}
              onComplete={() => {
                console.log('Packet animation completed:', packet.id)
                // 如果是等待状态，更新为传输状态
                if (packet.status === 'waiting') {
                  setPackets((prev) =>
                    prev.map((p) =>
                      p.id === packet.id
                        ? {
                            ...p,
                            status: 'transmitting',
                          }
                        : p
                    )
                  )
                }
              }}
            />
          )
        })}
      </AnimatePresence>
    </>
  )
})

export default PacketManager
