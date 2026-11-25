interface FooterProps {
  onOpenAdmin: () => void;
}

export function Footer({ onOpenAdmin }: FooterProps) {
  return (
    <footer className="border-t border-zinc-200 bg-white py-12">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-lg">
          <a href="#home" className="inline-flex items-center gap-2 text-base font-extrabold tracking-tight text-zinc-950">
            <span
              aria-hidden="true"
              className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-600 via-rose-500 to-cyan-500 text-white grid place-items-center text-[10px] font-bold"
            >
              A
            </span>
            <span>ANIBEATS</span>
          </a>
          <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed">
            My personal corner on the internet. Anime. Rap. Beats. Cars. Travel. Built with love, not for a grade.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs text-zinc-500">
          <span>Baboucarr · Built piece by piece, like an album</span>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="font-semibold text-indigo-600 hover:underline cursor-pointer text-left sm:text-right"
          >
            Open Admin Panel
          </button>
        </div>
      </div>
    </footer>
  );
}
