import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Torus, Text } from '@react-three/drei'
import * as THREE from 'three'

const CYAN = '#00d4ff'
const AMBER = '#f59e0b'

function OuterRing() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.25
  })
  return (
    <Torus ref={ref} args={[2.6, 0.012, 6, 120]}>
      <meshBasicMaterial color={CYAN} transparent opacity={0.55} />
    </Torus>
  )
}

function MiddleRing() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z -= delta * 0.4
  })
  return (
    <Torus ref={ref} args={[2.1, 0.008, 6, 120]}>
      <meshBasicMaterial color={AMBER} transparent opacity={0.4} />
    </Torus>
  )
}

function InnerRing() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.7
  })
  return (
    <Torus ref={ref} args={[1.55, 0.006, 6, 120]}>
      <meshBasicMaterial color={CYAN} transparent opacity={0.35} />
    </Torus>
  )
}

function PulseDisk() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 1.8) * 0.04
      ref.current.scale.setScalar(s)
    }
  })
  return (
    <mesh ref={ref}>
      <circleGeometry args={[0.9, 64]} />
      <meshBasicMaterial color={CYAN} transparent opacity={0.06} />
    </mesh>
  )
}

function OrionLabel() {
  return (
    <Text
      fontSize={0.32}
      color={CYAN}
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.22}
    >
      ORION
    </Text>
  )
}

function TickMarks() {
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const angle = (i / 36) * Math.PI * 2
    const len = i % 3 === 0 ? 0.18 : 0.08
    const r = 2.6
    const points = [
      new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0),
      new THREE.Vector3(Math.cos(angle) * (r + len), Math.sin(angle) * (r + len), 0),
    ]
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    const mat = new THREE.LineBasicMaterial({
      color: CYAN,
      transparent: true,
      opacity: i % 3 === 0 ? 0.7 : 0.25,
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
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.1} />
        <TickMarks />
        <OuterRing />
        <MiddleRing />
        <InnerRing />
        <PulseDisk />
        <OrionLabel />
      </Canvas>
    </div>
  )
}
