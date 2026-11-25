import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { MoodKey } from '../../data/anibeatsData';

interface HeroSculpture3DProps {
  selectedMood: MoodKey;
  activeWorld: 'anime' | 'playlists' | 'cars' | 'travel';
}

const WORLD_ACCENTS: Record<HeroSculpture3DProps['activeWorld'], string> = {
  anime: '#e11d48',
  playlists: '#10b981',
  cars: '#2563eb',
  travel: '#0891b2',
};

const MOOD_SPEED: Record<MoodKey, number> = {
  all: 1.0,
  hype: 1.75,
  workout: 2.0,
  'late-night': 0.85,
  chill: 0.55,
  sad: 0.4,
};

function createVinylTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;

  // Deep obsidian vinyl base
  ctx.fillStyle = '#0c0c10';
  ctx.fillRect(0, 0, size, size);

  // Fine concentric micro-grooves
  for (let r = 178; r < 496; r += 3) {
    const shade = r % 9 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.028)';
    ctx.strokeStyle = shade;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Subtle track band dividers
  [245, 325, 415].forEach((r) => {
    ctx.strokeStyle = 'rgba(148,163,184,0.18)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Colorful ANIBEATS center label
  const grad = ctx.createLinearGradient(cx - 160, cy - 160, cx + 160, cy + 160);
  grad.addColorStop(0, '#4f46e5');
  grad.addColorStop(0.35, '#e11d48');
  grad.addColorStop(0.7, '#06b6d4');
  grad.addColorStop(1, '#10b981');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, 168, 0, Math.PI * 2);
  ctx.fill();

  // Inner crisp cream ring for editorial typography contrast
  ctx.fillStyle = '#fafafa';
  ctx.beginPath();
  ctx.arc(cx, cy, 128, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#09090b';
  ctx.font = '800 32px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ANIBEATS', cx, cy - 34);

  ctx.fillStyle = '#4f46e5';
  ctx.font = '700 18px "JetBrains Mono", monospace';
  ctx.fillText('SIDE A · V2.0', cx, cy + 44);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function HeroSculpture3D({ selectedMood, activeWorld }: HeroSculpture3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallbackMode, setFallbackMode] = useState(false);

  const moodRef = useRef(selectedMood);
  const worldRef = useRef(activeWorld);
  moodRef.current = selectedMood;
  worldRef.current = activeWorld;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setFallbackMode(true);
      return;
    }

    const gl = renderer.getContext();
    const debugExt = gl.getExtension('WEBGL_debug_renderer_info');
    const gpuStr = debugExt ? String(gl.getParameter(debugExt.UNMASKED_RENDERER_WEBGL)) : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpuStr);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'pan-y';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // Studio IBL environment
    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 260);
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(2.9, 2.35, 3.35);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = 0.45;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.target.set(0, 0.12, 0);

    // Crisp studio lighting + world-reactive accent rim light
    const keyLight = new THREE.DirectionalLight('#ffffff', 2.2);
    keyLight.position.set(4, 6, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight('#e0f2fe', 1.1);
    fillLight.position.set(-4, 3, -2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(WORLD_ACCENTS[worldRef.current], 4.5, 12);
    rimLight.position.set(-2.4, 2.1, 2.4);
    scene.add(rimLight);

    // Track disposables cleanly
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Chamfered anodized aluminum plinth
    const plinthShape = new THREE.Shape();
    const pw = 1.65;
    const pd = 1.32;
    const pr = 0.16;
    plinthShape.moveTo(-pw + pr, -pd);
    plinthShape.lineTo(pw - pr, -pd);
    plinthShape.quadraticCurveTo(pw, -pd, pw, -pd + pr);
    plinthShape.lineTo(pw, pd - pr);
    plinthShape.quadraticCurveTo(pw, pd, pw - pr, pd);
    plinthShape.lineTo(-pw + pr, pd);
    plinthShape.quadraticCurveTo(-pw, pd, -pw, pd - pr);
    plinthShape.lineTo(-pw, -pd + pr);
    plinthShape.quadraticCurveTo(-pw, -pd, -pw + pr, -pd);

    const plinthGeo = new THREE.ExtrudeGeometry(plinthShape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.035,
      bevelSegments: 4,
    });
    plinthGeo.rotateX(Math.PI / 2);
    plinthGeo.center();
    geometries.push(plinthGeo);

    const plinthMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      metalness: 0.25,
      roughness: 0.22,
    });
    materials.push(plinthMat);
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.position.y = -0.06;
    rootGroup.add(plinthMesh);

    // 2. Four brushed-dark isolation feet
    const footGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.08, 24);
    geometries.push(footGeo);
    const footMat = new THREE.MeshStandardMaterial({
      color: '#18181b',
      metalness: 0.65,
      roughness: 0.35,
    });
    materials.push(footMat);
    [
      [-1.32, -0.2, -1.0],
      [1.32, -0.2, -1.0],
      [-1.32, -0.2, 1.0],
      [1.32, -0.2, 1.0],
    ].forEach(([fx, fy, fz]) => {
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.position.set(fx, fy, fz);
      rootGroup.add(foot);
    });

    // 3. Machined platter rim + vinyl record assembly
    const platterGroup = new THREE.Group();
    platterGroup.position.set(-0.24, 0.07, 0);
    rootGroup.add(platterGroup);

    const platterGeo = new THREE.CylinderGeometry(1.06, 1.08, 0.09, 64);
    geometries.push(platterGeo);
    const platterMat = new THREE.MeshStandardMaterial({
      color: '#e4e4e7',
      metalness: 0.88,
      roughness: 0.18,
    });
    materials.push(platterMat);
    const platterMesh = new THREE.Mesh(platterGeo, platterMat);
    platterGroup.add(platterMesh);

    const vinylTex = createVinylTexture();
    textures.push(vinylTex);
    const vinylGeo = new THREE.CylinderGeometry(1.01, 1.01, 0.025, 64);
    geometries.push(vinylGeo);
    const vinylMat = new THREE.MeshStandardMaterial({
      map: vinylTex,
      roughness: 0.28,
      metalness: 0.22,
    });
    materials.push(vinylMat);
    const vinylMesh = new THREE.Mesh(vinylGeo, vinylMat);
    vinylMesh.position.y = 0.055;
    platterGroup.add(vinylMesh);

    const spindleGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.13, 24);
    geometries.push(spindleGeo);
    const chromeMat = new THREE.MeshStandardMaterial({
      color: '#f4f4f5',
      metalness: 0.96,
      roughness: 0.09,
    });
    materials.push(chromeMat);
    const spindleMesh = new THREE.Mesh(spindleGeo, chromeMat);
    spindleMesh.position.y = 0.1;
    platterGroup.add(spindleMesh);

    // 4. Precision Tonearm assembly (pivot, counterweight, S-curve tube, cartridge)
    const armGroup = new THREE.Group();
    armGroup.position.set(1.16, 0.08, -0.78);
    rootGroup.add(armGroup);

    const pivotBaseGeo = new THREE.CylinderGeometry(0.18, 0.21, 0.14, 32);
    geometries.push(pivotBaseGeo);
    const pivotBase = new THREE.Mesh(pivotBaseGeo, chromeMat);
    armGroup.add(pivotBase);

    const armCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.12, 0.22),
      new THREE.Vector3(0, 0.14, 0.02),
      new THREE.Vector3(-0.14, 0.13, 0.48),
      new THREE.Vector3(-0.34, 0.11, 0.96),
      new THREE.Vector3(-0.56, 0.09, 1.32),
    ]);
    const armTubeGeo = new THREE.TubeGeometry(armCurve, 40, 0.024, 14, false);
    geometries.push(armTubeGeo);
    const armTube = new THREE.Mesh(armTubeGeo, chromeMat);
    armGroup.add(armTube);

    const counterGeo = new THREE.CylinderGeometry(0.068, 0.068, 0.12, 24);
    counterGeo.rotateX(Math.PI / 2);
    geometries.push(counterGeo);
    const counterMesh = new THREE.Mesh(counterGeo, footMat);
    counterMesh.position.set(0, 0.12, 0.23);
    armGroup.add(counterMesh);

    const headGeo = new THREE.BoxGeometry(0.09, 0.05, 0.17);
    geometries.push(headGeo);
    const headMat = new THREE.MeshStandardMaterial({
      color: '#e11d48',
      metalness: 0.45,
      roughness: 0.25,
    });
    materials.push(headMat);
    const headshell = new THREE.Mesh(headGeo, headMat);
    headshell.position.set(-0.58, 0.08, 1.36);
    headshell.rotation.y = 0.42;
    armGroup.add(headshell);

    // 5. Pitch Slider & Glowing Accent Button
    const sliderSlotGeo = new THREE.BoxGeometry(0.12, 0.02, 0.72);
    geometries.push(sliderSlotGeo);
    const sliderSlot = new THREE.Mesh(sliderSlotGeo, footMat);
    sliderSlot.position.set(1.22, 0.04, 0.48);
    rootGroup.add(sliderSlot);

    const knobGeo = new THREE.BoxGeometry(0.16, 0.055, 0.09);
    geometries.push(knobGeo);
    const knobMat = new THREE.MeshStandardMaterial({
      color: '#4f46e5',
      emissive: '#4f46e5',
      emissiveIntensity: 0.35,
      roughness: 0.2,
    });
    materials.push(knobMat);
    const pitchKnob = new THREE.Mesh(knobGeo, knobMat);
    pitchKnob.position.set(1.22, 0.075, 0.44);
    rootGroup.add(pitchKnob);

    // 6. Four Colorful Spatial World Orbital Rings + Satellite Nodes
    const orbitConfigs = [
      { color: '#e11d48', radius: 1.88, tube: 0.018, tiltX: 0.28, tiltZ: 0.22, speed: 0.42 },
      { color: '#10b981', radius: 2.08, tube: 0.016, tiltX: -0.34, tiltZ: 0.31, speed: -0.34 },
      { color: '#2563eb', radius: 2.26, tube: 0.014, tiltX: 0.42, tiltZ: -0.26, speed: 0.26 },
      { color: '#0891b2', radius: 2.44, tube: 0.012, tiltX: -0.22, tiltZ: -0.38, speed: -0.21 },
    ];

    const orbitPivot = new THREE.Group();
    orbitPivot.position.set(0, 0.14, 0);
    rootGroup.add(orbitPivot);

    const ringGroups: { group: THREE.Group; speed: number }[] = [];
    const nodeGeo = new THREE.SphereGeometry(0.055, 20, 20);
    geometries.push(nodeGeo);

    orbitConfigs.forEach((cfg) => {
      const rg = new THREE.Group();
      rg.rotation.set(cfg.tiltX, 0, cfg.tiltZ);

      const torusGeo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 18, 96);
      geometries.push(torusGeo);
      const torusMat = new THREE.MeshPhysicalMaterial({
        color: cfg.color,
        emissive: cfg.color,
        emissiveIntensity: 0.22,
        metalness: 0.35,
        roughness: 0.14,
        transparent: true,
        opacity: 0.85,
      });
      materials.push(torusMat);

      const torus = new THREE.Mesh(torusGeo, torusMat);
      torus.rotation.x = Math.PI / 2;
      rg.add(torus);

      const satMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.color,
        emissiveIntensity: 0.5,
        roughness: 0.15,
      });
      materials.push(satMat);

      const sat1 = new THREE.Mesh(nodeGeo, satMat);
      sat1.position.set(cfg.radius, 0, 0);
      rg.add(sat1);

      const sat2 = new THREE.Mesh(nodeGeo, satMat);
      sat2.position.set(-cfg.radius, 0, 0);
      sat2.scale.setScalar(0.75);
      rg.add(sat2);

      orbitPivot.add(rg);
      ringGroups.push({ group: rg, speed: cfg.speed });
    });

    // 7. Instanced floating studio beat motes
    const moteCount = 36;
    const moteGeo = new THREE.OctahedronGeometry(0.032, 0);
    geometries.push(moteGeo);
    const moteMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.2,
      metalness: 0.4,
    });
    materials.push(moteMat);
    const motes = new THREE.InstancedMesh(moteGeo, moteMat, moteCount);
    const motePalette = ['#4f46e5', '#e11d48', '#10b981', '#06b6d4', '#f59e0b'];
    const tmpColor = new THREE.Color();
    const moteSeeds = Array.from({ length: moteCount }, (_, i) => {
      tmpColor.set(motePalette[i % motePalette.length]);
      motes.setColorAt(i, tmpColor);
      return {
        angle: (i / moteCount) * Math.PI * 2,
        radius: 1.55 + ((i * 7) % 10) * 0.12,
        yBase: -0.25 + ((i * 5) % 9) * 0.16,
        bobSpeed: 0.8 + (i % 4) * 0.35,
      };
    });
    if (motes.instanceColor) motes.instanceColor.needsUpdate = true;
    rootGroup.add(motes);

    // Pre-allocated animation helpers (no per-frame GC allocations)
    const dummy = new THREE.Object3D();
    const targetRimColor = new THREE.Color();
    const clock = new THREE.Clock();

    const handleResize = () => {
      if (!container) return;
      const w = Math.max(container.clientWidth, 260);
      const h = Math.max(container.clientHeight, 220);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    let rafId = 0;
    let lastDrawTime = 0;
    let disposed = false;

    const onContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(rafId);
      setFallbackMode(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    const renderFrame = (elapsed: number, delta: number) => {
      const speedMult = prefersReducedMotion ? 0 : MOOD_SPEED[moodRef.current];

      // Spin platter & gently rock tonearm
      platterGroup.rotation.y -= delta * 1.15 * speedMult;
      armGroup.rotation.y = Math.sin(elapsed * 0.6) * 0.015 * speedMult;

      // Smooth accent color transition matching active preview world
      targetRimColor.set(WORLD_ACCENTS[worldRef.current]);
      rimLight.color.lerp(targetRimColor, 0.08);
      knobMat.color.lerp(targetRimColor, 0.08);
      knobMat.emissive.lerp(targetRimColor, 0.08);

      // Orbit rings & subtle float
      rootGroup.position.y = prefersReducedMotion ? 0 : Math.sin(elapsed * 1.1) * 0.035;
      ringGroups.forEach((rg) => {
        rg.group.rotation.y += delta * rg.speed * speedMult;
      });

      // Update instanced beat motes
      for (let i = 0; i < moteCount; i++) {
        const s = moteSeeds[i];
        const a = s.angle + elapsed * 0.18 * speedMult;
        dummy.position.set(
          Math.cos(a) * s.radius,
          s.yBase + Math.sin(elapsed * s.bobSpeed + i) * 0.12,
          Math.sin(a) * s.radius
        );
        dummy.rotation.set(elapsed * 0.5 + i, elapsed * 0.7, 0);
        dummy.updateMatrix();
        motes.setMatrixAt(i, dummy.matrix);
      }
      motes.instanceMatrix.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      if (isSoftwareGl && now - lastDrawTime < 34) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      renderFrame(elapsed, delta);
      lastDrawTime = performance.now();
      rafId = requestAnimationFrame(tick);
    };

    renderFrame(0, 0.016);
    if (!prefersReducedMotion) {
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      controls.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      envTarget.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (fallbackMode) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-600 via-rose-500 to-cyan-500 p-1 shadow-xl">
          <div className="w-full h-full rounded-full bg-zinc-950 grid place-items-center">
            <div className="w-12 h-12 rounded-full bg-white grid place-items-center text-[10px] font-extrabold text-zinc-950">
              ANIBEATS
            </div>
          </div>
        </div>
        <p className="font-data text-xs text-zinc-500 mt-4">Interactive Spatial Vinyl Stage</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      aria-label="Interactive 3D ANIBEATS turntable sculpture — drag to rotate"
      className="w-full h-full cursor-grab active:cursor-grabbing select-none"
    />
  );
}
