"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  MeshTransmissionMaterial,
  PerformanceMonitor,
} from "@react-three/drei";
import { beamYAt, beams, layouts, type Point } from "./prism-layout";

/** Mutable values the DOM side (GSAP, pointer, scroll) writes and the frame loop reads. */
export type Rig = {
  source: number;
  beam0: number;
  beam1: number;
  beam2: number;
  scroll: number;
  px: number;
  py: number;
  motion: boolean;
};

type BeamKey = "source" | "beam0" | "beam1" | "beam2";

type SceneProps = {
  rig: RefObject<Rig>;
  wide: boolean;
  frameloop: "always" | "demand" | "never";
  onReady: () => void;
};

const INK = "#06070b";
const PAPER = "#f2f1ec";
const BASE_ROTATION = { x: 0.16, y: -0.62 };

const beamVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// A beam is a plane: a hot core and a soft halo across it, a fade-in tail and a soft tip along it.
const beamFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uTail;
uniform float uTime;
varying vec2 vUv;
void main() {
  float d = abs(vUv.y - 0.5) * 2.0;
  float core = exp(-d * d * 70.0);
  float halo = exp(-d * d * 7.0) * 0.3;
  float tail = smoothstep(0.0, uTail, vUv.x);
  float tip = 1.0 - smoothstep(0.86, 1.0, vUv.x);
  float pulse = 0.92 + 0.08 * sin(vUv.x * 22.0 - uTime * 2.4);
  float alpha = (core + halo) * tail * tip * pulse;
  gl_FragColor = vec4(mix(uColor, vec3(1.0), core * 0.5), alpha);
  #include <colorspace_fragment>
}`;

function Beam({
  from,
  to,
  color,
  thickness,
  tail,
  rig,
  progressKey,
}: {
  from: Point;
  to: Point;
  color: string;
  thickness: number;
  tail: number;
  rig: RefObject<Rig>;
  progressKey: BeamKey;
}) {
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uTail: { value: tail },
      uTime: { value: 0 },
    }),
    [color, tail],
  );
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  const angle = Math.atan2(to.y - from.y, to.x - from.x);

  useFrame((state) => {
    const g = group.current;
    const r = rig.current;
    if (!g || !r) return;
    const progress = r[progressKey];
    // Grow along the beam from its origin: the group scales, the plane sits at x 0..1 inside it.
    g.scale.set(Math.max(length * progress, 1e-4), thickness, 1);
    g.visible = progress > 0.001;
    if (r.motion && material.current) material.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group ref={group} position={[from.x, from.y, 0]} rotation={[0, 0, angle]} visible={false}>
      <mesh position={[0.5, 0, 0]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={beamVertex}
          fragmentShader={beamFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

const glowFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float alpha = pow(clamp(1.0 - d, 0.0, 1.0), 2.2) * uIntensity;
  gl_FragColor = vec4(uColor, alpha);
  #include <colorspace_fragment>
}`;

/**
 * Soft light behind the prism. The glass refracts it, which is what makes it read as glass
 * on a dark stage instead of a black solid; around the edges it reads as scattered light.
 */
function Glow({ position, size }: { position: Point; size: number }) {
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color("#d9d4ff") }, uIntensity: { value: 0.32 } }),
    [],
  );
  return (
    <mesh position={[position.x, position.y, -1.4]} scale={size}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={beamVertex}
        fragmentShader={glowFragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

/** A triangular prism with rounded vertical edges, so the edges catch the environment light. */
function buildPrismGeometry() {
  const corners = [0, 1, 2].map((i) => {
    const a = Math.PI / 2 + (i * Math.PI * 2) / 3;
    return new THREE.Vector2(Math.cos(a), Math.sin(a));
  });
  const shape = new THREE.Shape();
  corners.forEach((corner, i) => {
    const prev = corners[(i + 2) % 3];
    const next = corners[(i + 1) % 3];
    const start = corner.clone().lerp(prev, 0.12);
    const end = corner.clone().lerp(next, 0.12);
    if (i === 0) shape.moveTo(start.x, start.y);
    else shape.lineTo(start.x, start.y);
    shape.quadraticCurveTo(corner.x, corner.y, end.x, end.y);
  });
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 1.5,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.06,
    bevelSegments: 5,
    curveSegments: 10,
  });
  geometry.center();
  return geometry;
}

