# Orion

A personal AI robot assistant for the home.

Orion is a full-stack robotics platform that combines mechanical design, electronics, embedded firmware, AI inference, backend services, and a React command center into a single cohesive robot.

> **v0.2.0** — Live telemetry, state machine, command/chat history, HUD state-driven color, EventLog filters

---

## Changelog

### v0.2.0
- **Backend**: Telemetry broadcast loop — battery drain simulation + live CPU/memory over WebSocket every 5s
- **Backend**: Expanded state machine — `TASK_START`, `TASK_STOP`, `RESET`, `ERROR` commands with proper state transitions
- **Backend**: In-memory command history (`GET /api/robot/commands`) and chat history (`GET /api/chat/history`)
- **Frontend**: Fixed WebSocket message parsing — typed `telemetry` / `state_change` / `robot_state` handler
- **Frontend**: StatusPanel — live CPU%, memory%, battery% from telemetry; dynamic NOMINAL/ACTIVE/FAULT badge
- **Frontend**: HUD rings — state-driven accent color (ACTIVE=cyan, ERROR=red) via React context
- **Frontend**: EventLog — level filter buttons (ALL/INFO/WARN/ERROR) + error/warn counters in footer
- **Frontend**: ChatPanel — loads conversation history from backend on mount

### v0.1.0
- Initial full-stack scaffold: Rust/Axum backend, React/Vite frontend, ElevenLabs TTS/STT, Claude LLM, WebSocket

---

## Quickstart

### Prerequisites

- Node.js 20+
- npm 10+
- Rust 1.80+ (`rustup` recommended)
- Postgres 15+ (local or Docker)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/CsageApplications/Project-Orion.git
cd Project-Orion
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in any values you need. For frontend-only development, the defaults in `frontend-react/.env` are sufficient to run the UI.

### 3. Run the frontend

```bash
cd frontend-react
npm install
npm run dev
```

The command center UI will be available at `http://localhost:3000`.

### 4. Run the backend

```bash
cd backend-rust
cp .env.example .env  # then fill in keys — see below
cargo run
```

Required keys in `backend-rust/.env`:

```env
LLM_PROVIDER=anthropic
LLM_MODEL=claude-3-5-sonnet-latest
ANTHROPIC_API_KEY=sk-ant-...

ELEVENLABS_API_KEY=...          # used for both TTS and STT
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB  # Adam (default)
```

The backend API will be available at `http://localhost:8080`.

Key endpoints:

```
GET  /health                  — health check
GET  /api/robot/status        — current robot state
POST /api/robot/command       — send a command (PATROL, DOCK, STOP, etc.)
POST /api/chat                — send a message to Orion (LLM response)
POST /api/tts                 — text → MP3 bytes (ElevenLabs)
POST /api/stt                 — audio bytes → transcript (ElevenLabs Scribe)
WS   /ws                      — WebSocket telemetry stream
```

### 5. Run a production build

```bash
cd frontend-react
npm run build
```

Output is written to `frontend-react/dist/`.

### Notes

- The frontend will show backend status as `OFFLINE` until the backend is running on `http://localhost:8080`.
- Postgres is optional for Phase 1 — the backend runs without a database connection (DB calls are commented out until needed).
- All environment variables are documented in `.env.example` at the root.
- Voice features require `ELEVENLABS_API_KEY` in `backend-rust/.env`. The same key is used for both TTS and STT — ensure both capabilities are enabled on the key in your ElevenLabs dashboard.
- Microphone access is required for STT. Browsers prompt for permission on first use.

---

## Voice Pipeline

Orion has a complete voice loop:

```
Microphone
    ↓  (MediaRecorder — webm/opus)
POST /api/stt  (ElevenLabs Scribe v1)
    ↓  transcript
POST /api/chat  (Anthropic Claude claude-3-5-sonnet-latest)
    ↓  reply text
POST /api/tts  (ElevenLabs eleven_turbo_v2_5, Adam voice)
    ↓  MP3 bytes
Web Audio API → speakers + waveform visualizer
```

- **STT**: `useVoiceInput` hook records mic via `MediaRecorder`, sends raw audio to `/api/stt`, fires transcript into the chat input
- **LLM**: Orion is prompted as a physically-present home robot with speakers — it understands room-level announcements, not just text chat
- **TTS**: Every Orion reply is automatically spoken aloud; the waveform visualizer reacts to real `AnalyserNode` frequency data
- **Tap to speak**: The center HUD panel toggles mic recording — tap to start, tap again to stop and send

