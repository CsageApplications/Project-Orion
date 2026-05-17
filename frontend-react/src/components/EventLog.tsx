import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOrionStore } from '../store'

const levelColor: Record<string, string> = {
  INFO:  'text-[#00d4ff]',
  WARN:  'text-[#f59e0b]',
  ERROR: 'text-[#ff3b3b]',
}

export default function EventLog() {
  const logs = useOrionStore((s) => s.logs)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div className="hud-panel h-full p-4 flex flex-col gap-2">
      <span className="hud-label">Event Log</span>
      <div className="flex-1 overflow-y-auto font-mono text-[0.65rem] flex flex-col gap-0.5 pr-1 break-words">
        <AnimatePresence initial={false}>
          {logs.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-2 items-start"
            >
              <span className="text-[#2a4a5a] shrink-0">{e.timestamp}</span>
              <span className={`shrink-0 font-bold ${levelColor[e.level] ?? 'text-[#4a7a90]'}`}>[{e.level}]</span>
              <span className="text-[#6a9ab0]">{e.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {logs.length === 0 && (
          <span className="text-[#2a4a5a]">Waiting for events...</span>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
