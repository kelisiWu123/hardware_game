import type { Device, Connection } from '../types/device'
import type { Packet, ProcessResult } from '../types/packet'

// 查找两个设备之间的连接
export const findConnection = (connections: Connection[], deviceId1: string, deviceId2: string): Connection | null => {
  return connections.find((conn) => (conn.sourceId === deviceId1 && conn.targetId === deviceId2) || (conn.sourceId === deviceId2 && conn.targetId === deviceId1)) || null
}

// 查找设备的所有连接
export const findDeviceConnections = (connections: Connection[], deviceId: string): Connection[] => {
  return connections.filter((conn) => conn.sourceId === deviceId || conn.targetId === deviceId)
}

// 查找从源设备到目标设备的路径
export const findPath = (devices: Device[], connections: Connection[], sourceId: string, targetId: string): string[] => {
  const visited = new Set<string>()
  const queue: { deviceId: string; path: string[] }[] = [{ deviceId: sourceId, path: [sourceId] }]

  while (queue.length > 0) {
    const { deviceId, path } = queue.shift()!

    if (deviceId === targetId) {
      return path
    }

    if (!visited.has(deviceId)) {
      visited.add(deviceId)
      const deviceConnections = findDeviceConnections(connections, deviceId)

      for (const conn of deviceConnections) {
        const nextDeviceId = conn.sourceId === deviceId ? conn.targetId : conn.sourceId
        if (!visited.has(nextDeviceId)) {
          queue.push({ deviceId: nextDeviceId, path: [...path, nextDeviceId] })
        }
      }
    }
  }

  return []
}

// 处理数据包在不同设备上的行为
export const processPacket = (packet: Packet, device: Device, devices: Device[], connections: Connection[]): ProcessResult => {
  const deviceType = device.type

  switch (deviceType) {
    case 'router':
      return processRouterPacket(packet, device, devices, connections)
    case 'switch':
      return processSwitchPacket(packet, device, devices, connections)
    case 'bridge':
      return processBridgePacket(packet, device, devices, connections)
    case 'hub':
      return processHubPacket(packet, device, devices, connections)
    case 'gateway':
      return processGatewayPacket(packet, device, devices, connections)
    case 'computer':
      return processComputerPacket(packet, device)
    default:
      return { nextDeviceId: null, delay: 0, error: '未知设备类型' }
  }
}

// 路由器处理数据包
const processRouterPacket = (packet: Packet, device: Device, devices: Device[], connections: Connection[]): ProcessResult => {
  // 如果是目标设备，接收数据包
  if (device.id === packet.targetId) {
    return { nextDeviceId: null, delay: 100 }
  }

  // 查找到目标设备的路径
  const path = findPath(devices, connections, device.id, packet.targetId)
  if (path.length > 1) {
    return { nextDeviceId: path[1], delay: 200 }
  }

  return { nextDeviceId: null, delay: 0, error: '找不到到目标设备的路径' }
}

// 交换机处理数据包
const processSwitchPacket = (packet: Packet, device: Device, devices: Device[], connections: Connection[]): ProcessResult => {
  // 交换机会记住源设备的位置，并只向目标端口转发
  const targetDevice = devices.find((d) => d.id === packet.targetId)
  if (!targetDevice) {
    return { nextDeviceId: null, delay: 0, error: '找不到目标设备' }
  }

  const connection = findConnection(connections, device.id, targetDevice.id)
  if (connection) {
    return { nextDeviceId: targetDevice.id, delay: 100 }
  }

  // 如果没有直接连接，查找下一跳
  const path = findPath(devices, connections, device.id, packet.targetId)
  if (path.length > 1) {
    return { nextDeviceId: path[1], delay: 150 }
  }

  return { nextDeviceId: null, delay: 0, error: '找不到到目标设备的路径' }
}

// 网桥处理数据包
const processBridgePacket = (packet: Packet, device: Device, devices: Device[], connections: Connection[]): ProcessResult => {
  // 网桥连接不同网段，需要检查目标设备是否在另一端
  const deviceConnections = findDeviceConnections(connections, device.id)
  for (const conn of deviceConnections) {
    const nextDeviceId = conn.sourceId === device.id ? conn.targetId : conn.sourceId
    const path = findPath(devices, connections, nextDeviceId, packet.targetId)
    if (path.length > 0) {
      return { nextDeviceId, delay: 150 }
    }
  }

  return { nextDeviceId: null, delay: 0, error: '找不到到目标设备的路径' }
}

// 集线器处理数据包
const processHubPacket = (packet: Packet, device: Device, devices: Device[], connections: Connection[]): ProcessResult => {
  // 集线器广播数据包到所有连接的设备（除了源设备）
  const deviceConnections = findDeviceConnections(connections, device.id)
  const nextDevices = deviceConnections.map((conn) => (conn.sourceId === device.id ? conn.targetId : conn.sourceId)).filter((id) => id !== packet.currentDeviceId)

  if (nextDevices.includes(packet.targetId)) {
    return { nextDeviceId: packet.targetId, delay: 50 }
  }

  // 如果目标设备不在直接连接中，选择第一个设备转发
  return nextDevices.length > 0 ? { nextDeviceId: nextDevices[0], delay: 50 } : { nextDeviceId: null, delay: 0, error: '找不到下一跳设备' }
}

// 网关处理数据包
const processGatewayPacket = (packet: Packet, device: Device, devices: Device[], connections: Connection[]): ProcessResult => {
  // 网关连接不同类型的网络，可能需要进行协议转换
  const path = findPath(devices, connections, device.id, packet.targetId)
  if (path.length > 1) {
    return { nextDeviceId: path[1], delay: 300 } // 协议转换需要更多时间
  }

  return { nextDeviceId: null, delay: 0, error: '找不到到目标设备的路径' }
}

// 计算机处理数据包
const processComputerPacket = (packet: Packet, device: Device): ProcessResult => {
  // 计算机是终端设备，只能接收或发送数据包
  if (device.id === packet.targetId) {
    return { nextDeviceId: null, delay: 50 }
  }

  return { nextDeviceId: null, delay: 0, error: '计算机不能转发数据包' }
}

// 计算两点之间的位置
export const calculatePacketPosition = (sourcePos: { x: number; y: number }, targetPos: { x: number; y: number }, progress: number): { x: number; y: number } => {
  return {
    x: sourcePos.x + (targetPos.x - sourcePos.x) * progress,
    y: sourcePos.y + (targetPos.y - sourcePos.y) * progress,
  }
}
