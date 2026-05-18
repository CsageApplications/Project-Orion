# Orion Carrier Board — Hardware Specification

**Version**: 0.1 (pre-schematic)  
**Status**: SPEC — not yet in KiCad  
**Target fab**: JLCPCB 2-layer, FR4, 1oz copper  

---

## 1. Purpose

The carrier board is the central PCB inside the Orion Head. It:

- Accepts main DC power input and generates all regulated rails
- Hosts or connects the Jetson Orin Nano (SO-DIMM or via ribbon)
- Breaks out Jetson I/O to on-board peripherals and connectors
- Interfaces with the STM32/RP2040 MCU for real-time servo and sensor control
- Provides the physical ORION-EX expansion port at the neck

---

## 2. Power Architecture

### Input
- **Connector**: XT30 or DC barrel jack (5.5/2.5mm), 12V nominal
- **Input range**: 9V – 15V (Li-ion 2S/3S or wall adapter)
- **Reverse polarity protection**: P-channel MOSFET or Schottky ideal diode

### Rails

| Rail | Voltage | Max Current | Load | Regulator |
|------|---------|-------------|------|-----------|
| SYS_5V | 5.0V | 5A | Jetson Orin Nano | TPS54540 or LMR36015 buck |
| SERVO_6V | 6.0V | 4A | Servos (pan/tilt + aux) | Separate buck, isolated ground star |
| SYS_3V3 | 3.3V | 1A | MCU, I2C peripherals, LEDs | LDO from SYS_5V |
| EXP_12V | 12V (passthrough) | 3A | Expansion port modules | Switched via load switch (TPS22965 or similar) |

**Notes:**
- SERVO_6V must be decoupled from Jetson logic supply — servos generate significant back-EMF noise
- EXP_12V switched off by default; MCU asserts enable line after module ID handshake
- Add 100µF bulk + 100nF ceramic near each rail output
- ESD protection (TVS array) on all external-facing connectors

---

## 3. Compute

### NVIDIA Jetson Orin Nano
- Interface: SO-DIMM 260-pin (standard Jetson form factor)
- Power: SYS_5V @ 5A minimum (Jetson spec requires clean 5V)
- Power sequencing: SYS_5V must be stable before Jetson POWER_EN asserted
- Carrier board must implement: USB-C for flash/debug, Ethernet (optional — via USB3 dongle or on-board RTL8153), microSD, CSI camera connector (22-pin FFC for IMX477 or Arducam)

### Camera
- **Connector**: 22-pin FPC/FFC (standard Pi HQ / IMX477 pinout)
- Interface: MIPI CSI-2 2-lane
- Located at: front of head, behind visor aperture
- Notes: Keep FFC route short and away from servo power traces

---

## 4. Real-Time MCU

### MCU Options (pick one)
| Option | Notes |
|--------|-------|
| **STM32F411** | Strong I2C/SPI/UART, DMA, FPU, 100MHz — good for servo PID |
| **RP2040** | PIO state machines great for WS2812 LEDs and servo PWM, cheaper, easier toolchain |

**Recommended**: RP2040 for first spin — simpler bring-up, MicroPython for fast iteration, move to STM32 if real-time demands require it.

### MCU Responsibilities
- PWM servo control (pan, tilt, + 4 aux channels via PCA9685 I2C expander)
- WS2812B LED string for ambient visor lighting
- I2C master to OLED eye displays (SSD1306 or SSD1351)
- UART bridge to Jetson (Orion Core command interface)
- Watchdog: if no heartbeat from Jetson in 2s → servo safe-park position

### Jetson ↔ MCU Interface
- **Physical**: UART (3.3V logic), 115200 baud minimum
- **Protocol**: Simple JSON or CBOR frames
  ```
  {"cmd": "servo", "id": 0, "angle": 45}
  {"cmd": "led", "r": 0, "g": 212, "b": 255}
  {"evt": "button", "id": 0}
  ```
- **Future**: upgrade to SPI @ 10MHz if latency becomes an issue

---

## 5. Connectors & Peripherals

| Connector | Type | Purpose |
|-----------|------|---------|
| J1 — Power In | XT30 or 5.5/2.5 barrel | Main 12V input |
| J2 — Jetson SO-DIMM | 260-pin SO-DIMM | Jetson Orin Nano |
| J3 — Camera | 22-pin FPC | MIPI CSI-2 camera |
| J4 — Mic Array | 2×5 header | I2S MEMS mic array (ReSpeaker or custom) |
| J5 — Speaker | JST-PH 2-pin | Class D amp output |
| J6 — Servo Pan | JST-SH 3-pin | Neck pan servo |
| J7 — Servo Tilt | JST-SH 3-pin | Neck tilt servo |
| J8 — Servo Aux 1-4 | JST-SH 3-pin ×4 | Future / expression servos |
| J9 — OLED Eyes | 4-pin I2C header | SSD1306/SSD1351 displays |
| J10 — WS2812 | JST-SH 3-pin | Visor ambient LED strip |
| J11 — ORION-EX | See expansion spec | Module expansion port |
| J12 — Debug UART | Tag-Connect TC2030 | MCU debug |
| J13 — USB-C | USB-C receptacle | Jetson flash/OTG |
| J14 — Status LEDs | On-board | Power good, Jetson boot, MCU heartbeat |

---

## 6. Mechanical

- **Form factor**: ~100mm × 80mm (fit inside head shell above neck)
- **Mounting**: 4× M3 standoffs at corners
- **Orientation**: Connectors facing down/rear toward neck
- **Jetson SO-DIMM**: angled slot, Jetson module lays flat above board
- **Height budget**: ~30mm total stack (board + Jetson + standoffs)

---

## 7. Open Questions (resolve before schematic)

- [ ] Jetson Orin Nano vs. Orin NX — NX has more TOPS but higher power draw
- [ ] RP2040 vs STM32F411 MCU choice
- [ ] Camera model: IMX477 (HQ) vs. Arducam IMX708 (AF, wider FOV)
- [ ] Mic array: ReSpeaker 4-mic hat (I2S) vs. custom MEMS layout
- [ ] Connector gender on ORION-EX expansion port (head-side = receptacle, module-side = plug)
- [ ] Battery vs. wall power only for v1

---

## 8. Reference Parts (preliminary)

| Part | Description | Package |
|------|-------------|---------|
| TPS54540 | 4A synchronous buck | HTSSOP-14 |
| LM3940 | 1A LDO 5V→3.3V | SOT-223 |
| TPS22965 | 5.5A load switch | SOT-23-6 |
| PCA9685 | 16-ch PWM servo driver | TSSOP-28 |
| RP2040 | Dual Cortex-M0+ MCU | QFN-56 |
| SN65HVD230 | CAN bus transceiver | SOIC-8 |
| PRTR5V0U2X | Dual TVS ESD protection | SOT-363 |
