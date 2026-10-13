import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Satellite, Cpu, ShieldAlert, MessageSquare, Sprout } from 'lucide-react';
import bgImage from '../../assets/images/dramatic_agro_valley_1786792091015.jpg';

interface StepItem {
  number: number;
  icon: typeof Satellite;
  title: string;
  description: string;
}

const STEPS: StepItem[] = [
  {
    number: 1,
    icon: Satellite,
    title: 'Satellites & stations watch',
    description:
      'Climate data collected 24/7 from weather stations and satellites (simulated in this prototype)',
  },
  {
    number: 2,
    icon: Cpu,
    title: 'AI detects the risk',
    description:
      'Models analyze rainfall patterns, temperature, and vegetation to predict drought, flood, or heat threats weeks ahead',
  },
  {
    number: 3,
    icon: ShieldAlert,
    title: 'Warning is generated',
    description:
      'A severity level is assigned, green to red with crop-specific recommended actions automatically attached',
  },
  {
    number: 4,
    icon: MessageSquare,
    title: 'You receive the alert',
    description:
      'SMS or voice call delivered in Kinyarwanda on any phone, no internet or smartphone required',
  },
  {
    number: 5,
    icon: Sprout,
    title: 'You act and report back',
    description:
      'Follow crop-specific advice, then report what you observe. Your feedback makes the system smarter every season',
  },
];

// Refined threshold stages:
// 0.00 -> 0.10: Header fades in and settles
// 0.12 -> 0.22: Step 1 appears & stays
// 0.24 -> 0.34: Step 2 appears & stays
// 0.36 -> 0.46: Step 3 appears & stays
// 0.48 -> 0.58: Step 4 appears & stays
// 0.60 -> 0.70: Step 5 appears & stays
// 0.70 -> 1.00: All 5 steps remain completely visible and pinned together, giving ample reading time before scrolling to next screen
const STEP_THRESHOLDS = [
  { start: 0.12, peak: 0.22 },
  { start: 0.24, peak: 0.34 },
  { start: 0.36, peak: 0.46 },
  { start: 0.48, peak: 0.58 },
  { start: 0.60, peak: 0.70 },
];

export function HowItWorksScreen() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Header appears first and stays permanently visible through the rest of the scroll
  const headerOpacity = useTransform(scrollYProgress, [0, 0.10, 1], [0.1, 1, 1], {
    clamp: true,
  });
  const headerY = useTransform(scrollYProgress, [0, 0.10, 1], [24, 0, 0], {
    clamp: true,
  });

  // Connecting progress line fills from step 1 to step 5, and stays filled
  const lineScaleX = useTransform(scrollYProgress, [0.12, 0.70, 1], [0, 1, 1], {
    clamp: true,
  });

  return (
    <div
      id="how-it-works-screen"
      ref={containerRef}
      className="relative z-10 w-full h-[350vh] sm:h-[380vh] bg-[#05090f] font-sans selection:bg-emerald-500/30 selection:text-white border-t border-white/5"
    >
      {/* Sticky Fullscreen Viewport pinned during the scroll progression */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-center overflow-hidden px-6 sm:px-10 md:px-16 lg:px-20">
        {/* Atmospheric Background Image matching Hero with smooth transitions */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-0">
          <img
            src={bgImage}
            alt="How it Works Background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-60 scale-105"
          />
          {/* Overlays for high contrast & seamless blending */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05090f] via-black/40 to-black/50" />
          <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#05090f] via-[#05090f]/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#05090f] via-[#05090f]/80 to-transparent" />

          {/* Subtle Topographic Terrain SVG Lines */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.05] text-white"
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
          >
            <defs>
              <pattern
                id="howitworks-topo-pattern-scroll"
                width="800"
                height="800"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0 100 Q 200 40, 400 120 T 800 80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M0 220 Q 250 160, 450 240 T 800 200"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M0 340 Q 280 270, 500 360 T 800 310"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M0 480 Q 240 410, 480 500 T 800 450"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M0 620 Q 300 550, 550 640 T 800 590"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#howitworks-topo-pattern-scroll)" />
          </svg>

          {/* Ambient Glows matching Hero */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] sm:w-[1100px] h-[450px] bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-full blur-[140px] opacity-70" />
        </div>

        <div className="relative z-10 max-w-7xl w-full mx-auto flex flex-col items-center text-center my-auto py-8">
          {/* Header Block: Appears First, then stays locked in place */}
          <motion.div
            style={{ opacity: headerOpacity, y: headerY }}
            className="max-w-3xl mb-12 sm:mb-16 md:mb-20 flex flex-col items-center text-center"
          >
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-white/70 font-semibold mb-3 block">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-white tracking-tight leading-[1.12]">
              From risk detected to farmer protected
            </h2>
          </motion.div>

          {/* 5-Step Flow Grid: Appears sequentially, and stays visible once unlocked */}
          <div className="relative w-full">
            {/* Connecting Base Guideline (Track) */}
            <div className="hidden lg:block absolute top-5 left-[10%] right-[10%] h-[2px] bg-white/10 -z-10" />

            {/* Connecting Active Progress Line (Fills dynamically on scroll and stays full) */}
            <motion.div
              style={{ scaleX: lineScaleX, transformOrigin: 'left' }}
              className="hidden lg:block absolute top-5 left-[10%] right-[10%] h-[2px] bg-white -z-10 shadow-[0_0_12px_rgba(255,255,255,0.6)]"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-8 lg:gap-6 items-start">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const thresholds = STEP_THRESHOLDS[idx];

                // Once reached, values stay at 1 (100% visible, fully stationary) for all subsequent scroll points
                const stepOpacity = useTransform(
                  scrollYProgress,
                  [thresholds.start, thresholds.peak, 1],
                  [0, 1, 1],
                  { clamp: true }
                );

                const stepY = useTransform(
                  scrollYProgress,
                  [thresholds.start, thresholds.peak, 1],
                  [30, 0, 0],
                  { clamp: true }
                );

                const badgeScale = useTransform(
                  scrollYProgress,
                  [thresholds.start, thresholds.peak, 1],
                  [0.6, 1, 1],
                  { clamp: true }
                );

                return (
                  <motion.div
                    key={step.number}
                    style={{
                      opacity: stepOpacity,
                      y: stepY,
                    }}
                    className="group flex flex-col items-center text-center transition-all duration-300"
                  >
                    {/* Number Badge */}
                    <motion.div
                      style={{ scale: badgeScale }}
                      className="w-10 h-10 rounded-full bg-white text-black font-bold text-base flex items-center justify-center shadow-lg shadow-white/10 mb-6 group-hover:scale-110 group-hover:bg-neutral-100 transition-transform"
                    >
                      <span>{step.number}</span>
                    </motion.div>

                    {/* Step Icon */}
                    <div className="mb-4 text-white group-hover:text-white/80 transition-colors">
                      <Icon className="w-7 h-7 stroke-[1.75]" />
                    </div>

                    {/* Step Title */}
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2.5 tracking-tight font-sans leading-snug max-w-[200px]">
                      {step.title}
                    </h3>

                    {/* Step Description */}
                    <p className="text-xs sm:text-sm text-white/70 font-normal leading-relaxed max-w-[220px]">
                      {step.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scroll Progress Helper Indicator in Bottom Right */}
        <div className="absolute bottom-6 right-8 hidden md:flex items-center gap-2 text-[10px] font-mono text-white/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Scroll to step through workflow</span>
        </div>
      </div>
    </div>
  );
}
