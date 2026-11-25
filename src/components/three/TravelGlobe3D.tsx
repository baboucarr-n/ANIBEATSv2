import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface GlobePinSpec {
  id: string;
  country: string;
  lat: number;
  lon: number;
  color: string;
}

export const GLOBE_PIN_COORDS: GlobePinSpec[] = [
  { id: 'pin-jp', country: 'Japan', lat: 35.68, lon: 139.69, color: '#e11d48' },
  { id: 'pin-us', country: 'USA', lat: 40.71, lon: -74.0, color: '#10b981' },
  { id: 'pin-de', country: 'Germany', lat: 50.33, lon: 6.94, color: '#2563eb' },
  { id: 'pin-ae', country: 'Dubai', lat: 25.2, lon: 55.27, color: '#0891b2' },
];

interface TravelGlobe3DProps {
  selectedPinId: string;
  onSelectPin: (pinId: string) => void;
}

function latLonToVector3(lat: number, lon: number, radius: number, out = new THREE.Vector3()): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  out.x = -radius * Math.sin(phi) * Math.cos(theta);
  out.y = radius * Math.cos(phi);
  out.z = radius * Math.sin(phi) * Math.sin(theta);
  return out;
}

function createStudioEarthTexture(): THREE.CanvasTexture {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Clean airy ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
  oceanGrad.addColorStop(0, '#dbeafe');
  oceanGrad.addColorStop(0.5, '#eff6ff');
  oceanGrad.addColorStop(1, '#e0f2fe');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle architectural lat/lon graticule
  ctx.strokeStyle = 'rgba(79, 70, 229, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += w / 12) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += h / 6) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Helper to convert lon/lat to canvas coords
  const px = (lon: number) => ((lon + 180) / 360) * w;
  const py = (lat: number) => ((90 - lat) / 180) * h;

  const drawContinent = (coords: [number, number][], fill: string, stroke: string) => {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    coords.forEach(([lon, lat], i) => {
      if (i === 0) ctx.moveTo(px(lon), py(lat));
      else ctx.lineTo(px(lon), py(lat));
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const landFill = '#4f46e5';
  const landStroke = '#312e81';

  // Stylized crisp continent silhouettes
  // North America
  drawContinent(
    [
      [-166, 65], [-135, 70], [-95, 72], [-56, 52], [-70, 42],
      [-80, 25], [-92, 16], [-105, 20], [-122, 37], [-145, 58],
    ],
    '#4338ca',
    landStroke
  );

  // South America
  drawContinent(
    [
      [-80, 10], [-60, 10], [-36, -6], [-42, -23], [-58, -38],
      [-70, -54], [-75, -40], [-81, -5],
    ],
    '#0d9488',
    '#115e59'
  );

  // Europe
  drawContinent(
    [
      [-10, 37], [3, 43], [-4, 51], [6, 55], [20, 66], [34, 68],
      [40, 52], [28, 41], [15, 38], [3, 39],
    ],
    '#2563eb',
    '#1e40af'
  );

  // Africa
  drawContinent(
    [
      [-17, 15], [-6, 35], [12, 36], [32, 31], [44, 12], [50, 10],
      [39, -12], [28, -33], [18, -34], [12, -16], [8, 4], [-12, 6],
    ],
    '#6366f1',
    landStroke
  );

  // Asia & Middle East
  drawContinent(
    [
      [34, 42], [44, 38], [55, 25], [60, 22], [75, 8], [90, 22],
      [104, 2], [116, 22], [128, 38], [140, 50], [166, 64], [110, 72],
      [65, 70], [42, 56],
    ],
    landFill,
    landStroke
  );

  // Japan islands highlight
  drawContinent(
    [
      [130, 32], [136, 34], [141, 41], [145, 44], [140, 38], [134, 33],
    ],
    '#e11d48',
    '#9f1239'
  );

  // Australia
  drawContinent(
    [
      [114, -22], [132, -12], [144, -14], [153, -28], [146, -38],
      [130, -33], [115, -34],
    ],
    '#0891b2',
    '#155e75'
  );

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function TravelGlobe3D({ selectedPinId, onSelectPin }: TravelGlobe3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);

  const selectedRef = useRef(selectedPinId);
  const onSelectRef = useRef(onSelectPin);
  selectedRef.current = selectedPinId;
  onSelectRef.current = onSelectPin;

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
      setFallback(true);
      return;
    }

    const gl = renderer.getContext();
    const debugExt = gl.getExtension('WEBGL_debug_renderer_info');
    const gpuStr = debugExt ? String(gl.getParameter(debugExt.UNMASKED_RENDERER_WEBGL)) : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpuStr);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'pan-y';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();

    const width = Math.max(container.clientWidth, 280);
    const height = Math.max(container.clientHeight, 260);
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 40);
    camera.position.set(0, 0.8, 3.65);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.65;

    const keyLight = new THREE.DirectionalLight('#ffffff', 2.0);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#06b6d4', 1.2);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Earth sphere with studio map
    const earthTex = createStudioEarthTexture();
    textures.push(earthTex);
    const radius = 1.05;
    const earthGeo = new THREE.SphereGeometry(radius, 64, 48);
    geometries.push(earthGeo);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.42,
      metalness: 0.08,
    });
    materials.push(earthMat);
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // 2. Crisp glass atmospheric rim shell
    const atmosGeo = new THREE.SphereGeometry(radius * 1.045, 48, 36);
    geometries.push(atmosGeo);
    const atmosMat = new THREE.MeshPhysicalMaterial({
      color: '#38bdf8',
      transparent: true,
      opacity: 0.14,
      roughness: 0.1,
      metalness: 0.1,
      side: THREE.FrontSide,
      depthWrite: false,
    });
    materials.push(atmosMat);
    globeGroup.add(new THREE.Mesh(atmosGeo, atmosMat));

    // 3. Orbital travel rings
    const ringGeo = new THREE.TorusGeometry(1.32, 0.008, 12, 96);
    geometries.push(ringGeo);
    const ringMat = new THREE.MeshStandardMaterial({
      color: '#4f46e5',
      transparent: true,
      opacity: 0.35,
      roughness: 0.2,
    });
    materials.push(ringMat);
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.set(Math.PI * 0.42, 0.3, 0);
    globeGroup.add(ringMesh);

    // 4. Flight arcs between the 4 pins
    const pinVectors = GLOBE_PIN_COORDS.map((p) => latLonToVector3(p.lat, p.lon, radius));
    const arcPairs: [number, number][] = [
      [0, 1],
      [0, 2],
      [2, 3],
      [1, 2],
    ];
    const arcMat = new THREE.MeshStandardMaterial({
      color: '#06b6d4',
      emissive: '#06b6d4',
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.72,
    });
    materials.push(arcMat);

    arcPairs.forEach(([aIdx, bIdx]) => {
      const a = pinVectors[aIdx];
      const b = pinVectors[bIdx];
      const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5).normalize().multiplyScalar(radius * 1.32);
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const arcGeo = new THREE.TubeGeometry(curve, 28, 0.009, 8, false);
      geometries.push(arcGeo);
      globeGroup.add(new THREE.Mesh(arcGeo, arcMat));
    });

    // 5. Interactive 3D Pin Beacons
    const stemGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.16, 12);
    const headGeo = new THREE.SphereGeometry(0.055, 20, 20);
    const haloGeo = new THREE.TorusGeometry(0.085, 0.009, 10, 32);
    geometries.push(stemGeo, headGeo, haloGeo);

    const clickableMeshes: THREE.Mesh[] = [];
    const pinObjects: {
      id: string;
      beacon: THREE.Group;
      headMat: THREE.MeshStandardMaterial;
      halo: THREE.Mesh;
      targetQuat: THREE.Quaternion;
    }[] = [];

    const upAxis = new THREE.Vector3(0, 1, 0);
    const frontAxis = new THREE.Vector3(0, 0, 1);

    GLOBE_PIN_COORDS.forEach((pin, idx) => {
      const pos = pinVectors[idx];
      const normal = pos.clone().normalize();
      const beacon = new THREE.Group();
      beacon.position.copy(pos);
      beacon.quaternion.setFromUnitVectors(upAxis, normal);

      const pinMat = new THREE.MeshStandardMaterial({
        color: pin.color,
        emissive: pin.color,
        emissiveIntensity: 0.45,
        roughness: 0.2,
      });
      materials.push(pinMat);

      const stem = new THREE.Mesh(stemGeo, pinMat);
      stem.position.y = 0.08;
      beacon.add(stem);

      const head = new THREE.Mesh(headGeo, pinMat);
      head.position.y = 0.18;
      head.userData.pinId = pin.id;
      beacon.add(head);
      clickableMeshes.push(head);

      const halo = new THREE.Mesh(haloGeo, pinMat);
      halo.rotation.x = Math.PI / 2;
      halo.position.y = 0.02;
      beacon.add(halo);

      globeGroup.add(beacon);

      // Quaternion that rotates the globe so this pin points toward +Z (viewer)
      const q = new THREE.Quaternion().setFromUnitVectors(normal, frontAxis);
      pinObjects.push({ id: pin.id, beacon, headMat: pinMat, halo, targetQuat: q });
    });

    // Raycaster for direct 3D pin click
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };
    let userDragging = false;

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
      userDragging = true;
    };
    const onPointerUp = (e: PointerEvent) => {
      userDragging = false;
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (Math.hypot(dx, dy) > 6) return; // was drag, not click

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableMeshes, false);
      if (hits.length > 0) {
        const hitPinId = hits[0].object.userData.pinId as string | undefined;
        if (hitPinId) onSelectRef.current(hitPinId);
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    const handleResize = () => {
      if (!container) return;
      const w = Math.max(container.clientWidth, 240);
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
    let lastTargetId = '';
    const clock = new THREE.Clock();

    const onContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(rafId);
      setFallback(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    const renderFrame = (elapsed: number, delta: number) => {
      const activeId = selectedRef.current;
      const activeObj = pinObjects.find((p) => p.id === activeId) ?? pinObjects[0];

      if (!userDragging && activeObj) {
        if (lastTargetId !== activeObj.id) {
          lastTargetId = activeObj.id;
        }
        globeGroup.quaternion.slerp(activeObj.targetQuat, Math.min(1, delta * 3.4));
      }

      // Highlight selected beacon cleanly
      pinObjects.forEach((p, idx) => {
        const isSel = p.id === activeId;
        const scale = isSel ? 1.25 + Math.sin(elapsed * 3.2) * 0.08 : 0.9;
        p.beacon.scale.setScalar(prefersReducedMotion ? (isSel ? 1.22 : 0.9) : scale);
        p.headMat.emissiveIntensity = isSel ? 0.9 : 0.35;
        p.halo.rotation.z = elapsed * (0.8 + idx * 0.1);
      });

      if (!prefersReducedMotion) {
        ringMesh.rotation.z += delta * 0.25;
      }

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

    // Snap initially toward first selected pin
    const initialPin = pinObjects.find((p) => p.id === selectedRef.current) ?? pinObjects[0];
    if (initialPin) globeGroup.quaternion.copy(initialPin.targetQuat);
    renderFrame(0, 0.016);
    if (!prefersReducedMotion) {
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
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

  if (fallback) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-50 via-indigo-50 to-white p-6">
        <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 shadow-lg grid place-items-center text-white font-bold text-sm">
          80 Places
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      aria-label="Interactive 3D Travel Globe — drag to spin or click pins"
      className="w-full h-full cursor-grab active:cursor-grabbing select-none"
    />
  );
}
