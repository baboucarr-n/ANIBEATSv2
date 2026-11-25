import { useState } from 'react';
import { motion } from 'motion/react';
import { SlidersHorizontal } from 'lucide-react';
import {
  DREAM_MAP_PINS,
  TRAVEL_WHY_FILTERS,
  type TravelDestination,
  type TravelWhyKey,
} from '../data/anibeatsData';
import { TravelGlobe3D } from './three/TravelGlobe3D';

interface TravelSectionProps {
  travelTrips: TravelDestination[];
  visitedIds: string[];
  onToggleVisited: (id: string) => void;
  onResetVisited: () => void;
  onOpenAdminTravel: () => void;
}

const REMAINING_70_BATCHES = [
  { batch: 'Batch 1', range: '11–20', status: 'To be filled by me' },
  { batch: 'Batch 2', range: '21–40', status: 'To be filled by me' },
  { batch: 'Batch 3', range: '41–60', status: 'To be filled by me' },
  { batch: 'Batch 4', range: '61–80', status: 'To be filled by me' },
];

const PIN_SWATCHES: Record<string, string> = {
  'pin-jp': 'bg-rose-600 border-rose-600 text-white',
  'pin-us': 'bg-emerald-600 border-emerald-600 text-white',
  'pin-de': 'bg-blue-600 border-blue-600 text-white',
  'pin-ae': 'bg-cyan-600 border-cyan-600 text-white',
};

