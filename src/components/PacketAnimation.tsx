import { motion } from 'framer-motion'

interface Point {
  x: number
  y: number
}

interface PacketAnimationProps {
  start: Point
  end: Point
  onComplete?: () => void
  color?: string
  size?: number
  duration?: number
}

const PacketAnimation = ({ start, end, color = '#3B82F6', size = 12, duration = 1, onComplete }: PacketAnimationProps) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: size * 2,
        height: size * 2,
      }}
      initial={{
        x: start.x - size,
        y: start.y - size,
        scale: 0,
        opacity: 0,
      }}
      animate={{
        x: end.x - size,
        y: end.y - size,
        scale: 1,
        opacity: 1,
      }}
      exit={{
        scale: 0,
        opacity: 0,
      }}
      transition={{
        duration,
        ease: 'easeInOut',
      }}
      onAnimationComplete={onComplete}
    >
      {/* 核心圆点 */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          left: size / 2,
          top: size / 2,
          backgroundColor: color,
          boxShadow: `0 0 20px ${color}, 0 0 60px ${color}`,
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
        }}
      />

      {/* 外环 */}
      <motion.div
        className="absolute rounded-full border-2"
        style={{
          width: size * 2,
          height: size * 2,
          borderColor: color,
          opacity: 0.6,
        }}
        animate={{
          scale: [1, 1.5],
          opacity: [0.6, 0],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
        }}
      />

      {/* 尾迹效果 */}
      <motion.div
        className="absolute"
        style={{
          width: size * 3,
          height: 2,
          backgroundColor: color,
          left: -size,
          top: size - 1,
          filter: 'blur(4px)',
          transformOrigin: '100% 50%',
        }}
        animate={{
          scaleX: [1, 0],
          opacity: [0.8, 0],
        }}
        transition={{
          duration: 0.2,
          repeat: Infinity,
        }}
      />

      {/* 粒子效果 */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 4,
            height: 4,
            backgroundColor: color,
            left: size - 2,
            top: size - 2,
          }}
          animate={{
            x: [-20, 20],
            y: [-20, 20],
            opacity: [1, 0],
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      ))}
    </motion.div>
  )
}

export default PacketAnimation
