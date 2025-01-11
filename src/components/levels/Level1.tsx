import type { LevelConfig } from '../../types/level'
import LevelScene from '../LevelScene'
import TaskCard from '../TaskCard'

interface Level1Props {
  level: LevelConfig
  onComplete: () => void
  onExit: () => void
}

const level1Hints = [
  '交换机是一种网络设备，可以让多台计算机互相通信',
  '点击计算机，然后点击交换机来创建连接',
  '选择一台计算机，点击发送按钮，选择目标计算机来发送数据包',
  '交换机会记住每台计算机的位置，并准确地转发数据包',
]

const Level1 = ({ level, onComplete, onExit }: Level1Props) => {
  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900">
      <LevelScene level={level} onComplete={onComplete} onExit={onExit} />
      <TaskCard title={level.name} objectives={level.objectives} hints={level1Hints} />
    </div>
  )
}

export default Level1
