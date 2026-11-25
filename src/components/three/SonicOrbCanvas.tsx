import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { OrbPlaybackStatus, OrbSyncMode, SonicTrackItem } from '../../types/sonicOrb';
import {
  computeProceduralOrbMetrics,
  type WebAudioAnalyserEngine,
} from '../../utils/orbAudioSync';

interface SonicOrbCanvasProps {
  status: OrbPlaybackStatus;
  track: SonicTrackItem;
  syncMode: OrbSyncMode;
  webAudioEngine: WebAudioAnalyserEngine;
  positionMs: number;
  trackChangeKey: number;
}

const BAND_COUNT = 16;

const ORB_CELLULAR_SHADER_COMMON = /* glsl */ `
uniform float uTime;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uEnergy;
uniform float uTransient;
uniform float uWaveAmp;
uniform float uTransition;
uniform float uWarmth;
uniform float uFreqBands[16];

varying vec3 vObjPos;
varying float vCellMask;
varying float vBandEnergy;

float sampleBandSpectrum(float normPos) {
  float coord = clamp(normPos, 0.0, 1.0) * 15.0;
  float total = 0.0;
  float wSum = 0.0;
  for (int i = 0; i < 16; i++) {
    float dist = coord - float(i);
    float w = exp(-dist * dist * 0.65);
    total += uFreqBands[i] * w;
    wSum += w;
  }
  return total / max(0.0001, wSum);
}

// 3D Gyroid cellular lattice produces sculpted organic membranes and deep valleys at high FPS
float gyroidField(vec3 p) {
  return dot(sin(p), cos(p.yzx));
}

// Returns vec2(vertexDisplacement, normalizedCellRidgeMask [0..1])
vec2 evalCellularSurface(vec3 n) {
  float lon = atan(n.z, n.x);
  float latNorm = clamp((n.y + 1.0) * 0.5, 0.0, 1.0);
  float bandVal = sampleBandSpectrum(abs(n.y));
  float eqBand = sampleBandSpectrum(0.5 + 0.5 * cos(lon * 2.0 + uTime * 0.4));
  float localFreq = mix(bandVal, eqBand, 0.32);

  // Subtle vertical drift + organic fluid churn
  vec3 flow = n * 4.6 + vec3(0.0, -uTime * (0.24 + uEnergy * 0.32), uTime * 0.14);
  float g1 = abs(gyroidField(flow));
  float g2 = abs(gyroidField(flow * 1.98 + vec3(1.7, -uTime * 0.22, 0.9)));
  float g3 = abs(gyroidField(flow * 3.85 - vec3(0.6, uTime * 0.38, 1.4)));

  // Invert abs(gyroid) -> crisp luminous cellular membranes + deep dark pockets
  float ridge1 = 1.0 - smoothstep(0.0, 1.28, g1);
  float ridge2 = 1.0 - smoothstep(0.0, 1.18, g2);
  float fineCell = 1.0 - smoothstep(0.0, 1.08, g3);

  float cellMask = clamp(ridge1 * 0.56 + ridge2 * 0.30 + fineCell * 0.22, 0.0, 1.0);

  // Frequency vibration physically swells & ripples the cellular folds
  float lowerWeight = smoothstep(0.75, -0.85, n.y);
  float radialSwell = (0.045 + uBass * 0.095 + uTransient * 0.048) * (0.6 + lowerWeight * 0.4);
  float freqRipple = localFreq * (0.038 + uWaveAmp * 0.068);
  float switchRipple = uTransition * 0.06 * sin(latNorm * 14.0 - uTime * 8.0);

  float disp = cellMask * (radialSwell + freqRipple) + switchRipple;
  return vec2(disp, cellMask);
}
`;

