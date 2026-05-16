# PROJECT_MEMORY.md

# Orion Robotics Project Memory

## Project Name

**Orion**

Alternative naming options:
- Orion Core
- Orion OS
- Orion Command Center
- Orion Robotics

Working concept: **a personal AI robot assistant for the home**.

---

## Project Vision

Orion is a home robotics platform that combines hardware, embedded systems, AI, backend services, and a polished user interface.

The long-term vision is to build a robot that can:

- Talk naturally with the user
- Understand voice commands
- Move around the home
- Provide personal assistant capabilities
- Integrate with smart home systems
- Display expressive personality
- Eventually help with physical tasks such as cleaning, patrolling, carrying small objects, or interacting with home devices

The initial goal is not to build a full humanoid robot. The realistic first version is a **desktop or mobile assistant robot** that can speak, listen, see, animate, and be controlled from a web UI.

---

## Why This Project Exists

Pure software-only projects have started to feel too easy and less satisfying. Orion is intended to restore the challenge by combining:

- Mechanical design
- Electronics
- PCB design
- Embedded systems
- Robotics
- AI/LLMs
- Backend systems
- React UI
- Product design

This project should feel physically rewarding: code causes motors to move, eyes to animate, audio to play, sensors to update, and the robot to respond in the real world.

---

## Core Concept

Orion is a robot platform composed of:

```text
Robot body
+ onboard AI/audio/vision
+ Rust backend orchestration server
+ React command center UI
+ ROS 2 robot software
+ microcontroller-based motor/sensor control
```

---

## High-Level Architecture

```text
React Command Center
        ↓
Rust Backend / Orion Core
        ↓
Postgres + pgvector
        ↓
Jetson Orin Nano
        ↓
ROS 2 Nodes
        ↓
ESP32 / STM32 Microcontroller
        ↓
Motors, Servos, LEDs, Sensors, Camera, Audio
```

---

## Main System Components

### 1. React Command Center

The React UI acts as the home screen for interacting with Orion.

Potential features:

- Ask Orion chat box
- Voice interaction panel
- Live camera feed
- Robot battery status
- Current task state
- Current location or room
- Sensor health
- Conversation history
- Logs and event stream
- Command buttons:
  - Patrol
  - Dock
  - Clean
  - Follow me
  - Stop
  - Sleep
- Smart home controls
- System configuration

Recommended stack:

```text
React
TypeScript
Tailwind CSS
WebSockets
REST API
```

---

### 2. Rust Backend — Orion Core

The Rust backend acts as the reliable control plane.

Recommended stack:

```text
Rust
Axum
Tokio
SQLx
Postgres
pgvector
WebSockets
MQTT or ROS 2 bridge
```

Backend responsibilities:

- User authentication
- REST APIs
- WebSocket streaming
- Robot command queue
- Robot state management
- Telemetry ingestion
- Conversation history
- Memory storage
- LLM orchestration gateway
- Safety rules
- Task planning coordination
- Smart home integrations
- Audit/event logs

Rust is a strong fit for:

- Reliable long-running services
- Low-latency APIs
- WebSocket streaming
- State management
- Safety-critical command validation
- Telemetry pipelines

---

### 3. Jetson Orin Nano — Robot AI Computer

The NVIDIA Jetson Orin Nano is the robot’s onboard AI computer.

Important distinction:

```text
Jetson Orin Nano = AI computer / robot brain
ESP32 or STM32 = microcontroller for real-time hardware control
```

Use Jetson for:

- Computer vision
- Object detection
- Face/person detection
- Camera processing
- Local AI inference
- Speech processing
- Wake word processing
- ROS 2 nodes
- Robot behavior planning

---

### 4. ESP32 or STM32 — Microcontroller Layer

The microcontroller handles low-level real-time control.

Use ESP32/STM32 for:

- Motor control
- Servo control
- Wheel encoders
- Ultrasonic sensors
- Time-of-flight sensors
- LEDs
- Emergency stop handling
- Basic sensor polling
- Low-level timing-sensitive operations

The Jetson should not directly manage every motor/sensor timing detail. It should send high-level commands to the microcontroller.

Example:

```text
Jetson: "turn head 30 degrees left"
ESP32: generates servo PWM and confirms position
```

---

### 5. ROS 2 — Robot Software Architecture

ROS 2 provides the robotics middleware that connects sensors, movement, perception, and behavior.

Possible ROS 2 nodes:

- camera_node
- microphone_node
- speech_to_text_node
- text_to_speech_node
- llm_agent_node
- face_detection_node
- motion_controller_node
- navigation_node
- battery_state_node
- safety_monitor_node
- telemetry_publisher_node

