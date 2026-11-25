import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export type HeroWorldKey = 'anime' | 'rap' | 'beats' | 'cars' | 'travel';
export type HeroAuraKey = 'auto' | 'lavender' | 'cyan' | 'peach' | 'mint';

interface AfricanPattern3DProps {
  activeWorld: HeroWorldKey;
  auraOverride?: HeroAuraKey;
  paused?: boolean;
  surfaceTheme?: 'ivory' | 'midnight';
}

// Calm, modern pastel palette — lavender, cyan, peach, mint (no brown, not loud)
const CALM_PALETTE = {
  lavender: 0xd8cef8,
  cyan: 0xc2eef6,
  peach: 0xfadbc7,
  mint: 0xc8f2e3,
  ivory: 0xf7f3ed,
} as const;

const WORLD_ACCENT_SEQUENCE: Record<HeroWorldKey, (keyof typeof CALM_PALETTE)[]> = {
  anime: ['lavender', 'peach', 'cyan', 'mint', 'ivory'],
  rap: ['lavender', 'cyan', 'mint', 'peach', 'ivory'],
  beats: ['cyan', 'mint', 'lavender', 'peach', 'ivory'],
  cars: ['cyan', 'peach', 'lavender', 'mint', 'ivory'],
  travel: ['mint', 'cyan', 'peach', 'lavender', 'ivory'],
};

const AURA_ACCENT_SEQUENCE: Record<Exclude<HeroAuraKey, 'auto'>, (keyof typeof CALM_PALETTE)[]> = {
  lavender: ['lavender', 'lavender', 'cyan', 'peach', 'ivory'],
  cyan: ['cyan', 'cyan', 'mint', 'lavender', 'ivory'],
  peach: ['peach', 'peach', 'lavender', 'mint', 'ivory'],
  mint: ['mint', 'mint', 'cyan', 'lavender', 'ivory'],
};

interface ReliefModule {
  group: THREE.Group;
  poppingParts: { mesh: THREE.Object3D; baseZ: number; depthFactor: number }[];
  baseX: number;
  baseY: number;
  baseZ: number;
  phase: number;
  maxPop: number;
  colorIndex: number;
  accentMat: THREE.MeshStandardMaterial;
}

function createAlmondEyeGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-0.48, 0);
  shape.quadraticCurveTo(0, 0.34, 0.48, 0);
  shape.quadraticCurveTo(0, -0.34, -0.48, 0);
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.18,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.025,
    bevelSegments: 2,
  });
}

function createDiamondGeometry(size: number, depth: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, size);
  shape.lineTo(size * 0.78, 0);
  shape.lineTo(0, -size);
  shape.lineTo(-size * 0.78, 0);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.02,
    bevelSegments: 2,
  });
}

function createArchGeometry(outerR: number, innerR: number, depth: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.absarc(0, -0.18, outerR, 0, Math.PI, false);
  shape.lineTo(-innerR, -0.18);
  shape.absarc(0, -0.18, innerR, Math.PI, 0, true);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.015,
    bevelSegments: 2,
  });
}

