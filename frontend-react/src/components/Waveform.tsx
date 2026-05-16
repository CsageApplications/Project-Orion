import { motion } from 'framer-motion'

const BARS = 28

export default function Waveform({ active = false }: { active?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-[2px] h-8">
      {Array.from({ length: BARS }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          style={{ background: active ? '#00d4ff' : 'rgba(0,212,255,0.25)' }}
          animate={
            active
              ? {
                  height: ['4px', `${8 + Math.random() * 20}px`, '4px'],
                  opacity: [0.5, 1, 0.5],
                }
              : { height: '3px', opacity: 0.2 }
          }
          transition={
            active
              ? {
                  duration: 0.5 + Math.random() * 0.4,
                  repeat: Infinity,
                  delay: (i / BARS) * 0.3,
                  ease: 'easeInOut',
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  )
}
