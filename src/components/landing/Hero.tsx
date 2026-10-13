import { ArrowRight, Play } from 'lucide-react';

interface HeroProps {
  onExploreRiskMap: () => void;
  onHowItWorks: () => void;
}

export function Hero({ onExploreRiskMap, onHowItWorks }: HeroProps) {
  return (
    <div
      id="hero-content-section"
      className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 my-auto"
    >
      <div className="max-w-5xl space-y-6 flex flex-col items-center">
        {/* Centered Main Heading */}
        <h1
          id="hero-heading"
          className="text-5xl sm:text-7xl md:text-8xl font-serif tracking-tight leading-[1.05] text-white select-none"
        >
          CLIMATE <span className="italic font-light">and</span> CROP
          <br />
          INTELLIGENCE <span className="italic font-light">for</span> MODERN
          <br />
          AGRICULTURE
        </h1>

        <div className="flex flex-col items-center gap-8 mt-2">
          {/* Subtext */}
          <p
            id="hero-subtext"
            className="max-w-xl text-base sm:text-lg font-light text-white/80 leading-relaxed font-sans"
          >
            We harness AI micro-telemetry and satellite data to secure harvests{' '}
            <br className="hidden md:block" />
            and build a climate-resilient Rwanda.
          </p>

          {/* Buttons Row */}
          <div
            id="hero-actions-row"
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            {/* Primary Button */}
            <button
              id="explore-risk-map-btn"
              onClick={onExploreRiskMap}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold transition-transform hover:scale-105 active:scale-95 text-sm sm:text-base cursor-pointer shadow-lg shadow-white/5"
            >
              <span>Explore Risk Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Secondary Button */}
            <button
              id="how-it-works-btn"
              onClick={onHowItWorks}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 border border-white/40 backdrop-blur-sm px-8 py-4 rounded-full font-semibold transition-all hover:bg-white/10 active:scale-95 text-sm sm:text-base text-white cursor-pointer"
            >
              <div className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-full">
                <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
              </div>
              <span>How it Works</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
