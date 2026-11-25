export type StickerCategory =
  | 'Hype & Fire'
  | 'Anime Reactions'
  | 'Laughing'
  | 'Crying & Feels'
  | 'Love & Cozy'
  | 'Cool & Beats'
  | 'Food & Chill'
  | 'Animals'
  | 'Action & Fantasy';

export type StickerArchetype =
  | 'chibi'
  | 'cat'
  | 'fox'
  | 'frog'
  | 'bear'
  | 'bunny'
  | 'shiba'
  | 'ghost'
  | 'dragon'
  | 'icon';

export type StickerExpression =
  | 'hype'
  | 'laugh'
  | 'cry'
  | 'shock'
  | 'love'
  | 'cool'
  | 'smug'
  | 'sleepy'
  | 'angry'
  | 'sparkle'
  | 'dizzy'
  | 'wink'
  | 'blush'
  | 'deadpan'
  | 'glint'
  | 'awe';

export type StickerProp =
  | 'none'
  | 'headphones'
  | 'flame'
  | 'heart'
  | 'lightning'
  | 'tears'
  | 'glasses'
  | 'crown'
  | 'ramen'
  | 'boba'
  | 'katana'
  | 'vinyl'
  | 'moon'
  | 'cloud'
  | 'sakura'
  | 'magic'
  | 'star'
  | 'sparkles'
  | 'sweatdrop'
  | 'boombox'
  | 'gift'
  | 'coffee'
  | 'shuriken'
  | 'visor'
  | 'halo'
  | 'horns'
  | 'leaf'
  | 'confetti'
  | 'trophy'
  | 'guitar';

export type StickerBackdrop =
  | 'burst'
  | 'circle'
  | 'heart'
  | 'cloud'
  | 'diamond'
  | 'wave'
  | 'splat'
  | 'shield'
  | 'none';

export type StickerHairStyle = 'spiky' | 'bob' | 'twintails' | 'hood' | 'parted' | 'messy';

export interface StickerPalette {
  bg: string;
  accent: string;
  body: string;
  hair: string;
  cheek: string;
  stroke: string;
}

export interface StickerSpec {
  id: string;
  name: string;
  category: StickerCategory;
  keywords: string[];
  archetype: StickerArchetype;
  expression: StickerExpression;
  prop: StickerProp;
  backdrop: StickerBackdrop;
  hairStyle: StickerHairStyle;
  palette: StickerPalette;
  tilt: number;
  iconShape?:
    | 'flame'
    | 'ramen'
    | 'boba'
    | 'headphones'
    | 'vinyl'
    | 'katana'
    | 'heart'
    | 'crown'
    | 'lightning'
    | 'sakura'
    | 'moon'
    | 'boombox'
    | 'coffee'
    | 'magic'
    | 'shuriken'
    | 'trophy'
    | 'gift'
    | 'guitar'
    | 'onigiri'
    | 'confetti';
}

export const STICKER_CATEGORIES: StickerCategory[] = [
  'Hype & Fire',
  'Anime Reactions',
  'Laughing',
  'Crying & Feels',
  'Love & Cozy',
  'Cool & Beats',
  'Food & Chill',
  'Animals',
  'Action & Fantasy',
];

const PALETTES: StickerPalette[] = [
  { bg: '#FFE8D6', accent: '#EA843D', body: '#FFF3E8', hair: '#23262F', cheek: '#FF8585', stroke: '#121417' },
  { bg: '#E9F9D0', accent: '#8CD428', body: '#FFFFFF', hair: '#1E293B', cheek: '#FF8FA3', stroke: '#121417' },
  { bg: '#FFE0EA', accent: '#EC4899', body: '#FFF5F8', hair: '#4A1D3D', cheek: '#FB7185', stroke: '#121417' },
  { bg: '#DCEEFF', accent: '#3B82F6', body: '#F8FBFF', hair: '#172554', cheek: '#FDA4AF', stroke: '#121417' },
  { bg: '#FFF3C4', accent: '#F59E0B', body: '#FFFDF2', hair: '#78350F', cheek: '#F97316', stroke: '#121417' },
  { bg: '#EDE9FE', accent: '#8B5CF6', body: '#FAF8FF', hair: '#2E1065', cheek: '#F472B6', stroke: '#121417' },
  { bg: '#CCFBF1', accent: '#14B8A6', body: '#F0FDFA', hair: '#134E4A', cheek: '#FB7185', stroke: '#121417' },
  { bg: '#FFE4E6', accent: '#E11D48', body: '#FFF5F6', hair: '#18181B', cheek: '#FDA4AF', stroke: '#121417' },
  { bg: '#F3E8FF', accent: '#A855F7', body: '#FFF9F2', hair: '#3B0764', cheek: '#FB7185', stroke: '#121417' },
  { bg: '#FEF08A', accent: '#EAB308', body: '#FEFCE8', hair: '#1E1B4B', cheek: '#FB923C', stroke: '#121417' },
  { bg: '#E2E8F0', accent: '#475569', body: '#FFFFFF', hair: '#0F172A', cheek: '#FDA4AF', stroke: '#121417' },
  { bg: '#DCFCE7', accent: '#22C55E', body: '#F7FEE7', hair: '#14532D', cheek: '#FB7185', stroke: '#121417' },
];

