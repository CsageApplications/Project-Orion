import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Torus, Text } from '@react-three/drei'
import * as THREE from 'three'

const CYAN   = '#00d4ff'
const AMBER  = '#f59e0b'
const VIOLET = '#7c3aed'

function OuterRing() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.z += delta * 0.2 })
  return (
    <Torus ref={ref} args={[2.45, 0.008, 16, 120]}>
      <meshBasicMaterial color={CYAN} transparent opacity={0.25} />
    </Torus>
  )
}

function OuterDashed() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.z -= delta * 0.08 })
  return (
    <Torus ref={ref} args={[2.62, 0.004, 16, 60]}>
      <meshBasicMaterial color={CYAN} transparent opacity={0.12} />
    </Torus>
  )
}

function MiddleRing() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.z -= delta * 0.38 })
  return (
    <Torus ref={ref} args={[1.72, 0.007, 16, 120]}>
      <meshBasicMaterial color={AMBER} transparent opacity={0.35} />
    </Torus>
  )
}

function InnerRing() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.z += delta * 0.65 })
  return (
    <Torus ref={ref} args={[1.1, 0.006, 16, 120]}>
      <meshBasicMaterial color={CYAN} transparent opacity={0.4} />
    </Torus>
  )
}

function VioletRing() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.z += delta * 0.15 })
  return (
    <Torus ref={ref} args={[1.95, 0.005, 16, 80]}>
      <meshBasicMaterial color={VIOLET} transparent opacity={0.3} />
    </Torus>
  )
}

function PulseDisk() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 1.6) * 0.035
      ref.current.scale.setScalar(s)
      ;(ref.current.material as THREE.MeshBasicMaterial).opacity =
        0.04 + Math.sin(clock.getElapsedTime() * 1.6) * 0.02
    }
  })
  return (
    <mesh ref={ref}>
      <circleGeometry args={[0.75, 64]} />
      <meshBasicMaterial color={CYAN} transparent opacity={0.05} />
    </mesh>
  )
}

function GlowCore() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime()
      ;(ref.current.material as THREE.MeshBasicMaterial).opacity = 0.06 + Math.sin(t * 0.8) * 0.04
    }
  })
  return (
    <mesh ref={ref}>
      <circleGeometry args={[2.0, 64]} />
      <meshBasicMaterial color={CYAN} transparent opacity={0.06} />
    </mesh>
  )
}

function OrionLabel() {
  return (
    <Text
      fontSize={0.28}
      color={CYAN}
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.28}
    >
      ORION
    </Text>
  )
}

function SubLabel() {
  return (
    <Text
      position={[0, -0.38, 0]}
      fontSize={0.13}
      color={CYAN}
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.22}
      fillOpacity={0.4}
    >
      AI · COMMAND CENTER
    </Text>
  )
}

function TickMarks() {
  const ticks = Array.from({ length: 48 }, (_, i) => {
    const angle = (i / 48) * Math.PI * 2
    const len = i % 4 === 0 ? 0.2 : i % 2 === 0 ? 0.1 : 0.06
    const r = 2.45
    const points = [
      new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0),
      new THREE.Vector3(Math.cos(angle) * (r + len), Math.sin(angle) * (r + len), 0),
    ]
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    const mat = new THREE.LineBasicMaterial({
      color: CYAN,
      transparent: true,
      opacity: i % 4 === 0 ? 0.75 : 0.2,
    })
    return new THREE.Line(geo, mat)
  })

  return (
    <group>
      {ticks.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  )
}

export default function HudRings() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 0, 6.2], fov: 52 }} dpr={[1, 2]}>
        <GlowCore />
        <OuterDashed />
        <TickMarks />
        <OuterRing />
        <VioletRing />
        <MiddleRing />
        <InnerRing />
        <PulseDisk />
        <OrionLabel />
        <SubLabel />
      </Canvas>
    </div>
  )
}
