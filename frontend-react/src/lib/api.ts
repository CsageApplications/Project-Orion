const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export async function chatWithOrion(message: string): Promise<string> {
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }
  const data = await res.json()
  return data.response as string
}

export async function sendRobotCommand(
  command: string,
  params?: Record<string, unknown>,
): Promise<void> {
  const res = await fetch(`${BASE}/api/robot/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command: command.toLowerCase(), params }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }
}

export async function fetchRobotStatus() {
  const res = await fetch(`${BASE}/api/robot/status`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