export function AfricanPattern3D({
  activeWorld,
  auraOverride = 'auto',
  paused = false,
  surfaceTheme = 'ivory',
}: AfricanPattern3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglReady, setWebglReady] = useState(true);
  const activeWorldRef = useRef<HeroWorldKey>(activeWorld);
  const auraOverrideRef = useRef<HeroAuraKey>(auraOverride);
  const pausedRef = useRef<boolean>(paused);

  useEffect(() => {
    activeWorldRef.current = activeWorld;
  }, [activeWorld]);

  useEffect(() => {
    auraOverrideRef.current = auraOverride;
  }, [auraOverride]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

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
      setWebglReady(false);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 60);
    camera.position.set(0, 0, 14.8);

    // Soft studio lighting so pastel relief edges pop cleanly without glare
    const hemi = new THREE.HemisphereLight(0xffffff, 0xede8fa, 1.48);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfffaf4, 1.32);
    keyLight.position.set(-7, 8, 11);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd9f5fa, 0.86);
    fillLight.position.set(8, -4, 9);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xebe3ff, 0.65);
    rimLight.position.set(0, 6, -4);
    scene.add(rimLight);

    // Shared 3D geometries inspired by the African motif sheets (sun wheels, almond eyes, masks, diamonds, arches, stepped boxes)
    const baseTileGeo = new THREE.BoxGeometry(1.22, 1.22, 0.24);
    const sunDiscGeo = new THREE.CylinderGeometry(0.46, 0.48, 0.22, 24);
    sunDiscGeo.rotateX(Math.PI / 2);
    const sunRayGeo = new THREE.BoxGeometry(0.11, 0.22, 0.2);
    const smallCubeGeo = new THREE.BoxGeometry(0.26, 0.26, 0.34);
    const midBoxGeo = new THREE.BoxGeometry(0.74, 0.74, 0.26);
    const barHGeo = new THREE.BoxGeometry(0.96, 0.17, 0.24);
    const barVGeo = new THREE.BoxGeometry(0.17, 0.96, 0.24);
    const maskBodyGeo = new THREE.BoxGeometry(0.58, 0.92, 0.26);
    const maskEyeGeo = new THREE.BoxGeometry(0.14, 0.1, 0.24);
    const maskNoseGeo = new THREE.BoxGeometry(0.09, 0.32, 0.26);
    const maskMouthGeo = new THREE.BoxGeometry(0.24, 0.08, 0.22);

    const almondEyeGeo = createAlmondEyeGeometry();
    const irisGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.22, 20);
    irisGeo.rotateX(Math.PI / 2);

    const diamondOuterGeo = createDiamondGeometry(0.52, 0.22);
    const diamondInnerGeo = createDiamondGeometry(0.28, 0.26);
    const archOuterGeo = createArchGeometry(0.5, 0.36, 0.22);
    const archInnerGeo = createArchGeometry(0.3, 0.16, 0.26);

    const allGeometries: THREE.BufferGeometry[] = [
      baseTileGeo,
      sunDiscGeo,
      sunRayGeo,
      smallCubeGeo,
      midBoxGeo,
      barHGeo,
      barVGeo,
      maskBodyGeo,
      maskEyeGeo,
      maskNoseGeo,
      maskMouthGeo,
      almondEyeGeo,
      irisGeo,
      diamondOuterGeo,
      diamondInnerGeo,
      archOuterGeo,
      archInnerGeo,
    ];

    const wallGroup = new THREE.Group();
    scene.add(wallGroup);

    const modules: ReliefModule[] = [];
    const disposableMaterials: THREE.Material[] = [];

    const cols = 11;
    const rows = 7;
    const spacingX = 1.56;
    const spacingY = 1.52;

    const paletteKeys: (keyof typeof CALM_PALETTE)[] = [
      'lavender',
      'cyan',
      'peach',
      'mint',
      'ivory',
    ];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - (cols - 1) / 2) * spacingX;
        const y = (r - (rows - 1) / 2) * spacingY;

        // Keep center portrait area open on Hero ('ivory'); cover full atmospheric field on 'midnight'
        if (surfaceTheme === 'ivory') {
          const inCenterPortrait = Math.abs(x) < 2.25 && y < 1.35;
          if (inCenterPortrait) continue;
        }

        const modGroup = new THREE.Group();
        modGroup.position.set(x, y, -0.55);

        const motif = (c * 2 + r * 3) % 6;
        const colorIdx = (c * 3 + r * 5) % paletteKeys.length;
        const secondaryIdx = (colorIdx + 2) % 4;
        const isMidnight = surfaceTheme === 'midnight';

        const baseMat = new THREE.MeshStandardMaterial({
          color: isMidnight ? 0x161435 : CALM_PALETTE.ivory,
          roughness: isMidnight ? 0.65 : 0.88,
          metalness: isMidnight ? 0.14 : 0.02,
          transparent: true,
          opacity: isMidnight ? 0.24 : 0.84,
        });

        const accentMat = new THREE.MeshStandardMaterial({
          color: CALM_PALETTE[paletteKeys[colorIdx]],
          roughness: isMidnight ? 0.55 : 0.72,
          metalness: isMidnight ? 0.12 : 0.04,
          transparent: true,
          opacity: isMidnight ? 0.34 : 0.92,
        });

        const detailMat = new THREE.MeshStandardMaterial({
          color: CALM_PALETTE[paletteKeys[secondaryIdx]],
          roughness: isMidnight ? 0.5 : 0.66,
          metalness: isMidnight ? 0.12 : 0.05,
          transparent: true,
          opacity: isMidnight ? 0.42 : 0.96,
        });

        disposableMaterials.push(baseMat, accentMat, detailMat);

        const baseBox = new THREE.Mesh(baseTileGeo, baseMat);
        baseBox.position.z = 0;
        modGroup.add(baseBox);

        const poppingParts: { mesh: THREE.Object3D; baseZ: number; depthFactor: number }[] = [];

        if (motif === 0) {
          // 1. African Sun Medallion with radiating geometric rays
          const disc = new THREE.Mesh(sunDiscGeo, accentMat);
          disc.position.z = 0.2;
          modGroup.add(disc);
          poppingParts.push({ mesh: disc, baseZ: 0.2, depthFactor: 0.75 });

          for (let k = 0; k < 8; k++) {
            const angle = (k / 8) * Math.PI * 2;
            const ray = new THREE.Mesh(sunRayGeo, detailMat);
            ray.position.set(Math.cos(angle) * 0.44, Math.sin(angle) * 0.44, 0.26);
            ray.rotation.z = angle - Math.PI / 2;
            modGroup.add(ray);
            poppingParts.push({ mesh: ray, baseZ: 0.26, depthFactor: 0.95 });
          }

          const seed = new THREE.Mesh(smallCubeGeo, detailMat);
          seed.rotation.z = Math.PI / 4;
          seed.position.z = 0.38;
          modGroup.add(seed);
          poppingParts.push({ mesh: seed, baseZ: 0.38, depthFactor: 1.25 });
        } else if (motif === 1) {
          // 2. Stepped Concentric African Diamond Shield
          const outerD = new THREE.Mesh(diamondOuterGeo, accentMat);
          outerD.position.z = 0.16;
          const innerD = new THREE.Mesh(diamondInnerGeo, detailMat);
          innerD.position.z = 0.32;
          const core = new THREE.Mesh(smallCubeGeo, accentMat);
          core.rotation.z = Math.PI / 4;
          core.position.z = 0.46;
          modGroup.add(outerD, innerD, core);
          poppingParts.push(
            { mesh: outerD, baseZ: 0.16, depthFactor: 0.7 },
            { mesh: innerD, baseZ: 0.32, depthFactor: 1.0 },
            { mesh: core, baseZ: 0.46, depthFactor: 1.3 }
          );
        } else if (motif === 2) {
          // 3. African Almond Eye Shield Relief
          const eye = new THREE.Mesh(almondEyeGeo, accentMat);
          eye.position.z = 0.16;
          const iris = new THREE.Mesh(irisGeo, detailMat);
          iris.position.z = 0.3;
          const pupil = new THREE.Mesh(smallCubeGeo, accentMat);
          pupil.scale.set(0.52, 0.52, 0.8);
          pupil.rotation.z = Math.PI / 4;
          pupil.position.z = 0.42;
          modGroup.add(eye, iris, pupil);
          poppingParts.push(
            { mesh: eye, baseZ: 0.16, depthFactor: 0.75 },
            { mesh: iris, baseZ: 0.3, depthFactor: 1.05 },
            { mesh: pupil, baseZ: 0.42, depthFactor: 1.3 }
          );
        } else if (motif === 3) {
          // 4. Stepped African Arch & Wave Relief
          const outerArch = new THREE.Mesh(archOuterGeo, accentMat);
          outerArch.position.z = 0.16;
          const innerArch = new THREE.Mesh(archInnerGeo, detailMat);
          innerArch.position.z = 0.3;
          const stepBar = new THREE.Mesh(barHGeo, accentMat);
          stepBar.scale.set(0.85, 0.75, 1);
          stepBar.position.set(0, -0.34, 0.34);
          modGroup.add(outerArch, innerArch, stepBar);
          poppingParts.push(
            { mesh: outerArch, baseZ: 0.16, depthFactor: 0.7 },
            { mesh: innerArch, baseZ: 0.3, depthFactor: 1.05 },
            { mesh: stepBar, baseZ: 0.34, depthFactor: 1.15 }
          );
        } else if (motif === 4) {
          // 5. Stylized Geometric Mask / Totem Tile
          const maskFace = new THREE.Mesh(maskBodyGeo, accentMat);
          maskFace.position.z = 0.18;
          const leftEye = new THREE.Mesh(maskEyeGeo, detailMat);
          leftEye.position.set(-0.14, 0.15, 0.34);
          const rightEye = new THREE.Mesh(maskEyeGeo, detailMat);
          rightEye.position.set(0.14, 0.15, 0.34);
          const nose = new THREE.Mesh(maskNoseGeo, detailMat);
          nose.position.set(0, -0.02, 0.38);
          const mouth = new THREE.Mesh(maskMouthGeo, detailMat);
          mouth.position.set(0, -0.26, 0.34);
          modGroup.add(maskFace, leftEye, rightEye, nose, mouth);
          poppingParts.push(
            { mesh: maskFace, baseZ: 0.18, depthFactor: 0.7 },
            { mesh: leftEye, baseZ: 0.34, depthFactor: 1.1 },
            { mesh: rightEye, baseZ: 0.34, depthFactor: 1.1 },
            { mesh: nose, baseZ: 0.38, depthFactor: 1.25 },
            { mesh: mouth, baseZ: 0.34, depthFactor: 1.05 }
          );
        } else {
          // 6. Adinkra Cross-Square & Stepped Corner Cubes
          const frame = new THREE.Mesh(midBoxGeo, accentMat);
          frame.position.z = 0.16;
          const barH = new THREE.Mesh(barHGeo, detailMat);
          barH.position.z = 0.32;
          const barV = new THREE.Mesh(barVGeo, detailMat);
          barV.position.z = 0.32;
          const center = new THREE.Mesh(smallCubeGeo, accentMat);
          center.rotation.z = Math.PI / 4;
          center.position.z = 0.44;
          modGroup.add(frame, barH, barV, center);
          poppingParts.push(
            { mesh: frame, baseZ: 0.16, depthFactor: 0.65 },
            { mesh: barH, baseZ: 0.32, depthFactor: 1.0 },
            { mesh: barV, baseZ: 0.32, depthFactor: 1.0 },
            { mesh: center, baseZ: 0.44, depthFactor: 1.25 }
          );
        }

        wallGroup.add(modGroup);
        modules.push({
          group: modGroup,
          poppingParts,
          baseX: x,
          baseY: y,
          baseZ: -0.55,
          phase: c * 0.52 + r * 0.68,
          maxPop: 0.4 + ((c + r) % 3) * 0.14,
          colorIndex: colorIdx,
          accentMat,
        });
      }
    }

    const pointerTarget = { x: 0, y: 0 };
    const pointerSmooth = { x: 0, y: 0 };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointerTarget.x = Math.max(-1, Math.min(1, nx));
      pointerTarget.y = Math.max(-1, Math.min(1, ny));
    };

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglReady(false);
    };

    const handleContextRestored = () => {
      setWebglReady(true);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let rafId = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    const tempColor = new THREE.Color();

    const animate = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const isPaused = prefersReducedMotion || pausedRef.current;
      if (!isPaused) {
        elapsed += dt;
      }

      pointerSmooth.x += (pointerTarget.x - pointerSmooth.x) * 0.05;
      pointerSmooth.y += (pointerTarget.y - pointerSmooth.y) * 0.05;

      camera.position.x = pointerSmooth.x * 0.62;
      camera.position.y = pointerSmooth.y * 0.4;
      camera.lookAt(0, 0, 0);

      const cursorWallX = pointerSmooth.x * 6.5;
      const cursorWallY = pointerSmooth.y * 3.8;
      const auraKey = auraOverrideRef.current;
      const sequence =
        auraKey !== 'auto'
          ? AURA_ACCENT_SEQUENCE[auraKey]
          : WORLD_ACCENT_SEQUENCE[activeWorldRef.current];

      for (let i = 0; i < modules.length; i++) {
        const mod = modules[i];
        const wave = Math.sin(elapsed * 0.68 + mod.phase) * 0.5 + 0.5;
        const dx = mod.baseX - cursorWallX;
        const dy = mod.baseY - cursorWallY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const cursorLift = Math.max(0, 1 - dist / 4.2) * 0.52;

        const targetZ = mod.baseZ + wave * mod.maxPop + cursorLift;
        mod.group.position.z += (targetZ - mod.group.position.z) * 0.08;

        for (let p = 0; p < mod.poppingParts.length; p++) {
          const part = mod.poppingParts[p];
          const extra = (wave * 0.18 + cursorLift * 0.4) * part.depthFactor;
          part.mesh.position.z += (part.baseZ + extra - part.mesh.position.z) * 0.1;
        }

        const desiredHex = CALM_PALETTE[sequence[mod.colorIndex % sequence.length]];
        tempColor.setHex(desiredHex);
        mod.accentMat.color.lerp(tempColor, 0.04);
      }

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      allGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [surfaceTheme]);

  if (!webglReady) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-65"
        style={{
          backgroundImage:
            'radial-gradient(circle at 16% 28%, rgba(216,206,248,0.55) 0%, transparent 28%), radial-gradient(circle at 86% 24%, rgba(194,238,246,0.55) 0%, transparent 28%), radial-gradient(circle at 14% 78%, rgba(250,219,199,0.5) 0%, transparent 28%), radial-gradient(circle at 86% 78%, rgba(200,242,227,0.55) 0%, transparent 28%)',
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="w-full h-full pointer-events-none"
    />
  );
}
