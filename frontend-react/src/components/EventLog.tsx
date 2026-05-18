import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOrionStore } from '../store'

const levelStyle: Record<string, { color: string; bg: string }> = {
  INFO:  { color: 'var(--cyan)',  bg: 'rgba(0,212,255,0.08)'  },
  WARN:  { color: 'var(--amber)', bg: 'rgba(245,158,11,0.08)' },
  ERROR: { color: 'var(--red)',   bg: 'rgba(239,68,68,0.08)'  },
}

export default function EventLog() {
  const logs = useOrionStore((s) => s.logs)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div className="hud-panel h-full" style={{ padding: '12px 12px', display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingBottom: 8, borderBottom:'1px solid rgba(0,212,255,0.07)' }}>
        <span style={{ fontFamily:'var(--mono)', fontSize:'0.55rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--text-dim)' }}>Event Log</span>
        <span style={{ fontFamily:'var(--mono)', fontSize:'0.5rem', color:'var(--text-dim)' }}>{logs.length} entries</span>
      </div>
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:2, paddingRight:2 }}>
        <AnimatePresence initial={false}>
          {logs.map((e) => {
            const style = levelStyle[e.level] ?? { color: 'var(--text-mid)', bg: 'transparent' }
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                  display: 'flex', gap: 6, alignItems: 'flex-start',
                  padding: '3px 6px',
                  borderRadius: '2px',
                  borderLeft: `2px solid ${style.color}`,
                  background: style.bg,
                }}
              >
                <span style={{ fontFamily:'var(--mono)', fontSize:'0.55rem', color:'var(--text-dim)', flexShrink:0, paddingTop:1 }}>{e.timestamp}</span>
                <span style={{ fontFamily:'var(--mono)', fontSize:'0.55rem', fontWeight:700, color: style.color, flexShrink:0 }}>{e.level}</span>
                <span style={{ fontFamily:'var(--mono)', fontSize:'0.55rem', color:'var(--text-mid)', wordBreak:'break-word' }}>{e.message}</span>
              </motion.div>
            )
          })}
        </AnimatePresence>
        {logs.length === 0 && (
          <span style={{ fontFamily:'var(--mono)', fontSize:'0.55rem', color:'var(--text-dim)' }}>Waiting for events...</span>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