function Prism({
  position,
  radius,
  rig,
  wide,
}: {
  position: Point;
  radius: number;
  rig: RefObject<Rig>;
  wide: boolean;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => buildPrismGeometry(), []);
  const background = useMemo(() => new THREE.Color(INK), []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    const m = mesh.current;
    const r = rig.current;
    if (!m || !r) return;
    if (!r.motion) {
      m.rotation.set(BASE_ROTATION.x, BASE_ROTATION.y, 0);
      return;
    }
    const idle = Math.sin(state.clock.elapsedTime * 0.32) * 0.07;
    const targetY = BASE_ROTATION.y + idle + r.scroll * 0.9 + r.px * 0.14;
    const targetX = BASE_ROTATION.x + r.py * 0.1;
    m.rotation.y = THREE.MathUtils.damp(m.rotation.y, targetY, 3.5, delta);
    m.rotation.x = THREE.MathUtils.damp(m.rotation.x, targetX, 3.5, delta);
  });

  return (
    <mesh ref={mesh} geometry={geometry} position={[position.x, position.y, 0]} scale={radius}>
      <MeshTransmissionMaterial
        background={background}
        samples={wide ? 8 : 5}
        resolution={wide ? 768 : 384}
        backside={wide}
        backsideThickness={0.4}
        thickness={0.45}
        roughness={0.03}
        ior={1.5}
        chromaticAberration={1}
        anisotropicBlur={0.08}
        distortion={0.05}
        distortionScale={0.4}
        temporalDistortion={0}
        envMapIntensity={1.6}
        color="#ffffff"
      />
    </mesh>
  );
}

function LightPath({ rig, wide }: { rig: RefObject<Rig>; wide: boolean }) {
  const viewport = useThree((s) => s.viewport);
  const layout = wide ? layouts.wide : layouts.narrow;
  const { width: w, height: h } = viewport;
  const toWorld = (p: Point): Point => ({ x: p.x * w, y: p.y * h });

  const prism = toWorld(layout.prism);
  const radius = Math.min(layout.radius.ofHeight * h, layout.radius.ofWidth * w);

  return (
    <>
      <Beam
        from={toWorld(layout.source)}
        to={prism}
        color={PAPER}
        thickness={h * 0.036}
        tail={0.4}
        rig={rig}
        progressKey="source"
      />
      {beams.map((beam, i) => (
        <Beam
          key={beam.unit}
          from={prism}
          to={toWorld({ x: layout.exitX, y: beamYAt(layout, beam, layout.exitX) })}
          color={beam.color}
          thickness={h * 0.03}
          tail={0.06}
          rig={rig}
          progressKey={`beam${i}` as BeamKey}
        />
      ))}
      <Glow position={prism} size={radius * 5} />
      <Prism position={prism} radius={radius} rig={rig} wide={wide} />
    </>
  );
}

/** Under frameloop="demand" nothing repaints by itself; render the first frames explicitly. */
function SettleFrames() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let frames = 0;
    let id = requestAnimationFrame(function tick() {
      invalidate();
      if (++frames < 12) id = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(id);
  }, [invalidate]);
  return null;
}

export default function PrismScene({ rig, wide, frameloop, onReady }: SceneProps) {
  const [dpr, setDpr] = useState<number | [number, number]>([1, 1.75]);

  return (
    <Canvas
      frameloop={frameloop}
      dpr={dpr}
      camera={{ position: [0, 0, 8], fov: 30, near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={onReady}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr([1, 1.75])}
        onFallback={() => setDpr(1)}
        flipflops={3}
      />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={5} position={[0, 4, 3]} rotation-x={Math.PI / 2} scale={[10, 1.5, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[0, 0, 6]} scale={[4, 4, 1]} />
        <Lightformer form="rect" intensity={2.6} color="#a99aff" position={[-5, 0.5, 1]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={2.6} color="#c6ff3d" position={[5, -0.5, 1]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="ring" intensity={3} color="#ff946e" position={[0, -3, 4]} scale={2} />
      </Environment>
      <LightPath rig={rig} wide={wide} />
      {frameloop === "demand" && <SettleFrames />}
    </Canvas>
  );
}
