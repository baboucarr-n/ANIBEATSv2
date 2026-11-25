import { useState } from 'react';
import { motion } from 'motion/react';
import { SlidersHorizontal } from 'lucide-react';
import {
  CAR_CATEGORIES,
  type CarCategoryKey,
  type CarEntry,
  type MoodKey,
} from '../data/anibeatsData';
import { Tilt3DCard } from './Tilt3DCard';

interface CarsSectionProps {
  selectedMood: MoodKey;
  cars: CarEntry[];
  onOpenAdminCars: () => void;
}

export function CarsSection({ selectedMood, cars, onOpenAdminCars }: CarsSectionProps) {
  const [carCategory, setCarCategory] = useState<CarCategoryKey>('all');

  const filteredCars = cars.filter(
    (car) => carCategory === 'all' || car.category === carCategory
  );

  return (
    <section id="cars" className="studio-wash-cars py-20 md:py-24 border-t border-zinc-200">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="font-data text-xs font-semibold uppercase tracking-wider text-blue-600 mb-3">
              05 · Cars
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 mb-4">
              The Dream Garage
            </h2>
            <p className="text-base text-zinc-600 leading-relaxed">
              Cars mean just as much to me as Anime and Music. From JDM icons to late-night dream drives — edit or add builds anytime in the Admin Panel.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAdminCars}
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 whitespace-nowrap shrink-0 cursor-pointer self-start md:self-auto transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Edit Garage</span>
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div
          className="inline-flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-zinc-100 border border-zinc-200/80 mb-8"
          role="group"
          aria-label="Car categories"
        >
          {CAR_CATEGORIES.map((cat) => {
            const isActive = carCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCarCategory(cat.key)}
                aria-pressed={isActive}
                className={`relative min-h-[36px] px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  isActive ? 'text-blue-700' : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="carCategoryTab"
                    transition={{ type: 'spring', stiffness: 540, damping: 36 }}
                    className="absolute inset-0 bg-white rounded-lg shadow-sm border border-blue-200"
                  />
                )}
                <span className="relative z-10">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dream Garage Ranked 3D Tilt Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCars.map((car) => {
            const matchesMood = selectedMood === 'all' || car.moods.includes(selectedMood);
            return (
              <Tilt3DCard
                key={car.id}
                maxTilt={5}
                sheenColor="rgba(37, 99, 235, 0.14)"
                className={`rounded-2xl transition-opacity ${
                  matchesMood ? 'opacity-100' : 'opacity-45'
                }`}
              >
                <article
                  className={`surface-card rounded-2xl overflow-hidden hover:border-blue-300 ${
                    selectedMood !== 'all' && matchesMood ? 'ring-2 ring-blue-600' : ''
                  }`}
                >
                  <div className="relative h-56 bg-zinc-100 overflow-hidden border-b border-zinc-100">
                    <img
                      src={car.imageUrl}
                      alt={car.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 font-data text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-600 text-white shadow-sm">
                      #{String(car.rank).padStart(2, '0')} · {car.categoryLabel}
                    </span>
                  </div>
                  <div className="p-6 bg-white">
                    <h3 className="text-xl font-bold text-zinc-950">{car.name}</h3>
                    <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
                      <span className="font-semibold text-zinc-900">Why it matters to me:</span>{' '}
                      {car.why}
                    </p>
                  </div>
                </article>
              </Tilt3DCard>
            );
          })}
        </div>

        {/* Anime Cars, Car Hot Takes, Dream Drive */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div
            className={`surface-card rounded-2xl p-6 transition-opacity hover:border-blue-200 ${
              selectedMood === 'all' || selectedMood === 'late-night' || selectedMood === 'hype'
                ? 'opacity-100'
                : 'opacity-45'
            }`}
          >
            <p className="font-data text-xs font-semibold text-blue-600 uppercase">Anime Cars</p>
            <h3 className="text-lg font-bold text-zinc-950 mt-1.5">
              Initial D &amp; Wangan Midnight
            </h3>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              Cars from the anime I love — mountain passes, highway midnight runs, and the machines that stole every scene.
            </p>
            <p className="font-data text-xs text-zinc-500 mt-4">
              Specific favorites: To be filled by me
            </p>
          </div>

          <div className="surface-card rounded-2xl p-6 hover:border-amber-200">
            <p className="font-data text-xs font-semibold text-amber-600 uppercase">Car Hot Takes</p>
            <h3 className="text-lg font-bold text-zinc-950 mt-1.5">Honest Car Opinions</h3>
            <div className="space-y-2 mt-3 text-sm text-zinc-600">
              <p>
                <span className="font-semibold text-zinc-900">Best sounding car:</span> To be filled by me
              </p>
              <p>
                <span className="font-semibold text-zinc-900">Most overrated car:</span> To be filled by me
              </p>
            </div>
          </div>

          <div
            className={`surface-card rounded-2xl p-6 transition-opacity hover:border-blue-200 ${
              selectedMood === 'all' || selectedMood === 'late-night' || selectedMood === 'chill'
                ? 'opacity-100'
                : 'opacity-45'
            }`}
          >
            <p className="font-data text-xs font-semibold text-indigo-600 uppercase">Dream Drive</p>
            <h3 className="text-lg font-bold text-zinc-950 mt-1.5">
              Car + Road + Song + Place
            </h3>
            <div className="space-y-1.5 mt-3 text-sm text-zinc-600">
              <p>
                <span className="font-semibold text-zinc-900">The Car:</span> To be filled by me
              </p>
              <p>
                <span className="font-semibold text-zinc-900">The Road &amp; Place:</span> To be filled by me
              </p>
              <p>
                <span className="font-semibold text-zinc-900">The Song Playing:</span> To be filled by me
              </p>
            </div>
            <p className="text-xs text-zinc-500 italic mt-4">
              Future: My real driving journey, first car &amp; car meets.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
