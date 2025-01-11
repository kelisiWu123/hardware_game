import { useState } from 'react'
import type { Device } from '../types/device'
import DeviceTemplate from '../components/DeviceTemplate'
import GameCanvas from '../components/GameCanvas'

const Game = () => {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [devices, setDevices] = useState<Device[]>([])

  const handleDeviceAdd = (device: Device) => {
    setDevices((prev) => [...prev, device])
  }

  const handleDeviceUpdate = (updatedDevice: Device) => {
    setDevices((prev) => prev.map((device) => (device.id === updatedDevice.id ? updatedDevice : device)))
  }

  const handleDeviceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedDevice) return
    const updatedDevice = { ...selectedDevice, name: e.target.value }
    handleDeviceUpdate(updatedDevice)
    setSelectedDevice(updatedDevice)
  }

  const handleReset = () => {
    setDevices([])
    setSelectedDevice(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100">
      {/* 顶部工具栏 */}
      <div className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-800">网络设备大冒险</h1>
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">保存</button>
            <button className="px-4 py-2 bg-white text-primary-500 border border-primary-500 rounded-lg hover:bg-primary-50 transition-colors" onClick={handleReset}>
              重置
            </button>
          </div>
        </div>
      </div>

      {/* 游戏主区域 */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* 左侧设备面板 */}
        <div className="w-64 bg-white shadow-lg p-4">
          <h2 className="text-lg font-semibold text-primary-800 mb-4">可用设备</h2>
          <div className="space-y-2">
            {['router', 'switch', 'bridge', 'hub', 'gateway', 'computer'].map((type) => (
              <DeviceTemplate key={type} type={type as Device['type']} />
            ))}
          </div>
        </div>

        {/* 中间画布区域 */}
        <div className="flex-1 relative p-4">
          <GameCanvas devices={devices} selectedDevice={selectedDevice} onDeviceSelect={setSelectedDevice} onDeviceAdd={handleDeviceAdd} onDeviceUpdate={handleDeviceUpdate} />
        </div>

        {/* 右侧属性面板 */}
        <div className="w-64 bg-white shadow-lg p-4">
          <h2 className="text-lg font-semibold text-primary-800 mb-4">设备属性</h2>
          {selectedDevice ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">名称</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={selectedDevice.name}
                  onChange={handleDeviceNameChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">类型</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{selectedDevice.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">端口数量</label>
                <p className="mt-1 text-sm text-gray-900">{selectedDevice.ports}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">描述</label>
                <p className="mt-1 text-sm text-gray-900">{selectedDevice.description}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">请选择一个设备查看属性</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Game
