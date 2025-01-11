import { useState, useEffect } from 'react'
import type { LevelConfig } from '../../types/level'
import type { Device, Connection } from '../../types/device'
import LevelScene from '../LevelScene'
import TutorialGuide from '../TutorialGuide'

interface TutorialLevelProps {
  level: LevelConfig
  onComplete: () => void
  onExit: () => void
}

const tutorialSteps = [
  {
    id: 'welcome',
    title: '欢迎来到网络世界',
    content: '在这里，你将学习如何连接网络设备并传输数据。让我们开始吧！',
  },
  {
    id: 'computer-intro',
    title: '认识计算机',
    content: '这是两台计算机。计算机是网络中最基本的设备，可以发送和接收数据。',
    targetElement: 'computer-1',
  },
  {
    id: 'connection',
    title: '建立连接',
    content: '要让计算机之间通信，首先需要建立连接。点击一台计算机，然后点击另一台计算机来创建连接。',
  },
  {
    id: 'send-packet',
    title: '发送数据包',
    content: '太好了！现在计算机已经连接好了。选择一台计算机，点击发送按钮向另一台计算机发送数据包。',
  },
]

const TutorialLevel = ({ level, onComplete, onExit }: TutorialLevelProps) => {
  const [showTutorial, setShowTutorial] = useState(true)
  const [devices, setDevices] = useState<Device[]>(level.initialDevices || [])
  const [connections, setConnections] = useState<Connection[]>([])

  // 监听目标完成情况
  useEffect(() => {
    const hasConnection = connections.length > 0
    const hasPacketSent = false // TODO: 实现数据包发送检测

    if (hasConnection && hasPacketSent) {
      onComplete()
    }
  }, [connections])

  const handleTutorialComplete = () => {
    setShowTutorial(false)
  }

  return (
    <div className="relative">
      <LevelScene level={level} onComplete={onComplete} onExit={onExit} />

      <TutorialGuide steps={tutorialSteps} onComplete={handleTutorialComplete} isVisible={showTutorial} />
    </div>
  )
}

export default TutorialLevel
