import { useState } from 'react'
import { motion } from 'framer-motion'
import type { LevelConfig } from '../types/level'
import { useLevelProgressStore } from '../stores/levelProgressStore'
import LevelSelect from '../components/LevelSelect'
import TutorialLevel from '../components/levels/TutorialLevel'
import Level1 from '../components/levels/Level1'
import LevelScene from '../components/LevelScene'

const Game = () => {
  const { progress, initializeProgress } = useLevelProgressStore()
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig | null>(null)
  const [showLevelSelect, setShowLevelSelect] = useState(true)

  // 处理关卡选择
  const handleLevelSelect = (level: LevelConfig) => {
    setSelectedLevel(level)
    setShowLevelSelect(false)
  }

  // 处理关卡完成
  const handleLevelComplete = () => {
    setShowLevelSelect(true)
    setSelectedLevel(null)
  }

  // 处理退出关卡
  const handleLevelExit = () => {
    setShowLevelSelect(true)
    setSelectedLevel(null)
  }

  // 重置游戏进度
  const handleReset = () => {
    initializeProgress()
    setSelectedLevel(null)
    setShowLevelSelect(true)
  }

  // 渲染关卡
  const renderLevel = () => {
    if (!selectedLevel) return null

    switch (selectedLevel.id) {
      case 'tutorial':
        return <TutorialLevel level={selectedLevel} onComplete={handleLevelComplete} onExit={handleLevelExit} />
      case 'level-1':
        return <Level1 level={selectedLevel} onComplete={handleLevelComplete} onExit={handleLevelExit} />
      default:
        return <LevelScene level={selectedLevel} onComplete={handleLevelComplete} onExit={handleLevelExit} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100">
      {/* 顶部工具栏 */}
      <div className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-800">网络设备大冒险</h1>
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-white text-primary-500 border border-primary-500 rounded-lg hover:bg-primary-50 transition-colors" onClick={handleReset}>
              重置进度
            </button>
          </div>
        </div>
      </div>

      {/* 游戏内容区域 */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="container mx-auto p-4">
        {showLevelSelect ? <LevelSelect progress={progress} onLevelSelect={handleLevelSelect} /> : renderLevel()}
      </motion.div>
    </div>
  )
}

export default Game
