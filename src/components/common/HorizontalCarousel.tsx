import React, { useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalCarouselProps {
  title: string;
  subtitle?: string;
  viewAllLabel?: string;
  onViewAll?: () => void;
  children: React.ReactNode;
}

export const HorizontalCarousel: React.FC<HorizontalCarouselProps> = ({
  title,
  subtitle,
  viewAllLabel = 'View All',
  onViewAll,
  children,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (direction: -1 | 1) => {
    if (!trackRef.current) return;
    const width = trackRef.current.clientWidth;
    trackRef.current.scrollBy({ left: direction * Math.max(280, width * 0.75), behavior: 'smooth' });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            onClick={onViewAll}
            className={`font-display text-xl sm:text-2xl font-bold text-[#141619] tracking-tight ${
              onViewAll ? 'cursor-pointer hover:text-amber-800 transition-colors' : ''
            }`}
          >
            {title}
          </h2>
          {subtitle && <p className="text-sm text-stone-600 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            aria-label={`Previous ${title}`}
            className="w-9 h-9 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-700 hover:bg-stone-50 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            aria-label={`Next ${title}`}
            className="w-9 h-9 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-700 hover:bg-stone-50 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="hidden sm:inline-flex items-center gap-1.5 ml-1 px-3 py-2 text-xs font-semibold text-[#141619] hover:text-amber-800 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{viewAllLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 snap-x snap-mandatory"
      >
        {children}
      </div>
    </section>
  );
};
