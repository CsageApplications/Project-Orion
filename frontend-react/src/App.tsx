import { useState } from 'react'
import { motion } from 'framer-motion'
import HudRings from './components/HudRings'
import StatusPanel from './components/StatusPanel'
import EventLog from './components/EventLog'
import ChatPanel from './components/ChatPanel'
import Waveform from './components/Waveform'

function App() {
  const [listening, setListening] = useState(false)

  return (
    <div className="hud-grid w-full h-full flex flex-col overflow-hidden select-none">

      {/* ── Top bar ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-[rgba(0,212,255,0.12)]">
        <div className="flex items-center gap-3">
          <div className="status-dot" />
          <span className="hud-label text-[#00d4ff]">ORION</span>
          <span className="hud-label opacity-30">/ COMMAND CENTER</span>
        </div>
        <div className="flex items-center gap-6">
          {['NAV', 'SENSORS', 'SYSTEM', 'SETTINGS'].map((tab) => (
            <button
              key={tab}
              className="hud-label hover:text-[#00d4ff] hover:opacity-100 transition-all"
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="hud-label">
            {new Date().toLocaleTimeString('en-US', { hour12: false })}
          </span>
          <span className="hud-label opacity-30">UTC-7</span>
        </div>
      </div>

      {/* ── Main grid ────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-[280px_1fr_280px] gap-3 p-3 min-h-0">

        {/* Left column */}
        <div className="flex flex-col gap-3 min-h-0">
          <div className="flex-1 min-h-0">
            <StatusPanel />
          </div>
          <div className="h-[180px]">
            <EventLog />
          </div>
        </div>

        {/* Center column — HUD rings + waveform + quick commands */}
        <div className="flex flex-col items-center gap-3 min-h-0">

          {/* HUD rings */}
          <div className="flex-1 w-full min-h-0">
            <HudRings />
          </div>

          {/* Voice indicator */}
          <motion.div
            className="hud-panel w-full px-4 py-3 flex flex-col items-center gap-2 cursor-pointer"
            onClick={() => setListening((l) => !l)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Waveform active={listening} />
            <span className={`hud-label ${listening ? 'text-[#00d4ff] opacity-100' : ''}`}>
              {listening ? 'LISTENING...' : 'TAP TO SPEAK'}
            </span>
          </motion.div>

          {/* Quick commands */}
          <div className="hud-panel w-full p-3 flex flex-wrap gap-2 justify-center">
            {['PATROL', 'DOCK', 'FOLLOW', 'STOP', 'SLEEP'].map((cmd) => (
              <button
                key={cmd}
                className="hud-label text-[0.6rem] px-3 py-1.5 border border-[rgba(0,212,255,0.2)] hover:border-[#00d4ff] hover:text-[#00d4ff] hover:opacity-100 transition-all"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3 min-h-0">
          <div className="flex-1 min-h-0">
            <ChatPanel />
          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-1.5 border-t border-[rgba(0,212,255,0.12)] text-[0.6rem] tracking-widest uppercase">
        <span className="text-[#2a4a5a]">Phase 1 — Desktop AI Assistant</span>
        <span className="text-[#2a4a5a]">v0.1.0-alpha</span>
        <span className="text-[#2a4a5a]">Backend: <span className="text-[#ff3b3b]">OFFLINE</span></span>
      </div>
    </div>
  )
}

export default App
