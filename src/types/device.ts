export type DeviceType = 'router' | 'switch' | 'bridge' | 'hub' | 'gateway' | 'computer'

export interface Position {
  x: number
  y: number
}

export interface Device {
  id: string
  type: DeviceType
  name: string
  position: Position
  description: string
  ports: number
  connections: string[] // 连接的设备ID数组
}

export interface Connection {
  id: string
  sourceId: string
  targetId: string
  status: 'active' | 'inactive'
}
