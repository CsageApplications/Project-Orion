import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LogEntry {
  id: number
  time: string
  type: 'info' | 'warn' | 'error' | 'system'
  msg: string
}

const seed: LogEntry[] = [
  { id: 1, time: '00:00:01', type: 'system', msg: 'Orion core initializing...' },
  { id: 2, time: '00:00:02', type: 'system', msg: 'Frontend connected' },
  { id: 3, time: '00:00:03', type: 'warn',   msg: 'Backend unreachable — retrying' },
  { id: 4, time: '00:00:05', type: 'info',   msg: 'LLM gateway ready' },
  { id: 5, time: '00:00:06', type: 'warn',   msg: 'Robot not connected' },
]

let nextId = 6

const typeColor: Record<LogEntry['type'], string> = {
  info:   'text-[#00d4ff]',
  warn:   'text-[#f59e0b]',
  error:  'text-[#ff3b3b]',
  system: 'text-[#4a7a90]',
}

const typeTag: Record<LogEntry['type'], string> = {
  info:   'INFO',
  warn:   'WARN',
  error:  'ERR ',
  system: 'SYS ',
}

function timestamp() {
  const d = new Date()
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join(':')
}

export default function EventLog() {
  const [entries, setEntries] = useState<LogEntry[]>(seed)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const examples: Pick<LogEntry, 'type' | 'msg'>[] = [
        { type: 'info',   msg: 'Heartbeat OK' },
        { type: 'info',   msg: 'Telemetry packet received' },
        { type: 'warn',   msg: 'High CPU on Jetson node' },
        { type: 'system', msg: 'WebSocket ping 12ms' },
        { type: 'info',   msg: 'Memory usage nominal' },
      ]
      const pick = examples[Math.floor(Math.random() * examples.length)]
      setEntries((prev) => [
        ...prev.slice(-49),
        { id: nextId++, time: timestamp(), ...pick },
      ])
    }, 3200)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  return (
    <div className="hud-panel h-full p-4 flex flex-col gap-2">
      <span className="hud-label">Event Log</span>
      <div className="flex-1 overflow-y-auto font-mono text-[0.65rem] flex flex-col gap-0.5 pr-1">
        <AnimatePresence initial={false}>
          {entries.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-2 items-start"
            >
              <span className="text-[#2a4a5a] shrink-0">{e.time}</span>
              <span className={`shrink-0 font-bold ${typeColor[e.type]}`}>[{typeTag[e.type]}]</span>
              <span className="text-[#6a9ab0]">{e.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
