import { useRef, useState, useCallback } from 'react'
import type { Device, DeviceType, Position, Connection } from '../types/device'
import NetworkDevice from './NetworkDevice'
import ConnectionLayer from './ConnectionLayer'
import PacketManager from './PacketManager'
import { deviceTemplates } from '../data/deviceTemplates'
import { autoLayout } from '../utils/autoLayout'

interface GameCanvasProps {
  devices: Device[]
  onDevicesChange: (newDevices: Device[]) => boolean
  connections: Connection[]
  onConnectionsChange: (newConnections: Connection[]) => void
  onPacketEvent: (event: { type: string }) => void
}

const DEVICE_SIZE = 128 // 设备的宽高
const GRID_GAP = 160 // 网格间距

export const GameCanvas = ({ devices, onDevicesChange, connections, onConnectionsChange, onPacketEvent }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const packetManagerRef = useRef<{ createPacket: (sourceId: string, targetId: string) => void } | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [connectingDevice, setConnectingDevice] = useState<Device | null>(null)
  const [isAutoLayouting, setIsAutoLayouting] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' | null }>({ text: '', type: null })

  // 处理发送数据包
  const handleSendPacket = useCallback(
    (sourceId: string, targetId: string) => {
      console.log('Sending packet:', { sourceId, targetId, packetManager: !!packetManagerRef.current })

      if (!packetManagerRef.current) {
        console.warn('PacketManager ref is not available')
        showMessage('无法发送数据包', 'error')
        return
      }

      // 检查连接是否存在
      const connectionExists = connections.some((conn) => (conn.sourceId === sourceId && conn.targetId === targetId) || (conn.sourceId === targetId && conn.targetId === sourceId))

      if (!connectionExists) {
        console.warn('No connection between devices')
        showMessage('设备之间没有连接', 'error')
        return
      }

      packetManagerRef.current.createPacket(sourceId, targetId)
      showMessage('发送数据包', 'info')
    },
    [connections]
  )

  // 处理自动布局
  const handleAutoLayout = useCallback(() => {
    if (!canvasRef.current || devices.length === 0 || isAutoLayouting) return

    setIsAutoLayouting(true)
    const rect = canvasRef.current.getBoundingClientRect()

    // 执行自动布局
    const updatedDevices = autoLayout(devices, connections, rect.width, rect.height, {
      deviceSize: DEVICE_SIZE,
      padding: 32,
      springLength: GRID_GAP,
      iterations: 100,
    })

    // 更新所有设备的位置
    onDevicesChange(updatedDevices)
    setIsAutoLayouting(false)
  }, [devices, connections, isAutoLayouting, onDevicesChange])

  // 快速布局示例网络
  const handleQuickLayout = () => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const centerX = rect.width / 2 - DEVICE_SIZE / 2
    const centerY = rect.height / 2 - DEVICE_SIZE / 2

    // 创建路由器（中心）
    const router: Device = {
      id: `router-${Date.now()}`,
      type: 'router',
      name: '路由器 1',
      position: { x: centerX, y: centerY },
      description: deviceTemplates.router.description,
      ports: deviceTemplates.router.ports,
      connections: [],
    }

    // 创建交换机（左右）
    const switch1: Device = {
      id: `switch-${Date.now() + 1}`,
      type: 'switch',
      name: '交换机 1',
      position: { x: centerX - GRID_GAP, y: centerY },
      description: deviceTemplates.switch.description,
      ports: deviceTemplates.switch.ports,
      connections: [],
    }

    const switch2: Device = {
      id: `switch-${Date.now() + 2}`,
      type: 'switch',
      name: '交换机 2',
      position: { x: centerX + GRID_GAP, y: centerY },
      description: deviceTemplates.switch.description,
      ports: deviceTemplates.switch.ports,
      connections: [],
    }

    // 创建计算机（四周）
    const computers: Device[] = [
      {
        id: `computer-${Date.now() + 1}`,
        type: 'computer',
        name: '计算机 1',
        position: { x: centerX - GRID_GAP, y: centerY - GRID_GAP },
        description: deviceTemplates.computer.description,
        ports: deviceTemplates.computer.ports,
        connections: [],
      },
      {
        id: `computer-${Date.now() + 2}`,
        type: 'computer',
        name: '计算机 2',
        position: { x: centerX - GRID_GAP, y: centerY + GRID_GAP },
        description: deviceTemplates.computer.description,
        ports: deviceTemplates.computer.ports,
        connections: [],
      },
      {
        id: `computer-${Date.now() + 3}`,
        type: 'computer',
        name: '计算机 3',
        position: { x: centerX + GRID_GAP, y: centerY - GRID_GAP },
        description: deviceTemplates.computer.description,
        ports: deviceTemplates.computer.ports,
        connections: [],
      },
      {
        id: `computer-${Date.now() + 4}`,
        type: 'computer',
        name: '计算机 4',
        position: { x: centerX + GRID_GAP, y: centerY + GRID_GAP },
        description: deviceTemplates.computer.description,
        ports: deviceTemplates.computer.ports,
        connections: [],
      },
    ]

    // 添加所有设备
    const allDevices = [router, switch1, switch2, ...computers]
    onDevicesChange(allDevices)

    // 创建连接
    setTimeout(() => {
      // 连接路由器和交换机
      const routerConnections: Connection[] = [
        {
          id: `connection-${Date.now() + 1}`,
          sourceId: router.id,
          targetId: switch1.id,
          status: 'active',
        },
        {
          id: `connection-${Date.now() + 2}`,
          sourceId: router.id,
          targetId: switch2.id,
          status: 'active',
        },
      ]

      // 连接交换机和计算机
      const switchConnections: Connection[] = [
        {
          id: `connection-${Date.now() + 3}`,
          sourceId: switch1.id,
          targetId: computers[0].id,
          status: 'active',
        },
        {
          id: `connection-${Date.now() + 4}`,
          sourceId: switch1.id,
          targetId: computers[1].id,
          status: 'active',
        },
        {
          id: `connection-${Date.now() + 5}`,
          sourceId: switch2.id,
          targetId: computers[2].id,
          status: 'active',
        },
        {
          id: `connection-${Date.now() + 6}`,
          sourceId: switch2.id,
          targetId: computers[3].id,
          status: 'active',
        },
      ]

      // 更新连接状态
      onConnectionsChange([...routerConnections, ...switchConnections])

      // 更新设备连接信息
      const updateDeviceConnections = (device: Device, connectedIds: string[]) => {
        const updatedDevice = {
          ...device,
          connections: [...device.connections, ...connectedIds],
        }
        const newDevices = devices.map((d) => (d.id === device.id ? updatedDevice : d))
        onDevicesChange(newDevices)
      }

      // 更新路由器连接
      updateDeviceConnections(router, [switch1.id, switch2.id])
      updateDeviceConnections(switch1, [router.id, computers[0].id, computers[1].id])
      updateDeviceConnections(switch2, [router.id, computers[2].id, computers[3].id])
      updateDeviceConnections(computers[0], [switch1.id])
      updateDeviceConnections(computers[1], [switch1.id])
      updateDeviceConnections(computers[2], [switch2.id])
      updateDeviceConnections(computers[3], [switch2.id])
    }, 100)
  }

  // 处理从模板拖拽设备到画布
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(true)
  }

  const handleDragLeave = () => {
    setIsDraggingOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)

    const deviceType = e.dataTransfer.getData('deviceType') as DeviceType
    if (!deviceType || !canvasRef.current) return

    const template = deviceTemplates[deviceType]
    const rect = canvasRef.current.getBoundingClientRect()

    // 计算相对于画布的位置
    const position: Position = {
      x: e.clientX - rect.left - DEVICE_SIZE / 2,
      y: e.clientY - rect.top - DEVICE_SIZE / 2,
    }

    // 确保位置在画布范围内
    const maxX = rect.width - DEVICE_SIZE
    const maxY = rect.height - DEVICE_SIZE

    const validPosition = {
      x: Math.max(0, Math.min(position.x, maxX)),
      y: Math.max(0, Math.min(position.y, maxY)),
    }

    const newDevice: Device = {
      id: `${deviceType}-${Date.now()}`,
      type: deviceType,
      name: `${template.name} ${devices.length + 1}`,
      position: validPosition,
      description: template.description,
      ports: template.ports,
      connections: [],
    }

    onDevicesChange([...devices, newDevice])
  }

  // 处理设备位置更新，确保设备不会超出画布边界
  const handleDeviceDrag = (device: Device, position: Position) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const maxX = rect.width - DEVICE_SIZE
    const maxY = rect.height - DEVICE_SIZE

    const newPosition = {
      x: Math.max(0, Math.min(position.x, maxX)),
      y: Math.max(0, Math.min(position.y, maxY)),
    }

    if (newPosition.x !== device.position.x || newPosition.y !== device.position.y) {
      const newDevices = devices.map((d) => (d.id === device.id ? { ...device, position: newPosition } : d))
      onDevicesChange(newDevices)
    }
  }

  // 处理设备连接
  const handleDeviceConnect = (device: Device) => {
    if (!connectingDevice) {
      // 开始连接
      setConnectingDevice(device)
      showMessage('请选择要连接的目标设备', 'info')
    } else if (connectingDevice.id !== device.id) {
      // 完成连接
      const newConnection: Connection = {
        id: `connection-${Date.now()}`,
        sourceId: connectingDevice.id,
        targetId: device.id,
        status: 'active',
      }

      // 检查是否已存在相同的连接
      const exists = connections.some(
        (conn) => (conn.sourceId === newConnection.sourceId && conn.targetId === newConnection.targetId) || (conn.sourceId === newConnection.targetId && conn.targetId === newConnection.sourceId)
      )

      if (!exists && connectingDevice.connections.length < connectingDevice.ports && device.connections.length < device.ports) {
        // 更新连接状态
        onConnectionsChange([...connections, newConnection])

        // 更新设备的连接信息
        const updateDevice = (device: Device, connectedId: string) => ({
          ...device,
          connections: [...device.connections, connectedId],
        })

        const newDevices = devices.map((d) => {
          if (d.id === connectingDevice.id) return updateDevice(d, device.id)
          if (d.id === device.id) return updateDevice(d, connectingDevice.id)
          return d
        })
        onDevicesChange(newDevices)

        showMessage('连接成功！', 'success')
      } else {
        if (exists) {
          showMessage('设备已经连接！', 'error')
        } else {
          showMessage('设备端口已满！', 'error')
        }
      }

      // 清除连接状态
      setConnectingDevice(null)
    } else {
      // 如果点击了同一个设备，取消连接
      setConnectingDevice(null)
      showMessage('已取消连接', 'info')
    }
  }

  // 处理连接点击
  const handleConnectionClick = (connection: Connection) => {
    // 删除连接
    onConnectionsChange(connections.filter((conn) => conn.id !== connection.id))

    // 更新设备的连接信息
    const updateDevice = (device: Device, disconnectedId: string) => ({
      ...device,
      connections: device.connections.filter((id) => id !== disconnectedId),
    })

    const sourceDevice = devices.find((d) => d.id === connection.sourceId)
    const targetDevice = devices.find((d) => d.id === connection.targetId)

    if (sourceDevice && targetDevice) {
      const newDevices = devices.map((d) => {
        if (d.id === sourceDevice.id) return updateDevice(d, connection.targetId)
        if (d.id === targetDevice.id) return updateDevice(d, connection.sourceId)
        return d
      })
      onDevicesChange(newDevices)
    }
  }

  const showMessage = (text: string, type: 'success' | 'error' | 'info') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: null }), 2000)
  }

  return (
    <div
      ref={canvasRef}
      className={`relative w-full h-full border-2 rounded-lg transition-colors overflow-hidden ${isDraggingOver ? 'border-primary-500 bg-primary-50' : 'border-dashed border-primary-200'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 消息提示 */}
      {message.type && (
        <div
          className={`
            absolute top-4 left-1/2 transform -translate-x-1/2 z-50
            px-4 py-2 rounded-lg shadow-lg
            ${message.type === 'success' ? 'bg-green-500' : message.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}
            text-white text-sm font-medium
            animate-fade-in-down
          `}
        >
          {message.text}
        </div>
      )}

      {/* 工具栏 */}
      {devices.length > 0 && (
        <div className="absolute top-4 right-4 flex space-x-2 z-10">
          <button
            className={`px-4 py-2 bg-primary-500 text-white rounded-lg transition-colors ${isAutoLayouting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-600'}`}
            onClick={handleAutoLayout}
            disabled={isAutoLayouting}
          >
            {isAutoLayouting ? '布局中...' : '自动布局'}
          </button>
        </div>
      )}

      {devices.length === 0 && !isDraggingOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-primary-400 mb-4">拖拽设备到此处开始构建网络</p>
          <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors" onClick={handleQuickLayout}>
            快速布局示例网络
          </button>
        </div>
      )}

      <ConnectionLayer connections={connections} devices={devices} onConnectionClick={handleConnectionClick} />

      <PacketManager ref={packetManagerRef} devices={devices} connections={connections} onPacketEvent={onPacketEvent} />

      {devices.map((device) => (
        <NetworkDevice
          key={device.id}
          device={device}
          isSelected={selectedDevice?.id === device.id}
          isConnecting={connectingDevice?.id === device.id}
          canConnect={!!connectingDevice && connectingDevice.id !== device.id}
          onClick={() => setSelectedDevice(device)}
          onDragEnd={(position) => handleDeviceDrag(device, position)}
          onConnect={() => handleDeviceConnect(device)}
          onSendPacket={(targetId) => handleSendPacket(device.id, targetId)}
        />
      ))}
    </div>
  )
}

export default GameCanvas
