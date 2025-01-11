import type { Device, Connection, Position } from '../types/device'

interface ForceNode extends Device {
  vx: number // x方向速度
  vy: number // y方向速度
  fx: number | null // 固定x位置（如果需要）
  fy: number | null // 固定y位置（如果需要）
}

interface LayoutOptions {
  width: number
  height: number
  deviceSize: number
  padding: number
  springLength: number // 弹簧理想长度
  springStrength: number // 弹簧强度
  repulsionStrength: number // 排斥力强度
  damping: number // 阻尼系数
  iterations: number // 迭代次数
}

const defaultOptions: LayoutOptions = {
  width: 800,
  height: 600,
  deviceSize: 128,
  padding: 50,
  springLength: 200,
  springStrength: 0.1,
  repulsionStrength: 8000,
  damping: 0.5,
  iterations: 50,
}

// 计算两点之间的距离
const distance = (a: Position, b: Position): number => {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

// 应用弹簧力（连接的节点之间的吸引力）
const applySpringForce = (node: ForceNode, other: ForceNode, options: LayoutOptions) => {
  const dx = other.position.x - node.position.x
  const dy = other.position.y - node.position.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist === 0) return

  // 计算弹簧力
  const force = options.springStrength * (dist - options.springLength)
  const fx = (force * dx) / dist
  const fy = (force * dy) / dist

  // 更新节点速度
  node.vx += fx
  node.vy += fy
  other.vx -= fx
  other.vy -= fy
}

// 应用排斥力（节点之间的排斥）
const applyRepulsionForce = (node: ForceNode, other: ForceNode, options: LayoutOptions) => {
  const dx = other.position.x - node.position.x
  const dy = other.position.y - node.position.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist === 0) return

  // 计算排斥力
  const force = options.repulsionStrength / (dist * dist)
  const fx = (force * dx) / dist
  const fy = (force * dy) / dist

  // 更新节点速度
  node.vx -= fx
  node.vy -= fy
  other.vx += fx
  other.vy += fy
}

// 确保节点在边界内
const constrainToBounds = (node: ForceNode, options: LayoutOptions) => {
  const minX = options.padding
  const maxX = options.width - options.deviceSize - options.padding
  const minY = options.padding
  const maxY = options.height - options.deviceSize - options.padding

  if (node.position.x < minX) node.position.x = minX
  if (node.position.x > maxX) node.position.x = maxX
  if (node.position.y < minY) node.position.y = minY
  if (node.position.y > maxY) node.position.y = maxY
}

export const autoLayout = (devices: Device[], connections: Connection[], canvasWidth: number, canvasHeight: number, customOptions: Partial<LayoutOptions> = {}): Device[] => {
  const options: LayoutOptions = {
    ...defaultOptions,
    width: canvasWidth,
    height: canvasHeight,
    ...customOptions,
  }

  // 创建力导向节点
  const nodes: ForceNode[] = devices.map((device) => ({
    ...device,
    vx: 0,
    vy: 0,
    fx: null,
    fy: null,
  }))

  // 主循环
  for (let i = 0; i < options.iterations; i++) {
    // 应用排斥力
    for (let j = 0; j < nodes.length; j++) {
      for (let k = j + 1; k < nodes.length; k++) {
        applyRepulsionForce(nodes[j], nodes[k], options)
      }
    }

    // 应用弹簧力（连接的节点之间）
    for (const connection of connections) {
      const source = nodes.find((n) => n.id === connection.sourceId)
      const target = nodes.find((n) => n.id === connection.targetId)
      if (source && target) {
        applySpringForce(source, target, options)
      }
    }

    // 更新位置
    for (const node of nodes) {
      if (node.fx !== null && node.fy !== null) continue // 跳过固定节点

      // 应用阻尼
      node.vx *= options.damping
      node.vy *= options.damping

      // 更新位置
      node.position.x += node.vx
      node.position.y += node.vy

      // 确保在边界内
      constrainToBounds(node, options)
    }
  }

  // 返回更新后的设备列表
  return nodes.map((node) => ({
    ...node,
    position: {
      x: Math.round(node.position.x),
      y: Math.round(node.position.y),
    },
  }))
}

// 计算布局质量分数（可用于评估布局效果）
export const calculateLayoutScore = (devices: Device[], connections: Connection[]): number => {
  let score = 0

  // 检查连接的设备之间的距离
  for (const connection of connections) {
    const source = devices.find((d) => d.id === connection.sourceId)
    const target = devices.find((d) => d.id === connection.targetId)
    if (source && target) {
      score -= distance(source.position, target.position)
    }
  }

  // 检查设备之间的重叠
  for (let i = 0; i < devices.length; i++) {
    for (let j = i + 1; j < devices.length; j++) {
      const dist = distance(devices[i].position, devices[j].position)
      if (dist < 100) {
        score -= (100 - dist) * 2
      }
    }
  }

  return score
}
