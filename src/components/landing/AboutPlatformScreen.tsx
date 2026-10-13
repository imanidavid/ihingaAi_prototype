import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, MotionValue } from 'motion/react';
import { Activity, Bot, ShieldCheck, Sparkles, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import bgImage from '../../assets/images/rwanda_terraced_hills_1786792050652.jpg';

interface AboutPlatformScreenProps {
  onContactClick?: () => void;
  onStayInformedClick?: () => void;
}

interface HighlightCardItem {
  id: string;
  num: string;
  tag: string;
  icon: typeof Activity;
  title: string;
  description: string;
}

const HIGHLIGHT_CARDS: HighlightCardItem[] = [
  {
    id: 'card-1',
    num: '01',
    tag: 'SURFACE & CELL RESOLUTION',
    icon: Activity,
    title: 'National-to-cell model',
    description:
      'Every microclimate mapped into high-resolution forecasts — from national level down to cell level with hyper-local precision.',
  },
  {
    id: 'card-2',
    num: '02',
    tag: 'DEEP LEARNING ENGINE',
    icon: Bot,
    title: 'AI-first forecasting',
    description:
      'Deep predictive models trained on Rwandan historical weather data, rainfall patterns, satellite NDVI vegetation indices, and soil moisture.',
  },
  {
    id: 'card-3',
    num: '03',
    tag: 'ZERO CONNECTIVITY BARRIERS',
    icon: ShieldCheck,
    title: 'Multi-channel alerts',
    description:
      'Instant automated SMS in Kinyarwanda, USSD menus, and automated voice alerts designed for feature phones in rural areas.',
  },
  {
    id: 'card-4',
    num: '04',
    tag: 'SMALLHOLDER ACCESSIBLE',
    icon: Sparkles,
    title: 'Built to scale down',
    description:
      'Enterprise-grade climate intelligence priced and accessible for individual smallholder farmers and district cooperatives.',
  },
];

interface StackedCardProps {
  key?: string;
  card: HighlightCardItem;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  activeIndex: number;
  onCardClick?: () => void;
}

function StackedCard({
  card,
  index,
  total,
  scrollYProgress,
  activeIndex,
  onCardClick,
}: StackedCardProps) {
  const Icon = card.icon;
  const isLast = index === total - 1;

  // Step calculations based on 4 cards
  // Card 0 active: 0.00 -> 0.28
  // Card 1 active: 0.28 -> 0.54
  // Card 2 active: 0.54 -> 0.80
  // Card 3 active: 0.80 -> 1.00 (and STOPS/REMAINS fully visible)
  const ranges = [
    { start: 0.0, exitStart: 0.2, end: 0.28 },
    { start: 0.28, exitStart: 0.46, end: 0.54 },
    { start: 0.54, exitStart: 0.72, end: 0.8 },
    { start: 0.8, exitStart: 1.0, end: 1.0 },
  ];

  const currentRange = ranges[index];

  // Calculate transforms for non-last cards vs last card
  let yTransform: MotionValue<number>;
  let scaleTransform: MotionValue<number>;
  let rotateTransform: MotionValue<number>;

  if (isLast) {
    // The last card smoothly rises to the front and STAYS on top and fully visible
    yTransform = useTransform(
      scrollYProgress,
      [0, currentRange.start - 0.15, currentRange.start, 1.0],
      [36, 20, 0, 0]
    );
    scaleTransform = useTransform(
      scrollYProgress,
      [0, currentRange.start - 0.15, currentRange.start, 1.0],
      [0.9, 0.94, 1.0, 1.0]
    );
    rotateTransform = useTransform(scrollYProgress, [0, 1.0], [0, 0]);
  } else {
    // Regular cards rise, become active, then slide up/behind when scrolling past
    yTransform = useTransform(
      scrollYProgress,
      [
        Math.max(0, currentRange.start - 0.15),
        currentRange.start,
        currentRange.exitStart,
        currentRange.end,
        Math.min(1, currentRange.end + 0.1),
      ],
      [
        index === 0 ? 0 : 20, // Initial position
        0, // Active top
        0, // Hold active
        -70, // Slide up & behind next card
        30, // Settle back into stack
      ]
    );

    scaleTransform = useTransform(
      scrollYProgress,
      [
        Math.max(0, currentRange.start - 0.15),
        currentRange.start,
        currentRange.exitStart,
        currentRange.end,
        Math.min(1, currentRange.end + 0.1),
      ],
      [
        index === 0 ? 1.0 : 0.94,
        1.0,
        1.0,
        0.92,
        0.88,
      ]
    );

    rotateTransform = useTransform(
      scrollYProgress,
      [currentRange.exitStart, currentRange.end],
      [0, index % 2 === 0 ? 2.5 : -2.5]
    );
  }

  // Calculate dynamic zIndex so active card is always on top
  let zIndex = 10;
  if (activeIndex === index) {
    zIndex = 50;
  } else if (activeIndex < index) {
    zIndex = 40 - (index - activeIndex);
  } else {
    // Passed cards sit in background
    zIndex = 10 + index;
  }

  const isCurrentActive = activeIndex === index;

  return (
    <motion.div
      style={{
        y: yTransform,
        scale: scaleTransform,
        rotate: rotateTransform,
        zIndex,
        transformOrigin: 'top center',
      }}
      onClick={onCardClick}
      className={`absolute inset-x-0 top-0 bg-[#0c1624] rounded-2xl md:rounded-3xl p-7 sm:p-8 border shadow-[0_20px_50px_rgba(0,0,0,0.85)] transition-colors duration-300 select-none flex flex-col justify-between h-[320px] sm:h-[340px] md:h-[360px] ${
        isCurrentActive
          ? 'border-white/40 cursor-pointer shadow-[0_25px_60px_rgba(255,255,255,0.06)]'
          : 'border-white/10 pointer-events-none'
      }`}
    >
      {/* Top Bar: Icon + Tag & Number */}
      <div className="flex items-center justify-between gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
          <Icon className="w-6 h-6 stroke-[1.8]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/90 font-semibold">
            {card.tag}
          </span>
          <span className="text-xs font-mono text-white/50 font-bold">
            {card.num}
          </span>
        </div>
      </div>

      {/* Main Content (Title & Description) */}
      <div className="space-y-3 my-auto py-2">
        <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight font-sans">
          {card.title}
        </h3>
        <p className="text-sm text-white/75 leading-relaxed font-sans font-light">
          {card.description}
        </p>
      </div>

      {/* Bottom Footer Details */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/40">
        <span className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isCurrentActive ? 'bg-white animate-pulse' : 'bg-white/20'
            }`}
          />
          <span className="text-white/60">
            {isCurrentActive ? 'Active Overview' : `Feature ${card.num}`}
          </span>
        </span>
        <span className="text-white/80 font-semibold text-[11px]">
          {index + 1} / {total}
        </span>
      </div>
    </motion.div>
  );
}

export function AboutPlatformScreen({}: AboutPlatformScreenProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Track the active index as the user scrolls
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const total = HIGHLIGHT_CARDS.length;
    if (latest >= 0.8) {
      setActiveIndex(3);
    } else if (latest >= 0.54) {
      setActiveIndex(2);
    } else if (latest >= 0.28) {
      setActiveIndex(1);
    } else {
      setActiveIndex(0);
    }
  });

  // Smooth scroll helper when user clicks a step indicator
  const scrollToCard = (index: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const containerTop = rect.top + scrollTop;
    const offsets = [0, 0.35, 0.62, 0.95];
    const targetScroll =
      containerTop + offsets[index] * (container.offsetHeight - window.innerHeight);

    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    });
  };

  const handleNext = () => {
    if (activeIndex < HIGHLIGHT_CARDS.length - 1) {
      scrollToCard(activeIndex + 1);
    } else {
      scrollToCard(0);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      scrollToCard(activeIndex - 1);
    }
  };

  return (
    <section
      id="platform-overview-screen"
      ref={containerRef}
      className="relative z-20 w-full bg-[#05090f] text-white font-sans selection:bg-white/20 selection:text-white transition-colors border-t border-white/5 h-[280vh]"
    >
      {/* Sticky Full-Viewport Stage */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        {/* Background Image Container with Smooth Top & Bottom Transitions */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-0">
          <img
            src={bgImage}
            alt="Rwandan Agricultural Terraced Hills"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-60 scale-105"
          />
          {/* Overlays matching Hero styling for high contrast & seamless blending */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05090f] via-black/40 to-black/50" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#05090f] via-[#05090f]/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#05090f] via-[#05090f]/80 to-transparent" />
          <div className="absolute top-1/3 right-10 w-[600px] h-[500px] bg-gradient-to-l from-white/5 via-white/10 to-transparent rounded-full blur-[140px] opacity-70" />
          <div className="absolute bottom-10 left-1/4 w-[500px] h-[350px] bg-white/5 rounded-full blur-[130px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left Column: Pill + Main Headline + Descriptive Paragraphs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Eyebrow Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] border border-white/10 text-white/80 text-xs font-mono tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Why ihingaAI
              </div>

              {/* Main Headline */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-white tracking-tight leading-[1.12] font-sans">
                Empowering Farmers Through Climate Intelligence
              </h2>

              {/* Descriptive Paragraphs */}
              <div className="space-y-4 text-base sm:text-lg font-light text-white/80 leading-relaxed font-sans max-w-2xl">
                <p>
                  We provide a climate risk prediction platform that helps farmers monitor environmental conditions, analyze climate patterns, and receive early warnings to protect crops and improve agricultural productivity. Our goal is to support resilient and sustainable farming through smart climate technology.
                </p>
                <p className="text-white/70">
                  ihingaAI was built from the ground up as an integrated climate forecasting platform — delivering real-time risk alerts from national to cell level so agricultural officers, cooperatives, and smallholders can act before extreme weather impacts their harvest.
                </p>
              </div>

              {/* Vertical Scroll Hint Pill */}
              <div className="inline-flex items-center gap-2 text-xs font-mono text-white/80 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/15 shadow-inner">
                <Layers className="w-3.5 h-3.5 text-white" />
                <span>Scroll down to slide behind • Scroll up to reveal</span>
              </div>
            </div>

            {/* Right Column: 3D Scroll-Driven Vertical Stacked Deck + Sub-Card Indicators */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end">
              {/* Cards Deck Container */}
              <div className="relative w-full max-w-[430px] h-[320px] sm:h-[340px] md:h-[360px]">
                {HIGHLIGHT_CARDS.map((card, index) => (
                  <StackedCard
                    key={card.id}
                    card={card}
                    index={index}
                    total={HIGHLIGHT_CARDS.length}
                    scrollYProgress={scrollYProgress}
                    activeIndex={activeIndex}
                    onCardClick={handleNext}
                  />
                ))}
              </div>

              {/* Indicator Located Directly Below Cards */}
              <div className="w-full max-w-[430px] mt-6 pt-4 flex items-center justify-between px-2">
                {/* Previous Button */}
                <button
                  onClick={handlePrev}
                  disabled={activeIndex === 0}
                  aria-label="Previous card"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Center Pill Indicators matching user reference design */}
                <div className="flex items-center gap-2">
                  {HIGHLIGHT_CARDS.map((card, idx) => {
                    const isActive = activeIndex === idx;
                    return (
                      <button
                        key={card.id}
                        onClick={() => scrollToCard(idx)}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          isActive
                            ? 'w-9 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]'
                            : 'w-2.5 bg-white/25 hover:bg-white/45'
                        }`}
                        aria-label={`Go to card ${idx + 1}: ${card.title}`}
                      />
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNext}
                  disabled={activeIndex === HIGHLIGHT_CARDS.length - 1}
                  aria-label="Next card"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
