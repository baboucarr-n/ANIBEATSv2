import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, X, SlidersHorizontal, ChevronDown } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  currentRoute: '/' | '/weekly-must';
  onNavigate: (route: '/' | '/weekly-must', hash?: string) => void;
  onOpenAdmin: () => void;
}

const PRIMARY_LINKS: {
  id: string;
  label: string;
  route: '/' | '/weekly-must';
  href: string;
  underline: string;
}[] = [
  { id: 'anime', label: 'Anime', route: '/', href: '/#anime', underline: 'bg-rose-500' },
  { id: 'music', label: 'Music', route: '/', href: '/#music', underline: 'bg-emerald-500' },
  { id: 'playlists', label: 'Playlists', route: '/', href: '/#playlists', underline: 'bg-violet-600' },
  { id: 'weekly-must', label: 'Weekly MUST', route: '/weekly-must', href: '/weekly-must', underline: 'bg-gradient-to-r from-violet-600 to-cyan-500' },
  { id: 'cars', label: 'Cars', route: '/', href: '/#cars', underline: 'bg-blue-600' },
  { id: 'travel', label: 'Travel', route: '/', href: '/#travel', underline: 'bg-cyan-600' },
  { id: 'story', label: 'Story', route: '/', href: '/#story', underline: 'bg-indigo-600' },
];

const MORE_LINKS = [
  { href: '/#community', id: 'community', label: 'Community' },
  { href: '/#journal', id: 'journal', label: 'Journal' },
];

const MOBILE_CORE_LINKS = [
  { href: '/#home', id: 'home', label: '01. Home', route: '/' as const },
  { href: '/#anime', id: 'anime', label: '02. Anime', route: '/' as const },
  { href: '/#music', id: 'music', label: '03. Music / Rap', route: '/' as const },
  { href: '/#playlists', id: 'playlists', label: '04. Playlists', route: '/' as const },
  { href: '/#cars', id: 'cars', label: '05. Cars', route: '/' as const },
  { href: '/#travel', id: 'travel', label: '06. Travel (80)', route: '/' as const },
  { href: '/#story', id: 'story', label: '07. Story', route: '/' as const },
];

const MOBILE_MORE_LINKS = [
  { href: '/weekly-must', id: 'weekly-must', label: 'Weekly MUST', route: '/weekly-must' as const },
  { href: '/#community', id: 'community', label: '08. Community', route: '/' as const },
  { href: '/#journal', id: 'journal', label: '09. Journal', route: '/' as const },
];

export function Navbar({ activeSection, currentRoute, onNavigate, onOpenAdmin }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        setMoreOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const effectiveActive = currentRoute === '/weekly-must' ? 'weekly-must' : activeSection;
  const activeObj = PRIMARY_LINKS.find((l) => l.id === effectiveActive);

  return (
    <header
      className={`sticky top-0 z-40 apple-material transition-colors duration-200 ${
        scrolled ? 'border-b border-zinc-200' : 'border-b border-zinc-200/60'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-[64px] flex items-center justify-between gap-6">
        {/* Zone 1: Clean geometric colorful mark + single-line wordmark */}
        <a
          href="/#home"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/', '#home');
          }}
          className="inline-flex items-center gap-2.5 text-base font-extrabold tracking-tight text-zinc-950 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-4 rounded-sm"
        >
          <span
            aria-hidden="true"
            className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 text-white grid place-items-center text-xs font-bold shadow-sm"
          >
            A
          </span>
          <span>ANIBEATS</span>
        </a>

        {/* Zone 2: Minimalist typography links with Weekly MUST between Playlists and Cars */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-5">
          {PRIMARY_LINKS.map((link) => {
            const isActive = effectiveActive === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(link.route, link.route === '/' ? `#${link.id}` : undefined);
                }}
                className={`relative py-1.5 text-sm whitespace-nowrap shrink-0 transition-colors ${
                  isActive ? 'text-zinc-950 font-semibold' : 'text-zinc-500 hover:text-zinc-950 font-medium'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="activeNavUnderline"
                    transition={{ type: 'spring', stiffness: 520, damping: 36 }}
                    className={`absolute inset-x-0 -bottom-0.5 h-[2px] rounded-full ${
                      activeObj?.underline || 'bg-indigo-600'
                    }`}
                  />
                )}
              </a>
            );
          })}

          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((prev) => !prev)}
              aria-expanded={moreOpen}
              className={`inline-flex items-center gap-1 py-1.5 text-sm whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                ['community', 'journal'].includes(effectiveActive)
                  ? 'text-zinc-950 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-950 font-medium'
              }`}
            >
              More
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 34 }}
                  onMouseLeave={() => setMoreOpen(false)}
                  className="absolute right-0 mt-2 w-44 rounded-xl bg-white border border-zinc-200 shadow-lg p-1.5"
                >
                  {MORE_LINKS.map((item) => (
                    <a
                      key={item.id}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        setMoreOpen(false);
                        onNavigate('/', `#${item.id}`);
                      }}
                      className={`block px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                        effectiveActive === item.id
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950'
                      }`}
                    >
                      {item.label}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Zone 3: Admin Studio Button + Mobile Menu */}
        <div className="flex items-center gap-2.5 shrink-0">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={onOpenAdmin}
            className="inline-flex items-center justify-center gap-2 min-h-[38px] px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-zinc-950 hover:bg-indigo-600 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Admin Panel</span>
          </motion.button>

          <button
            type="button"
            onClick={() => setDrawerOpen((prev) => !prev)}
            aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={drawerOpen}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-zinc-200 bg-white text-zinc-900 cursor-pointer"
          >
            {drawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Interruptible Spring Mobile Drawer — Weekly MUST placed in More on mobile */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 460, damping: 36 }}
            className="lg:hidden overflow-hidden border-t border-zinc-200 bg-white"
          >
            <nav aria-label="Mobile navigation" className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-1.5">
                {MOBILE_CORE_LINKS.map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setDrawerOpen(false);
                      onNavigate(link.route, `#${link.id}`);
                    }}
                    className={`px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                      effectiveActive === link.id
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950'
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="pt-3 border-t border-zinc-100">
                <p className="font-data text-[11px] font-semibold uppercase tracking-wider text-zinc-500 px-3 mb-2">
                  More
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {MOBILE_MORE_LINKS.map((link) => (
                    <a
                      key={link.id}
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        setDrawerOpen(false);
                        onNavigate(link.route, link.route === '/' ? `#${link.id}` : undefined);
                      }}
                      className={`px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                        effectiveActive === link.id
                          ? 'bg-violet-50 text-violet-700 font-semibold'
                          : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950'
                      }`}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
