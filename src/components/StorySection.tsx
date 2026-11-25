import { LIVING_TIMELINE, STORY_PILLARS } from '../data/anibeatsData';

interface StorySectionProps {
  storyPersonalNote: string;
}

const PILLAR_COLORS = ['text-rose-600', 'text-indigo-600', 'text-cyan-700'];

export function StorySection({ storyPersonalNote }: StorySectionProps) {
  return (
    <section id="story" className="py-20 md:py-24 border-t border-zinc-200">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-3xl mb-12">
          <p className="font-data text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-3">
            07 · Story — The Heart
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 mb-4">
            Why ANIBEATS Exists
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed">
            ANIBEATS started as WEB1 Assignment 2 — Internet and Web Programming 1. A hobby website about Anime and Rap Music.
            The assignment ended. The love did not. I kept building because I actually love this.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {STORY_PILLARS.map((pillar, idx) => (
            <article key={pillar.num} className="surface-card rounded-2xl p-7">
              <p className={`font-data text-xs font-semibold ${PILLAR_COLORS[idx] || 'text-indigo-600'}`}>
                PILLAR {pillar.num}
              </p>
              <h3 className="text-lg font-bold text-zinc-950 mt-2.5 leading-snug">
                {pillar.title}
              </h3>
              <p className="text-sm text-zinc-600 mt-3 leading-relaxed">{pillar.body}</p>
            </article>
          ))}
        </div>

        {/* Living Timeline */}
        <div className="surface-card rounded-2xl p-7 sm:p-8 mb-8">
          <h3 className="text-xl font-bold text-zinc-950 mb-6">The Living Timeline</h3>

          <div className="divide-y divide-zinc-100">
            {LIVING_TIMELINE.map((step) => (
              <div
                key={step.date}
                className="py-5 first:pt-0 last:pb-0 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6 items-start"
              >
                <div className="sm:col-span-3">
                  <span className="font-data text-sm font-bold text-indigo-600">
                    {step.date}
                  </span>
                </div>
                <div className="sm:col-span-9">
                  <h4 className="text-base font-bold text-zinc-950">{step.title}</h4>
                  <p className="text-sm text-zinc-600 mt-1.5 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Note in First Person */}
        <div className="surface-card rounded-2xl p-7 sm:p-9 bg-gradient-to-br from-indigo-50/50 via-white to-cyan-50/50">
          <p className="font-data text-xs font-semibold text-indigo-600 uppercase">
            First-Person Note from Baboucarr
          </p>
          <h3 className="text-2xl font-bold text-zinc-950 mt-2">
            Why Anime, Why Rap, Why Cars, Why Travel, Why 80 Places
          </h3>
          <p className="text-sm sm:text-base text-zinc-700 mt-4 leading-relaxed max-w-3xl">
            {storyPersonalNote}
          </p>
          <div className="mt-5 space-y-1.5 text-sm text-zinc-600">
            <p>
              <span className="font-semibold text-zinc-950">Why anime &amp; rap:</span> To be filled by me in my own words.
            </p>
            <p>
              <span className="font-semibold text-zinc-950">Why cars &amp; 80 places:</span> To be filled by me in my own words.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
