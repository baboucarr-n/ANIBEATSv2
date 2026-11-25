import type { ReactNode } from 'react';
import {
  STICKER_MAP,
  type StickerSpec,
} from '../data/stickerPack';

interface StickerArtProps {
  stickerId: string;
  sizeClass?: string;
  decorative?: boolean;
}

function renderBackdrop(spec: StickerSpec): ReactNode {
  const { bg, accent } = spec.palette;
  switch (spec.backdrop) {
    case 'burst':
      return (
        <polygon
          points="60,8 71,27 93,18 89,40 110,49 93,65 106,85 83,86 80,109 60,96 40,109 37,86 14,85 27,65 10,49 31,40 27,18 49,27"
          fill={bg}
          stroke={accent}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      );
    case 'heart':
      return (
        <path
          d="M60 103 C60 103 16 74 16 44 C16 28 29 17 44 17 C53 17 58 22 60 27 C62 22 67 17 76 17 C91 17 104 28 104 44 C104 74 60 103 60 103 Z"
          fill={bg}
          stroke={accent}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      );
    case 'cloud':
      return (
        <path
          d="M32 92 H88 C100 92 108 83 108 72 C108 62 101 54 91 53 C88 37 74 26 57 26 C40 26 26 38 25 55 C16 57 10 65 10 74 C10 84 19 92 32 92 Z"
          fill={bg}
          stroke={accent}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      );
    case 'diamond':
      return (
        <rect
          x="22"
          y="22"
          width="76"
          height="76"
          rx="18"
          transform="rotate(45 60 60)"
          fill={bg}
          stroke={accent}
          strokeWidth="2.5"
        />
      );
    case 'wave':
      return (
        <g>
          <circle cx="60" cy="60" r="46" fill={bg} stroke={accent} strokeWidth="2.5" />
          <path
            d="M20 72 Q40 58 60 72 T100 72"
            fill="none"
            stroke={accent}
            strokeWidth="2.2"
            opacity="0.45"
          />
        </g>
      );
    case 'splat':
      return (
        <path
          d="M60 14 C75 14 82 26 94 25 C104 24 108 38 100 49 C108 60 107 78 93 84 C88 99 70 104 60 98 C48 106 31 99 27 85 C13 80 12 61 20 50 C13 38 18 24 29 25 C40 26 46 14 60 14 Z"
          fill={bg}
          stroke={accent}
          strokeWidth="2.5"
        />
      );
    case 'shield':
      return (
        <path
          d="M60 14 L98 28 V58 C98 83 78 99 60 106 C42 99 22 83 22 58 V28 Z"
          fill={bg}
          stroke={accent}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      );
    case 'none':
      return <circle cx="60" cy="62" r="42" fill={bg} opacity="0.55" />;
    case 'circle':
    default:
      return <circle cx="60" cy="60" r="46" fill={bg} stroke={accent} strokeWidth="2.5" />;
  }
}

