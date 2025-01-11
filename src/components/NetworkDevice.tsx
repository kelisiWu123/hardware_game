import { motion } from 'framer-motion'
import type { Device, Position } from '../types/device'
import { useRef, useState } from 'react'

interface NetworkDeviceProps {
  device: Device
  isSelected?: boolean
  isConnecting?: boolean
  canConnect?: boolean
  onClick?: () => void
  onDragEnd?: (position: Position) => void
  onConnect?: () => void
  onSendPacket?: (targetId: string) => void
}

const NetworkDevice = ({ device, isSelected = false, isConnecting = false, canConnect = false, onClick, onDragEnd, onConnect, onSendPacket }: NetworkDeviceProps) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  // 获取设备图标
  const getDeviceIcon = () => {
    switch (device.type) {
      case 'router':
        return '🌐'
      case 'switch':
        return '🔄'
      case 'bridge':
        return '🌉'
      case 'hub':
        return '⭐'
      case 'gateway':
        return '🚪'
      case 'computer':
        return '💻'
      default:
        return '📱'
    }
  }

  // 获取设备等级（基于连接数）
  const getDeviceLevel = () => {
    const ratio = device.connections.length / device.ports
    if (ratio >= 0.8) return 'Master'
    if (ratio >= 0.5) return 'Pro'
    if (ratio >= 0.3) return 'Advanced'
    return 'Beginner'
  }

  const handleDragEnd = () => {
    if (!elementRef.current || !onDragEnd) return

    const element = elementRef.current
    const rect = element.getBoundingClientRect()
    const parentRect = element.parentElement?.getBoundingClientRect()

    if (!parentRect) return

    onDragEnd({
      x: rect.left - parentRect.left,
      y: rect.top - parentRect.top,
    })
  }

  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey && onConnect) {
      onConnect()
    } else if (e.altKey && onSendPacket && device.connections.length > 0) {
      const targetId = device.connections[Math.floor(Math.random() * device.connections.length)]

      // 添加点击反馈动画
      const element = e.currentTarget as HTMLElement
      element.classList.add('animate-ping')
      setTimeout(() => {
        element.classList.remove('animate-ping')
      }, 200)

      onSendPacket(targetId)
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <motion.div
      ref={elementRef}
      className={`
        absolute p-4 rounded-xl shadow-lg cursor-pointer
        backdrop-blur-sm
        transition-all duration-200 ease-in-out
        ${isSelected ? 'bg-primary-100/90 ring-2 ring-primary-500 shadow-primary-200/50' : 'bg-white/90 hover:bg-primary-50/90'}
        ${isConnecting ? 'ring-2 ring-green-500 shadow-green-200/50' : ''}
        ${canConnect ? 'ring-2 ring-green-300 ring-dashed shadow-green-200/50' : ''}
        ${isHovered ? 'shadow-xl scale-105' : ''}
      `}
      style={{
        left: device.position.x,
        top: device.position.y,
        width: '128px',
        height: '128px',
        touchAction: 'none',
      }}
      onHoverStart={() => {
        setIsHovered(true)
        setShowTooltip(true)
      }}
      onHoverEnd={() => {
        setIsHovered(false)
        setShowTooltip(false)
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={handleDragEnd}
    >
      {/* 设备图标和状态 */}
      <div className="text-center">
        <motion.div
          className={`
            w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center
            transition-colors duration-200 relative
            ${isConnecting ? 'bg-green-200/80' : 'bg-primary-200/80'}
            ${canConnect ? 'bg-green-100/80 animate-pulse' : ''}
          `}
          whileHover={{ scale: 1.1, rotate: 360 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-2xl">{getDeviceIcon()}</span>
          {/* 等级标志 */}
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-yellow-800 shadow-lg transform rotate-12">
            {device.connections.length}
          </div>
        </motion.div>
        <p className="text-sm font-medium text-primary-800">{device.name}</p>
        <p className="text-xs text-primary-600">Level: {getDeviceLevel()}</p>
        <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-primary-500 rounded-full h-1.5 transition-all duration-300" style={{ width: `${(device.connections.length / device.ports) * 100}%` }} />
        </div>
      </div>

      {/* 交互提示 */}
      {(isConnecting || canConnect || device.connections.length > 0) && (
        <motion.div className="absolute -bottom-8 left-0 right-0 flex flex-col items-center gap-1" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          {(isConnecting || canConnect) && (
            <div className="px-2 py-1 rounded-full bg-green-500 text-white text-xs shadow-lg backdrop-blur-sm">{isConnecting ? '选择要连接的设备' : '按住 Shift 点击连接'}</div>
          )}
          {device.connections.length > 0 && <div className="px-2 py-1 rounded-full bg-blue-500 text-white text-xs shadow-lg backdrop-blur-sm">按住 Alt 点击发送数据包</div>}
        </motion.div>
      )}

      {/* 详细信息提示框 */}
      {showTooltip && (
        <motion.div
          className="absolute -top-24 left-1/2 transform -translate-x-1/2 bg-black/75 text-white p-2 rounded-lg text-xs backdrop-blur-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <p className="font-medium">{device.description}</p>
          <p className="mt-1">
            连接数: {device.connections.length}/{device.ports}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default NetworkDevice
