import { motion, AnimatePresence } from 'framer-motion'
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
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('top')

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

  // 获取设备状态信息
  const getDeviceStatus = () => {
    if (device.connections.length === 0) return { text: '未连接', color: 'text-gray-500' }
    if (device.connections.length === device.ports) return { text: '端口已满', color: 'text-yellow-500' }
    return { text: '运行中', color: 'text-green-500' }
  }

  // 获取设备类型说明
  const getDeviceTypeDescription = () => {
    switch (device.type) {
      case 'router':
        return '路由器 - 负责不同网络间的数据包转发'
      case 'switch':
        return '交换机 - 在局域网内智能转发数据'
      case 'bridge':
        return '网桥 - 连接并转发不同网段'
      case 'hub':
        return '集线器 - 简单的数据广播设备'
      case 'gateway':
        return '网关 - 连接不同类型的网络'
      case 'computer':
        return '计算机 - 网络终端设备'
      default:
        return '未知设备'
    }
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
        absolute p-4 rounded-xl cursor-pointer
        backdrop-blur-sm
        transition-all duration-200 ease-in-out
        ${isSelected ? 'bg-primary-100/90 ring-2 ring-primary-500 shadow-primary-200/50' : 'bg-white/90'}
        ${isConnecting ? 'ring-2 ring-green-500 shadow-green-200/50' : ''}
        ${canConnect ? 'ring-2 ring-green-300 ring-dashed shadow-green-200/50' : ''}
        ${isHovered ? 'shadow-2xl shadow-primary-200/50 scale-105 z-50' : 'shadow-lg z-10'}
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
        if (elementRef.current) {
          const rect = elementRef.current.getBoundingClientRect()
          setTooltipPosition(rect.top < 200 ? 'bottom' : 'top')
        }
      }}
      onHoverEnd={() => {
        setIsHovered(false)
        setShowTooltip(false)
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        duration: 0.2,
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
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
            transition-all duration-200 relative
            ${isConnecting ? 'bg-green-200/80' : 'bg-primary-200/80'}
            ${canConnect ? 'bg-green-100/80 animate-pulse' : ''}
            ${isHovered ? 'shadow-lg shadow-primary-300/50 bg-primary-300/80' : ''}
          `}
          whileHover={{
            scale: 1.05,
            y: -2,
          }}
          whileTap={{
            scale: 0.95,
            y: 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 17,
          }}
        >
          {/* 光晕效果 */}
          {isHovered && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary-400/20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}

          <span className="text-2xl relative z-10">{getDeviceIcon()}</span>

          {/* 等级标志 */}
          <motion.div
            className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-yellow-800 shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            whileHover={{
              scale: 1.1,
              y: -1,
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 17,
            }}
          >
            {device.connections.length}
          </motion.div>
        </motion.div>

        {/* 设备名称和等级 */}
        <motion.div animate={isHovered ? { y: -1 } : { y: 0 }} transition={{ duration: 0.2 }}>
          <p className="text-sm font-medium text-primary-800">{device.name}</p>
          <p className="text-xs text-primary-600">Level: {getDeviceLevel()}</p>
        </motion.div>

        {/* 进度条 */}
        <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="bg-primary-500 h-1.5"
            initial={{ width: 0 }}
            animate={{
              width: `${(device.connections.length / device.ports) * 100}%`,
              backgroundColor: isHovered ? '#3B82F6' : '#60A5FA',
            }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        </div>
      </div>

      {/* 交互提示 */}
      <AnimatePresence>
        {(isConnecting || canConnect || device.connections.length > 0) && (
          <motion.div
            className="absolute -bottom-8 left-0 right-0 flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{
              duration: 0.2,
              ease: 'easeOut',
            }}
          >
            {(isConnecting || canConnect) && (
              <div className="px-2 py-1 rounded-full bg-green-500 text-white text-xs shadow-lg backdrop-blur-sm">{isConnecting ? '选择要连接的设备' : '按住 Shift 点击连接'}</div>
            )}
            {device.connections.length > 0 && <div className="px-2 py-1 rounded-full bg-blue-500 text-white text-xs shadow-lg backdrop-blur-sm">按住 Alt 点击发送数据包</div>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 详细信息提示框 */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className={`absolute ${tooltipPosition === 'top' ? '-top-32' : 'top-32'} left-1/2 transform -translate-x-1/2 bg-black/75 text-white p-3 rounded-xl text-xs backdrop-blur-sm w-64 shadow-xl`}
            initial={{ opacity: 0, y: tooltipPosition === 'top' ? 5 : -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: tooltipPosition === 'top' ? 5 : -5, scale: 0.95 }}
            transition={{
              duration: 0.15,
              ease: 'easeOut',
            }}
          >
            <p className="font-medium mb-2">{getDeviceTypeDescription()}</p>
            <div className="space-y-1">
              <p className="flex justify-between">
                <span>状态:</span>
                <span className={getDeviceStatus().color}>{getDeviceStatus().text}</span>
              </p>
              <p className="flex justify-between">
                <span>连接数:</span>
                <span>
                  {device.connections.length}/{device.ports}
                </span>
              </p>
              <p className="flex justify-between">
                <span>等级:</span>
                <span>{getDeviceLevel()}</span>
              </p>
              {device.description && <p className="mt-2 text-gray-300 border-t border-white/20 pt-2">{device.description}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default NetworkDevice
