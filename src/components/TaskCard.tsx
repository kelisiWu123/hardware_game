import { motion } from 'framer-motion'
import type { LevelObjective } from '../types/level'
import { CheckCircle2, Circle } from 'lucide-react'

interface TaskCardProps {
  title: string
  objectives: LevelObjective[]
  hints: string[]
}

const TaskCard = ({ title, objectives, hints }: TaskCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed right-6 top-1/2 -translate-y-1/2 w-80 max-h-[calc(100vh-4rem)] flex flex-col bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
    >
      {/* Header */}
      <div className="shrink-0 px-5 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
        <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{title}</h3>
      </div>

      {/* Objectives */}
      <div className="shrink-0 px-5 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">任务目标</h4>
        <ul className="space-y-2.5">
          {objectives.map((objective, index) => {
            const isCompleted = objective.current >= objective.required
            return (
              <motion.li key={index} initial={false} animate={{ scale: isCompleted ? [1.05, 1] : 1 }} className="flex items-start gap-2.5 group">
                <div className="mt-0.5 text-blue-500 dark:text-blue-400">{isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}</div>
                <div>
                  <p className={`text-sm ${isCompleted ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>{objective.description}</p>
                  {!isCompleted && objective.required > 1 && (
                    <div className="mt-1">
                      <div className="w-28 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-300" style={{ width: `${(objective.current / objective.required) * 100}%` }} />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {objective.current} / {objective.required}
                      </p>
                    </div>
                  )}
                </div>
              </motion.li>
            )
          })}
        </ul>
      </div>

      {/* Hints */}
      <div className="grow px-5 py-3 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 sticky top-0 bg-white/95 dark:bg-gray-900/95 py-1">提示</h4>
        <ul className="space-y-2">
          {hints.map((hint, index) => (
            <li key={index} className="text-sm text-gray-600 dark:text-gray-300 pl-3 border-l-2 border-blue-500/30 hover:border-blue-500 transition-colors duration-200">
              {hint}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

export default TaskCard
