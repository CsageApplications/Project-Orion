import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const BARS = 32

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
        const height = Math.max(2, value * 36)
        bar.style.height = `${height}px`
        bar.style.opacity = String(0.25 + value * 0.75)
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
        bar.style.height = '2px'
        bar.style.opacity = '0.15'
      })
      cancelAnimationFrame(rafRef.current)
    }
  }, [active])

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:2, height:36 }}>
      {Array.from({ length: BARS }).map((_, i) => {
        // gradient from violet at edges to cyan in center
        const center = BARS / 2
        const dist = Math.abs(i - center) / center
        const r = Math.round(0 + dist * 124)
        const g = Math.round(212 - dist * 154)
        const b = Math.round(255 - dist * 18)
        const color = `rgb(${r},${g},${b})`

        return analyser?.current ? (
          <div
            key={i}
            ref={(el) => { barsRef.current[i] = el }}
            style={{
              width: 2,
              height: 2,
              borderRadius: '1px',
              background: color,
              boxShadow: active ? `0 0 4px ${color}` : 'none',
              opacity: 0.15,
              transition: 'height 0.04s ease, opacity 0.04s ease',
              flexShrink: 0,
            }}
          />
        ) : (
          <motion.div
            key={i}
            style={{ width: 2, borderRadius: '1px', background: color, flexShrink: 0 }}
            animate={
              active
                ? { height: ['2px', `${6 + Math.random() * 28}px`, '2px'], opacity: [0.4, 1, 0.4] }
                : { height: '2px', opacity: 0.15 }
            }
            transition={
              active
                ? { duration: 0.45 + Math.random() * 0.4, repeat: Infinity, delay: (i / BARS) * 0.25, ease: 'easeInOut' }
                : { duration: 0.25 }
            }
          />
        )
      })}
    </div>
  )
}

