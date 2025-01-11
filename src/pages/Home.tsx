import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100 flex flex-col items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-primary-800 mb-4">网络设备大冒险</h1>
        <p className="text-lg md:text-xl text-primary-600 mb-8">通过游戏学习网络硬件知识</p>
        <div className="space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-primary-600 transition-colors"
            onClick={() => navigate('/game')}
          >
            开始游戏
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-primary-500 px-6 py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/devices')}
          >
            设备图鉴
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default Home