export function SonicOrbCanvas({
  status,
  track,
  syncMode,
  webAudioEngine,
  positionMs,
  trackChangeKey,
}: SonicOrbCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const liveStateRef = useRef({
    status,
    track,
    syncMode,
    webAudioEngine,
    positionMs,
  });
  liveStateRef.current = { status, track, syncMode, webAudioEngine, positionMs };

  const transitionImpulseRef = useRef(0);
  const prevTrackChangeKeyRef = useRef(trackChangeKey);

  useEffect(() => {
    if (prevTrackChangeKeyRef.current !== trackChangeKey) {
      prevTrackChangeKeyRef.current = trackChangeKey;
      transitionImpulseRef.current = 1;
    }
  }, [trackChangeKey]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === 'undefined') return;

    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return false;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param) || '');
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render|Mesa OffScreen/i.test(gpu);
      } catch {
        return false;
      }
    })();

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    const gl = renderer.getContext();
    if (!gl) {
      renderer.dispose();
      setWebglFailed(true);
      return;
    }

    const applyRendererSizing = () => {
      if (!renderer || !container) return;
      const width = Math.max(220, container.clientWidth);
      const height = Math.max(220, container.clientHeight);
      const dpr = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
    };

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'pan-y';
    applyRendererSizing();

    container.replaceChildren(renderer.domElement);

    const scene = new THREE.Scene();

    const width0 = Math.max(220, container.clientWidth);
    const height0 = Math.max(220, container.clientHeight);
    const camera = new THREE.PerspectiveCamera(36, width0 / height0, 0.1, 45);
    camera.position.set(0, 0.22, width0 < 400 ? 6.9 : 6.15);
    camera.lookAt(0, -0.22, 0);

    // Studio environment reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Lighting matching the icy-blue top crown + molten orange bottom glow
    const hemiLight = new THREE.HemisphereLight('#8FD0FF', '#FF7A24', 0.55);
    scene.add(hemiLight);

    const topIceLight = new THREE.DirectionalLight('#A6DCFF', 2.4);
    topIceLight.position.set(0.4, 4.8, 2.5);
    scene.add(topIceLight);

    const bottomMoltenLight = new THREE.PointLight('#FF7E26', 3.4, 9, 1.5);
    bottomMoltenLight.position.set(0, -1.35, 1.2);
    scene.add(bottomMoltenLight);

    const sideBlueFill = new THREE.DirectionalLight('#3CA2FF', 1.45);
    sideBlueFill.position.set(-3.8, 1.6, 2.2);
    scene.add(sideBlueFill);

    // Master stage group (orb slightly above center so bottom reflection has room)
    const stageGroup = new THREE.Group();
    stageGroup.position.set(0, 0.22, 0);
    scene.add(stageGroup);

    const orbGroup = new THREE.Group();
    stageGroup.add(orbGroup);

    const initialFreqBands = new Array<number>(BAND_COUNT).fill(0.08);
    const orbUniforms = {
      uTime: { value: 0 },
      uBass: { value: 0.1 },
      uMid: { value: 0.12 },
      uHigh: { value: 0.08 },
      uEnergy: { value: 0.14 },
      uTransient: { value: 0 },
      uWaveAmp: { value: 0.14 },
      uTransition: { value: 0 },
      uWarmth: { value: 0.72 },
      uFreqBands: { value: initialFreqBands },
    };

    // =========================================================================
    // 1. SCULPTED CELLULAR PLASMA / MEMBRANE SPHERE (Blue crown -> Orange base)
    // =========================================================================
    const sphereSegs = isSoftwareGl ? 72 : 128;
    const sphereGeo = new THREE.SphereGeometry(1.34, sphereSegs, sphereSegs);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0E1320'),
      metalness: 0.08,
      roughness: 0.32,
      clearcoat: 0.56,
      clearcoatRoughness: 0.18,
      iridescence: 0.06,
      iridescenceIOR: 1.3,
      envMapIntensity: 0.45,
    });

    sphereMat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, orbUniforms);

      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${ORB_CELLULAR_SHADER_COMMON}`)
        .replace(
          '#include <beginnormal_vertex>',
          `#include <beginnormal_vertex>
          float dCenter = evalCellularSurface(normalize(position)).x;
          vec3 upRef = abs(normal.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
          vec3 tangentA = normalize(cross(upRef, normal));
          vec3 tangentB = normalize(cross(normal, tangentA));
          float eps = 0.022;
          float dA = evalCellularSurface(normalize(position + tangentA * eps)).x;
          float dB = evalCellularSurface(normalize(position + tangentB * eps)).x;
          vec3 waveGrad = tangentA * ((dA - dCenter) / eps) + tangentB * ((dB - dCenter) / eps);
          objectNormal = normalize(objectNormal - waveGrad * 0.85);`
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          vec2 surfEval = evalCellularSurface(normalize(position));
          transformed += normal * surfEval.x;
          vObjPos = normalize(position);
          vCellMask = surfEval.y;
          vBandEnergy = sampleBandSpectrum(abs(vObjPos.y));`
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform float uTime;
          uniform float uBass;
          uniform float uMid;
          uniform float uHigh;
          uniform float uEnergy;
          uniform float uTransient;
          uniform float uTransition;
          varying vec3 vObjPos;
          varying float vCellMask;
          varying float vBandEnergy;`
        )
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
          float yGrad = clamp((vObjPos.y + 1.0) * 0.5, 0.0, 1.0);
          float viewFacing = clamp(abs(dot(normalize(vNormal), normalize(vViewPosition))), 0.0, 1.0);
          float rimMask = pow(1.0 - viewFacing, 1.45);

          // Multi-color cellular palette matching reference artwork:
          // Deep indigo/bronze pockets + warm copper interior + icy frost-blue crown/rim + orchid-violet mid + molten gold base
          vec3 valleyTop = vec3(0.035, 0.06, 0.12);
          vec3 valleyMid = vec3(0.065, 0.04, 0.055);
          vec3 valleyBot = vec3(0.14, 0.045, 0.015);
          vec3 valleyColor = mix(mix(valleyBot, valleyMid, smoothstep(0.08, 0.46, yGrad)), valleyTop, smoothstep(0.46, 0.9, yGrad));

          vec3 coreCopper = vec3(0.86, 0.38, 0.16);
          vec3 warmAmber = vec3(1.0, 0.52, 0.16);
          vec3 moltenGold = vec3(1.0, 0.84, 0.44);
          vec3 dustyViolet = vec3(0.64, 0.46, 0.72);
          vec3 slateIce = vec3(0.38, 0.68, 0.95);
          vec3 crownIce = vec3(0.74, 0.91, 1.0);

          // Warm copper veins extend up inside the center; icy blue wraps top dome & outer rim
          vec3 innerTone = mix(warmAmber, coreCopper, smoothstep(0.18, 0.78, yGrad));
          vec3 rimBlue = mix(dustyViolet, slateIce, smoothstep(0.32, 0.76, yGrad));
          rimBlue = mix(rimBlue, crownIce, smoothstep(0.74, 1.0, yGrad));

          float coolBlend = clamp(smoothstep(0.52, 0.94, yGrad) * 0.85 + rimMask * smoothstep(0.24, 0.62, yGrad) * 0.85, 0.0, 1.0);
          vec3 ridgeColor = mix(innerTone, rimBlue, coolBlend);

          // Subtle violet-pink tint across the equator where blue waveform crosses warm core
          float eqZone = exp(-pow((yGrad - 0.5) * 4.5, 2.0));
          ridgeColor = mix(ridgeColor, dustyViolet, eqZone * 0.36);
          ridgeColor = mix(moltenGold, ridgeColor, smoothstep(0.0, 0.24, yGrad));

          float crestMask = smoothstep(0.15, 0.88, vCellMask);
          diffuseColor.rgb = mix(valleyColor, ridgeColor, crestMask * 0.95);`
        )
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
          float yGradE = clamp((vObjPos.y + 1.0) * 0.5, 0.0, 1.0);
          float viewFacingE = clamp(abs(dot(normalize(vNormal), normalize(vViewPosition))), 0.0, 1.0);
          float fresnel = pow(1.0 - viewFacingE, 2.1);
          float sharpCrest = smoothstep(0.28, 0.95, vCellMask);

          vec3 emberBase = mix(vec3(1.0, 0.84, 0.42), vec3(1.0, 0.44, 0.12), smoothstep(0.0, 0.36, yGradE));
          vec3 midCopper = vec3(0.92, 0.42, 0.16);
          vec3 violetMid = vec3(0.66, 0.48, 0.76);
          vec3 iceTop = mix(vec3(0.36, 0.70, 1.0), vec3(0.76, 0.92, 1.0), smoothstep(0.6, 1.0, yGradE));

          float eqBelt = exp(-pow((yGradE - 0.5) * 4.2, 2.0));
          float topMask = clamp(smoothstep(0.5, 0.95, yGradE) * 0.82 + fresnel * smoothstep(0.22, 0.65, yGradE) * 0.85, 0.0, 1.0);

          vec3 interiorCrestGlow = mix(emberBase, midCopper, smoothstep(0.16, 0.68, yGradE));
          interiorCrestGlow = mix(interiorCrestGlow, iceTop, topMask);
          interiorCrestGlow = mix(interiorCrestGlow, violetMid, eqBelt * 0.34);

          vec3 rimGlowColor = mix(emberBase, iceTop, smoothstep(0.22, 0.62, yGradE));
          rimGlowColor = mix(rimGlowColor, violetMid, eqBelt * 0.42);

          float bottomHotspot = pow(smoothstep(0.48, -1.0, vObjPos.y), 2.2);

          totalEmissiveRadiance += interiorCrestGlow * sharpCrest * (0.42 + vBandEnergy * 0.72 + uTransient * 0.38 + uTransition * 0.3);
          totalEmissiveRadiance += rimGlowColor * fresnel * (0.52 + uEnergy * 0.52 + uHigh * 0.32);
          totalEmissiveRadiance += vec3(1.0, 0.62, 0.22) * bottomHotspot * (0.65 + uBass * 0.8 + uTransient * 0.5);`
        );
    };
    sphereMat.customProgramCacheKey = () => 'anibeats-cellular-plasma-orb-v4-multicolor';

    const coreSphere = new THREE.Mesh(sphereGeo, sphereMat);
    orbGroup.add(coreSphere);

    // Subtle warm inner amber glow core for volumetric depth behind translucent valleys
    const innerCoreGeo = new THREE.SphereGeometry(0.95, 32, 32);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FF6A1A'),
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    innerCore.position.y = -0.18;
    orbGroup.add(innerCore);

    // =========================================================================
    // 2. HORIZONTAL TRANSLUCENT ICE-BLUE ACOUSTIC WAVEFORM CURTAINS (LEFT-RIGHT)
    // =========================================================================
    const waveGroup = new THREE.Group();
    stageGroup.add(waveGroup);

    const waveSegs = isSoftwareGl ? 140 : 240;
    const waveSpan = 3.95; // extends left and right beyond the sphere into dark edges

    interface WaveformLayer {
      mesh: THREE.Mesh;
      lineTop: THREE.Line;
      lineBottom: THREE.Line;
      ribbonGeo: THREE.BufferGeometry;
      topGeo: THREE.BufferGeometry;
      bottomGeo: THREE.BufferGeometry;
      ribbonMat: THREE.ShaderMaterial;
      lineMat: THREE.LineBasicMaterial;
      ribbonPos: Float32Array;
      topPos: Float32Array;
      bottomPos: Float32Array;
      zOffset: number;
      ampScale: number;
      freqMul: number;
      phaseOffset: number;
      speed: number;
      opacity: number;
    }

    const layerConfigs = [
      { z: -0.22, ampScale: 1.05, freqMul: 1.0, phase: 0.0, speed: 3.1, opacity: 0.32 },
      { z: 0.04, ampScale: 0.88, freqMul: 1.45, phase: 1.85, speed: -4.2, opacity: 0.42 },
      { z: 0.28, ampScale: 0.72, freqMul: 2.05, phase: 3.4, speed: 5.4, opacity: 0.36 },
    ];

    const waveformLayers: WaveformLayer[] = layerConfigs.map((cfg) => {
      const ribbonGeo = new THREE.BufferGeometry();
      const ribbonPos = new Float32Array((waveSegs + 1) * 2 * 3);
      const ribbonUv = new Float32Array((waveSegs + 1) * 2 * 2);
      const indices: number[] = [];

      for (let i = 0; i <= waveSegs; i++) {
        const u = i / waveSegs;
        const x = (u * 2 - 1) * waveSpan;
        // Top vertex (even index), Bottom vertex (odd index)
        ribbonPos[i * 6 + 0] = x;
        ribbonPos[i * 6 + 1] = 0.2;
        ribbonPos[i * 6 + 2] = cfg.z;

        ribbonPos[i * 6 + 3] = x;
        ribbonPos[i * 6 + 4] = -0.2;
        ribbonPos[i * 6 + 5] = cfg.z;

        ribbonUv[i * 4 + 0] = u;
        ribbonUv[i * 4 + 1] = 1.0;
        ribbonUv[i * 4 + 2] = u;
        ribbonUv[i * 4 + 3] = 0.0;

        if (i < waveSegs) {
          const a = i * 2;
          const b = a + 1;
          const c = a + 2;
          const d = a + 3;
          indices.push(a, b, c, b, d, c);
        }
      }

      ribbonGeo.setAttribute('position', new THREE.BufferAttribute(ribbonPos, 3));
      ribbonGeo.setAttribute('uv', new THREE.BufferAttribute(ribbonUv, 2));
      ribbonGeo.setIndex(indices);

      const ribbonMat = new THREE.ShaderMaterial({
        uniforms: {
          uOpacity: { value: cfg.opacity },
          uEnergy: { value: 0.2 },
          uColorCore: { value: new THREE.Color('#BFE6FF') },
          uColorEdge: { value: new THREE.Color('#3B9EFF') },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          varying float vX;
          void main() {
            vUv = uv;
            vX = position.x;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uOpacity;
          uniform float uEnergy;
          uniform vec3 uColorCore;
          uniform vec3 uColorEdge;
          varying vec2 vUv;
          varying float vX;
          void main() {
            float centerDist = abs(vUv.y - 0.5) * 2.0; // 0 at center line, 1 at tips
            float edgeGlow = pow(centerDist, 1.6);
            float centerCore = exp(-centerDist * centerDist * 5.0);
            float horizFade = smoothstep(3.95, 2.55, abs(vX));
            vec3 col = mix(uColorEdge, uColorCore, centerCore * 0.75 + edgeGlow * 0.45);
            float alpha = uOpacity * horizFade * (0.28 + edgeGlow * 0.55 + centerCore * (0.45 + uEnergy * 0.35));
            gl_FragColor = vec4(col, alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(ribbonGeo, ribbonMat);
      mesh.renderOrder = 3;
      waveGroup.add(mesh);

      const topPos = new Float32Array((waveSegs + 1) * 3);
      const bottomPos = new Float32Array((waveSegs + 1) * 3);
      for (let i = 0; i <= waveSegs; i++) {
        const u = i / waveSegs;
        const x = (u * 2 - 1) * waveSpan;
        topPos[i * 3] = x;
        topPos[i * 3 + 2] = cfg.z;
        bottomPos[i * 3] = x;
        bottomPos[i * 3 + 2] = cfg.z;
      }

      const topGeo = new THREE.BufferGeometry();
      topGeo.setAttribute('position', new THREE.BufferAttribute(topPos, 3));
      const bottomGeo = new THREE.BufferGeometry();
      bottomGeo.setAttribute('position', new THREE.BufferAttribute(bottomPos, 3));

      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color('#9ED8FF'),
        transparent: true,
        opacity: Math.min(1, cfg.opacity * 1.45),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const lineTop = new THREE.Line(topGeo, lineMat);
      const lineBottom = new THREE.Line(bottomGeo, lineMat);
      lineTop.renderOrder = 4;
      lineBottom.renderOrder = 4;
      waveGroup.add(lineTop);
      waveGroup.add(lineBottom);

      return {
        mesh,
        lineTop,
        lineBottom,
        ribbonGeo,
        topGeo,
        bottomGeo,
        ribbonMat,
        lineMat,
        ribbonPos,
        topPos,
        bottomPos,
        zOffset: cfg.z,
        ampScale: cfg.ampScale,
        freqMul: cfg.freqMul,
        phaseOffset: cfg.phase,
        speed: cfg.speed,
        opacity: cfg.opacity,
      };
    });

    // Horizontal equatorial sparkling stardust suspended inside the blue waveform
    const dustCount = isSoftwareGl ? 150 : 280;
    const dustPos = new Float32Array(dustCount * 3);
    const dustSeed = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      const u = i / dustCount;
      const x = (u * 2 - 1) * 3.7 + Math.sin(i * 12.7) * 0.08;
      dustSeed[i] = i * 1.731;
      dustPos[i * 3] = x;
      dustPos[i * 3 + 1] = Math.sin(i * 7.3) * 0.22;
      dustPos[i * 3 + 2] = Math.cos(i * 4.1) * 0.45 + 0.15;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));

    const sparkCanvas = document.createElement('canvas');
    sparkCanvas.width = 32;
    sparkCanvas.height = 32;
    const sCtx = sparkCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(16, 16, 1, 16, 16, 15);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.35, 'rgba(180,228,255,0.75)');
      grad.addColorStop(1, 'rgba(100,180,255,0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 32, 32);
    }
    const sparkTex = new THREE.CanvasTexture(sparkCanvas);
    sparkTex.colorSpace = THREE.SRGBColorSpace;

    const dustMat = new THREE.PointsMaterial({
      size: 0.036,
      color: new THREE.Color('#D4EEFF'),
      map: sparkTex,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    dustPoints.renderOrder = 5;
    waveGroup.add(dustPoints);

    // =========================================================================
    // 3. DARK RIPPLED LIQUID WATER FLOOR WITH ORANGE GLOW REFLECTION & SPARKS
    // =========================================================================
    const waterGeo = new THREE.PlaneGeometry(
      9.4,
      5.4,
      isSoftwareGl ? 48 : 96,
      isSoftwareGl ? 32 : 64
    );
    waterGeo.rotateX(-Math.PI / 2);

    const waterMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uBass: { value: 0.1 },
        uEnergy: { value: 0.14 },
        uTransient: { value: 0 },
        uHigh: { value: 0.08 },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uBass;
        uniform float uTransient;
        varying vec3 vWorldPos;
        varying float vRippleH;

        float evalWaterHeight(vec2 p) {
          float r = length(p);
          float concentric = sin(r * 5.2 - uTime * (2.4 + uBass * 1.4)) * exp(-r * 0.28);
          float crossWave = sin(p.x * 2.8 + uTime * 1.1) * cos(p.y * 3.4 - uTime * 0.9);
          float micro = sin(p.x * 6.5 - p.y * 5.2 + uTime * 2.2) * 0.25;
          float amp = 0.028 + uBass * 0.055 + uTransient * 0.03;
          return (concentric * 0.55 + crossWave * 0.35 + micro * 0.2) * amp;
        }

        void main() {
          vec3 pos = position;
          float h = evalWaterHeight(pos.xz);
          pos.y += h;
          vRippleH = h;
          vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
          vWorldPos = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uBass;
        uniform float uEnergy;
        uniform float uTransient;
        uniform float uHigh;
        varying vec3 vWorldPos;
        varying float vRippleH;

        void main() {
          vec2 p = vWorldPos.xz;
          float r = length(p);

          // Procedural wave normal distortion for shimmering liquid caustics
          float nx = cos(p.x * 3.1 + uTime * 1.2) * 0.22 + cos(r * 5.2 - uTime * 2.4) * (p.x / max(0.05, r)) * 0.25;
          float nz = sin(p.y * 3.6 - uTime * 1.0) * 0.22 + cos(r * 5.2 - uTime * 2.4) * (p.y / max(0.05, r)) * 0.25;
          vec2 distortedP = p + vec2(nx, nz) * (0.42 + uBass * 0.35);

          float reflectRadius = length(vec2(distortedP.x * 0.88, distortedP.y * 0.72));
          float ringReflect = exp(-pow(reflectRadius - 0.58, 2.0) * 5.5);
          float coreReflect = exp(-reflectRadius * reflectRadius * 1.45);
          float outerScatter = exp(-reflectRadius * 0.78);

          // Shimmering cellular glint lines on wave crests
          float glint = pow(clamp(0.5 + 0.5 * sin(distortedP.x * 8.5 + distortedP.y * 6.0 + uTime * 2.6), 0.0, 1.0), 6.0);

          vec3 baseWater = vec3(0.018, 0.022, 0.036);
          vec3 deepEmber = vec3(0.75, 0.20, 0.04);
          vec3 brightOrange = vec3(1.0, 0.48, 0.14);
          vec3 goldSpark = vec3(1.0, 0.84, 0.48);
          vec3 blueMist = vec3(0.18, 0.48, 0.85);

          float glowGain = 0.65 + uBass * 0.75 + uTransient * 0.45;
          vec3 reflection = deepEmber * outerScatter * 0.55 * glowGain;
          reflection += brightOrange * (coreReflect * 0.72 + ringReflect * 0.62) * glowGain;
          reflection += goldSpark * (ringReflect * 0.45 + glint * coreReflect * 0.85) * glowGain;
          reflection += blueMist * glint * smoothstep(1.2, 3.2, r) * (0.14 + uHigh * 0.28);

          // Soft circular edge alpha fade so water blends seamlessly into container void
          float edgeAlpha = smoothstep(4.6, 2.1, length(vec2(p.x * 0.95, p.y * 1.3)));
          gl_FragColor = vec4(baseWater + reflection, edgeAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
    });

    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(0, -1.62, 0.2);
    waterMesh.renderOrder = 1;
    stageGroup.add(waterMesh);

    // Floating warm golden/orange ember sparks hovering over the water reflection
    const emberCount = isSoftwareGl ? 65 : 120;
    const emberPos = new Float32Array(emberCount * 3);
    const emberBaseX = new Float32Array(emberCount);
    const emberBaseZ = new Float32Array(emberCount);
    const emberPhase = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
      const ang = i * 2.39996; // golden angle spread
      const rad = 0.25 + Math.sqrt(i / emberCount) * 2.85;
      emberBaseX[i] = Math.cos(ang) * rad;
      emberBaseZ[i] = Math.sin(ang) * rad * 0.65 + 0.25;
      emberPhase[i] = i * 0.71;
      emberPos[i * 3] = emberBaseX[i];
      emberPos[i * 3 + 1] = -1.52 + (i % 7) * 0.035;
      emberPos[i * 3 + 2] = emberBaseZ[i];
    }

    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
    const emberMat = new THREE.PointsMaterial({
      size: 0.052,
      color: new THREE.Color('#FFB15C'),
      map: sparkTex,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const emberPoints = new THREE.Points(emberGeo, emberMat);
    emberPoints.renderOrder = 2;
    stageGroup.add(emberPoints);

    // Pre-compile WebGL shaders upfront on hardware GPUs
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Pointer interaction (drag to inspect orb rotation gently without breaking horizontal wave axis)
    let pointerDown = false;
    let lastPtrX = 0;
    let lastPtrY = 0;
    let targetYawOffset = 0;
    let targetPitchOffset = 0;
    let currentYawOffset = 0;
    let currentPitchOffset = 0;
    let hoverX = 0;
    let hoverY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      pointerDown = true;
      lastPtrX = e.clientX;
      lastPtrY = e.clientY;
      setIsDragging(true);
      try {
        renderer?.domElement.setPointerCapture(e.pointerId);
      } catch {
        // ignore synthetic capture error
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = renderer?.domElement.getBoundingClientRect();
      if (rect && rect.width > 0 && rect.height > 0) {
        hoverX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        hoverY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      }
      if (!pointerDown) return;
      const dx = e.clientX - lastPtrX;
      const dy = e.clientY - lastPtrY;
      lastPtrX = e.clientX;
      lastPtrY = e.clientY;
      targetYawOffset += dx * 0.0085;
      targetPitchOffset = Math.max(-0.55, Math.min(0.55, targetPitchOffset + dy * 0.0055));
    };

    const handlePointerUp = () => {
      pointerDown = false;
      setIsDragging(false);
    };

    const canvasEl = renderer.domElement;
    canvasEl.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('pointercancel', handlePointerUp, { passive: true });

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionQuery.matches;
    const handleMotionChange = (ev: MediaQueryListEvent) => {
      reducedMotion = ev.matches;
    };
    motionQuery.addEventListener('change', handleMotionChange);

    let inViewport = true;
    let tabVisible = !document.hidden;
    let contextLost = false;
    let disposed = false;

    let rafId = 0;
    let softTimerId = 0;

    let smoothedBass = 0.09;
    let smoothedMid = 0.11;
    let smoothedHigh = 0.07;
    let smoothedEnergy = 0.12;
    let smoothedTransient = 0;
    let smoothedWaveAmp = 0.12;
    let smoothedRotSpeed = 0.12;
    let continuousSpinAngle = 0;
    const smoothedBands = new Float32Array(BAND_COUNT).fill(0.06);

    let prevNow = performance.now();
    let elapsedSec = 0;

    const shouldRender = () => !disposed && !contextLost && inViewport && tabVisible;

    const afterDraw = (cb: () => void) => {
      const glCtx = renderer?.getContext() as WebGL2RenderingContext | undefined;
      if (!glCtx || typeof glCtx.fenceSync !== 'function') {
        softTimerId = window.setTimeout(cb, 80);
        return;
      }
      const sync = glCtx.fenceSync(glCtx.SYNC_GPU_COMMANDS_COMPLETE, 0);
      glCtx.flush();
      const poll = () => {
        if (!shouldRender()) {
          if (sync) glCtx.deleteSync(sync);
          return;
        }
        const state = sync ? glCtx.getSyncParameter(sync, glCtx.SYNC_STATUS) : glCtx.SIGNALED;
        if (state === glCtx.UNSIGNALED) {
          softTimerId = window.setTimeout(poll, 5);
        } else {
          if (sync) glCtx.deleteSync(sync);
          softTimerId = window.setTimeout(cb, 80);
        }
      };
      softTimerId = window.setTimeout(poll, 5);
    };

    const renderFrame = (now: number) => {
      if (!shouldRender() || !renderer) return;

      const dt = Math.min(0.05, Math.max(0.001, (now - prevNow) / 1000));
      prevNow = now;
      elapsedSec += dt;

      if (transitionImpulseRef.current > 0.001) {
        transitionImpulseRef.current = THREE.MathUtils.damp(
          transitionImpulseRef.current,
          0,
          3.4,
          dt
        );
      } else {
        transitionImpulseRef.current = 0;
      }

      const live = liveStateRef.current;
      let targetMetrics =
        live.syncMode === 'web-audio-fft' && live.status === 'playing'
          ? live.webAudioEngine.sampleMetrics(reducedMotion, transitionImpulseRef.current)
          : null;

      if (!targetMetrics) {
        targetMetrics = computeProceduralOrbMetrics({
          status: live.status,
          elapsedSec,
          positionMs: live.positionMs,
          transitionImpulse: transitionImpulseRef.current,
          track: live.track,
          reducedMotion,
        });
      }

      const dampRate = live.status === 'paused' ? 2.8 : 10.5;
      smoothedBass = THREE.MathUtils.damp(smoothedBass, targetMetrics.bass, dampRate, dt);
      smoothedMid = THREE.MathUtils.damp(smoothedMid, targetMetrics.mid, dampRate, dt);
      smoothedHigh = THREE.MathUtils.damp(smoothedHigh, targetMetrics.high, dampRate, dt);
      smoothedEnergy = THREE.MathUtils.damp(smoothedEnergy, targetMetrics.energy, dampRate, dt);
      smoothedTransient = THREE.MathUtils.damp(
        smoothedTransient,
        targetMetrics.transient,
        14.0,
        dt
      );
      smoothedWaveAmp = THREE.MathUtils.damp(
        smoothedWaveAmp,
        targetMetrics.waveAmplitude,
        dampRate,
        dt
      );
      smoothedRotSpeed = THREE.MathUtils.damp(
        smoothedRotSpeed,
        targetMetrics.rotationSpeed,
        3.0,
        dt
      );

      const bandDamp = live.status === 'paused' ? 3.2 : 14.0;
      for (let i = 0; i < BAND_COUNT; i++) {
        const targetBand = targetMetrics.bands[i] ?? 0.05;
        smoothedBands[i] = THREE.MathUtils.damp(smoothedBands[i], targetBand, bandDamp, dt);
        orbUniforms.uFreqBands.value[i] = smoothedBands[i];
      }

      // Update sphere uniforms
      orbUniforms.uTime.value = elapsedSec;
      orbUniforms.uBass.value = smoothedBass;
      orbUniforms.uMid.value = smoothedMid;
      orbUniforms.uHigh.value = smoothedHigh;
      orbUniforms.uEnergy.value = smoothedEnergy;
      orbUniforms.uTransient.value = smoothedTransient;
      orbUniforms.uWaveAmp.value = smoothedWaveAmp;
      orbUniforms.uTransition.value = transitionImpulseRef.current;
      orbUniforms.uWarmth.value = THREE.MathUtils.damp(
        orbUniforms.uWarmth.value,
        live.track.energyProfile.warmth,
        2.5,
        dt
      );

      // Update water reflection uniforms
      waterMat.uniforms.uTime.value = elapsedSec;
      waterMat.uniforms.uBass.value = smoothedBass;
      waterMat.uniforms.uEnergy.value = smoothedEnergy;
      waterMat.uniforms.uTransient.value = smoothedTransient;
      waterMat.uniforms.uHigh.value = smoothedHigh;

      // Orb continuous spin + user drag inspect
      continuousSpinAngle += dt * smoothedRotSpeed;
      if (!pointerDown) {
        targetPitchOffset = THREE.MathUtils.damp(targetPitchOffset, hoverY * -0.08, 2.2, dt);
      }
      currentYawOffset = THREE.MathUtils.damp(currentYawOffset, targetYawOffset, 6.5, dt);
      currentPitchOffset = THREE.MathUtils.damp(currentPitchOffset, targetPitchOffset, 6.5, dt);

      orbGroup.rotation.y = continuousSpinAngle + currentYawOffset + (pointerDown ? 0 : hoverX * 0.1);
      orbGroup.rotation.x = currentPitchOffset;

      const scaleBreath =
        1 +
        smoothedBass * 0.042 +
        smoothedTransient * 0.025 +
        transitionImpulseRef.current * 0.028;
      coreSphere.scale.setScalar(scaleBreath);
      innerCoreMat.opacity = 0.14 + smoothedBass * 0.28 + smoothedTransient * 0.18;

      // Update horizontal translucent acoustic waveform curtains from 16 frequency bands
      for (let l = 0; l < waveformLayers.length; l++) {
        const layer = waveformLayers[l];
        const rPos = layer.ribbonPos;
        const tPos = layer.topPos;
        const bPos = layer.bottomPos;

        layer.ribbonMat.uniforms.uEnergy.value = smoothedEnergy;

        for (let i = 0; i <= waveSegs; i++) {
          const u = i / waveSegs;
          const x = (u * 2 - 1) * waveSpan;
          const absU = Math.abs(u * 2 - 1); // 0 at sphere core center, 1 at far left/right edges

          // Map center outward: sub/low-mids drive bold inner waves, highs drive crisp side flutters
          const bandIdxFloat = absU * (BAND_COUNT - 1);
          const idx0 = Math.min(BAND_COUNT - 1, Math.floor(bandIdxFloat));
          const idx1 = Math.min(BAND_COUNT - 1, idx0 + 1);
          const frac = bandIdxFloat - idx0;
          const bandAmp = smoothedBands[idx0] * (1 - frac) + smoothedBands[idx1] * frac;

          // Multi-harmonic standing & traveling wave envelope
          const carrier = Math.sin(
            x * (4.6 * layer.freqMul) + elapsedSec * layer.speed + layer.phaseOffset
          );
          const overtone = Math.cos(
            x * (10.8 * layer.freqMul) - elapsedSec * layer.speed * 1.35 + layer.phaseOffset * 0.7
          );
          const fineSpike = Math.sin(x * 19.5 + elapsedSec * layer.speed * 2.1);

          // Slightly taller symmetric wings flanking the orb + strong center vibration
          const shapeEnvelope =
            (0.45 + 0.55 * Math.sin(absU * Math.PI * 0.85)) *
            smoothStepClamp(3.92, 2.75, Math.abs(x));

          const vibGain = reducedMotion
            ? 0.08 + bandAmp * 0.12
            : 0.12 + bandAmp * 1.15 + smoothedEnergy * 0.35 + smoothedTransient * 0.28;

          const waveVal =
            (Math.abs(carrier) * 0.58 +
              Math.abs(overtone) * 0.28 +
              Math.abs(fineSpike) * (0.14 + smoothedHigh * 0.25)) *
            vibGain *
            layer.ampScale *
            shapeEnvelope;

          // Asymmetric wave wiggle inside mirrored top/bottom envelope for authentic audio trace feel
          const asym = carrier * 0.085 * vibGain * shapeEnvelope;
          const yTop = Math.max(0.02, waveVal + asym);
          const yBot = -Math.max(0.02, waveVal - asym);

          rPos[i * 6 + 1] = yTop;
          rPos[i * 6 + 4] = yBot;
          tPos[i * 3 + 1] = yTop;
          bPos[i * 3 + 1] = yBot;
        }

        (layer.ribbonGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
        (layer.topGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
        (layer.bottomGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
        layer.lineMat.opacity = Math.min(0.95, layer.opacity * (1.1 + smoothedEnergy * 0.8));
      }

      // Animate stardust along the horizontal waveform band
      for (let i = 0; i < dustCount; i++) {
        const x = dustPos[i * 3];
        const bandIdx = Math.min(
          BAND_COUNT - 1,
          Math.floor((Math.abs(x) / waveSpan) * (BAND_COUNT - 1))
        );
        const bVal = smoothedBands[bandIdx];
        dustPos[i * 3 + 1] =
          Math.sin(dustSeed[i] + elapsedSec * (1.8 + smoothedHigh * 2.4)) *
          (0.09 + bVal * 0.45) *
          smoothStepClamp(3.85, 2.5, Math.abs(x));
      }
      (dustGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
      dustMat.opacity = 0.42 + smoothedHigh * 0.48 + smoothedEnergy * 0.2;

      // Animate warm ember sparks hovering over dark water reflection
      for (let i = 0; i < emberCount; i++) {
        const lift = Math.sin(elapsedSec * 1.4 + emberPhase[i]) * 0.035;
        emberPos[i * 3 + 1] =
          -1.56 + ((i % 7) * 0.028) + lift + smoothedBass * 0.06;
      }
      (emberGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
      emberMat.opacity = 0.48 + smoothedBass * 0.45 + smoothedTransient * 0.25;

      bottomMoltenLight.intensity = 2.8 + smoothedBass * 1.8 + smoothedTransient * 1.1;
      topIceLight.intensity = 2.1 + smoothedHigh * 1.05;

      renderer.render(scene, camera);

      if (!shouldRender()) return;
      if (isSoftwareGl) {
        afterDraw(() => {
          if (shouldRender()) {
            rafId = window.requestAnimationFrame(renderFrame);
          }
        });
      } else {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    const startLoop = () => {
      if (!shouldRender()) return;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(softTimerId);
      prevNow = performance.now();
      rafId = window.requestAnimationFrame(renderFrame);
    };

    const stopLoop = () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(softTimerId);
    };

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        inViewport = visible;
        if (visible) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    const handleVisibilityChange = () => {
      tabVisible = !document.hidden;
      if (tabVisible) {
        startLoop();
      } else {
        stopLoop();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const resizeObserver = new ResizeObserver(() => {
      if (!renderer || !container) return;
      const w = Math.max(220, container.clientWidth);
      const h = Math.max(220, container.clientHeight);
      camera.aspect = w / h;
      camera.position.z = w < 400 ? 6.9 : 6.15;
      camera.updateProjectionMatrix();
      applyRendererSizing();
    });
    resizeObserver.observe(container);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
      stopLoop();
    };
    const handleContextRestored = () => {
      contextLost = false;
      startLoop();
    };
    canvasEl.addEventListener('webglcontextlost', handleContextLost);
    canvasEl.addEventListener('webglcontextrestored', handleContextRestored);

    startLoop();

    return () => {
      disposed = true;
      stopLoop();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      motionQuery.removeEventListener('change', handleMotionChange);
      canvasEl.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      canvasEl.removeEventListener('webglcontextlost', handleContextLost);
      canvasEl.removeEventListener('webglcontextrestored', handleContextRestored);

      sphereGeo.dispose();
      sphereMat.dispose();
      innerCoreGeo.dispose();
      innerCoreMat.dispose();
      for (const layer of waveformLayers) {
        layer.ribbonGeo.dispose();
        layer.topGeo.dispose();
        layer.bottomGeo.dispose();
        layer.ribbonMat.dispose();
        layer.lineMat.dispose();
      }
      dustGeo.dispose();
      dustMat.dispose();
      waterGeo.dispose();
      waterMat.dispose();
      emberGeo.dispose();
      emberMat.dispose();
      sparkTex.dispose();
      envTarget.dispose();
      renderer?.dispose();
    };
  }, []);

  if (webglFailed) {
    return <SonicOrbSvgFallback status={status} />;
  }

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`Interactive 3D Sonic Orb visualizing ${track.title} (${status})`}
      className={`w-full h-full relative select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    />
  );
}

