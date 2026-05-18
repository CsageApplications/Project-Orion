# Orion Hardware

This directory contains all hardware design files, specifications, and documentation for the Orion robot head platform.

## Directory Structure

```
hardware/
├── README.md                        ← this file
├── specs/
│   ├── carrier-board.md             ← Orion Head carrier board specification
│   ├── expansion-connector.md       ← Module expansion port specification
│   └── face-board.md                ← Expression / display board specification (TBD)
├── pcb-kicad/
│   ├── orion-carrier/               ← Carrier board KiCad project
│   ├── orion-face/                  ← Face/expression board KiCad project
│   └── orion-expansion-dock/        ← Neck expansion dock board KiCad project
└── cad-fusion/
    └── orion-head/                  ← Fusion 360 mechanical design files
```

## Boards Overview

| Board | Purpose | Status |
|-------|---------|--------|
| Carrier Board | Power, Jetson breakout, servo drivers, expansion port | `SPEC` |
| Face Board | OLED eye displays, ambient LEDs, touch sensing | `CONCEPT` |
| Expansion Dock | Module interface connector, power switching, ID bus | `SPEC` |

## Key Design Decisions

- **Compute**: NVIDIA Jetson Orin Nano (5V/4A)
- **MCU**: STM32F4 or RP2040 for real-time servo/sensor control
- **Module bus**: CAN bus (ORION-EX spec) — see `specs/expansion-connector.md`
- **Servo power**: Isolated 6V rail, separate from Jetson logic
- **Fabrication target**: JLCPCB 2-layer, LCSC BOM, PCBA for SMD passives
