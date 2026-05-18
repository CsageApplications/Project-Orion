import { useState, useRef, forwardRef, useImperativeHandle } from 'react'
import { motion } from 'framer-motion'
import { chatWithOrion } from '../lib/api'
import { useOrionStore } from '../store'

interface Message {
  id: number
  role: 'user' | 'orion'
  text: string
}

let msgId = 1

export interface ChatPanelHandle {
  injectMessage: (text: string) => void
}

const ChatPanel = forwardRef<ChatPanelHandle, { onSpeak?: (text: string) => void }>(
  function ChatPanel({ onSpeak }, ref) {
  const backendOnline = useOrionStore((s) => s.backendOnline)
  const pushLog = useOrionStore((s) => s.pushLog)
  const [messages, setMessages] = useState<Message[]>([
    { id: msgId++, role: 'orion', text: 'ORION online. How can I assist?' },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    injectMessage: (text: string) => {
      setInput(text)
      // Defer so state is set before send fires
      setTimeout(() => {
        sendText(text)
      }, 0)
    },
  }))

  const send = async () => sendText(input.trim())

  const sendText = async (text: string) => {
    if (!text) return
    setInput('')
    setMessages((m) => [...m, { id: msgId++, role: 'user', text }])
    setThinking(true)
    pushLog('INFO', `User: ${text}`)

    try {
      if (!backendOnline) throw new Error('Backend offline')
      const raw = await chatWithOrion(text)
      // Strip markdown bold/italic so it renders cleanly in the HUD
      const reply = raw
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/^#{1,3}\s/gm, '')
        .trim()
      if (reply) {
        setMessages((m) => [...m, { id: msgId++, role: 'orion', text: reply }])
        pushLog('INFO', `Orion: ${reply.slice(0, 60)}${reply.length > 60 ? '...' : ''}`)
        onSpeak?.(reply)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setMessages((m) => [
        ...m,
        { id: msgId++, role: 'orion', text: `[ERROR] ${msg}` },
      ])
      pushLog('ERROR', msg)
    }

    setThinking(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  return (
    <div className="hud-panel h-full" style={{ display:'flex', flexDirection:'column', padding:'14px 14px' }}>

      {/* Header */}
      <div style={{ marginBottom:12, paddingBottom:10, borderBottom:'1px solid rgba(0,212,255,0.08)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontFamily:'var(--mono)', fontSize:'0.55rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--text-dim)' }}>Command Interface</span>
        <div style={{ display:'flex', gap:4 }}>
          {['●','●','●'].map((d,i) => (
            <span key={i} style={{ fontSize:'0.4rem', color: i===0?'var(--red)':i===1?'var(--amber)':'var(--cyan)', opacity:0.6 }}>{d}</span>
          ))}
        </div>
      </div>

      {/* Message history */}
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:10, paddingRight:4 }}>
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            style={{ display:'flex', flexDirection:'column', gap:3, alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <span style={{ fontFamily:'var(--mono)', fontSize:'0.5rem', letterSpacing:'0.14em', fontWeight:700, color: m.role==='user'?'var(--text-dim)':'var(--cyan)' }}>
              {m.role === 'user' ? 'YOU' : 'ORION'}
            </span>
            <div style={{
              maxWidth: '87%',
              padding: '7px 10px',
              borderRadius: '2px',
              fontSize: '0.72rem',
              lineHeight: 1.55,
              fontFamily: 'var(--sans)',
              ...(m.role === 'user' ? {
                background: 'rgba(0,212,255,0.06)',
                border: '1px solid rgba(0,212,255,0.18)',
                color: 'var(--text)',
                borderBottomRightRadius: '0px',
              } : {
                background: 'rgba(124,58,237,0.06)',
                border: '1px solid rgba(124,58,237,0.15)',
                borderLeft: '2px solid rgba(0,212,255,0.4)',
                color: 'var(--text-mid)',
                borderBottomLeftRadius: '0px',
              }),
            }}>
              {m.text}
            </div>
          </motion.div>
        ))}

        {thinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display:'flex', flexDirection:'column', gap:3, alignItems:'flex-start' }}
          >
            <span style={{ fontFamily:'var(--mono)', fontSize:'0.5rem', letterSpacing:'0.14em', fontWeight:700, color:'var(--cyan)' }}>ORION</span>
            <div style={{
              padding:'7px 10px',
              background:'rgba(124,58,237,0.06)',
              border:'1px solid rgba(124,58,237,0.15)',
              borderLeft:'2px solid rgba(0,212,255,0.4)',
              borderRadius:'2px',
              display:'flex', gap:4, alignItems:'center',
            }}>
              {[0,1,2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity:[0.15,1,0.15], scale:[0.8,1,0.8] }}
                  transition={{ duration:0.9, delay:i*0.2, repeat:Infinity }}
                  style={{ display:'inline-block', width:4, height:4, borderRadius:'50%', background:'var(--cyan)', boxShadow:'0 0 4px var(--cyan)' }}
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        marginTop:12,
        display:'flex', gap:6, alignItems:'center',
        padding:'6px 10px',
        background:'rgba(0,212,255,0.03)',
        border:'1px solid rgba(0,212,255,0.15)',
        borderRadius:'2px',
      }}>
        <span style={{ fontFamily:'var(--mono)', fontSize:'0.7rem', color:'var(--cyan)', opacity:0.6, userSelect:'none' }}>›</span>
        <input
          style={{
            flex:1, background:'transparent', border:'none', outline:'none',
            fontFamily:'var(--mono)', fontSize:'0.68rem', color:'var(--text)',
            letterSpacing:'0.04em',
          }}
          placeholder="Enter command..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          autoFocus
        />
        <button
          onClick={send}
          style={{
            fontFamily:'var(--mono)', fontSize:'0.55rem', fontWeight:700,
            letterSpacing:'0.14em', padding:'4px 10px',
            border:'1px solid rgba(0,212,255,0.25)', borderRadius:'2px',
            background:'rgba(0,212,255,0.07)', color:'var(--cyan)', cursor:'pointer',
            transition:'all 0.18s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.background = 'rgba(0,212,255,0.15)'
            el.style.borderColor = 'var(--cyan)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.background = 'rgba(0,212,255,0.07)'
            el.style.borderColor = 'rgba(0,212,255,0.25)'
          }}
        >
          SEND
        </button>
      </div>
    </div>
  )
  }
)

export default ChatPanel
