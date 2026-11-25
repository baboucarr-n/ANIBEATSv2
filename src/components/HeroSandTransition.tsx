import { useEffect, useRef, type ReactNode } from 'react';

interface HeroSandTransitionProps {
  children: ReactNode;
}

interface SandGrain {
  nx: number;
  ny: number;
  threshold: number;
  size: number;
  speed: number;
  drift: number;
  funnel: number;
  phase: number;
  color: string;
}

function hash01(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

/**
 * Wraps the untouched HeroStartingPage and drives a smooth, bottom-to-top
 * hourglass sand dissolve as the user scrolls out of Hero into Anime World rising underneath.
 */
export function HeroSandTransition({ children }: HeroSandTransitionProps) {
  const runwayRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const heroMaskRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grainsRef = useRef<SandGrain[]>([]);
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);

  // Build dense, real-pixel sand grains sampled from Hero portrait, pattern, & UI typography
  useEffect(() => {
    let cancelled = false;
    const heroWrap = heroMaskRef.current;
    if (!heroWrap) return;

    const portraitImg = new Image();
    const motifImg = new Image();
    let loadedCount = 0;

    const buildGrainSnapshot = () => {
      if (cancelled || !heroMaskRef.current || !canvasRef.current) return;
      const rect = heroMaskRef.current.getBoundingClientRect();
      const w = Math.max(320, Math.round(rect.width));
      const h = Math.max(480, Math.round(rect.height));

      // Sampling grid resolution (~180x110 = ~19,800 crisp sand grains)
      const cols = w >= 900 ? 185 : 120;
      const rows = Math.max(85, Math.round((cols * h) / w));

      const off = document.createElement('canvas');
      off.width = cols;
      off.height = rows;
      const octx = off.getContext('2d', { willReadFrequently: true });
      if (!octx) return;

      // 1. Base Hero wall #FAF6F1
      octx.fillStyle = '#FAF6F1';
      octx.fillRect(0, 0, cols, rows);

      // 2. Portrait image matching CSS object-cover object-[50%_58%] md:object-[50%_72%]
      if (portraitImg.complete && portraitImg.naturalWidth > 0) {
        const iw = portraitImg.naturalWidth;
        const ih = portraitImg.naturalHeight;
        const scale = Math.max(cols / iw, rows / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        const objPosY = w >= 768 ? 0.72 : 0.58;
        const dx = (cols - dw) * 0.5;
        const dy = (rows - dh) * objPosY;
        octx.drawImage(portraitImg, dx, dy, dw, dh);
      }

      // 3. Soft ivory top & left washes + calm pastel aura tints matching Hero layers
      const topGrad = octx.createLinearGradient(0, 0, 0, rows * 0.36);
      topGrad.addColorStop(0, 'rgba(250, 246, 241, 0.78)');
      topGrad.addColorStop(1, 'rgba(250, 246, 241, 0)');
      octx.fillStyle = topGrad;
      octx.fillRect(0, 0, cols, rows * 0.36);

      if (w >= 768) {
        const leftGrad = octx.createLinearGradient(0, 0, cols * 0.4, 0);
        leftGrad.addColorStop(0, 'rgba(250, 246, 241, 0.74)');
        leftGrad.addColorStop(1, 'rgba(250, 246, 241, 0)');
        octx.fillStyle = leftGrad;
        octx.fillRect(0, 0, cols * 0.4, rows);
      }

      // Calm lavender/cyan/peach edge washes
      const lav = octx.createRadialGradient(cols * 0.14, rows * 0.22, 2, cols * 0.14, rows * 0.22, cols * 0.32);
      lav.addColorStop(0, 'rgba(216, 206, 248, 0.45)');
      lav.addColorStop(1, 'rgba(216, 206, 248, 0)');
      octx.fillStyle = lav;
      octx.fillRect(0, 0, cols, rows);

      const cyan = octx.createRadialGradient(cols * 0.88, rows * 0.3, 2, cols * 0.88, rows * 0.3, cols * 0.32);
      cyan.addColorStop(0, 'rgba(194, 238, 246, 0.4)');
      cyan.addColorStop(1, 'rgba(194, 238, 246, 0)');
      octx.fillStyle = cyan;
      octx.fillRect(0, 0, cols, rows);

      // 4. Subtle African motif texture tint around margins
      if (motifImg.complete && motifImg.naturalWidth > 0) {
        octx.save();
        octx.globalAlpha = 0.14;
        octx.drawImage(motifImg, 0, 0, cols, rows);
        octx.restore();
      }

      // 5. Paint live DOM positions of Hero text, button dock, header, and world card
      const sx = cols / w;
      const sy = rows / h;

      const paintRect = (el: Element | null, fill: string) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) return;
        const rx = (r.left - rect.left) * sx;
        const ry = (r.top - rect.top) * sy;
        const rw = r.width * sx;
        const rh = r.height * sy;
        octx.fillStyle = fill;
        octx.fillRect(rx, ry, rw, rh);
      };

      const h1El = heroMaskRef.current.querySelector('h1');
      if (h1El) {
        const r = h1El.getBoundingClientRect();
        const rx = (r.left - rect.left) * sx;
        const ry = (r.top - rect.top) * sy;
        const rw = r.width * sx;
        const rh = r.height * sy;
        octx.fillStyle = '#18181B';
        const lines = 4;
        const lineH = rh / lines;
        for (let l = 0; l < lines; l++) {
          octx.fillRect(rx, ry + l * lineH + 1, rw * (l === lines - 1 ? 0.65 : 0.94), Math.max(1.5, lineH * 0.56));
        }
      }

      const mainEl = heroMaskRef.current.querySelector('main');
      if (mainEl) {
        const subP = mainEl.querySelectorAll('p')[1];
        if (subP) {
          const r = subP.getBoundingClientRect();
          const rx = (r.left - rect.left) * sx;
          const ry = (r.top - rect.top) * sy;
          const rw = r.width * sx;
          const rh = r.height * sy;
          octx.fillStyle = '#3F3F46';
          for (let l = 0; l < 3; l++) {
            octx.fillRect(rx, ry + (l * rh) / 3, rw * (l === 2 ? 0.7 : 0.92), Math.max(1, rh * 0.16));
          }
        }
      }

      // Header wordmark & nav links
      const headerBrand = heroMaskRef.current.querySelector('header a');
      paintRect(headerBrand, '#18181B');
      const headerNavBtns = heroMaskRef.current.querySelectorAll('header nav button');
      headerNavBtns.forEach((btn) => paintRect(btn, '#52525B'));

      // Primary dark CTA button + dock + Explore button + world card
      const buttons = heroMaskRef.current.querySelectorAll('button');
      buttons.forEach((btn) => {
        const cls = btn.className || '';
        if (cls.includes('bg-zinc-950')) {
          paintRect(btn, '#18181B');
        }
      });

      const asideEl = heroMaskRef.current.querySelector('aside');
      if (asideEl) {
        paintRect(asideEl, 'rgba(250, 246, 241, 0.92)');
        const r = asideEl.getBoundingClientRect();
        const rx = (r.left - rect.left) * sx;
        const ry = (r.top - rect.top) * sy;
        const rw = r.width * sx;
        octx.fillStyle = '#18181B';
        octx.fillRect(rx + 2, ry + 5, rw * 0.72, 2);
        octx.fillStyle = '#9F8FEF';
        octx.fillRect(rx + 2, ry + (r.height * sy) - 3, rw * 0.25, 1.5);
      }

      // Extract sampled pixel data into fast SandGrain list
      const imgData = octx.getImageData(0, 0, cols, rows).data;
      const nextGrains: SandGrain[] = [];

      for (let iy = 0; iy < rows; iy++) {
        for (let ix = 0; ix < cols; ix++) {
          const idx = (iy * cols + ix) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];

          const seed = iy * cols + ix + 1;
          const j1 = hash01(seed);
          const j2 = hash01(seed * 1.37 + 19);
          const j3 = hash01(seed * 2.13 + 73);
          const j4 = hash01(seed * 3.07 + 41);

          const nx = (ix + (j1 - 0.5) * 0.85) / cols;
          const ny = (iy + (j2 - 0.5) * 0.85) / rows;

          // Subtle hourglass curve: bottom breaks slightly faster near middle-x like pouring sand
          const centerBias = (1 - Math.abs(nx - 0.5) * 2) * 0.035;
          const threshold = Math.max(0.01, Math.min(0.995, ny + (j3 - 0.5) * 0.085 + centerBias));

          nextGrains.push({
            nx,
            ny,
            threshold,
            size: 1.6 + j4 * 2.2,
            speed: 0.65 + j1 * 0.85,
            drift: (j2 - 0.5) * 38,
            funnel: (0.5 - nx) * 26,
            phase: j3 * Math.PI * 2,
            color: `rgb(${r},${g},${b})`,
          });
        }
      }

      grainsRef.current = nextGrains;
    };

    const onAssetReady = () => {
      loadedCount += 1;
      if (loadedCount >= 1) {
        buildGrainSnapshot();
      }
    };

    portraitImg.onload = onAssetReady;
    portraitImg.onerror = onAssetReady;
    motifImg.onload = onAssetReady;
    motifImg.onerror = onAssetReady;

    portraitImg.src = '/assets/aistudio/image_f89375b5.png';
    motifImg.src = '/assets/aistudio/image_e71aa317.png';

    const ro = new ResizeObserver(() => {
      buildGrainSnapshot();
    });
    ro.observe(heroWrap);

    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, []);

  // 60fps scroll-driven hourglass sand render loop
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let rafId = 0;

    const updateTargetProgress = () => {
      const runway = runwayRef.current;
      if (!runway) return;
      const rect = runway.getBoundingClientRect();
      const scrollSpan = Math.max(1, runway.offsetHeight - window.innerHeight);
      const raw = Math.max(0, Math.min(1, -rect.top / scrollSpan));
      targetProgressRef.current = raw;
    };

    const renderFrame = () => {
      const canvas = canvasRef.current;
      const heroMask = heroMaskRef.current;
      const sticky = stickyRef.current;
      if (!canvas || !heroMask || !sticky) {
        rafId = requestAnimationFrame(renderFrame);
        return;
      }

      const targetP = targetProgressRef.current;
      const prevP = progressRef.current;
      const nextP =
        Math.abs(targetP - prevP) < 0.0008
          ? targetP
          : prevP + (targetP - prevP) * 0.24;
      progressRef.current = nextP;

      // Toggle pointer events so Anime World underneath becomes interactive as Hero dissolves
      sticky.style.pointerEvents = targetP > 0.35 ? 'none' : 'auto';

      if (prefersReduced) {
        heroMask.style.opacity = String(Math.max(0, 1 - targetP));
        heroMask.style.maskImage = 'none';
        heroMask.style.webkitMaskImage = 'none';
        rafId = requestAnimationFrame(renderFrame);
        return;
      }

      // Erode Hero DOM smoothly from bottom to top synced 1:1 with rising Anime top edge (zero gap)
      if (targetP <= 0.001) {
        heroMask.style.maskImage = 'none';
        heroMask.style.webkitMaskImage = 'none';
        heroMask.style.opacity = '1';
      } else if (targetP >= 0.996) {
        heroMask.style.opacity = '0';
      } else {
        heroMask.style.opacity = '1';
        const cutPct = Math.max(0, (1 - targetP) * 100);
        const softStart = Math.max(0, cutPct - 6.5);
        const midStop = Math.max(0, cutPct - 2.4);
        const endStop = Math.min(100, cutPct + 0.6);
        const maskStr = `linear-gradient(to bottom, #000 0%, #000 ${softStart.toFixed(
          2
        )}%, rgba(0,0,0,0.52) ${midStop.toFixed(2)}%, transparent ${endStop.toFixed(2)}%)`;
        heroMask.style.maskImage = maskStr;
        heroMask.style.webkitMaskImage = maskStr;
      }

      // Resize canvas backing buffer only when dimensions change
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = sticky.clientWidth;
      const ch = sticky.clientHeight;
      if (cw > 0 && ch > 0) {
        const targetW = Math.round(cw * dpr);
        const targetH = Math.round(ch * dpr);
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }
      }

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, cw, ch);

        if (nextP > 0.002 && nextP < 0.998) {
          // Dissolve line rises from bottom (1.05) past top (-0.07)
          const erodeFront = 1.05 - nextP * 1.12;
          const grains = grainsRef.current;
          const fallSpan = 0.36;

          for (let i = 0; i < grains.length; i++) {
            const g = grains[i];
            const diff = g.threshold - erodeFront;
            if (diff <= 0 || diff >= fallSpan) continue;

            const age = diff / fallSpan; // 0 = just detached, 1 = faded out
            const alpha = age < 0.14 ? age / 0.14 : Math.max(0, 1 - (age - 0.14) / 0.86);
            if (alpha <= 0.03) continue;

            const px =
              g.nx * cw +
              Math.sin(age * 4.5 + g.phase) * g.drift * age +
              g.funnel * age * age;
            const py = g.ny * ch + age * age * g.speed * ch * 0.44;

            if (py < -8 || py > ch + 8) continue;

            ctx.globalAlpha = alpha;
            ctx.fillStyle = g.color;
            ctx.fillRect(px, py, g.size, g.size);
          }
          ctx.globalAlpha = 1;
        }
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    updateTargetProgress();
    window.addEventListener('scroll', updateTargetProgress, { passive: true });
    window.addEventListener('resize', updateTargetProgress, { passive: true });
    rafId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', updateTargetProgress);
      window.removeEventListener('resize', updateTargetProgress);
    };
  }, []);

  return (
    <div ref={runwayRef} className="relative h-[200dvh] z-20 pointer-events-none">
      <div
        ref={stickyRef}
        className="sticky top-0 h-[100dvh] w-full overflow-hidden pointer-events-auto"
      >
        <div ref={heroMaskRef} className="w-full h-full">
          {children}
        </div>
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 w-full h-full z-40"
        />
      </div>
    </div>
  );
}
