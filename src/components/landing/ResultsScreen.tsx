import { useState, useEffect, useRef } from 'react';

interface ResultStatConfig {
  prefix?: string;
  targetValue: number;
  suffix: string;
  label: string;
  durationMs?: number;
}

const STATS_CONFIG: ResultStatConfig[] = [
  {
    prefix: '',
    targetValue: 10,
    suffix: ' days',
    label: 'Rain forecast ahead, for every sector',
    durationMs: 1600,
  },
  {
    prefix: '<',
    targetValue: 15,
    suffix: ' min',
    label: 'Weather station data refresh',
    durationMs: 1400,
  },
  {
    prefix: '',
    targetValue: 15,
    suffix: '',
    label: 'Musanze sectors covered',
    durationMs: 1300,
  },
  {
    prefix: '',
    targetValue: 2,
    suffix: '',
    label: 'Languages: Kinyarwanda and English',
    durationMs: 1000,
  },
];

function AnimatedCounter({
  config,
  hasTriggered,
}: {
  config: ResultStatConfig;
  hasTriggered: boolean;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!hasTriggered) return;

    let startTimestamp: number | null = null;
    const duration = config.durationMs || 1500;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const val = Math.floor(easeOut * config.targetValue);
      setCurrent(val);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCurrent(config.targetValue);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [hasTriggered, config.targetValue, config.durationMs]);

  return (
    <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-sans tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.25)] mb-2.5 transition-transform duration-300 group-hover:scale-105 whitespace-nowrap flex items-baseline justify-center">
      {config.prefix && <span className="mr-1">{config.prefix.trim()} </span>}
      <span>{current}</span>
      <span>{config.suffix}</span>
    </div>
  );
}

export function ResultsScreen() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Trigger counting animation once when the screen appears into viewport (independent of subsequent scroll)
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      {
        threshold: 0.25,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [hasAnimated]);

  return (
    <section
      id="results-screen"
      ref={sectionRef}
      className="relative z-10 w-full min-h-[48vh] py-20 sm:py-24 md:py-28 px-6 sm:px-10 md:px-16 lg:px-20 bg-[#05090f] font-sans selection:bg-white/20 selection:text-white overflow-hidden flex flex-col justify-center items-center text-center border-t border-white/5"
    >
      {/* Subtle Background Glow Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] sm:w-[1100px] h-[340px] bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-full blur-[140px] opacity-70" />
      </div>

      <div className="relative z-10 max-w-5xl w-full mx-auto flex flex-col items-center">
        {/* Eyebrow & Headline */}
        <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-white/70 font-semibold mb-3 block">
          IN THE PROTOTYPE
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-white tracking-tight leading-[1.12] max-w-3xl mb-12 sm:mb-14 md:mb-16">
          What ihingaAI covers today
        </h2>

        {/* 4 Stats Minimalist Horizontal Row Layout */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-8 md:gap-6 lg:gap-8 items-start justify-center">
          {STATS_CONFIG.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center text-center group">
              {/* Number with 0 -> target count-up animation on first appearance */}
              <AnimatedCounter config={stat} hasTriggered={hasAnimated} />

              {/* Monospace Muted Label Below */}
              <div className="text-xs sm:text-sm font-sans text-white/70 group-hover:text-white transition-colors leading-relaxed max-w-[170px] sm:max-w-[190px]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
