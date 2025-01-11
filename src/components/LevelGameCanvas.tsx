import type { Device, Connection } from '../types/device'
import GameCanvas from './GameCanvas'

interface LevelGameCanvasProps {
  devices: Device[]
  onDevicesChange: (newDevices: Device[]) => boolean
  connections: Connection[]
  onConnectionsChange: (newConnections: Connection[]) => void
  onPacketEvent: (event: { type: string }) => void
}

const LevelGameCanvas = ({ devices, onDevicesChange, connections, onConnectionsChange, onPacketEvent }: LevelGameCanvasProps) => {
  return (
    <div className="w-full h-full relative">
      <GameCanvas devices={devices} onDevicesChange={onDevicesChange} connections={connections} onConnectionsChange={onConnectionsChange} onPacketEvent={onPacketEvent} />
    </div>
  )
}

export default LevelGameCanvas
