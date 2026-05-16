import { useOrionStore } from '../store'

type Status = 'ok' | 'warn' | 'err'

const dotClass: Record<Status, string> = {
  ok: 'status-dot',
  warn: 'status-dot amber',
  err: 'status-dot red',
}

const valColor: Record<Status, string> = {
  ok: 'text-[#00d4ff]',
  warn: 'text-[#f59e0b]',
  err: 'text-[#ff3b3b]',
}

function Row({ label, value, unit, status }: { label: string; value: string; unit?: string; status: Status }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={dotClass[status]} />
        <span className="text-xs tracking-widest uppercase text-[#4a7a90]">{label}</span>
      </div>
      <span className={`text-xs font-bold tracking-wider font-mono ${valColor[status]}`}>
        {value}{unit && <span className="opacity-50 ml-0.5">{unit}</span>}
      </span>
    </div>
  )
}

export default function StatusPanel() {
  const backendOnline = useOrionStore((s) => s.backendOnline)
  const robot = useOrionStore((s) => s.robotStatus)

  const robotState = robot?.state?.toUpperCase() ?? 'STANDBY'
  const battery = robot?.battery_level ?? null

  return (
    <div className="hud-panel h-full p-4 flex flex-col gap-3">
      <span className="hud-label">System Status</span>
      <div className="flex flex-col gap-2 flex-1">
        <Row label="System" value="ONLINE" status="ok" />
        <Row
          label="Battery"
          value={battery !== null ? String(battery) : '—'}
          unit="%"
          status={battery === null ? 'warn' : battery > 20 ? 'ok' : 'err'}
        />
        <Row label="CPU" value="—" status="warn" />
        <Row label="Memory" value="—" status="warn" />
        <Row
          label="Backend"
          value={backendOnline ? 'ONLINE' : 'OFFLINE'}
          status={backendOnline ? 'ok' : 'err'}
        />
        <Row
          label="Robot"
          value={robotState}
          status={robotState === 'IDLE' || robotState === 'STANDBY' ? 'warn' : robotState === 'ERROR' ? 'err' : 'ok'}
        />
        <Row label="Camera" value="NO FEED" status="warn" />
        <Row label="LLM" value="READY" status="ok" />
      </div>
    </div>
  )
}
