import { useRef, useState, useCallback } from 'react'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export function useTts() {
  const [speaking, setSpeaking] = useState(false)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)

  const speak = useCallback(async (text: string) => {
    // Stop any current speech
    sourceRef.current?.stop()
    setSpeaking(false)

    try {
      const res = await fetch(`${BASE}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error(`TTS error ${res.status}`)

      const arrayBuffer = await res.arrayBuffer()

      // Create/reuse AudioContext
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContext()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') await ctx.resume()

      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)

      // Analyser for waveform visualization
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      analyser.smoothingTimeConstant = 0.75
      analyserRef.current = analyser

      // Source → Analyser → Output
      const source = ctx.createBufferSource()
      source.buffer = audioBuffer
      source.connect(analyser)
      analyser.connect(ctx.destination)
      sourceRef.current = source

      setSpeaking(true)
      source.start()
      source.onended = () => {
        setSpeaking(false)
        analyserRef.current = null
      }
    } catch (err) {
      console.error('TTS failed:', err)
      setSpeaking(false)
    }
  }, [])

  const stop = useCallback(() => {
    sourceRef.current?.stop()
    setSpeaking(false)
    analyserRef.current = null
  }, [])

  return { speak, stop, speaking, analyser: analyserRef }
}
