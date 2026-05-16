import { create } from 'zustand'

export interface RobotStatus {
  state: string
  battery_level: number
  current_task: string | null
  location: string | null
  error_message: string | null
  last_updated: string
}

export interface LogEntry {
  id: number
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR'
  message: string
}

interface OrionState {
  backendOnline: boolean
  robotStatus: RobotStatus | null
  logs: LogEntry[]

  setBackendOnline: (online: boolean) => void
  setRobotStatus: (status: RobotStatus) => void
  pushLog: (level: LogEntry['level'], message: string) => void
}

let logId = 1

export const useOrionStore = create<OrionState>((set) => ({
  backendOnline: false,
  robotStatus: null,
  logs: [
    { id: logId++, timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }), level: 'INFO', message: 'Orion frontend initialized' },
  ],

  setBackendOnline: (online) => set({ backendOnline: online }),
  setRobotStatus: (status) => set({ robotStatus: status }),
  pushLog: (level, message) =>
    set((s) => ({
      logs: [
        ...s.logs.slice(-99), // keep last 100
        {
          id: logId++,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          level,
          message,
        },
      ],
    })),
}))