---


Orion is designed to live in the home as a calm, intelligent, and useful assistant. The goal is not a toy or a gimmick — it is an embodied AI platform that can speak, listen, see, move, and eventually help with real-world tasks.

Long-term capabilities:

- Natural voice conversation
- Voice command understanding
- Physical movement around the home
- Personal assistant integrations (calendar, reminders, smart home)
- Expressive animated face
- Patrol, dock, follow, and cleaning modes
- Safety-first autonomous navigation

---

## Architecture

```
React Command Center
        ↓
Rust Backend (Orion Core)
        ↓
Postgres + pgvector
        ↓
Jetson Orin Nano (AI / Vision / ROS 2)
        ↓
ESP32 / STM32 (Real-time motor and sensor control)
        ↓
Motors · Servos · LEDs · Sensors · Camera · Audio
```

---

## System Components

| Component | Role |
|---|---|
| React + TypeScript | Command center UI (dashboard, controls, telemetry) |
| Rust + Axum | Backend control plane, APIs, WebSocket streaming |
| Postgres + pgvector | Conversation memory, telemetry, robot state |
| Jetson Orin Nano | Onboard AI, vision, speech processing, ROS 2 |
| ESP32 / STM32 | Real-time motor/servo control, sensors, emergency stop |
| ROS 2 | Robot middleware — perception, motion, audio, telemetry nodes |
| Autodesk Fusion | Mechanical CAD — chassis, head, mounts, enclosures |
| KiCad | PCB design — schematics, connectors, power, layouts |

---

## Repository Structure

```
orion/
├── README.md
├── PROJECT_MEMORY.md
├── docs/
│   ├── architecture.md
│   ├── hardware.md
│   ├── software.md
│   ├── roadmap.md
│   └── safety.md
├── frontend-react/
├── backend-rust/
├── robot-ros2/
├── firmware-esp32/
├── cad-fusion/
├── pcb-kicad/
└── experiments/
```

---

## Development Phases

| Phase | Name | Status |
|---|---|---|
| 0 | Planning and Architecture | Complete |
| 1 | Desktop AI Assistant | In Progress |
| 2 | Embodied Robot Head | Not Started |
| 3 | ROS 2 Integration | Not Started |
| 4 | Mobile Base | Not Started |
| 5 | Home Assistant Features | Not Started |
| 6 | Cleaning / Utility | Not Started |

---

## MVP

The first working prototype is a **desktop robot head** with:

- Wake word detection
- Voice input → Speech-to-text
- LLM response generation
- Text-to-speech output
- Animated OLED/LCD eyes
- 2-axis pan/tilt head movement while speaking
- Live telemetry streamed to the React dashboard

---

## Tech Stack

```
Frontend:        React · TypeScript · Tailwind CSS · WebSockets
Backend:         Rust · Axum · Tokio · SQLx
Database:        Postgres · pgvector
Robot Middleware: ROS 2
Robot AI Layer:  Python ROS 2 nodes
Firmware:        ESP32 / STM32
Mechanical CAD:  Autodesk Fusion
PCB Design:      KiCad
```

---

## Safety Principles

- Emergency stop always overrides everything
- Robot never moves blindly
- Avoids stairs, pets, and people
- Speed-limited indoors
- Risky physical actions require confirmation
- All commands and decisions are logged
- Low-risk: execute · Medium-risk: confirm · High-risk: block

---

## Status

Project Orion is currently in **Phase 1 — Desktop AI Assistant**.

| Component | Status |
|---|---|
| React command center (JARVIS HUD) | ✅ Complete — running on `localhost:3000` |
| Rust/Axum backend | ✅ Complete — API, WebSocket, LLM/TTS/STT |
| LLM integration | ✅ Complete — Anthropic Claude via `/api/chat` |
| ElevenLabs TTS | ✅ Complete — voice replies auto-spoken, waveform visualizer |
| ElevenLabs STT | ✅ Complete — mic input via `/api/stt`, tap to speak |
| Full voice loop | ✅ Complete — mic → STT → LLM → TTS → speakers |
| Postgres schema | Migrations written — pending DB setup |
| Robot hardware | Phase 2 |
| ROS 2 integration | Phase 3 |
