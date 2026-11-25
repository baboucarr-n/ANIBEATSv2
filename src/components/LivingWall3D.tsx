import { useEffect, useState } from 'react';
import { motion, type MotionValue, useTransform } from 'motion/react';

export interface LivingPanelSpec {
  id: string;
  src: string;
  alt: string;
  /** Percentage left position inside stage */
  left: string;
  /** Percentage top position inside stage */
  top: string;
  /** Width classes responsive */
  sizeClass: string;
  /** Aspect class matching photo orientation */
  aspectClass: string;
  /** Base 3D tilt degrees */
  tiltX: number;
  tiltY: number;
  tiltZ: number;
  /** Parallax depth multiplier (higher = closer) */
  depth: number;
  /** Continuous gentle drift phase */
  phase: number;
}

interface LivingWallZoneProps {
  panels: LivingPanelSpec[];
  scrollYProgress: MotionValue<number>;
  paused: boolean;
  /** Softened + blurred behind dense card grids (e.g., My Collection) */
  softBlurBehindCards?: boolean;
  /** Big cinematic stage framing (e.g., Currently Watching) */
  cinematicSolo?: boolean;
  /** Continuous slow 3D orbital rotation (e.g., Discovery) */
  slowRotate?: boolean;
  /** Scroll parallax amplitude in px */
  parallaxRange?: number;
  /** Optional connector line geometry between panels */
  connectorStyle?: 'hero' | 'collection' | 'watching' | 'discovery';
}

export function LivingWallZone({
  panels,
  scrollYProgress,
  paused,
  softBlurBehindCards = false,
  cinematicSolo = false,
  slowRotate = false,
  parallaxRange = 54,
  connectorStyle = 'hero',
}: LivingWallZoneProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Every 4 seconds, glide the next 3D glass panel smoothly forward to front, then glide back
  useEffect(() => {
    if (paused || reducedMotion || panels.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % panels.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, panels.length]);

  const scrollY = useTransform(scrollYProgress, [0, 1], [-parallaxRange, parallaxRange]);

  const isMotionOff = paused || reducedMotion;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden [perspective:1700px]"
    >
      {/* Thin Flat African Line-Art Filaments connecting the panels — 1px lime #A8E84A, no glow, no gradient */}
      <svg
        viewBox="0 0 1200 700"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full opacity-35"
      >
        <g fill="none" stroke="#A8E84A" strokeWidth="1">
          <path d="M 90 170 C 280 110, 440 280, 620 220 S 940 120, 1110 260" strokeDasharray="6 6" />
          <path d="M 140 520 C 350 420, 560 560, 760 440 S 1020 340, 1130 490" />
          <path d="M 595 220 L 620 195 L 645 220 L 620 245 Z" />
          <path d="M 607 220 L 620 207 L 633 220 L 620 233 Z" />
          <path d="M 270 360 Q 320 326 370 360 Q 320 394 270 360 Z" />
          <circle cx="320" cy="360" r="9" />
          <circle cx="910" cy="330" r="34" />
          <circle cx="910" cy="330" r="14" />
          <path d="M 910 284 V 296 M 910 364 V 376 M 864 330 H 876 M 944 330 H 956" />
        </g>
      </svg>

      {/* Scroll Parallax Plane */}
      <motion.div
        style={isMotionOff ? undefined : { y: scrollY }}
        className="relative w-full h-full [transform-style:preserve-3d]"
      >
        {panels.map((panel, idx) => {
          const isFrontSpotlight = idx === activeIndex;
          const zPx = isFrontSpotlight
            ? cinematicSolo
              ? 130
              : 155
            : -90 - ((idx * 55) % 140);
          const scaleVal = isFrontSpotlight
            ? cinematicSolo
              ? 1.07
              : 1.15
            : softBlurBehindCards
              ? 0.96
              : 0.92;

          const mouseShiftX = panel.depth * 24;
          const mouseShiftY = panel.depth * 18;
          const mouseTiltY = (isFrontSpotlight ? 9 : 12) * (idx % 2 === 0 ? 1 : -1);
          const mouseTiltX = isFrontSpotlight ? 6 : 8;

          const baseRotateY = isFrontSpotlight ? panel.tiltY * 0.25 : panel.tiltY;
          const baseRotateX = isFrontSpotlight ? panel.tiltX * 0.25 : panel.tiltX;
          const baseRotateZ = isFrontSpotlight ? 0 : panel.tiltZ;

          return (
            <div
              key={panel.id}
              data-connector={connectorStyle}
              className={`absolute ${panel.sizeClass} ${panel.aspectClass} will-change-transform`}
              style={{
                left: panel.left,
                top: panel.top,
                zIndex: isFrontSpotlight ? 2 : 1,
                transform: isMotionOff
                  ? `translate(-50%, -50%) translate3d(0px, 0px, ${zPx}px) rotateX(${baseRotateX}deg) rotateY(${baseRotateY}deg) rotateZ(${baseRotateZ}deg) scale(${scaleVal})`
                  : `translate(-50%, -50%) translate3d(calc(var(--mx, 0) * ${mouseShiftX}px), calc(var(--my, 0) * ${mouseShiftY}px), ${zPx}px) rotateX(calc(${baseRotateX}deg + var(--my, 0) * -${mouseTiltX}deg)) rotateY(calc(${baseRotateY}deg + var(--mx, 0) * ${mouseTiltY}deg)) rotateZ(${baseRotateZ}deg) scale(${scaleVal})`,
                opacity: 0.24,
                filter: 'blur(3px)',
                transition: 'transform 1500ms cubic-bezier(0.22, 1, 0.36,1)',
              }}
            >
              {/* Continuous gentle 3D float + optional slow Discovery rotation — 35% opacity, slight blur, behind everything */}
              <motion.div
                animate={
                  isMotionOff
                    ? undefined
                    : slowRotate
                      ? {
                          y: [0, -14, 4, -10, 0],
                          rotateY: [0, 14, 0, -14, 0],
                          rotateZ: [-1.5, 1.5, -1.5],
                        }
                      : {
                          y: [0, -12, 3, -8, 0],
                          rotateZ: [-0.8, 0.8, -0.8],
                        }
                }
                transition={{
                  duration: slowRotate ? 14 + idx * 2 : 9 + panel.phase,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative w-full h-full overflow-hidden rounded-[20px]"
              >
                <img
                  src={panel.src}
                  alt={panel.alt}
                  loading="eager"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none"
                />
              </motion.div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