const HAIR_STYLES: StickerHairStyle[] = ['spiky', 'bob', 'twintails', 'hood', 'parted', 'messy'];
const TILTS = [-6, -3, 0, 3, 6, -4, 4, -2, 2];

interface CategoryRecipe {
  category: StickerCategory;
  slug: string;
  count: number;
  archetypes: StickerArchetype[];
  expressions: StickerExpression[];
  props: StickerProp[];
  backdrops: StickerBackdrop[];
  iconShapes: NonNullable<StickerSpec['iconShape']>[];
  nouns: string[];
  baseKeywords: string[];
}

const RECIPES: CategoryRecipe[] = [
  {
    category: 'Hype & Fire',
    slug: 'hype',
    count: 36,
    archetypes: ['chibi', 'shiba', 'dragon', 'cat', 'icon'],
    expressions: ['hype', 'glint', 'sparkle', 'angry', 'wink'],
    props: ['flame', 'lightning', 'crown', 'confetti', 'trophy', 'sparkles'],
    backdrops: ['burst', 'diamond', 'splat', 'circle'],
    iconShapes: ['flame', 'lightning', 'crown', 'trophy', 'confetti'],
    nouns: [
      'Blazing Hype',
      'Super Charge',
      'Victory Crown',
      'Peak Energy',
      'Lightning Pop',
      'Flame Burst',
      'Champion Flex',
      'Gold Aura',
      'Ultra Focus',
      'Hero Dash',
      'Spark Storm',
      'Wild Cheer',
    ],
    baseKeywords: ['hype', 'fire', 'lit', 'energy', 'power', 'win', 'victory', 'peak', 'excited'],
  },
  {
    category: 'Anime Reactions',
    slug: 'react',
    count: 40,
    archetypes: ['chibi', 'fox', 'cat', 'bunny', 'ghost'],
    expressions: ['shock', 'glint', 'smug', 'blush', 'deadpan', 'awe', 'dizzy', 'sparkle'],
    props: ['sweatdrop', 'glasses', 'sparkles', 'star', 'sakura', 'visor'],
    backdrops: ['burst', 'splat', 'circle', 'diamond', 'none'],
    iconShapes: ['sakura', 'lightning', 'magic'],
    nouns: [
      'Glasses Glint',
      'Sweatdrop Panic',
      'Starry Awe',
      'Deadpan Stare',
      'Plot Twist Gasp',
      'Smug Mastermind',
      'Shy Blush',
      'Dizzy Shock',
      'Dramatic Glare',
      'Sparkle Gaze',
    ],
    baseKeywords: ['anime', 'reaction', 'shock', 'smug', 'sweat', 'glasses', 'blush', 'surprised', 'deadpan'],
  },
  {
    category: 'Laughing',
    slug: 'laugh',
    count: 36,
    archetypes: ['chibi', 'frog', 'cat', 'shiba', 'bear', 'bunny'],
    expressions: ['laugh', 'wink', 'smug', 'hype', 'dizzy'],
    props: ['confetti', 'sparkles', 'tears', 'leaf', 'star'],
    backdrops: ['splat', 'burst', 'wave', 'circle'],
    iconShapes: ['confetti', 'trophy'],
    nouns: [
      'Tears of Joy',
      'Giggle Fit',
      'Gremlin Cackle',
      'Cheeky Wink',
      'Silly Snicker',
      'Happy Roll',
      'Bouncing Laugh',
      'Mischief Grin',
      'Comedy Gold',
      'Smug Chuckle',
      'Meme Laugh',
      'Joy Burst',
    ],
    baseKeywords: ['laugh', 'lol', 'funny', 'giggle', 'haha', 'happy', 'smile', 'grin', 'joke'],
  },
  {
    category: 'Crying & Feels',
    slug: 'cry',
    count: 36,
    archetypes: ['chibi', 'ghost', 'cat', 'bear', 'bunny', 'frog'],
    expressions: ['cry', 'awe', 'blush', 'deadpan', 'dizzy'],
    props: ['tears', 'cloud', 'sakura', 'heart', 'sweatdrop'],
    backdrops: ['cloud', 'wave', 'circle', 'none'],
    iconShapes: ['sakura', 'moon'],
    nouns: [
      'Waterfall Tears',
      'Raincloud Blues',
      'Emotional Damage',
      'Dramatic Sob',
      'Puppy Eyes',
      'Misty Feels',
      'Sad Puddle',
      'Nostalgia Tears',
      'Lonely Cloud',
      'Heartache Sigh',
      'Touching Moment',
      'Quivering Pout',
    ],
    baseKeywords: ['cry', 'sad', 'tears', 'feels', 'emotional', 'rain', 'pout', 'sob', 'pain'],
  },
  {
    category: 'Love & Cozy',
    slug: 'love',
    count: 36,
    archetypes: ['chibi', 'bunny', 'cat', 'bear', 'icon'],
    expressions: ['love', 'blush', 'wink', 'sparkle', 'awe'],
    props: ['heart', 'sakura', 'gift', 'sparkles', 'halo', 'star'],
    backdrops: ['heart', 'circle', 'cloud', 'burst'],
    iconShapes: ['heart', 'gift', 'sakura'],
    nouns: [
      'Heart Storm',
      'Wholesome Hug',
      'Shy Valentine',
      'Cupid Spark',
      'Warm Adoration',
      'Blushing Crush',
      'Sweet Gift',
      'Pure Love',
      'Sakura Romance',
      'Angel Glow',
      'Cherish Vibe',
      'Sparkling Heart',
    ],
    baseKeywords: ['love', 'heart', 'cute', 'wholesome', 'hug', 'kiss', 'crush', 'sweet', 'romantic'],
  },
  {
    category: 'Cool & Beats',
    slug: 'cool',
    count: 36,
    archetypes: ['chibi', 'fox', 'cat', 'shiba', 'icon'],
    expressions: ['cool', 'smug', 'wink', 'glint', 'hype'],
    props: ['headphones', 'glasses', 'vinyl', 'boombox', 'visor', 'guitar', 'moon'],
    backdrops: ['wave', 'diamond', 'circle', 'burst'],
    iconShapes: ['headphones', 'vinyl', 'boombox', 'guitar'],
    nouns: [
      'Headphones On',
      'Midnight Lo-Fi',
      'Vinyl Spin',
      'Boombox Bass',
      'Shades Chill',
      'Cyber Visor',
      'Guitar Riff',
      'Studio Vibe',
      'Opening Track',
      'Cool Breeze',
      'Beat Drop',
      'Night Cruise',
    ],
    baseKeywords: ['cool', 'music', 'beats', 'headphones', 'vinyl', 'boombox', 'lofi', 'chill', 'sunglasses'],
  },
  {
    category: 'Food & Chill',
    slug: 'food',
    count: 36,
    archetypes: ['icon', 'bear', 'cat', 'frog', 'chibi', 'shiba'],
    expressions: ['sleepy', 'love', 'sparkle', 'happy' as never, 'blush', 'awe'].filter(
      (e): e is StickerExpression => e !== ('happy' as never)
    ),
    props: ['ramen', 'boba', 'coffee', 'moon', 'cloud', 'leaf'],
    backdrops: ['circle', 'cloud', 'wave', 'none'],
    iconShapes: ['ramen', 'boba', 'coffee', 'onigiri', 'moon'],
    nouns: [
      'Steaming Ramen',
      'Boba Pearls',
      'Matcha Break',
      'Midnight Snack',
      'Sleepy Moon',
      'Coffee Warmth',
      'Onigiri Treat',
      'Cozy Nap',
      'Comfy Blanket',
      'Tea Ceremony',
      'Late Night Bowl',
      'Snack Time',
    ],
    baseKeywords: ['food', 'ramen', 'boba', 'coffee', 'tea', 'sleepy', 'cozy', 'chill', 'snack', 'onigiri'],
  },
  {
    category: 'Animals',
    slug: 'animal',
    count: 36,
    archetypes: ['cat', 'shiba', 'fox', 'frog', 'bear', 'bunny', 'ghost', 'dragon'],
    expressions: ['wink', 'smug', 'sleepy', 'love', 'shock', 'laugh', 'blush'],
    props: ['leaf', 'star', 'sparkles', 'heart', 'crown', 'headphones', 'moon'],
    backdrops: ['circle', 'splat', 'cloud', 'heart'],
    iconShapes: ['crown', 'heart'],
    nouns: [
      'Neko Kitty',
      'Shiba Good Boy',
      'Kitsune Fox',
      'Pond Frog',
      'Honey Bear',
      'Fluffy Bunny',
      'Boo Ghost',
      'Tiny Dragon',
      'Leaf Spirit',
      'Napping Pet',
      'Cheeky Mascot',
      'Mascot Charm',
    ],
    baseKeywords: ['animal', 'cat', 'dog', 'shiba', 'fox', 'frog', 'bear', 'bunny', 'ghost', 'dragon', 'pet'],
  },
  {
    category: 'Action & Fantasy',
    slug: 'action',
    count: 36,
    archetypes: ['chibi', 'dragon', 'fox', 'icon'],
    expressions: ['glint', 'angry', 'hype', 'smug', 'cool'],
    props: ['katana', 'magic', 'shuriken', 'flame', 'lightning', 'horns', 'halo', 'visor'],
    backdrops: ['shield', 'burst', 'diamond', 'splat'],
    iconShapes: ['katana', 'magic', 'shuriken', 'flame', 'lightning'],
    nouns: [
      'Katana Slash',
      'Arcane Seal',
      'Shadow Shuriken',
      'Dragon Breath',
      'Demon Smirk',
      'Guardian Halo',
      'Final Strike',
      'Mecha Lock',
      'Spirit Blade',
      'Storm Duel',
      'Boss Battle',
      'Shonen Clash',
    ],
    baseKeywords: ['action', 'fantasy', 'katana', 'sword', 'magic', 'ninja', 'shuriken', 'dragon', 'fight', 'shonen'],
  },
];

