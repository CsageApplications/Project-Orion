# PCB — KiCad Projects

KiCad project files for all Orion Head circuit boards. Each subdirectory is a self-contained KiCad project.

## Boards

| Directory | Board | Status | Layers | Size |
|-----------|-------|--------|--------|------|
| `orion-carrier/` | Orion Carrier Board | DESIGN | 2 | 100×80mm |
| `orion-face/` | Face Servo Board | CONCEPT | 2 | ~60×40mm |
| `orion-expansion-dock/` | ORION-EX Dock (bench test) | CONCEPT | 2 | TBD |

## Directory Layout (per board)

```
orion-carrier/
├── orion-carrier.kicad_pro    # KiCad project file
├── orion-carrier.kicad_sch    # Schematic
├── orion-carrier.kicad_pcb    # Layout
├── fp-lib-table               # Footprint library table
├── sym-lib-table              # Symbol library table
├── gerbers/                   # Production Gerber files (generated, not edited)
│   └── .gitkeep
├── bom/                       # Bill of materials exports
│   └── .gitkeep
└── fab-notes/                 # JLCPCB fabrication notes, assembly pick/place CSV
    └── .gitkeep
```

## Workflow

1. Design schematic → run ERC
2. Assign footprints → generate netlist
3. Layout PCB → run DRC (use JLCPCB 2-layer design rules)
4. Export Gerbers + drill files to `gerbers/`
5. Export BOM + centroid file to `bom/` + `fab-notes/`
6. Zip `gerbers/` and upload to JLCPCB for quote

## KiCad Setup

- KiCad 7 or 8
- JLCPCB design rules file: [jlcpcb.com/help/article/98](https://jlcpcb.com/help/article/98)
- Recommended symbol libs: KiCad standard + custom Orion library (TBD)

## Gitignore

KiCad backup files (`*-backups/`, `*.kicad_prl`, `fp-info-cache`) are excluded via `.gitignore`.
