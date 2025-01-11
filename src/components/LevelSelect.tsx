import { motion } from 'framer-motion'
import type { LevelConfig, LevelProgress } from '../types/level'
import { levels } from '../data/levels'

interface LevelSelectProps {
  progress: LevelProgress
  onLevelSelect: (level: LevelConfig) => void
}

const LevelSelect = ({ progress, onLevelSelect }: LevelSelectProps) => {
  const getDifficultyColor = (difficulty: LevelConfig['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'hard':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 to-primary-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-800 mb-8 text-center">网络设备大冒险</h1>

        {/* 进度概览 */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-primary-700">总进度</p>
              <p className="text-sm text-primary-600">已获得 {progress.totalStars} 颗星</p>
            </div>
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((star) => (
                <motion.span
                  key={star}
                  className={`text-2xl ${progress.totalStars >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: star * 0.1 }}
                >
                  ⭐
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        {/* 关卡列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {levels.map((level) => {
            const isUnlocked = progress.unlockedLevels.includes(level.id)
            const isCompleted = progress.completedLevels[level.id]?.isCompleted
            const stars = progress.completedLevels[level.id]?.stars || 0

            return (
              <motion.div
                key={level.id}
                className={`
                  relative bg-white rounded-lg shadow-lg overflow-hidden
                  ${isUnlocked ? 'cursor-pointer hover:shadow-xl' : 'opacity-75 cursor-not-allowed'}
                  transition-all duration-200
                `}
                whileHover={isUnlocked ? { scale: 1.02 } : {}}
                onClick={() => isUnlocked && onLevelSelect(level)}
              >
                {/* 难度标签 */}
                <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs text-white ${getDifficultyColor(level.difficulty)}`}>{level.difficulty.toUpperCase()}</div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary-800 mb-2">{level.name}</h3>
                  <p className="text-sm text-primary-600 mb-4">{level.description}</p>

                  {/* 目标列表 */}
                  <div className="space-y-2 mb-4">
                    {level.objectives.map((objective, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <span className="w-4 h-4 rounded-full bg-primary-100 flex items-center justify-center mr-2">{isCompleted ? '✓' : index + 1}</span>
                        {objective.description}
                      </div>
                    ))}
                  </div>

                  {/* 星级和状态 */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3].map((star) => (
                        <motion.span
                          key={star}
                          className={`text-xl ${stars >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: star * 0.1 }}
                        >
                          ⭐
                        </motion.span>
                      ))}
                    </div>
                    {!isUnlocked && (
                      <div className="flex items-center text-gray-500">
                        <span className="mr-2">🔒</span>
                        需要 {level.minScore} 分解锁
                      </div>
                    )}
                  </div>
                </div>

                {/* 完成标记 */}
                {isCompleted && <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default LevelSelect
