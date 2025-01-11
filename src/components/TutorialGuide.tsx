import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TutorialStep {
  id: string
  title: string
  content: string
  position?: 'top' | 'right' | 'bottom' | 'left'
  targetElement?: string
}

interface TutorialGuideProps {
  steps: TutorialStep[]
  onComplete: () => void
  isVisible: boolean
}

const TutorialGuide = ({ steps, onComplete, isVisible }: TutorialGuideProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isShowing, setIsShowing] = useState(isVisible)

  useEffect(() => {
    setIsShowing(isVisible)
  }, [isVisible])

  const currentStep = steps[currentStepIndex]

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      setIsShowing(false)
      onComplete()
    }
  }

  const getPositionClasses = (position: string = 'bottom') => {
    switch (position) {
      case 'top':
        return 'bottom-full mb-2'
      case 'right':
        return 'left-full ml-2'
      case 'bottom':
        return 'top-full mt-2'
      case 'left':
        return 'right-full mr-2'
      default:
        return 'top-full mt-2'
    }
  }

  if (!isShowing || !currentStep) return null

  return (
    <AnimatePresence>
      <motion.div
        key={currentStep.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed z-50 ${currentStep.targetElement ? 'absolute' : 'bottom-8 left-1/2 transform -translate-x-1/2'}`}
      >
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-primary-800">{currentStep.title}</h3>
            <span className="text-sm text-primary-600">
              {currentStepIndex + 1} / {steps.length}
            </span>
          </div>

          <p className="text-primary-700 mb-6">{currentStep.content}</p>

          <div className="flex justify-between items-center">
            <button
              className="px-4 py-2 text-primary-600 hover:text-primary-800 transition-colors"
              onClick={() => {
                setIsShowing(false)
                onComplete()
              }}
            >
              跳过教程
            </button>
            <button className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors" onClick={handleNext}>
              {currentStepIndex === steps.length - 1 ? '完成' : '下一步'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TutorialGuide
