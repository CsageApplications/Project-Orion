# ORION-EX Expansion Connector — Specification

**Version**: 0.1  
**Status**: SPEC — not yet finalized  
**Connector designation**: J11 on carrier board  

---

## 1. Overview

ORION-EX is the neck-mount expansion interface between the Orion Head (host) and interchangeable hardware modules (vacuum base, mobility base, arm, etc.).

Design goals:
- **Robust**: survives repeated attach/detach, mechanical stress from module weight
- **Safe**: module cannot draw power until the host has verified its identity
- **Extensible**: software capability contract negotiated over the ID bus before operation
- **Simple to implement**: third-party or DIY modules can implement the interface without proprietary silicon

---

## 2. Physical Connector

### Recommended connector family
**Amphenol AT / TE Connectivity DT series** (automotive-grade circular) or **Molex Mini-Fit Jr.** (robust, locking, hobby-accessible).

**For v1 prototyping**: Molex Mini-Fit Jr. 12-pin (2×6), TE Connectivity part or equivalent from LCSC.

| Property | Value |
|----------|-------|
| Pin count | 12 |
| Mating cycles | ≥ 500 |
| Current rating | Power pins: 8.5A / signal pins: 3A |
| Locking | Yes — positive latch |
| IP rating | IP44 target (splash resistant) |
| Head side | Receptacle (female) |
| Module side | Plug (male) |

---

## 3. Pinout

| Pin | Name | Direction | Voltage | Description |
|-----|------|-----------|---------|-------------|
| 1 | PWR_12V_A | Host → Module | 12V | Main power, up to 3A |
| 2 | PWR_12V_B | Host → Module | 12V | Main power (parallel for current sharing) |
| 3 | GND_A | — | 0V | Ground return |
| 4 | GND_B | — | 0V | Ground return (parallel) |
| 5 | CAN_H | Bidirectional | — | CAN bus high (ORION-EX bus) |
| 6 | CAN_L | Bidirectional | — | CAN bus low (ORION-EX bus) |
| 7 | ID_1W | Bidirectional | 3.3V | 1-Wire module identity bus (DS2431 or similar EEPROM) |
| 8 | PWR_EN | Host → Module | 3.3V | Power enable (host asserts HIGH after ID verified) |
| 9 | USB_D+ | Bidirectional | — | USB 2.0 data+ (reserved, optional for complex modules) |
| 10 | USB_D- | Bidirectional | — | USB 2.0 data- (reserved, optional for complex modules) |
| 11 | UART_TX | Host → Module | 3.3V | Auxiliary UART (debug / simple modules) |
| 12 | UART_RX | Module → Host | 3.3V | Auxiliary UART |

**Notes:**
- Pin 1+2 and 3+4 are paralleled — use both for any module drawing >3A
- CAN bus is the primary command/telemetry channel (see Section 5)
- USB pins are reserved for v1, unpopulated on initial boards
- All signal pins: 3.3V logic, 5V tolerant inputs recommended

---

## 4. Power Sequencing

```
Module plugged in
       │
       ▼
Host detects plug via mechanical switch (limit switch or hall sensor on connector)
       │
       ▼
Host reads module EEPROM over ID_1W (1-Wire)
       │
       ├─ EEPROM not found or CRC fail → ABORT, log error, no power
       │
       ▼
Host validates capability contract (see Section 6)
       │
       ├─ Unknown module type or unsafe config → ABORT
       │
       ▼
Host asserts PWR_EN HIGH
       │
       ▼
Module receives 12V, boots its MCU
       │
       ▼
Module announces readiness on CAN bus: {"module": "vacuum", "state": "ready"}
       │
       ▼
Normal operation
```

**Power-off sequence** (reverse): Host de-asserts PWR_EN, waits for CAN bus silence, then power removed.

---

## 5. CAN Bus Configuration

| Parameter | Value |
|-----------|-------|
| Standard | CAN 2.0B |
| Baud rate | 500 kbit/s |
| Transceiver | SN65HVD230 (3.3V) on both host and module |
| Termination | 120Ω at host end (carrier board); module end optionally terminated |
| Max nodes | 8 modules (theoretical), 2-3 practical for head platform |

### CAN Frame ID allocation

| ID Range | Owner | Purpose |
|----------|-------|---------|
| 0x001 – 0x00F | Host | Commands to all modules (broadcast) |
| 0x010 – 0x01F | Host | Commands to specific module by slot |
| 0x100 – 0x1FF | Module | Telemetry / status from module |
| 0x200 – 0x2FF | Module | Sensor data from module |
| 0x7FF | Any | Heartbeat / keepalive |

---

## 6. Module Identity & Capability Contract

Every ORION-EX module must contain a **DS2431** (or compatible) 1-Wire EEPROM with the following 64-byte capability record:

```json
{
  "orion_ex_version": "1.0",
  "module_type": "vacuum",
  "module_id": "ORN-MOD-VAC-001",
  "manufacturer": "DIY",
  "hw_revision": "A",
  "capabilities": [
    "vacuum_room",
    "spot_clean",
    "return_to_dock",
    "report_bin_status"
  ],
  "power_max_ma": 2000,
  "risk_level": "medium",
  "requires_confirmation": false,
  "safe_park_cmd": "0x010:STOP"
}
```

The host reads this record, validates the CRC, and cross-references `module_type` against its internal capability registry before enabling power.

**Unknown module types are denied power by default.** New module types must be added to the host's allow-list via a firmware update.

---

## 7. Emergency Stop

Any component can broadcast CAN ID `0x001` with payload `ESTOP`:

```
CAN ID: 0x001
Data:   0x45 0x53 0x54 0x4F 0x50  ("ESTOP")
```

On receipt, all modules must immediately enter safe-park state and halt motion. Host de-asserts PWR_EN within 500ms if module does not acknowledge.

---

## 8. Module Developer Checklist

To implement an ORION-EX compatible module:

- [ ] Include DS2431 1-Wire EEPROM with valid capability record
- [ ] Include SN65HVD230 CAN transceiver (or compatible 3.3V part)
- [ ] Connect PWR_EN to an enable pin on your power regulator (do not power your logic from 12V until PWR_EN asserts)
- [ ] Implement CAN heartbeat at 1Hz (CAN ID `0x7FF`, 1-byte payload = module slot)
- [ ] Implement ESTOP handler — all actuators to safe state within 100ms of receiving ESTOP frame
- [ ] Provide safe-park command in capability record

---

## 9. Open Questions

- [ ] Finalize connector family (Molex Mini-Fit Jr. vs. something more industrial)
- [ ] Mechanical keying — add a polarizing rib so modules can't be inserted backwards
- [ ] Cable length limit for CAN bus stub — keep under 300mm for 500 kbit/s
- [ ] 1-Wire vs I2C for module EEPROM — 1-Wire simpler (one pin), I2C allows more complex auth chip
- [ ] Whether to add a dedicated 5V rail for module logic (avoids needing a buck on every module)
