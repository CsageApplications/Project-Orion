import { create } from 'zustand'

/** Matches the backend RobotStatus struct */
export interface RobotStatus {
  id: string
  state: string
  battery_pct: number
  task: string | null
  online: boolean
  timestamp: string
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
  cpuPct: number | null
  memoryPct: number | null
  logs: LogEntry[]

  setBackendOnline: (online: boolean) => void
  setRobotStatus: (status: RobotStatus) => void
  setTelemetry: (cpu: number, memory: number, batteryPct: number) => void
  pushLog: (level: LogEntry['level'], message: string) => void
}

let logId = 1

export const useOrionStore = create<OrionState>((set) => ({
  backendOnline: false,
  robotStatus: null,
  cpuPct: null,
  memoryPct: null,
  logs: [
    { id: logId++, timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }), level: 'INFO', message: 'Orion frontend initialized' },
  ],

  setBackendOnline: (online) => set({ backendOnline: online }),
  setRobotStatus: (status) => set({ robotStatus: status }),
  setTelemetry: (cpu, memory, batteryPct) =>
    set((s) => ({
      cpuPct: cpu,
      memoryPct: memory,
      robotStatus: s.robotStatus
        ? { ...s.robotStatus, battery_pct: batteryPct }
        : s.robotStatus,
    })),
  pushLog: (level, message) =>
    set((s) => ({
      logs: [
        ...s.logs.slice(-99),
        {
          id: logId++,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          level,
          message,
        },
      ],
    })),
}))
