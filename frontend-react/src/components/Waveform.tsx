import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const BARS = 28

interface Props {
  active?: boolean
  analyser?: React.RefObject<AnalyserNode | null>
}

export default function Waveform({ active = false, analyser }: Props) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!active || !analyser?.current) return

    const node = analyser.current
    const dataArray = new Uint8Array(node.frequencyBinCount)

    const tick = () => {
      node.getByteFrequencyData(dataArray)
      barsRef.current.forEach((bar, i) => {
        if (!bar) return
        const bin = Math.floor((i / BARS) * dataArray.length)
        const value = dataArray[bin] / 255
        const height = Math.max(3, value * 32)
        bar.style.height = `${height}px`
        bar.style.opacity = String(0.3 + value * 0.7)
      })
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, analyser])

  useEffect(() => {
    if (!active) {
      barsRef.current.forEach((bar) => {
        if (!bar) return
        bar.style.height = '3px'
        bar.style.opacity = '0.2'
      })
      cancelAnimationFrame(rafRef.current)
    }
  }, [active])

  return (
    <div className="flex items-center justify-center gap-[2px] h-8">
      {Array.from({ length: BARS }).map((_, i) =>
        analyser?.current ? (
          <div
            key={i}
            ref={(el) => { barsRef.current[i] = el }}
            className="w-[3px] rounded-full"
            style={{
              background: '#00d4ff',
              height: '3px',
              opacity: 0.2,
              transition: 'height 0.05s ease, opacity 0.05s ease',
            }}
          />
        ) : (
          <motion.div
            key={i}
            className="w-[3px] rounded-full"
            style={{ background: active ? '#00d4ff' : 'rgba(0,212,255,0.25)' }}
            animate={
              active
                ? { height: ['4px', `${8 + Math.random() * 20}px`, '4px'], opacity: [0.5, 1, 0.5] }
                : { height: '3px', opacity: 0.2 }
            }
            transition={
              active
                ? { duration: 0.5 + Math.random() * 0.4, repeat: Infinity, delay: (i / BARS) * 0.3, ease: 'easeInOut' }
                : { duration: 0.3 }
            }
          />
        )
      )}
    </div>
  )
}
