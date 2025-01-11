import { motion } from 'framer-motion'
import type { Packet } from '../types/packet'

interface PacketAnimationProps {
  packet: Packet
}

const PacketAnimation = ({ packet }: PacketAnimationProps) => {
  const getStatusColor = () => {
    switch (packet.status) {
      case 'transmitting':
        return 'bg-blue-500'
      case 'received':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: packet.position.x,
        top: packet.position.y,
        width: '16px',
        height: '16px',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* 主数据包 */}
      <motion.div
        className={`
          w-full h-full rounded-full
          ${getStatusColor()}
          shadow-lg
        `}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.8, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 轨迹效果 */}
      <motion.div
        className={`
          absolute top-0 left-0 w-full h-full rounded-full
          ${getStatusColor()}
          opacity-50
        `}
        initial={{ scale: 1 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
        }}
      />

      {/* 发光效果 */}
      <motion.div
        className={`
          absolute top-0 left-0 w-full h-full rounded-full
          ${getStatusColor()}
          filter blur-sm
        `}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0.2, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 状态指示器 */}
      {packet.status === 'error' && (
        <motion.div
          className="absolute -top-4 -right-4 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        >
          !
        </motion.div>
      )}
    </motion.div>
  )
}

export default PacketAnimation