Example ROS 2 flow:

```text
Microphone captures audio
        ↓
Speech-to-text node converts audio to text
        ↓
LLM agent node decides response/action
        ↓
Text-to-speech node generates audio
        ↓
Motion controller animates head/eyes
        ↓
Speaker plays response
```

---

## Hardware Design Toolchain

### Fusion

Use **Autodesk Fusion** for mechanical CAD.

Fusion is responsible for:

- Chassis
- Enclosure
- Head design
- Servo mounts
- Wheel brackets
- Sensor mounts
- Camera placement
- Battery compartment
- Internal component layout
- 3D printing exports

Outputs:

```text
STL files for 3D printing
STEP files for mechanical sharing
Assembly models
Renderings
```

---

### KiCad

Use **KiCad** for electronics and PCB design.

KiCad is responsible for:

- Schematics
- PCB layout
- Connector pinouts
- Power regulation
- Sensor/motor headers
- Battery charging circuits
- Status LEDs
- Board visualization
- Gerber files for fabrication

Outputs:

```text
Gerber files
Schematics
PCB layout
3D board model
Bill of materials
```

---

### Fusion + KiCad Integration

The mechanical and electronics designs should be checked together.

Workflow:

```text
Design robot body in Fusion
Design PCB in KiCad
Export PCB 3D model
Import PCB into Fusion
Verify board fit, mounting holes, cable clearance, and enclosure spacing
```

This prevents common hardware mistakes like:

- PCB does not fit inside enclosure
- USB/power ports are blocked
- Mounting holes do not align
- Wires have no clearance
- Servos collide with the shell
- Battery is inaccessible

---

## Recommended Initial MVP

Build a desktop assistant robot head before attempting full mobility.

### MVP Features

The first working prototype should:

1. Wake on voice command
2. Listen to the user
3. Convert speech to text
4. Send the text to an LLM
5. Generate a response
6. Speak the response aloud
7. Move its head while speaking
8. Show animated OLED/display eyes
9. Stream telemetry to the React dashboard

This version does not need to clean the house yet. The goal is to create a compelling embodied AI assistant.

---

## MVP Hardware

Possible components:

```text
NVIDIA Jetson Orin Nano or Raspberry Pi 5
ESP32 or STM32
USB microphone or mic array
Small speaker
OLED or LCD display for eyes
2-axis pan/tilt servo setup
Camera
Battery or wall power
3D printed head/enclosure
Basic status LEDs
```

---

## MVP Software Stack

```text
Frontend: React + TypeScript + Tailwind
Backend: Rust + Axum + Tokio
Database: Postgres + pgvector
Realtime: WebSockets
Robot middleware: ROS 2
Robot AI layer: Python ROS 2 nodes
Microcontroller firmware: ESP32 or STM32
Mechanical CAD: Fusion
PCB design: KiCad
```

---

## Possible Repository Structure

```text
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
│   └── README.md
├── backend-rust/
│   └── README.md
├── robot-ros2/
│   └── README.md
├── firmware-esp32/
│   └── README.md
├── cad-fusion/
│   └── README.md
├── pcb-kicad/
│   └── README.md
└── experiments/
    └── README.md
```

---

## Development Phases

### Phase 0 — Planning and Architecture

Goals:

- Define project scope
- Pick initial hardware
- Create repo
- Create architecture docs
- Create system diagram
- Define MVP
- Choose development environment

Deliverables:

- PROJECT_MEMORY.md
- README.md
- Architecture diagram
- Initial BOM
- Repo structure

---

### Phase 1 — Desktop AI Assistant

Goals:

- Build stationary voice assistant
- Connect React UI to Rust backend
- Connect backend to LLM
- Add WebSocket streaming
- Store conversations

Deliverables:

- React command center
- Rust API
- LLM chat endpoint
- Conversation memory
- Basic UI dashboard

---

### Phase 2 — Embodied Robot Head

Goals:

- Add physical robot head
- Add servos
- Add animated eyes
- Add microphone and speaker
- Add camera
- Control physical expression

Deliverables:

- 3D printed head
- Servo firmware
- Eye animations
- Speech-to-text
- Text-to-speech
- Head movement while speaking

---

### Phase 3 — ROS 2 Integration

Goals:

- Introduce ROS 2 nodes
- Separate perception, motion, speech, and behavior
- Bridge backend commands to robot runtime

Deliverables:

- ROS 2 workspace
- Motion node
- Audio node
- Camera node
- Telemetry node
- Backend-to-robot bridge

---

### Phase 4 — Mobile Base

Goals:

- Add movement
- Add battery
- Add sensors
- Add basic obstacle avoidance
- Add manual driving from React UI

Deliverables:

