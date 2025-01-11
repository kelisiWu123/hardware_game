export type PacketType = 'data' | 'ack' | 'error'

export interface Packet {
  id: string
  sourceId: string
  targetId: string
  currentDeviceId: string
  nextDeviceId: string | null
  status: 'waiting' | 'transmitting' | 'received' | 'error'
  type: PacketType
  path: string[]
  position: {
    x: number
    y: number
  }
}

export interface ProcessResult {
  nextDeviceId: string | null
  delay: number
  error?: string
}

export type PacketEventType = 'start' | 'hop' | 'receive' | 'error'

export interface PacketEvent {
  type: PacketEventType
  packet: Packet
  timestamp: number
  error?: string
}
