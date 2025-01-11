import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LevelProgress, LevelState } from '../types/level'
import { levels, calculateScore, calculateStars } from '../data/levels'

interface LevelProgressStore {
  progress: LevelProgress
  initializeProgress: () => void
  updateLevelProgress: (levelId: string, completionTime: number, successfulConnections: number, totalConnections: number, successfulPackets: number, totalPackets: number, devicesUsed: number) => void
  unlockLevel: (levelId: string) => void
}

const initialProgress: LevelProgress = {
  currentLevel: 'level-1',
  completedLevels: {},
  totalStars: 0,
  unlockedLevels: ['level-1'],
}

export const useLevelProgressStore = create<LevelProgressStore>()(
  persist(
    (set) => ({
      progress: initialProgress,

      initializeProgress: () => {
        set({ progress: initialProgress })
      },

      updateLevelProgress: (levelId, completionTime, successfulConnections, totalConnections, successfulPackets, totalPackets, devicesUsed) => {
        const level = levels.find((l) => l.id === levelId)
        if (!level) return

        const score = calculateScore(level, completionTime, successfulConnections, totalConnections, successfulPackets, totalPackets, devicesUsed)

        const stars = calculateStars(score)

        set((state) => {
          const newCompletedLevels = {
            ...state.progress.completedLevels,
            [levelId]: {
              id: levelId,
              isCompleted: true,
              highScore: Math.max(score, state.progress.completedLevels[levelId]?.highScore || 0),
              stars,
              completionTime,
              unlockedDevices: level.requiredDevices.map((d) => d.type),
            } as LevelState,
          }

          // 计算总星数
          const totalStars = Object.values(newCompletedLevels).reduce((sum, level) => sum + level.stars, 0)

          // 解锁下一关
          const currentLevelIndex = levels.findIndex((l) => l.id === levelId)
          const nextLevel = levels[currentLevelIndex + 1]
          const unlockedLevels = [...state.progress.unlockedLevels]
          if (nextLevel && score >= level.minScore && !unlockedLevels.includes(nextLevel.id)) {
            unlockedLevels.push(nextLevel.id)
          }

          return {
            progress: {
              ...state.progress,
              completedLevels: newCompletedLevels,
              totalStars,
              unlockedLevels,
              currentLevel: nextLevel?.id || levelId,
            },
          }
        })
      },

      unlockLevel: (levelId) => {
        set((state) => ({
          progress: {
            ...state.progress,
            unlockedLevels: [...new Set([...state.progress.unlockedLevels, levelId])],
          },
        }))
      },
    }),
    {
      name: 'level-progress',
    }
  )
)
