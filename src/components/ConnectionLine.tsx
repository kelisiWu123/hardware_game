import { motion } from 'framer-motion'
import type { Connection } from '../types/device'

interface ConnectionLineProps {
  connection: Connection
  sourcePosition: { x: number; y: number }
  targetPosition: { x: number; y: number }
  onClick?: () => void
}

const ConnectionLine = ({ connection, sourcePosition, targetPosition, onClick }: ConnectionLineProps) => {
  // 计算连线的起点和终点（考虑设备的中心点）
  const DEVICE_CENTER = 64 // 设备尺寸的一半
  const start = {
    x: sourcePosition.x + DEVICE_CENTER,
    y: sourcePosition.y + DEVICE_CENTER,
  }
  const end = {
    x: targetPosition.x + DEVICE_CENTER,
    y: targetPosition.y + DEVICE_CENTER,
  }

  // 计算控制点，使连线呈现优美的曲线
  const midX = (start.x + end.x) / 2
  const midY = (start.y + end.y) / 2
  const dx = end.x - start.x
  const dy = end.y - start.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  const curvature = Math.min(0.2, 50 / distance) // 根据距离动态调整曲率

  // 计算垂直于连线的方向
  const perpX = -dy / distance
  const perpY = dx / distance

  // 计算控制点
  const controlPoint = {
    x: midX + perpX * distance * curvature,
    y: midY + perpY * distance * curvature,
  }

  // 计算连线的路径（使用二次贝塞尔曲线）
  const path = `M ${start.x} ${start.y} Q ${controlPoint.x} ${controlPoint.y} ${end.x} ${end.y}`

  return (
    <g>
      {/* 发光效果底层 */}
      <motion.path
        d={path}
        stroke={connection.status === 'active' ? '#0ea5e9' : '#94a3b8'}
        strokeWidth={6}
        strokeOpacity={0.2}
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        exit={{ pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />

      {/* 主连接线 */}
      <motion.path
        d={path}
        stroke={connection.status === 'active' ? '#0ea5e9' : '#94a3b8'}
        strokeWidth={2}
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        exit={{ pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="cursor-pointer"
        onClick={onClick}
        whileHover={{ strokeWidth: 3 }}
      />

      {/* 流动动画效果 */}
      <circle r="3" fill="#0ea5e9">
        <animateMotion dur="2s" repeatCount="indefinite" path={path} />
      </circle>

      {/* 连接线端点 */}
      <motion.circle cx={start.x} cy={start.y} r="3" fill="#0ea5e9" initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.5 }} />
      <motion.circle cx={end.x} cy={end.y} r="3" fill="#0ea5e9" initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.5 }} />

      {/* 连接状态指示器 */}
      <motion.text x={controlPoint.x} y={controlPoint.y - 10} textAnchor="middle" fill="#0ea5e9" fontSize="12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        ⚡
      </motion.text>
    </g>
  )
}

export default ConnectionLine