function buildStickerPack(): StickerSpec[] {
  const list: StickerSpec[] = [];
  let globalIdx = 0;

  for (const recipe of RECIPES) {
    for (let i = 0; i < recipe.count; i++) {
      const archetype = recipe.archetypes[i % recipe.archetypes.length];
      const expression = recipe.expressions[(i + Math.floor(i / recipe.archetypes.length)) % recipe.expressions.length];
      const prop = recipe.props[(i * 3 + Math.floor(i / 4)) % recipe.props.length];
      const backdrop = recipe.backdrops[(i + Math.floor(i / 3)) % recipe.backdrops.length];
      const hairStyle = HAIR_STYLES[(i + globalIdx) % HAIR_STYLES.length];
      const palette = PALETTES[(i * 5 + globalIdx) % PALETTES.length];
      const tilt = TILTS[(i + globalIdx) % TILTS.length];
      const noun = recipe.nouns[i % recipe.nouns.length];
      const variantNum = Math.floor(i / recipe.nouns.length) + 1;
      const iconShape =
        archetype === 'icon'
          ? recipe.iconShapes[i % recipe.iconShapes.length]
          : undefined;

      const name = variantNum > 1 ? `${noun} ${variantNum}` : noun;
      const id = `stk-${recipe.slug}-${String(i + 1).padStart(2, '0')}`;

      const keywordSet = new Set<string>([
        ...recipe.baseKeywords,
        ...noun.toLowerCase().split(/\s+/),
        archetype,
        expression,
        prop,
        ...(iconShape ? [iconShape] : []),
      ]);

      list.push({
        id,
        name,
        category: recipe.category,
        keywords: Array.from(keywordSet).filter((k) => k && k !== 'none'),
        archetype,
        expression,
        prop,
        backdrop,
        hairStyle,
        palette,
        tilt,
        iconShape,
      });

      globalIdx += 1;
    }
  }

  return list;
}

export const STICKER_PACK: StickerSpec[] = buildStickerPack();

export const STICKER_MAP: Record<string, StickerSpec> = Object.fromEntries(
  STICKER_PACK.map((s) => [s.id, s])
);

export const VALID_STICKER_ID_SET: Set<string> = new Set(STICKER_PACK.map((s) => s.id));
