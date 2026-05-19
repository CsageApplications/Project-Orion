import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOrionStore, type LogEntry } from '../store'

type LevelFilter = 'ALL' | 'INFO' | 'WARN' | 'ERROR'

const levelStyle: Record<string, { color: string; bg: string }> = {
  INFO:  { color: 'var(--cyan)',  bg: 'rgba(0,212,255,0.08)'  },
  WARN:  { color: 'var(--amber)', bg: 'rgba(245,158,11,0.08)' },
  ERROR: { color: 'var(--red)',   bg: 'rgba(239,68,68,0.08)'  },
}

const filterColors: Record<LevelFilter, string> = {
  ALL:   'var(--cyan)',
  INFO:  'var(--cyan)',
  WARN:  'var(--amber)',
  ERROR: 'var(--red)',
}

export default function EventLog() {
  const logs = useOrionStore((s) => s.logs)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<LevelFilter>('ALL')

  const filtered: LogEntry[] = filter === 'ALL' ? logs : logs.filter((e) => e.level === filter)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [filtered.length])

  return (
    <div className="hud-panel h-full" style={{ padding: '12px 12px', display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingBottom: 8, borderBottom:'1px solid rgba(0,212,255,0.07)' }}>
        <span style={{ fontFamily:'var(--mono)', fontSize:'0.55rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--text-dim)' }}>Event Log</span>
        <div style={{ display:'flex', gap:4 }}>
          {(['ALL','INFO','WARN','ERROR'] as LevelFilter[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.48rem',
                letterSpacing: '0.12em',
                padding: '2px 6px',
                borderRadius: '2px',
                border: `1px solid ${filter === lvl ? filterColors[lvl] : 'rgba(255,255,255,0.08)'}`,
                background: filter === lvl ? `${filterColors[lvl]}18` : 'transparent',
                color: filter === lvl ? filterColors[lvl] : 'var(--text-dim)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:2, paddingRight:2 }}>
        <AnimatePresence initial={false}>
          {filtered.map((e) => {
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
        {filtered.length === 0 && (
          <span style={{ fontFamily:'var(--mono)', fontSize:'0.55rem', color:'var(--text-dim)' }}>
            {filter === 'ALL' ? 'Waiting for events...' : `No ${filter} events`}
          </span>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ paddingTop:6, borderTop:'1px solid rgba(0,212,255,0.06)', display:'flex', justifyContent:'space-between' }}>
        <span style={{ fontFamily:'var(--mono)', fontSize:'0.48rem', color:'var(--text-dim)' }}>
          {filtered.length}/{logs.length} entries
        </span>
        <span style={{ fontFamily:'var(--mono)', fontSize:'0.48rem', color:'var(--text-dim)' }}>
          ERR: {logs.filter(l => l.level === 'ERROR').length}  WARN: {logs.filter(l => l.level === 'WARN').length}
        </span>
      </div>
    </div>
  )
}

