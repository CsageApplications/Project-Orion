interface Stat {
  label: string
  value: string
  unit?: string
  status: 'ok' | 'warn' | 'err'
}

const stats: Stat[] = [
  { label: 'System', value: 'ONLINE', status: 'ok' },
  { label: 'Battery', value: '87', unit: '%', status: 'ok' },
  { label: 'CPU', value: '14', unit: '%', status: 'ok' },
  { label: 'Memory', value: '2.1', unit: 'GB', status: 'ok' },
  { label: 'Backend', value: 'OFFLINE', status: 'err' },
  { label: 'Robot', value: 'STANDBY', status: 'warn' },
  { label: 'Camera', value: 'NO FEED', status: 'warn' },
  { label: 'LLM', value: 'READY', status: 'ok' },
]

const dotClass: Record<Stat['status'], string> = {
  ok: 'status-dot',
  warn: 'status-dot amber',
  err: 'status-dot red',
}

const valColor: Record<Stat['status'], string> = {
  ok: 'text-[#00d4ff]',
  warn: 'text-[#f59e0b]',
  err: 'text-[#ff3b3b]',
}

export default function StatusPanel() {
  return (
    <div className="hud-panel h-full p-4 flex flex-col gap-3">
      <span className="hud-label">System Status</span>
      <div className="flex flex-col gap-2 flex-1">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={dotClass[s.status]} />
              <span className="text-xs tracking-widest uppercase text-[#4a7a90]">{s.label}</span>
            </div>
            <span className={`text-xs font-bold tracking-wider font-mono ${valColor[s.status]}`}>
              {s.value}{s.unit && <span className="opacity-50 ml-0.5">{s.unit}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