- Mobile chassis
- Motor controller firmware
- Drive controls
- Battery telemetry
- Emergency stop
- Basic local navigation

---

### Phase 5 — Home Assistant Features

Goals:

- Add calendar/email integrations
- Add smart home integrations
- Add user-specific memory
- Add scheduled routines
- Add patrol mode

Deliverables:

- Personal assistant workflows
- Smart home control
- Patrol task
- Memory system
- Notification system

---

### Phase 6 — Cleaning / Utility

Goals:

- Integrate with cleaning behavior
- Consider robot vacuum base or custom cleaning module
- Add docking behavior

Deliverables:

- Cleaning mode
- Docking mode
- Room-specific commands
- More advanced navigation

---

## Product Personality

Orion should feel:

- Useful
- Calm
- Intelligent
- Slightly futuristic
- Not annoying
- Not gimmicky
- More like a personal operator than a toy

Possible personality direction:

```text
Calm technical assistant with subtle humor.
```

---

## Example Commands

```text
"Orion, summarize my schedule today."

"Orion, start patrol mode."

"Orion, show me the garage camera."

"Orion, dock yourself."

"Orion, explain this architecture diagram."

"Orion, remind me what I was working on."

"Orion, turn on the office lights."

"Orion, come to the kitchen."

"Orion, stop."
```

---

## Safety Principles

Orion should always prioritize safety.

Initial rules:

- Emergency stop must always override everything
- Robot should not move blindly
- Robot should avoid stairs
- Robot should avoid pets and people
- Robot should limit speed indoors
- Robot should never execute risky physical actions without confirmation
- Robot should log important decisions
- Robot should distinguish between conversation and action commands

Possible action policy:

```text
Low-risk command: execute immediately
Medium-risk command: confirm first
High-risk command: block
```

---

## Important Design Decisions

### Rust Backend

Decision: use Rust for the backend control plane.

Reason:

- Reliable
- Fast
- Strong type safety
- Good for WebSockets and state management
- Fits the user’s interest in Rust
- More satisfying than another simple Python backend

---

### Python for ROS 2 / AI Experiments

Decision: use Python where robotics and AI tooling is richer.

Reason:

- Faster experimentation
- Better ROS 2 examples
- Better AI ecosystem
- Easier computer vision prototyping

---

### Jetson + Microcontroller Split

Decision: use Jetson for AI/perception and ESP32/STM32 for real-time control.

Reason:

- Jetson is powerful but not ideal for precise real-time motor control
- Microcontrollers are better for direct hardware timing
- Clean separation between high-level intelligence and low-level actuation

---

### Fusion + KiCad

Decision: use Fusion for mechanical design and KiCad for PCB design.

Reason:

- Fusion handles 3D mechanical design and assemblies
- KiCad handles open-source PCB design
- Together they allow mechanical/electrical fit validation before fabrication

---

## Open Questions

- Should the first prototype use Jetson Orin Nano or Raspberry Pi 5?
- Should Orion start as a desktop robot or mobile base?
- Should the mobile base be custom-built or based on an existing robot vacuum?
- Should the UI be web-first or iOS-first?
- Should voice processing be cloud-based, local, or hybrid?
- Should the first robot have a display face, physical eyes, or both?
- What sensors are required for safe indoor navigation?
- What level of autonomy is realistic for v1?

---

## Near-Term Next Steps

1. Create GitHub repository
2. Add this PROJECT_MEMORY.md
3. Create README.md
4. Pick MVP hardware
5. Sketch architecture diagram
6. Create React command center shell
7. Create Rust Axum backend shell
8. Add WebSocket telemetry endpoint
9. Build first LLM chat endpoint
10. Prototype animated eyes on a display
11. Prototype servo head movement
12. Connect voice input/output
13. Start Fusion model for robot head
14. Start simple KiCad board planning

---

## Suggested Initial Bill of Materials

Early prototype:

```text
NVIDIA Jetson Orin Nano or Raspberry Pi 5
ESP32 development board
USB microphone or mic array
Small speaker
OLED/LCD display
2x servos for pan/tilt head
Camera module or USB camera
Breadboard/jumper wires
5V power supply
Basic battery pack
3D printer filament
Screws/standoffs
Emergency stop button
```

---

## Long-Term Vision

Orion can eventually become:

- A personal AI home assistant
- A robotics portfolio project
- A platform for experimenting with embodied AI
- A showcase for Rust + React + ROS 2 + hardware integration
- A bridge between R!O1/R!VAL-style software intelligence and real-world robotic embodiment

The ultimate goal is to build something that feels alive enough to be fun, useful enough to keep improving, and technically deep enough to remain challenging for years.
