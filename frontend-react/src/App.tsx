import { useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import HudRings from './components/HudRings'
import StatusPanel from './components/StatusPanel'
import EventLog from './components/EventLog'
import ChatPanel, { type ChatPanelHandle } from './components/ChatPanel'
import Waveform from './components/Waveform'
import { useOrionStore } from './store'
import { sendRobotCommand, fetchRobotStatus } from './lib/api'
import { useTts } from './hooks/useTts'
import { useVoiceInput } from './hooks/useVoiceInput'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080/ws'

function App() {
  const chatRef = useRef<ChatPanelHandle>(null)
  const { speak, speaking, analyser } = useTts()

  const handleTranscript = useCallback((text: string) => {
    chatRef.current?.injectMessage(text)
  }, [])

  const { listening, toggleListening } = useVoiceInput(handleTranscript)
  const setBackendOnline = useOrionStore((s) => s.setBackendOnline)
  const setRobotStatus = useOrionStore((s) => s.setRobotStatus)
  const setTelemetry = useOrionStore((s) => s.setTelemetry)
  const pushLog = useOrionStore((s) => s.pushLog)
  const backendOnline = useOrionStore((s) => s.backendOnline)
  const wsRef = useRef<WebSocket | null>(null)

  // ── WebSocket connection ──────────────────────────────────────────
  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout>

    const connect = () => {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        setBackendOnline(true)
        pushLog('INFO', 'Backend connected')
        // Fetch initial robot status over REST
        fetchRobotStatus().then(setRobotStatus).catch(() => {})
      }

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          if (msg.type === 'robot_state' || msg.type === 'state_change') {
            setRobotStatus(msg.data)
          } else if (msg.type === 'telemetry') {
            setTelemetry(msg.data.cpu_pct, msg.data.memory_pct, msg.data.battery_pct)
          } else {
            pushLog('INFO', e.data)
          }
        } catch {
          pushLog('INFO', e.data)
        }
      }

      ws.onerror = () => {
        setBackendOnline(false)
      }

      ws.onclose = () => {
        setBackendOnline(false)
        pushLog('WARN', 'Backend disconnected — retrying in 5s')
        reconnectTimer = setTimeout(connect, 5000)
      }
    }

    connect()
    return () => {
      clearTimeout(reconnectTimer)
      wsRef.current?.close()
    }
  }, [])

  // ── Quick command handler ─────────────────────────────────────────
  const handleCommand = async (cmd: string) => {
    pushLog('INFO', `Command sent: ${cmd}`)
    try {
      await sendRobotCommand(cmd)
      pushLog('INFO', `${cmd} acknowledged`)
      // Refresh robot status
      fetchRobotStatus().then(setRobotStatus).catch(() => {})
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed'
      pushLog('ERROR', `${cmd} failed: ${msg}`)
    }
  }

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden select-none" style={{ fontFamily: 'var(--sans)' }}>

      {/* Fixed bg layers */}
      <div className="hud-grid-bg" />

      {/* ── Top bar ──────────────────────────────────────── */}
      <div
        className="relative z-10 flex items-center justify-between px-5 py-0"
        style={{
          height: '44px',
          background: 'rgba(6,11,20,0.85)',
          borderBottom: '1px solid rgba(0,212,255,0.1)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Left — brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="status-dot" />
            <span style={{ fontFamily:'var(--mono)', fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.2em', color:'var(--cyan)' }}>ORION</span>
          </div>
          <span style={{ fontFamily:'var(--mono)', fontSize:'0.55rem', letterSpacing:'0.15em', color:'var(--text-dim)', textTransform:'uppercase' }}>/ COMMAND CENTER</span>
          <div style={{ width:1, height:12, background:'var(--border)' }} />
          <span style={{ fontFamily:'var(--mono)', fontSize:'0.55rem', letterSpacing:'0.12em', color:'var(--text-dim)' }}>PHASE 1</span>
        </div>

        {/* Center — nav */}
        <div className="flex items-center gap-1">
          {['NAV', 'SENSORS', 'SYSTEM', 'SETTINGS'].map((tab) => (
            <button
              key={tab}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.55rem',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--text-dim)',
                padding: '4px 10px',
                border: '1px solid transparent',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderRadius: '2px',
              }}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.color = 'var(--cyan)'
                ;(e.target as HTMLElement).style.borderColor = 'var(--border)'
                ;(e.target as HTMLElement).style.background = 'var(--cyan-dim)'
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.color = 'var(--text-dim)'
                ;(e.target as HTMLElement).style.borderColor = 'transparent'
                ;(e.target as HTMLElement).style.background = 'transparent'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right — clock + status */}
        <div className="flex items-center gap-4">
          <span style={{ fontFamily:'var(--mono)', fontSize:'0.6rem', color:'var(--text-mid)', letterSpacing:'0.1em' }}>
            {new Date().toLocaleTimeString('en-US', { hour12: false })}
          </span>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '3px 10px',
              border: `1px solid ${backendOnline ? 'rgba(0,212,255,0.2)' : 'rgba(239,68,68,0.2)'}`,
              borderRadius: '2px',
              background: backendOnline ? 'rgba(0,212,255,0.05)' : 'rgba(239,68,68,0.05)',
            }}
          >
            <div className={`status-dot ${backendOnline ? '' : 'red'}`} />
            <span style={{ fontFamily:'var(--mono)', fontSize:'0.55rem', fontWeight:600, letterSpacing:'0.12em', color: backendOnline ? 'var(--cyan)' : 'var(--red)' }}>
              {backendOnline ? 'CONNECTED' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main grid ────────────────────────────────────── */}
      <div className="relative z-10 flex-1 grid min-h-0 gap-2 p-2" style={{ gridTemplateColumns: '260px 1fr 270px' }}>

        {/* Left column */}
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex-1 min-h-0">
            <StatusPanel />
          </div>
          <div style={{ height: '200px' }}>
            <EventLog />
          </div>
        </div>

        {/* Center column */}
        <div className="flex flex-col items-center gap-2 min-h-0">

          {/* HUD rings */}
          <div className="flex-1 w-full min-h-0 hud-panel">
            <div className="scan-line" />
            <HudRings />
          </div>

          {/* Voice indicator */}
          <motion.div
            className="hud-panel w-full cursor-pointer"
            style={{ padding: '10px 16px', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}
            onClick={toggleListening}
            whileHover={{ borderColor: 'rgba(0,212,255,0.4)' }}
            whileTap={{ scale: 0.99 }}
          >
            <Waveform active={speaking || listening} analyser={analyser} />
            <div className="flex items-center gap-2">
              {(speaking || listening) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)' }}
                />
              )}
              <span style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.58rem',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: (speaking || listening) ? 'var(--cyan)' : 'var(--text-dim)',
              }}>
                {speaking ? 'ORION SPEAKING' : listening ? 'LISTENING' : 'TAP TO SPEAK'}
              </span>
            </div>
          </motion.div>

          {/* Quick commands */}
          <div className="hud-panel w-full" style={{ padding: '10px 12px' }}>
            <div style={{ marginBottom: 8, fontFamily:'var(--mono)', fontSize:'0.52rem', letterSpacing:'0.15em', color:'var(--text-dim)', textTransform:'uppercase' }}>Quick Commands</div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {[
                { cmd: 'PATROL', color: 'var(--cyan)' },
                { cmd: 'DOCK',   color: 'var(--cyan)' },
                { cmd: 'FOLLOW', color: 'var(--cyan)' },
                { cmd: 'STOP',   color: 'var(--red)'  },
                { cmd: 'SLEEP',  color: 'var(--amber)' },
              ].map(({ cmd, color }) => (
                <button
                  key={cmd}
                  onClick={() => handleCommand(cmd)}
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '0.55rem',
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    padding: '5px 12px',
                    border: `1px solid rgba(0,212,255,0.15)`,
                    borderRadius: '2px',
                    background: 'transparent',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.color = color
                    el.style.borderColor = color
                    el.style.background = `${color}15`
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.color = 'var(--text-dim)'
                    el.style.borderColor = 'rgba(0,212,255,0.15)'
                    el.style.background = 'transparent'
                  }}
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex-1 min-h-0">
            <ChatPanel ref={chatRef} onSpeak={speak} />
          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────── */}
      <div
        className="relative z-10 flex items-center justify-between px-5"
        style={{
          height: '28px',
          background: 'rgba(6,11,20,0.9)',
          borderTop: '1px solid rgba(0,212,255,0.08)',
        }}
      >
        <span style={{ fontFamily:'var(--mono)', fontSize:'0.5rem', letterSpacing:'0.15em', color:'var(--text-dim)', textTransform:'uppercase' }}>Phase 1 — Desktop AI Assistant</span>
        <span style={{ fontFamily:'var(--mono)', fontSize:'0.5rem', letterSpacing:'0.12em', color:'var(--text-dim)' }}>v0.1.0-alpha</span>
        <span style={{ fontFamily:'var(--mono)', fontSize:'0.5rem', letterSpacing:'0.15em', color:'var(--text-dim)', textTransform:'uppercase' }}>
          Build: <span style={{ color:'var(--cyan)', fontWeight:600 }}>STABLE</span>
        </span>
      </div>
    </div>
  )
}

export default App
