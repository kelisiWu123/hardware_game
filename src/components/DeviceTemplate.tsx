import { motion } from 'framer-motion'
import type { DeviceType } from '../types/device'
import { deviceTemplates } from '../data/deviceTemplates'

interface DeviceTemplateProps {
  type: DeviceType
}

const DeviceTemplate = ({ type }: DeviceTemplateProps) => {
  const template = deviceTemplates[type]

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('deviceType', type)
  }

  return (
    <motion.div
      draggable
      onDragStart={handleDragStart}
      className="p-3 bg-primary-50 rounded-lg cursor-move hover:bg-primary-100 transition-colors"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-primary-200 rounded-full flex items-center justify-center">
          <span className="text-primary-700 capitalize">{type.charAt(0)}</span>
        </div>
        <div>
          <p className="text-primary-700 font-medium">{template.name}</p>
          <p className="text-xs text-primary-500">端口: {template.ports}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default DeviceTemplate
