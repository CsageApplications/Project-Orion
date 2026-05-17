import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { chatWithOrion } from '../lib/api'
import { useOrionStore } from '../store'

interface Message {
  id: number
  role: 'user' | 'orion'
  text: string
}

let msgId = 1

export default function ChatPanel({ onSpeak }: { onSpeak?: (text: string) => void }) {
  const backendOnline = useOrionStore((s) => s.backendOnline)
  const pushLog = useOrionStore((s) => s.pushLog)
  const [messages, setMessages] = useState<Message[]>([
    { id: msgId++, role: 'orion', text: 'ORION online. How can I assist?' },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const send = async () => {
    const text = input.trim()
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
    <div className="hud-panel h-full flex flex-col p-4 gap-3">
      <span className="hud-label">Command Interface</span>

      {/* Message history */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex gap-2 text-xs leading-relaxed ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'orion' && (
              <span className="text-[#00d4ff] font-bold shrink-0 tracking-widest">ORION</span>
            )}
            <span
              className={
                m.role === 'user'
                  ? 'text-[#c8eaf5] bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] px-3 py-1 rounded-sm max-w-[80%]'
                  : 'text-[#7ab8cc] max-w-[85%]'
              }
            >
              {m.text}
            </span>
            {m.role === 'user' && (
              <span className="text-[#4a7a90] font-bold shrink-0 tracking-widest">YOU</span>
            )}
          </motion.div>
        ))}

        {thinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 text-xs items-center"
          >
            <span className="text-[#00d4ff] font-bold tracking-widest shrink-0">ORION</span>
            <span className="text-[#4a7a90] flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1, delay: i * 0.18, repeat: Infinity }}
                  className="inline-block w-1 h-1 rounded-full bg-[#00d4ff]"
                />
              ))}
            </span>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex gap-2 border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.04)] p-2">
        <span className="text-[#4a7a90] font-mono text-xs self-center shrink-0">❯</span>
        <input
          className="flex-1 bg-transparent text-[#c8eaf5] text-xs outline-none placeholder-[#2a4a5a] font-mono tracking-wide"
          placeholder="Enter command..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          autoFocus
        />
        <button
          onClick={send}
          className="text-[#00d4ff] text-xs font-bold tracking-widest hover:text-white transition-colors px-2 border border-[rgba(0,212,255,0.3)] hover:border-[#00d4ff]"
        >
          SEND
        </button>
      </div>
    </div>
  )
}
