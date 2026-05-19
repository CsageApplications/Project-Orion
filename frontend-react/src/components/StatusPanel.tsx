import { useOrionStore } from '../store'

type Status = 'ok' | 'warn' | 'err'

const statusColor: Record<Status, string> = {
  ok:   'var(--cyan)',
  warn: 'var(--amber)',
  err:  'var(--red)',
}
const dotClass: Record<Status, string> = {
  ok:   'status-dot',
  warn: 'status-dot amber',
  err:  'status-dot red',
}

function MetricBar({ value, max = 100, status }: { value: number | null; max?: number; status: Status }) {
  const pct = value !== null ? Math.min(100, (value / max) * 100) : 0
  return (
    <div style={{ height: 2, background: 'rgba(0,212,255,0.08)', borderRadius: 1, overflow: 'hidden', marginTop: 2 }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: value !== null
          ? `linear-gradient(90deg, ${statusColor[status]}, ${statusColor[status]}aa)`
          : 'transparent',
        transition: 'width 0.6s ease',
        boxShadow: value !== null ? `0 0 4px ${statusColor[status]}88` : 'none',
      }} />
    </div>
  )
}

function Row({
  label, value, unit, status, showBar = false, barValue = null,
}: {
  label: string; value: string; unit?: string; status: Status
  showBar?: boolean; barValue?: number | null
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={dotClass[status]} style={{ width: 4, height: 4 }} />
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '0.58rem', letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'var(--text-dim)',
          }}>{label}</span>
        </div>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '0.62rem', fontWeight: 600,
          letterSpacing: '0.08em', color: statusColor[status],
        }}>
          {value}{unit && <span style={{ opacity: 0.5, marginLeft: 2 }}>{unit}</span>}
        </span>
      </div>
      {showBar && <MetricBar value={barValue} status={status} />}
    </div>
  )
}

export default function StatusPanel() {
  const backendOnline = useOrionStore((s) => s.backendOnline)
  const robot = useOrionStore((s) => s.robotStatus)
  const cpuPct = useOrionStore((s) => s.cpuPct)
  const memoryPct = useOrionStore((s) => s.memoryPct)

  const robotState = robot?.state?.toUpperCase() ?? 'STANDBY'
  const battery = robot?.battery_pct ?? null

  return (
    <div className="hud-panel h-full" style={{ padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontFamily:'var(--mono)', fontSize:'0.55rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--text-dim)' }}>System Status</span>
          <span style={{
            fontFamily:'var(--mono)', fontSize:'0.5rem', letterSpacing:'0.12em',
            padding: '2px 8px',
            border: `1px solid ${robotState === 'ERROR' ? 'rgba(239,68,68,0.4)' : robotState === 'ACTIVE' ? 'rgba(0,212,255,0.3)' : 'rgba(0,212,255,0.2)'}`,
            borderRadius: '2px',
            background: robotState === 'ERROR' ? 'rgba(239,68,68,0.1)' : robotState === 'ACTIVE' ? 'rgba(0,212,255,0.1)' : 'rgba(0,212,255,0.06)',
            color: robotState === 'ERROR' ? 'var(--red)' : 'var(--cyan)',
          }}>{robotState === 'ERROR' ? 'FAULT' : robotState === 'ACTIVE' ? 'ACTIVE' : 'NOMINAL'}</span>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <Row label="Connection" value={backendOnline ? 'ONLINE' : 'OFFLINE'}
          status={backendOnline ? 'ok' : 'err'} />
        <Row label="Robot" value={robotState}
          status={robotState === 'ERROR' ? 'err' : robotState === 'IDLE' || robotState === 'STANDBY' ? 'warn' : 'ok'} />
        <Row label="Battery" value={battery !== null ? String(battery) : '—'} unit="%"
          status={battery === null ? 'warn' : battery > 20 ? 'ok' : 'err'}
          showBar barValue={battery} />
        <Row label="CPU" value={cpuPct !== null ? String(cpuPct) : '—'} unit="%"
          status={cpuPct === null ? 'warn' : cpuPct > 80 ? 'err' : 'ok'}
          showBar barValue={cpuPct} />
        <Row label="Memory" value={memoryPct !== null ? String(memoryPct) : '—'} unit="%"
          status={memoryPct === null ? 'warn' : memoryPct > 85 ? 'err' : 'ok'}
          showBar barValue={memoryPct} />
        <Row label="LLM" value="READY" status="ok" />
        <Row label="Camera" value="NO FEED" status="warn" />
        <Row label="Audio" value="ACTIVE" status="ok" />
      </div>

      {/* Footer */}
      <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(0,212,255,0.06)' }}>
        <span style={{ fontFamily:'var(--mono)', fontSize:'0.5rem', letterSpacing:'0.12em', color:'var(--text-dim)' }}>
          SYS · ORION-01 · v0.2.0
        </span>
      </div>
    </div>
  )
}