function smoothStepClamp(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function SonicOrbSvgFallback({ status }: { status: OrbPlaybackStatus }) {
  const isPlaying = status === 'playing';
  return (
    <div
      role="img"
      aria-label="Sonic Orb fallback artwork"
      className="w-full h-full flex flex-col items-center justify-center p-6"
    >
      <svg
        viewBox="0 0 320 320"
        className={`w-64 h-64 sm:w-80 sm:h-80 ${
          isPlaying ? 'animate-[spin_18s_linear_infinite]' : ''
        }`}
      >
        <defs>
          <linearGradient id="orbFallbackCore" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#BDE3FF" stopOpacity="0.96" />
            <stop offset="30%" stopColor="#488BC9" stopOpacity="0.9" />
            <stop offset="52%" stopColor="#9C74B3" stopOpacity="0.88" />
            <stop offset="76%" stopColor="#F27229" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#FFE296" stopOpacity="0.98" />
          </linearGradient>
        </defs>
        <circle cx="160" cy="144" r="96" fill="url(#orbFallbackCore)" />
        <path
          d="M 16 144 Q 65 96, 110 144 T 210 144 T 304 144"
          fill="none"
          stroke="#9ED8FF"
          strokeOpacity="0.72"
          strokeWidth="2.5"
        />
        <ellipse
          cx="160"
          cy="266"
          rx="92"
          ry="18"
          fill="#FF6A1A"
          fillOpacity="0.32"
        />
      </svg>
      <p className="font-data text-[11px] text-zinc-500 mt-2">
        Static visual fallback active (WebGL unavailable)
      </p>
    </div>
  );
}
