import type { DeviceType } from '../types/device'

interface DeviceTemplate {
  type: DeviceType
  name: string
  description: string
  ports: number
  icon?: string
}

export const deviceTemplates: Record<DeviceType, DeviceTemplate> = {
  router: {
    type: 'router',
    name: '路由器',
    description: '负责不同网络之间的数据包转发',
    ports: 4,
  },
  switch: {
    type: 'switch',
    name: '交换机',
    description: '在局域网内转发数据包',
    ports: 8,
  },
  bridge: {
    type: 'bridge',
    name: '网桥',
    description: '连接并转发不同网段',
    ports: 2,
  },
  hub: {
    type: 'hub',
    name: '集线器',
    description: '在连接的设备间广播数据',
    ports: 4,
  },
  gateway: {
    type: 'gateway',
    name: '网关',
    description: '连接不同网络并进行协议转换',
    ports: 2,
  },
  computer: {
    type: 'computer',
    name: '计算机',
    description: '网络终端设备',
    ports: 1,
  },
}