export function TravelSection({
  travelTrips,
  visitedIds,
  onToggleVisited,
  onResetVisited,
  onOpenAdminTravel,
}: TravelSectionProps) {
  const [whyFilter, setWhyFilter] = useState<TravelWhyKey>('all');
  const [selectedPinId, setSelectedPinId] = useState<string>(DREAM_MAP_PINS[0].id);

  const visitedCount = visitedIds.length;
  const progressPct = Math.min(100, (visitedCount / 80) * 100);

  const filteredTrips = travelTrips.filter(
    (trip) => whyFilter === 'all' || trip.whyKey === whyFilter
  );

  const activePin = DREAM_MAP_PINS.find((p) => p.id === selectedPinId) ?? DREAM_MAP_PINS[0];

  return (
    <section id="travel" className="studio-wash-travel py-20 md:py-24 border-t border-zinc-200">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="font-data text-xs font-semibold uppercase tracking-wider text-cyan-700 mb-3">
              06 · Travel
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 mb-4">
              80 Dream Destinations
            </h2>
            <p className="text-base text-zinc-600 leading-relaxed">
              Every place connects to what I love. Spin the interactive 3D Dream Globe, inspect pins, and track progress from 0 / 80.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAdminTravel}
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-cyan-800 bg-cyan-50 border border-cyan-200 hover:bg-cyan-100 whitespace-nowrap shrink-0 cursor-pointer self-start md:self-auto transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Add Destinations</span>
          </button>
        </div>

        {/* Real-Life Progress Tracker 0 / 80 */}
        <div className="surface-card rounded-2xl p-6 sm:p-7 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-data text-xs font-semibold text-cyan-700 uppercase">
                Real-Life Progress Tracker
              </p>
              <h3 className="text-2xl font-bold text-zinc-950 mt-1 tabular-nums">
                <span className="font-data text-cyan-700">{visitedCount} / 80</span> Visited — Journey Starts Now
              </h3>
            </div>

            <button
              type="button"
              onClick={onResetVisited}
              className="inline-flex items-center justify-center min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 cursor-pointer whitespace-nowrap shrink-0"
            >
              Reset Ticks
            </button>
          </div>

          <div className="w-full h-2.5 rounded-full bg-cyan-100 overflow-hidden mt-4 mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <p className="text-xs text-zinc-500">
            Tick off each place as I actually visit it in real life (persisted to the backend API).
          </p>
        </div>

        {/* Interactive 3D Dream Map Globe */}
        <div className="surface-card rounded-2xl overflow-hidden mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-5 flex flex-col bg-gradient-to-br from-slate-50 via-cyan-50/40 to-indigo-50/50 border-b lg:border-b-0 lg:border-r border-zinc-200">
              <div className="h-[290px] sm:h-[320px] w-full">
                <TravelGlobe3D selectedPinId={selectedPinId} onSelectPin={setSelectedPinId} />
              </div>
              <div className="px-6 py-4 bg-white border-t border-zinc-200">
                <p className="font-data text-[11px] font-semibold text-cyan-700 uppercase">
                  Focused 3D Pin · {activePin.tag}
                </p>
                <h3 className="text-lg font-bold text-zinc-950 mt-0.5">{activePin.country}</h3>
                <p className="text-xs text-zinc-600 mt-1">{activePin.why}</p>
              </div>
            </div>

            <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between bg-white">
              <div>
                <p className="font-data text-xs font-semibold text-cyan-700 uppercase">
                  Interactive 3D Dream Map
                </p>
                <h3 className="text-xl font-bold text-zinc-950 mt-1.5">
                  Click Any Pin or Drag the 3D Globe
                </h3>
                <p className="text-sm text-zinc-600 mt-1">
                  Selecting a country card or clicking a 3D beacon rotates the globe directly to that destination.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                  {DREAM_MAP_PINS.map((pin) => {
                    const isSelected = pin.id === activePin.id;
                    return (
                      <button
                        key={pin.id}
                        type="button"
                        onClick={() => setSelectedPinId(pin.id)}
                        className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? PIN_SWATCHES[pin.id] || 'bg-cyan-600 text-white border-cyan-600'
                            : 'bg-white text-zinc-900 border-zinc-200 hover:border-cyan-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold">{pin.country}</span>
                          <span
                            className={`font-data text-[11px] ${
                              isSelected ? 'text-white/90' : 'text-zinc-500'
                            }`}
                          >
                            {pin.tag}
                          </span>
                        </div>
                        <p
                          className={`text-xs mt-1.5 leading-relaxed ${
                            isSelected ? 'text-white/90' : 'text-zinc-600'
                          }`}
                        >
                          {pin.why}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="font-data text-xs text-zinc-500 mt-5">
                Owner defines final 80-pin mapping slowly, batch by batch.
              </p>
            </div>
          </div>
        </div>

        {/* Filters by WHY */}
        <div
          className="inline-flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-zinc-100 border border-zinc-200/80 mb-8"
          role="group"
          aria-label="Travel filters by WHY"
        >
          {TRAVEL_WHY_FILTERS.map((flt) => {
            const isActive = whyFilter === flt.key;
            return (
              <button
                key={flt.key}
                type="button"
                onClick={() => setWhyFilter(flt.key)}
                aria-pressed={isActive}
                className={`relative min-h-[36px] px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  isActive ? 'text-cyan-800' : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="travelWhyTab"
                    transition={{ type: 'spring', stiffness: 540, damping: 36 }}
                    className="absolute inset-0 bg-white rounded-lg shadow-sm border border-cyan-200"
                  />
                )}
                <span className="relative z-10">{flt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Top 10 Dream Trips */}
        <div className="flex items-baseline justify-between gap-2 mb-5">
          <h3 className="text-xl font-bold text-zinc-950">Top Dream Trips</h3>
          <span className="font-data text-xs text-cyan-700 font-semibold">
            {travelTrips.length} listed · editable in Admin
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTrips.map((trip) => {
            const isVisited = visitedIds.includes(trip.id);
            return (
              <article key={trip.id} className="surface-card rounded-2xl p-6 hover:border-cyan-300">
                <p className="font-data text-xs font-semibold text-cyan-700 tabular-nums">
                  Trip #{String(trip.rank).padStart(2, '0')} · {trip.whyLabel}
                </p>
                <h4 className="text-lg font-bold text-zinc-950 mt-1.5">
                  {trip.city}, {trip.country}
                </h4>
                <div className="text-sm text-zinc-600 mt-2 space-y-1">
                  <p>
                    <span className="font-semibold text-zinc-900">Why:</span> {trip.whyText}
                  </p>
                  <p>
                    <span className="font-semibold text-zinc-900">Dream activity:</span>{' '}
                    {trip.dreamActivity}
                  </p>
                </div>

                <label className="inline-flex items-center gap-2.5 mt-4 text-xs font-semibold text-zinc-900 cursor-pointer select-none min-h-[32px]">
                  <input
                    type="checkbox"
                    checked={isVisited}
                    onChange={() => onToggleVisited(trip.id)}
                    className="w-4 h-4 accent-cyan-600 rounded cursor-pointer"
                  />
                  <span>{isVisited ? 'Visited in real life' : 'Mark as visited'}</span>
                </label>
              </article>
            );
          })}
        </div>

        {/* Remaining 70 Build Plan */}
        <div className="surface-card rounded-2xl p-7 mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
            <p className="font-data text-xs font-semibold text-cyan-700 uppercase">
              Remaining 70 · Batch Build
            </p>
            <span className="font-data text-xs text-zinc-500">
              To be filled by me in batches of 10–20
            </span>
          </div>
          <h3 className="text-xl font-bold text-zinc-950">The Other 70 Places (11 – 80)</h3>
          <p className="text-sm text-zinc-600 mt-2 max-w-3xl leading-relaxed">
            Build rule from my PRD: perfect my Top 10 first, then add the other 70 slowly in thoughtful batches of 10–20 so every destination has a Country, City, Why, Dream Activity, and Tag.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6">
            {REMAINING_70_BATCHES.map((item) => (
              <div key={item.batch} className="surface-subtle rounded-xl p-4">
                <p className="text-sm font-bold text-zinc-950 tabular-nums">
                  {item.batch} ({item.range})
                </p>
                <p className="text-xs text-zinc-500 mt-1">{item.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
