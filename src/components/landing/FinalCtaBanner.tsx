import { useRef } from 'react';
import { ArrowRight, LogIn } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import bgImage from '../../assets/images/rwanda_terraced_hills_1786792050652.jpg';

interface FinalCtaBannerProps {
  onStartTrial: () => void;
  onSignIn: () => void;
}

export function FinalCtaBanner({ onStartTrial, onSignIn }: FinalCtaBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track direct scroll progress across the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // 1. "READY" (0.02 -> 0.12, stays 1.0 till end)
  const readyOpacity = useTransform(scrollYProgress, [0.02, 0.12, 1], [0, 1, 1], { clamp: true });
  const readyY = useTransform(scrollYProgress, [0.02, 0.12, 1], [60, 0, 0], { clamp: true });

  // 2. "to" (0.12 -> 0.22, stays 1.0 till end)
  const toOpacity = useTransform(scrollYProgress, [0.12, 0.22, 1], [0, 1, 1], { clamp: true });
  const toY = useTransform(scrollYProgress, [0.12, 0.22, 1], [60, 0, 0], { clamp: true });

  // 3. "SEE THE SEASON" (0.22 -> 0.32, stays 1.0 till end)
  const seeSeasonOpacity = useTransform(scrollYProgress, [0.22, 0.32, 1], [0, 1, 1], { clamp: true });
  const seeSeasonY = useTransform(scrollYProgress, [0.22, 0.32, 1], [60, 0, 0], { clamp: true });

  // 4. "BEFORE" (0.32 -> 0.42, stays 1.0 till end)
  const beforeOpacity = useTransform(scrollYProgress, [0.32, 0.42, 1], [0, 1, 1], { clamp: true });
  const beforeY = useTransform(scrollYProgress, [0.32, 0.42, 1], [60, 0, 0], { clamp: true });

  // 5. "it" (0.42 -> 0.52, stays 1.0 till end)
  const itOpacity = useTransform(scrollYProgress, [0.42, 0.52, 1], [0, 1, 1], { clamp: true });
  const itY = useTransform(scrollYProgress, [0.42, 0.52, 1], [60, 0, 0], { clamp: true });

  // 6. "HAPPENS?" (0.52 -> 0.62, stays 1.0 till end)
  const happensOpacity = useTransform(scrollYProgress, [0.52, 0.62, 1], [0, 1, 1], { clamp: true });
  const happensY = useTransform(scrollYProgress, [0.52, 0.62, 1], [60, 0, 0], { clamp: true });

  // 7. Subtext Paragraph (0.62 -> 0.74, stays 1.0 till end)
  const subtextOpacity = useTransform(scrollYProgress, [0.62, 0.74, 1], [0, 1, 1], { clamp: true });
  const subtextY = useTransform(scrollYProgress, [0.62, 0.74, 1], [45, 0, 0], { clamp: true });

  // 8. Buttons (0.74 -> 0.86, stays 1.0 till end)
  const buttonsOpacity = useTransform(scrollYProgress, [0.74, 0.86, 1], [0, 1, 1], { clamp: true });
  const buttonsY = useTransform(scrollYProgress, [0.74, 0.86, 1], [45, 0, 0], { clamp: true });

  return (
    <div
      id="final-cta-banner"
      ref={containerRef}
      className="relative z-10 w-full h-[260vh] bg-[#05090f] selection:bg-white/20 selection:text-white transition-colors border-t border-white/5"
    >
      {/* Sticky pinned fullscreen viewport as you scroll through */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center px-6 sm:px-10 md:px-16 lg:px-20 overflow-hidden text-center">
        {/* Background Atmosphere matching Hero with smooth transitions */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-0">
          <img
            src={bgImage}
            alt="Final CTA Atmosphere Background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-60 scale-105"
          />
          {/* Deep cinematic overlay & smooth top/bottom gradient transitions */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05090f] via-black/40 to-black/50" />
          <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#05090f] via-[#05090f]/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#05090f] via-[#05090f]/80 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] sm:w-[1100px] h-[420px] bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-full blur-[140px] opacity-70" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[550px] h-[260px] bg-white/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          {/* Scroll-driven Headline: each word rises into place as you scroll down */}
          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif tracking-tight leading-[1.08] text-white mb-6 select-none max-w-4xl flex flex-col items-center justify-center gap-y-1 sm:gap-y-2">
            {/* First line: READY -> to -> SEE THE SEASON */}
            <div className="flex flex-wrap items-baseline justify-center gap-x-3 sm:gap-x-4">
              <motion.span
                style={{ opacity: readyOpacity, y: readyY }}
                className="inline-block"
              >
                READY
              </motion.span>
              <motion.span
                style={{ opacity: toOpacity, y: toY }}
                className="italic font-light inline-block"
              >
                to
              </motion.span>
              <motion.span
                style={{ opacity: seeSeasonOpacity, y: seeSeasonY }}
                className="inline-block"
              >
                SEE THE SEASON
              </motion.span>
            </div>

            {/* Second line: BEFORE -> it -> HAPPENS? */}
            <div className="flex flex-wrap items-baseline justify-center gap-x-3 sm:gap-x-4">
              <motion.span
                style={{ opacity: beforeOpacity, y: beforeY }}
                className="inline-block"
              >
                BEFORE
              </motion.span>
              <motion.span
                style={{ opacity: itOpacity, y: itY }}
                className="italic font-light inline-block"
              >
                it
              </motion.span>
              <motion.span
                style={{ opacity: happensOpacity, y: happensY }}
                className="inline-block"
              >
                HAPPENS?
              </motion.span>
            </div>
          </h2>

          {/* Subhead: rises and locks in after the headline */}
          <motion.p
            style={{ opacity: subtextOpacity, y: subtextY }}
            className="max-w-xl sm:max-w-2xl text-base sm:text-lg font-light text-white/80 leading-relaxed font-sans mb-10"
          >
            Deploy ihingaAI across your cooperative or district in days — and give every farmer the warning they need before conditions turn.
          </motion.p>

          {/* Action Buttons: rise in and remain fully interactable */}
          <motion.div
            style={{ opacity: buttonsOpacity, y: buttonsY }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            {/* Primary Button */}
            <button
              onClick={onStartTrial}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold transition-transform hover:scale-105 active:scale-95 text-sm sm:text-base cursor-pointer shadow-lg shadow-white/5"
            >
              <span>Sign up</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Secondary Button */}
            <button
              onClick={onSignIn}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 border border-white/40 backdrop-blur-sm px-8 py-4 rounded-full font-semibold transition-all hover:bg-white/10 active:scale-95 text-sm sm:text-base text-white cursor-pointer"
            >
              <div className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-full">
                <LogIn className="w-3 h-3 text-white" />
              </div>
              <span>Sign in</span>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
