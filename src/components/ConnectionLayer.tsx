import { motion } from 'framer-motion'
import type { Connection, Device } from '../types/device'

interface ConnectionLayerProps {
  connections: Connection[]
  devices: Device[]
  onConnectionClick?: (connection: Connection) => void
}

const ConnectionLayer = ({ connections = [], devices = [], onConnectionClick }: ConnectionLayerProps) => {
  // 获取设备位置
  const getDevicePosition = (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId)
    if (!device) return { x: 0, y: 0 }
    return {
      x: device.position.x + 64, // 设备中心点
      y: device.position.y + 64,
    }
  }

  return (
    <svg className="absolute inset-0 pointer-events-none">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" className="fill-primary-500">
          <polygon points="0 0, 10 3.5, 0 7" />
        </marker>
      </defs>
      {connections.map((connection) => {
        const source = getDevicePosition(connection.sourceId)
        const target = getDevicePosition(connection.targetId)

        // 计算连接线的路径
        const dx = target.x - source.x
        const dy = target.y - source.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // 如果设备重叠，不绘制连接线
        if (distance < 10) return null

        // 计算控制点，创建平滑的曲线
        const midX = (source.x + target.x) / 2
        const midY = (source.y + target.y) / 2
        const curvature = 0.2 // 曲线的弯曲程度
        const controlX = midX - dy * curvature
        const controlY = midY + dx * curvature

        return (
          <g key={connection.id}>
            {/* 连接线 */}
            <motion.path
              d={`M ${source.x} ${source.y} Q ${controlX} ${controlY} ${target.x} ${target.y}`}
              className="stroke-primary-500"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
              markerEnd="url(#arrowhead)"
              onClick={() => onConnectionClick?.(connection)}
              style={{ pointerEvents: 'stroke' }}
            />

            {/* 连接点 */}
            <motion.circle cx={source.x} cy={source.y} r="4" className="fill-primary-500" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} />
            <motion.circle cx={target.x} cy={target.y} r="4" className="fill-primary-500" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} />

            {/* 连接状态指示器 */}
            <motion.text
              x={midX}
              y={midY}
              className="text-xl fill-primary-500"
              textAnchor="middle"
              dominantBaseline="middle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              ⚡
            </motion.text>
          </g>
        )
      })}
    </svg>
  )
}

export default ConnectionLayer
