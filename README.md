# Orion

A personal AI robot assistant for the home.

Orion is a full-stack robotics platform that combines mechanical design, electronics, embedded firmware, AI inference, backend services, and a React command center into a single cohesive robot.

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
cp .env.example .env  # then fill in OPENAI_API_KEY or ANTHROPIC_API_KEY
cargo run
```

The backend API will be available at `http://localhost:8080`.

Key endpoints:

```
GET  /health                  — health check
GET  /api/robot/status        — current robot state
POST /api/robot/command       — send a command (PATROL, DOCK, STOP, etc.)
POST /api/chat                — send a message to Orion
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

---

## Vision

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
| React command center (JARVIS HUD) | Complete — running on `localhost:3000` |
| Rust/Axum backend | Scaffolded — API, WebSocket, LLM gateway |
| LLM integration | Implemented — requires API key to activate |
| Postgres schema | Migrations written — pending DB setup |
| Robot hardware | Phase 2 |
| ROS 2 integration | Phase 3 |