function renderIconSticker(spec: StickerSpec): ReactNode {
  const { accent, hair, body, stroke, cheek } = spec.palette;
  switch (spec.iconShape) {
    case 'ramen':
      return (
        <g>
          <path d="M26 58 H94 C94 82 80 96 60 96 C40 96 26 82 26 58 Z" fill={accent} stroke={stroke} strokeWidth="3" />
          <rect x="44" y="94" width="32" height="7" rx="3" fill={hair} stroke={stroke} strokeWidth="2.5" />
          <ellipse cx="60" cy="58" rx="34" ry="10" fill="#FFF7ED" stroke={stroke} strokeWidth="3" />
          <path d="M36 57 Q48 50 60 57 T84 57" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="48" cy="55" r="7" fill="#FFFFFF" stroke={stroke} strokeWidth="2" />
          <path d="M44 55 Q48 51 52 55" fill="none" stroke="#EC4899" strokeWidth="2" />
          <circle cx="72" cy="54" r="6" fill="#FDE047" stroke={stroke} strokeWidth="2" />
          <line x1="66" y1="30" x2="96" y2="48" stroke={hair} strokeWidth="3.5" strokeLinecap="round" />
          <line x1="74" y1="24" x2="98" y2="43" stroke={hair} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M40 38 Q36 30 42 22 M54 36 Q50 27 56 20" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" opacity="0.65" />
        </g>
      );
    case 'boba':
      return (
        <g>
          <path d="M40 42 H80 L74 96 H46 Z" fill={body} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
          <path d="M43 58 H77 L74 96 H46 Z" fill={accent} opacity="0.85" />
          <ellipse cx="60" cy="42" rx="22" ry="6" fill="#FFFFFF" stroke={stroke} strokeWidth="2.8" />
          <line x1="66" y1="18" x2="60" y2="62" stroke={hair} strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="51" cy="86" r="4" fill={stroke} />
          <circle cx="60" cy="88" r="4" fill={stroke} />
          <circle cx="69" cy="85" r="4" fill={stroke} />
          <circle cx="55" cy="77" r="3.5" fill={stroke} />
          <circle cx="65" cy="78" r="3.5" fill={stroke} />
          <circle cx="52" cy="66" r="2.2" fill={stroke} />
          <circle cx="68" cy="66" r="2.2" fill={stroke} />
          <path d="M56 68 Q60 72 64 68" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case 'headphones':
      return (
        <g>
          <path d="M26 66 C26 42 41 26 60 26 C79 26 94 42 94 66" fill="none" stroke={hair} strokeWidth="8" strokeLinecap="round" />
          <path d="M26 66 C26 42 41 26 60 26 C79 26 94 42 94 66" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" />
          <rect x="18" y="56" width="16" height="30" rx="8" fill={accent} stroke={stroke} strokeWidth="3" />
          <rect x="86" y="56" width="16" height="30" rx="8" fill={accent} stroke={stroke} strokeWidth="3" />
          <rect x="46" y="64" width="6" height="16" rx="3" fill={stroke} />
          <rect x="57" y="54" width="6" height="26" rx="3" fill={accent} stroke={stroke} strokeWidth="2" />
          <rect x="68" y="60" width="6" height="20" rx="3" fill={stroke} />
        </g>
      );
    case 'vinyl':
      return (
        <g>
          <circle cx="58" cy="62" r="34" fill={hair} stroke={stroke} strokeWidth="3" />
          <circle cx="58" cy="62" r="26" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.25" />
          <circle cx="58" cy="62" r="19" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.25" />
          <circle cx="58" cy="62" r="13" fill={accent} stroke={stroke} strokeWidth="2.5" />
          <circle cx="58" cy="62" r="4" fill="#FFFFFF" stroke={stroke} strokeWidth="2" />
          <path d="M90 28 L86 58 L76 72" fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="90" cy="28" r="6" fill={accent} stroke={stroke} strokeWidth="2.5" />
        </g>
      );
    case 'katana':
      return (
        <g>
          <path d="M22 92 L84 26 L94 22 L88 34 L30 96 Z" fill="#FFFFFF" stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
          <line x1="34" y1="68" x2="52" y2="86" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          <line x1="20" y1="84" x2="36" y2="98" stroke={hair} strokeWidth="7" strokeLinecap="round" />
          <path d="M28 36 Q60 22 92 52" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" />
          <path d="M36 26 L44 20 M84 62 L94 58" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case 'flame':
      return (
        <g>
          <path
            d="M60 18 C72 34 90 48 86 72 C83 89 72 98 60 98 C44 98 32 86 34 68 C35 55 44 48 44 38 C49 44 54 44 54 34 C54 27 57 22 60 18 Z"
            fill={accent}
            stroke={stroke}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M60 48 C68 58 74 66 72 78 C70 86 65 92 60 92 C52 92 47 84 48 75 C49 66 56 58 60 48 Z"
            fill="#FDE047"
            stroke={stroke}
            strokeWidth="2"
          />
          <circle cx="53" cy="74" r="2.5" fill={stroke} />
          <circle cx="67" cy="74" r="2.5" fill={stroke} />
          <path d="M55 81 Q60 85 65 81" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      );
    case 'crown':
      return (
        <g>
          <path
            d="M22 82 L28 40 L46 58 L60 32 L74 58 L92 40 L98 82 Z"
            fill="#FBBF24"
            stroke={stroke}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <rect x="22" y="82" width="76" height="10" rx="4" fill={accent} stroke={stroke} strokeWidth="3" />
          <circle cx="28" cy="37" r="4.5" fill={accent} stroke={stroke} strokeWidth="2" />
          <circle cx="60" cy="29" r="5.5" fill={accent} stroke={stroke} strokeWidth="2" />
          <circle cx="92" cy="37" r="4.5" fill={accent} stroke={stroke} strokeWidth="2" />
          <circle cx="60" cy="70" r="5" fill="#FFFFFF" stroke={stroke} strokeWidth="2" />
        </g>
      );
    case 'heart':
      return (
        <g>
          <path
            d="M60 94 C60 94 22 69 22 45 C22 31 33 22 45 22 C53 22 57 26 60 31 C63 26 67 22 75 22 C87 22 98 31 98 45 C98 69 60 94 60 94 Z"
            fill={accent}
            stroke={stroke}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M36 37 C32 41 32 47 34 51" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="48" cy="54" r="3" fill="#FFFFFF" />
          <circle cx="72" cy="54" r="3" fill="#FFFFFF" />
          <path d="M53 64 Q60 70 67 64" fill="none" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
        </g>
      );
    case 'lightning':
      return (
        <polygon
          points="66,18 32,64 56,64 48,102 88,52 62,52"
          fill="#FDE047"
          stroke={stroke}
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
      );
    case 'sakura':
      return (
        <g transform="translate(60,60)">
          {[0, 72, 144, 216, 288].map((deg) => (
            <path
              key={deg}
              d="M0 0 C-12 -14 -14 -34 0 -38 C14 -34 12 -14 0 0 Z"
              transform={`rotate(${deg})`}
              fill={cheek}
              stroke={stroke}
              strokeWidth="2.5"
            />
          ))}
          <circle cx="0" cy="0" r="8" fill="#FEF08A" stroke={stroke} strokeWidth="2.5" />
        </g>
      );
    case 'moon':
      return (
        <g>
          <path
            d="M72 24 C50 24 34 40 34 62 C34 83 50 96 72 96 C80 96 87 93 92 89 C72 88 58 76 58 60 C58 43 71 31 89 30 C84 26 78 24 72 24 Z"
            fill="#FDE047"
            stroke={stroke}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="48" cy="58" r="2.5" fill={stroke} />
          <path d="M44 68 Q51 73 58 68" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
          <polygon points="84,36 86,42 92,44 86,46 84,52 82,46 76,44 82,42" fill={accent} stroke={stroke} strokeWidth="1.5" />
        </g>
      );
    case 'boombox':
      return (
        <g>
          <path d="M40 42 V30 H80 V42" fill="none" stroke={stroke} strokeWidth="4" strokeLinejoin="round" />
          <rect x="20" y="42" width="80" height="46" rx="10" fill={accent} stroke={stroke} strokeWidth="3" />
          <circle cx="39" cy="67" r="12" fill={hair} stroke={stroke} strokeWidth="2.5" />
          <circle cx="39" cy="67" r="5" fill="#FFFFFF" />
          <circle cx="81" cy="67" r="12" fill={hair} stroke={stroke} strokeWidth="2.5" />
          <circle cx="81" cy="67" r="5" fill="#FFFFFF" />
          <rect x="54" y="54" width="12" height="22" rx="2" fill="#FFFFFF" stroke={stroke} strokeWidth="2" />
        </g>
      );
    case 'coffee':
      return (
        <g>
          <path d="M84 54 C96 54 96 74 84 74" fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round" />
          <path d="M30 48 H84 V74 C84 88 72 96 57 96 C42 96 30 88 30 74 Z" fill={body} stroke={stroke} strokeWidth="3" />
          <ellipse cx="57" cy="48" rx="27" ry="7" fill={hair} stroke={stroke} strokeWidth="2.8" />
          <path d="M46 35 Q42 27 48 21 M60 33 Q56 24 62 18 M72 36 Q68 28 74 22" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="49" cy="69" r="2.5" fill={stroke} />
          <circle cx="65" cy="69" r="2.5" fill={stroke} />
          <path d="M53 76 Q57 80 61 76" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      );
    case 'onigiri':
      return (
        <g>
          <path d="M60 22 C72 22 94 64 92 84 C91 93 80 96 60 96 C40 96 29 93 28 84 C26 64 48 22 60 22 Z" fill="#FFFFFF" stroke={stroke} strokeWidth="3" />
          <rect x="44" y="72" width="32" height="24" rx="4" fill={hair} stroke={stroke} strokeWidth="2.5" />
          <circle cx="51" cy="54" r="2.6" fill={stroke} />
          <circle cx="69" cy="54" r="2.6" fill={stroke} />
          <ellipse cx="44" cy="60" rx="4" ry="2.2" fill={cheek} />
          <ellipse cx="76" cy="60" rx="4" ry="2.2" fill={cheek} />
          <path d="M56 59 Q60 64 64 59" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      );
    case 'magic':
      return (
        <g transform="translate(60,60)">
          <circle cx="0" cy="0" r="36" fill="none" stroke={accent} strokeWidth="3.5" />
          <circle cx="0" cy="0" r="26" fill="none" stroke={stroke} strokeWidth="2" strokeDasharray="4 4" />
          <polygon points="0,-32 28,16 -28,16" fill="none" stroke={accent} strokeWidth="2.8" strokeLinejoin="round" />
          <polygon points="0,32 28,-16 -28,-16" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" />
          <circle cx="0" cy="0" r="7" fill={accent} stroke={stroke} strokeWidth="2" />
        </g>
      );
    case 'shuriken':
      return (
        <g transform="translate(60,60)">
          <path
            d="M0,-38 L11,-11 L38,0 L11,11 L0,38 L-11,11 L-38,0 L-11,-11 Z"
            fill={hair}
            stroke={stroke}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="0" cy="0" r="7" fill="#FFFFFF" stroke={stroke} strokeWidth="2.5" />
        </g>
      );
    case 'trophy':
      return (
        <g>
          <path d="M36 32 H84 V52 C84 68 74 78 60 78 C46 78 36 68 36 52 Z" fill="#FBBF24" stroke={stroke} strokeWidth="3" />
          <path d="M36 38 H24 C24 54 32 58 38 58 M84 38 H96 C96 54 88 58 82 58" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
          <rect x="55" y="78" width="10" height="10" fill="#F59E0B" stroke={stroke} strokeWidth="2.5" />
          <rect x="42" y="88" width="36" height="9" rx="3" fill={accent} stroke={stroke} strokeWidth="2.8" />
          <polygon points="60,42 63,50 71,50 65,55 67,63 60,58 53,63 55,55 49,50 57,50" fill="#FFFFFF" />
        </g>
      );
    case 'gift':
      return (
        <g>
          <rect x="28" y="46" width="64" height="46" rx="8" fill={accent} stroke={stroke} strokeWidth="3" />
          <rect x="24" y="38" width="72" height="14" rx="5" fill={body} stroke={stroke} strokeWidth="3" />
          <rect x="54" y="38" width="12" height="54" fill="#FDE047" stroke={stroke} strokeWidth="2.5" />
          <path d="M60 38 C46 22 36 30 46 38 M60 38 C74 22 84 30 74 38" fill="#FDE047" stroke={stroke} strokeWidth="2.5" />
        </g>
      );
    case 'guitar':
      return (
        <g>
          <line x1="70" y1="50" x2="94" y2="24" stroke={hair} strokeWidth="6" strokeLinecap="round" />
          <path
            d="M42 48 C56 42 74 52 72 68 C78 78 66 96 48 94 C30 92 24 76 34 64 C30 56 34 50 42 48 Z"
            fill={accent}
            stroke={stroke}
            strokeWidth="3"
          />
          <circle cx="52" cy="72" r="8" fill="#FFFFFF" stroke={stroke} strokeWidth="2.5" />
        </g>
      );
    case 'confetti':
    default:
      return (
        <g>
          <polygon points="34,88 50,36 86,72" fill={accent} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
          <circle cx="48" cy="24" r="4" fill="#F59E0B" />
          <circle cx="88" cy="36" r="4" fill="#EC4899" />
          <rect x="68" y="20" width="8" height="8" rx="2" transform="rotate(25 72 24)" fill="#22C55E" />
          <path d="M58 34 Q72 24 80 34" fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
          <path d="M74 52 Q90 48 96 58" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
  }
}

function renderCharacterHead(spec: StickerSpec): ReactNode {
  const { body, hair, accent, stroke } = spec.palette;
  switch (spec.archetype) {
    case 'cat':
      return (
        <g>
          <polygon points="30,44 26,18 48,32" fill={body} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
          <polygon points="90,44 94,18 72,32" fill={body} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
          <polygon points="32,40 30,25 43,34" fill={accent} opacity="0.6" />
          <polygon points="88,40 90,25 77,34" fill={accent} opacity="0.6" />
          <ellipse cx="60" cy="64" rx="34" ry="29" fill={body} stroke={stroke} strokeWidth="3" />
          <line x1="20" y1="62" x2="32" y2="64" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="70" x2="32" y2="69" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <line x1="100" y1="62" x2="88" y2="64" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <line x1="100" y1="70" x2="88" y2="69" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case 'fox':
      return (
        <g>
          <polygon points="28,46 22,16 50,30" fill={accent} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
          <polygon points="92,46 98,16 70,30" fill={accent} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
          <path d="M26 62 C26 40 42 32 60 32 C78 32 94 40 94 62 C94 84 74 94 60 94 C46 94 26 84 26 62 Z" fill={accent} stroke={stroke} strokeWidth="3" />
          <path d="M28 66 C34 84 48 93 60 93 C72 93 86 84 92 66 C80 72 70 72 60 72 C50 72 40 72 28 66 Z" fill="#FFFFFF" />
        </g>
      );
    case 'shiba':
      return (
        <g>
          <polygon points="30,44 26,20 48,32" fill="#F59E0B" stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
          <polygon points="90,44 94,20 72,32" fill="#F59E0B" stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="60" cy="64" rx="34" ry="29" fill="#FBBF24" stroke={stroke} strokeWidth="3" />
          <path d="M30 68 C34 86 47 93 60 93 C73 93 86 86 90 68 C78 72 70 68 60 68 C50 68 42 72 30 68 Z" fill="#FFFDF7" />
          <circle cx="48" cy="48" r="3" fill="#FFFDF7" />
          <circle cx="72" cy="48" r="3" fill="#FFFDF7" />
        </g>
      );
    case 'frog':
      return (
        <g>
          <circle cx="42" cy="36" r="12" fill="#84CC16" stroke={stroke} strokeWidth="3" />
          <circle cx="78" cy="36" r="12" fill="#84CC16" stroke={stroke} strokeWidth="3" />
          <ellipse cx="60" cy="66" rx="36" ry="26" fill="#A3E635" stroke={stroke} strokeWidth="3" />
          <ellipse cx="60" cy="76" rx="22" ry="12" fill="#ECFCCB" />
        </g>
      );
    case 'bear':
      return (
        <g>
          <circle cx="34" cy="34" r="11" fill={accent} stroke={stroke} strokeWidth="3" />
          <circle cx="86" cy="34" r="11" fill={accent} stroke={stroke} strokeWidth="3" />
          <circle cx="34" cy="34" r="5" fill={body} />
          <circle cx="86" cy="34" r="5" fill={body} />
          <ellipse cx="60" cy="64" rx="34" ry="29" fill={accent} stroke={stroke} strokeWidth="3" />
          <ellipse cx="60" cy="73" rx="14" ry="10" fill={body} />
        </g>
      );
    case 'bunny':
      return (
        <g>
          <ellipse cx="43" cy="24" rx="9" ry="20" transform="rotate(-10 43 24)" fill={body} stroke={stroke} strokeWidth="3" />
          <ellipse cx="77" cy="24" rx="9" ry="20" transform="rotate(10 77 24)" fill={body} stroke={stroke} strokeWidth="3" />
          <ellipse cx="43" cy="25" rx="4" ry="12" transform="rotate(-10 43 25)" fill={accent} opacity="0.55" />
          <ellipse cx="77" cy="25" rx="4" ry="12" transform="rotate(10 77 25)" fill={accent} opacity="0.55" />
          <ellipse cx="60" cy="66" rx="32" ry="27" fill={body} stroke={stroke} strokeWidth="3" />
        </g>
      );
    case 'ghost':
      return (
        <path
          d="M30 88 L30 56 C30 36 43 24 60 24 C77 24 90 36 90 56 L90 88 L79 80 L69 90 L60 80 L51 90 L41 80 Z"
          fill="#FFFFFF"
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      );
    case 'dragon':
      return (
        <g>
          <polygon points="34,36 22,14 44,28" fill="#FDE047" stroke={stroke} strokeWidth="2.8" strokeLinejoin="round" />
          <polygon points="86,36 98,14 76,28" fill="#FDE047" stroke={stroke} strokeWidth="2.8" strokeLinejoin="round" />
          <ellipse cx="60" cy="64" rx="33" ry="28" fill={accent} stroke={stroke} strokeWidth="3" />
          <ellipse cx="60" cy="76" rx="18" ry="11" fill="#FEF9C3" />
        </g>
      );
    case 'chibi':
    default:
      return (
        <g>
          {/* Anime Hair Back */}
          <ellipse cx="60" cy="56" rx="36" ry="32" fill={hair} stroke={stroke} strokeWidth="3" />
          {spec.hairStyle === 'twintails' && (
            <>
              <ellipse cx="22" cy="66" rx="8" ry="18" fill={hair} stroke={stroke} strokeWidth="2.5" />
              <ellipse cx="98" cy="66" rx="8" ry="18" fill={hair} stroke={stroke} strokeWidth="2.5" />
            </>
          )}
          {/* Face */}
          <ellipse cx="60" cy="65" rx="28" ry="26" fill={body} stroke={stroke} strokeWidth="2.8" />
          {/* Bangs */}
          {spec.hairStyle === 'spiky' ? (
            <path d="M30 56 L36 34 L48 48 L60 30 L72 48 L84 34 L90 56 C80 46 68 48 60 44 C52 48 40 46 30 56 Z" fill={hair} stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
          ) : spec.hairStyle === 'bob' ? (
            <path d="M29 58 C30 34 45 28 60 28 C75 28 90 34 91 58 C82 50 70 48 60 52 C50 48 38 50 29 58 Z" fill={hair} stroke={stroke} strokeWidth="2.5" />
          ) : (
            <path d="M31 54 C36 34 48 30 60 30 C72 30 84 34 89 54 C79 44 68 50 60 44 C52 50 41 44 31 54 Z" fill={hair} stroke={stroke} strokeWidth="2.5" />
          )}
        </g>
      );
  }
}

function renderExpression(spec: StickerSpec): ReactNode {
  const { stroke, cheek, accent } = spec.palette;
  const eyeY = spec.archetype === 'frog' ? 37 : 61;
  const mouthY = spec.archetype === 'frog' ? 74 : 76;

  switch (spec.expression) {
    case 'hype':
      return (
        <g>
          <polygon points={`46,${eyeY - 6} 48,${eyeY - 1} 53,${eyeY} 48,${eyeY + 2} 46,${eyeY + 7} 44,${eyeY + 2} 39,${eyeY} 44,${eyeY - 1}`} fill={accent} stroke={stroke} strokeWidth="1.5" />
          <polygon points={`74,${eyeY - 6} 76,${eyeY - 1} 81,${eyeY} 76,${eyeY + 2} 74,${eyeY + 7} 72,${eyeY + 2} 67,${eyeY} 72,${eyeY - 1}`} fill={accent} stroke={stroke} strokeWidth="1.5" />
          <path d={`M49 ${mouthY - 2} Q60 ${mouthY + 12} 71 ${mouthY - 2} Z`} fill="#EF4444" stroke={stroke} strokeWidth="2.2" />
        </g>
      );
    case 'laugh':
      return (
        <g>
          <path d={`M40 ${eyeY - 3} L49 ${eyeY} L40 ${eyeY + 4}`} fill="none" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M80 ${eyeY - 3} L71 ${eyeY} L80 ${eyeY + 4}`} fill="none" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M48 ${mouthY - 3} Q60 ${mouthY + 11} 72 ${mouthY - 3} Z`} fill="#FB7185" stroke={stroke} strokeWidth="2.2" />
          <ellipse cx="41" cy={eyeY + 8} rx="4" ry="2.2" fill={cheek} opacity="0.85" />
          <ellipse cx="79" cy={eyeY + 8} rx="4" ry="2.2" fill={cheek} opacity="0.85" />
        </g>
      );
    case 'cry':
      return (
        <g>
          <rect x="42" y={eyeY + 2} width="7" height="22" rx="3" fill="#60A5FA" opacity="0.85" />
          <rect x="71" y={eyeY + 2} width="7" height="22" rx="3" fill="#60A5FA" opacity="0.85" />
          <path d={`M40 ${eyeY} Q46 ${eyeY - 5} 52 ${eyeY}`} fill="none" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" />
          <path d={`M68 ${eyeY} Q74 ${eyeY - 5} 80 ${eyeY}`} fill="none" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" />
          <ellipse cx="60" cy={mouthY + 3} rx="6" ry="5" fill="#FB7185" stroke={stroke} strokeWidth="2.2" />
        </g>
      );
    case 'shock':
      return (
        <g>
          <circle cx="46" cy={eyeY} r="5.5" fill="#FFFFFF" stroke={stroke} strokeWidth="2.5" />
          <circle cx="74" cy={eyeY} r="5.5" fill="#FFFFFF" stroke={stroke} strokeWidth="2.5" />
          <circle cx="46" cy={eyeY} r="2" fill={stroke} />
          <circle cx="74" cy={eyeY} r="2" fill={stroke} />
          <ellipse cx="60" cy={mouthY + 3} rx="5" ry="7" fill="#FB7185" stroke={stroke} strokeWidth="2.2" />
        </g>
      );
    case 'love':
      return (
        <g>
          <path d={`M46 ${eyeY + 5} C46 ${eyeY + 5} 39 ${eyeY} 39 ${eyeY - 3} C39 ${eyeY - 6} 43 ${eyeY - 6} 46 ${eyeY - 3} C49 ${eyeY - 6} 53 ${eyeY - 6} 53 ${eyeY - 3} C53 ${eyeY} 46 ${eyeY + 5} 46 ${eyeY + 5} Z`} fill="#E11D48" stroke={stroke} strokeWidth="1.5" />
          <path d={`M74 ${eyeY + 5} C74 ${eyeY + 5} 67 ${eyeY} 67 ${eyeY - 3} C67 ${eyeY - 6} 71 ${eyeY - 6} 74 ${eyeY - 3} C77 ${eyeY - 6} 81 ${eyeY - 6} 81 ${eyeY - 3} C81 ${eyeY} 74 ${eyeY + 5} 74 ${eyeY + 5} Z`} fill="#E11D48" stroke={stroke} strokeWidth="1.5" />
          <path d={`M54 ${mouthY} Q60 ${mouthY + 6} 66 ${mouthY}`} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="38" cy={eyeY + 9} rx="4" ry="2.2" fill={cheek} />
          <ellipse cx="82" cy={eyeY + 9} rx="4" ry="2.2" fill={cheek} />
        </g>
      );
    case 'cool':
    case 'glint':
      return (
        <g>
          <rect x="36" y={eyeY - 6} width="20" height="12" rx="3" fill={stroke} />
          <rect x="64" y={eyeY - 6} width="20" height="12" rx="3" fill={stroke} />
          <line x1="56" y1={eyeY - 2} x2="64" y2={eyeY - 2} stroke={stroke} strokeWidth="2.8" />
          <line x1="40" y1={eyeY - 3} x2="45" y2={eyeY + 3} stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="68" y1={eyeY - 3} x2="73" y2={eyeY + 3} stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <path d={`M53 ${mouthY + 1} Q61 ${mouthY + 5} 69 ${mouthY - 2}`} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
    case 'smug':
      return (
        <g>
          <line x1="40" y1={eyeY - 2} x2="52" y2={eyeY - 2} stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="68" y1={eyeY - 2} x2="80" y2={eyeY - 2} stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="46" cy={eyeY + 2} r="3" fill={stroke} />
          <circle cx="74" cy={eyeY + 2} r="3" fill={stroke} />
          <path d={`M52 ${mouthY + 1} Q61 ${mouthY + 5} 69 ${mouthY - 2}`} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
    case 'sleepy':
      return (
        <g>
          <path d={`M40 ${eyeY + 1} Q46 ${eyeY + 6} 52 ${eyeY + 1}`} fill="none" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" />
          <path d={`M68 ${eyeY + 1} Q74 ${eyeY + 6} 80 ${eyeY + 1}`} fill="none" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="60" cy={mouthY + 1} r="3.5" fill={cheek} stroke={stroke} strokeWidth="2" />
          <circle cx="88" cy="40" r="6" fill="#E0F2FE" stroke={stroke} strokeWidth="1.8" opacity="0.9" />
        </g>
      );
    case 'angry':
      return (
        <g>
          <line x1="40" y1={eyeY - 7} x2="52" y2={eyeY - 2} stroke={stroke} strokeWidth="2.8" strokeLinecap="round" />
          <line x1="80" y1={eyeY - 7} x2="68" y2={eyeY - 2} stroke={stroke} strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="46" cy={eyeY + 1} r="3.2" fill={stroke} />
          <circle cx="74" cy={eyeY + 1} r="3.2" fill={stroke} />
          <path d={`M50 ${mouthY + 4} Q60 ${mouthY - 3} 70 ${mouthY + 4}`} fill="none" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" />
        </g>
      );
    case 'dizzy':
      return (
        <g>
          <circle cx="46" cy={eyeY} r="5.5" fill="none" stroke={stroke} strokeWidth="2.2" />
          <circle cx="46" cy={eyeY} r="2" fill={stroke} />
          <circle cx="74" cy={eyeY} r="5.5" fill="none" stroke={stroke} strokeWidth="2.2" />
          <circle cx="74" cy={eyeY} r="2" fill={stroke} />
          <path d={`M51 ${mouthY + 2} Q55 ${mouthY - 2} 60 ${mouthY + 2} T69 ${mouthY + 2}`} fill="none" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
        </g>
      );
    case 'deadpan':
      return (
        <g>
          <line x1="41" y1={eyeY} x2="51" y2={eyeY} stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <line x1="69" y1={eyeY} x2="79" y2={eyeY} stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <line x1="53" y1={mouthY + 1} x2="67" y2={mouthY + 1} stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
    case 'wink':
      return (
        <g>
          <path d={`M40 ${eyeY + 1} Q46 ${eyeY - 5} 52 ${eyeY + 1}`} fill="none" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="74" cy={eyeY} r="4" fill={stroke} />
          <circle cx="75.5" cy={eyeY - 1.5} r="1.4" fill="#FFFFFF" />
          <path d={`M51 ${mouthY - 1} Q55 ${mouthY + 4} 60 ${mouthY - 1} Q65 ${mouthY + 4} 69 ${mouthY - 1}`} fill="none" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
        </g>
      );
    case 'blush':
    case 'sparkle':
    case 'awe':
    default:
      return (
        <g>
          <circle cx="46" cy={eyeY} r="4.5" fill={stroke} />
          <circle cx="74" cy={eyeY} r="4.5" fill={stroke} />
          <circle cx="47.5" cy={eyeY - 1.5} r="1.7" fill="#FFFFFF" />
          <circle cx="75.5" cy={eyeY - 1.5} r="1.7" fill="#FFFFFF" />
          <ellipse cx="38" cy={eyeY + 8} rx="4.5" ry="2.4" fill={cheek} opacity="0.9" />
          <ellipse cx="82" cy={eyeY + 8} rx="4.5" ry="2.4" fill={cheek} opacity="0.9" />
          <path d={`M54 ${mouthY} Q60 ${mouthY + 6} 66 ${mouthY}`} fill="none" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
        </g>
      );
  }
}

function renderProp(spec: StickerSpec): ReactNode {
  if (spec.archetype === 'icon') return null;
  const { accent, stroke, hair } = spec.palette;
  switch (spec.prop) {
    case 'headphones':
      return (
        <g>
          <path d="M24 62 C24 38 40 24 60 24 C80 24 96 38 96 62" fill="none" stroke={hair} strokeWidth="6" strokeLinecap="round" />
          <rect x="19" y="54" width="11" height="20" rx="5" fill={accent} stroke={stroke} strokeWidth="2.2" />
          <rect x="90" y="54" width="11" height="20" rx="5" fill={accent} stroke={stroke} strokeWidth="2.2" />
        </g>
      );
    case 'crown':
      return (
        <path
          d="M44 26 L47 13 L55 20 L60 11 L65 20 L73 13 L76 26 Z"
          fill="#FBBF24"
          stroke={stroke}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      );
    case 'halo':
      return (
        <ellipse cx="60" cy="18" rx="18" ry="5" fill="none" stroke="#FBBF24" strokeWidth="4" />
      );
    case 'horns':
      return (
        <g>
          <path d="M40 31 L30 14 L47 25 Z" fill="#EF4444" stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M80 31 L90 14 L73 25 Z" fill="#EF4444" stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" />
        </g>
      );
    case 'heart':
      return (
        <path
          d="M92 34 C92 34 83 28 83 23 C83 20 86 18 89 18 C91 18 92 20 92 21 C93 20 94 18 96 18 C99 18 102 20 102 23 C102 28 92 34 92 34 Z"
          fill="#E11D48"
          stroke={stroke}
          strokeWidth="1.8"
        />
      );
    case 'flame':
      return (
        <path
          d="M95 76 C102 82 103 94 94 96 C86 98 82 90 86 82 C88 86 92 84 91 79 Z"
          fill="#F97316"
          stroke={stroke}
          strokeWidth="2"
        />
      );
    case 'lightning':
      return (
        <polygon points="94,18 84,32 91,32 87,44 100,28 93,28" fill="#FDE047" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round" />
      );
    case 'sweatdrop':
      return (
        <path d="M89 36 C94 44 94 50 89 50 C84 50 84 44 89 36 Z" fill="#38BDF8" stroke={stroke} strokeWidth="2" />
      );
    case 'sparkles':
    case 'star':
      return (
        <g>
          <polygon points="24,26 26,32 32,34 26,36 24,42 22,36 16,34 22,32" fill="#FDE047" stroke={stroke} strokeWidth="1.5" />
          <polygon points="95,22 97,27 102,29 97,31 95,36 93,31 88,29 93,27" fill="#FDE047" stroke={stroke} strokeWidth="1.5" />
        </g>
      );
    case 'sakura':
      return (
        <g>
          <ellipse cx="26" cy="28" rx="6" ry="3.5" transform="rotate(-25 26 28)" fill="#FDA4AF" stroke={stroke} strokeWidth="1.5" />
          <ellipse cx="95" cy="36" rx="5.5" ry="3" transform="rotate(30 95 36)" fill="#FDA4AF" stroke={stroke} strokeWidth="1.5" />
        </g>
      );
    case 'leaf':
      return (
        <path d="M60 28 C60 17 71 14 75 20 C72 28 63 29 60 28 Z" fill="#22C55E" stroke={stroke} strokeWidth="2" />
      );
    case 'cloud':
      return (
        <path d="M74 26 H98 C102 26 104 22 103 19 C102 15 97 14 94 16 C92 10 83 10 80 16 C75 16 72 21 74 26 Z" fill="#CBD5E1" stroke={stroke} strokeWidth="1.8" />
      );
    default:
      return null;
  }
}

export function StickerArt({
  stickerId,
  sizeClass = 'w-24 h-24',
  decorative = false,
}: StickerArtProps) {
  const spec = STICKER_MAP[stickerId];
  if (!spec) return null;

  return (
    <svg
      viewBox="0 0 120 120"
      className={`${sizeClass} select-none overflow-visible shrink-0`}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : spec.name}
      aria-hidden={decorative ? true : undefined}
      style={{ transform: `rotate(${spec.tilt}deg)` }}
    >
      {/* Die-cut outer sticker silhouette rim */}
      <g
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="#FFFFFF"
      >
        <circle cx="60" cy="60" r="46" />
      </g>
      <circle
        cx="60"
        cy="60"
        r="51"
        fill="#FFFFFF"
        stroke="#D5DBE4"
        strokeWidth="1.5"
      />

      {/* Backdrop + Sticker Illustration */}
      {renderBackdrop(spec)}
      {spec.archetype === 'icon' ? (
        renderIconSticker(spec)
      ) : (
        <>
          {renderCharacterHead(spec)}
          {renderExpression(spec)}
        </>
      )}
      {renderProp(spec)}
    </svg>
  );
}
