import React, { useState, useEffect, useRef } from 'react';
import bgImage from '../../assets/images/aerial_farmland_dusk_1786792063738.jpg';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

const FEATURES: FeatureItem[] = [
  {
    id: 'multi-source-data-fusion',
    title: 'Multi-Source Data Fusion',
    description:
      'Aggregate weather, satellite, soil, and crop data from several providers into a unified intelligence layer',
    image:
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'real-time-risk-scoring',
    title: 'Real-Time Risk Scoring',
    description:
      'AI models continuously evaluate climate threats and assign risk levels from low to critical',
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'geospatial-precision',
    title: 'Geospatial Precision',
    description:
      'District-to-cell level targeting ensures alerts reach the right farmers at the right time',
    image:
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'predictive-analytics',
    title: 'Predictive Analytics',
    description:
      'Forecast extreme weather up to 10 days ahead, with a likely range',
    image:
      'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'multi-channel-distribution',
    title: 'Multi-Channel Distribution',
    description:
      'Deliver alerts via SMS, voice calls, mobile app, and web dashboard simultaneously',
    image:
      'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'community-validation',
    title: 'Community Validation',
    description:
      'Ground-level farmer reports refine prediction accuracy through feedback loops.',
    image:
      'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'decision-automation',
    title: 'Decision Automation',
    description:
      'Generate actionable planting and harvest recommendations based on risk thresholds.',
    image:
      'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1200&q=80',
  },
];

const BG_IMAGE_URL =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260709_082449_46df5cc4-ad98-4541-9236-a2659c1478a4.png&w=1920&q=85';

function CardLogoSvg() {
  return (
    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center p-2 text-white">
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 flex-shrink-0"
        aria-hidden="true"
      >
        <rect
          x="2"
          y="2"
          width="16"
          height="16"
          rx="4"
          fill="#ffffff"
        />
        <rect
          x="22"
          y="2"
          width="16"
          height="16"
          rx="4"
          fill="rgba(255,255,255,0.7)"
        />
        <rect
          x="2"
          y="22"
          width="16"
          height="16"
          rx="4"
          fill="rgba(255,255,255,0.7)"
        />
        <rect
          x="22"
          y="22"
          width="16"
          height="16"
          rx="4"
          fill="rgba(255,255,255,0.3)"
        />
      </svg>
    </div>
  );
}

export function CoreCapabilitiesSection() {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // 1. Reveal observer (threshold: 0.15)
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setRevealedIndices((prev) => {
                if (prev.has(index)) return prev;
                const next = new Set(prev);
                next.add(index);
                return next;
              });
            }
          }
        });
      },
      {
        threshold: 0.15,
      }
    );

    // 2. Active detection observer (rootMargin: "-20% 0px -20% 0px")
    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setActiveIdx(index);
            }
          }
        });
      },
      {
        rootMargin: '-20% 0px -20% 0px',
        threshold: 0.2,
      }
    );

    cardRefs.current.forEach((card) => {
      if (card) {
        revealObserver.observe(card);
        activeObserver.observe(card);
      }
    });

    return () => {
      revealObserver.disconnect();
      activeObserver.disconnect();
    };
  }, []);

  const handleNavClick = (index: number) => {
    setActiveIdx(index);
    const target = cardRefs.current[index];
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  return (
    <section
      id="core-capabilities-section"
      className="relative z-10 w-full px-5 md:px-10 lg:px-16 py-20 md:py-36 lg:py-44 font-sans selection:bg-white/20 selection:text-white bg-[#05090f] border-t border-white/5"
    >
      {/* Scoped Background Image Container with Smooth Top & Bottom Transitions */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <img
          src={bgImage}
          alt="Platform Intelligence Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-60 scale-105"
        />
        {/* Dark overlay and soft gradients to ensure solid contrast and seamless blending with #05090f */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05090f] via-black/40 to-black/50" />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#05090f] via-[#05090f]/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#05090f] via-[#05090f]/80 to-transparent" />
      </div>

      {/* Main Grid Layout */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[380px_1fr] xl:grid-cols-[440px_1fr] gap-12 lg:gap-20 xl:gap-36 items-start">
        {/* Left Column (Sticky Navigation pinned on Desktop while cards scroll) */}
        <div className="lg:sticky lg:top-0 lg:h-screen lg:flex lg:flex-col lg:justify-between lg:py-16 xl:py-24 z-20">
          {/* Heading */}
          <div>
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-white/70 font-semibold mb-3 block">
              PLATFORM INTELLIGENCE
            </span>
            <h2 className="text-white text-3xl sm:text-4xl lg:text-[46px] leading-[1.12] font-serif tracking-tight">
              Core Capabilities
            </h2>
          </div>

          {/* Feature Nav Buttons (hidden below lg) */}
          <nav
            aria-label="Core capabilities navigation"
            className="hidden lg:flex lg:flex-col space-y-2.5 my-auto py-6"
          >
            {FEATURES.map((item, index) => {
              const isActive = activeIdx === index;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(index)}
                  className={`text-left px-5 py-3.5 rounded-2xl text-sm transition-all duration-300 backdrop-blur-sm cursor-pointer border ${
                    isActive
                      ? 'bg-white text-black font-semibold border-white shadow-md'
                      : 'bg-white/[0.04] text-white/50 hover:text-white/80 hover:bg-white/[0.08] border-transparent'
                  }`}
                >
                  {item.title}
                </button>
              );
            })}
          </nav>

          {/* Bottom CTA (hidden below lg) */}
          <div className="hidden lg:block">
            <p className="text-white/70 text-sm font-light leading-relaxed font-sans">
              No noise. No complicated systems. Just your day, gently sorted.
            </p>
          </div>
        </div>

        {/* Right Column (Scrolling Cards) */}
        <div className="flex flex-col gap-12 sm:gap-16 md:gap-20">
          {FEATURES.map((item, index) => {
            const isRevealed = revealedIndices.has(index);

            return (
              <div
                key={item.id}
                data-index={index}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className={`bg-[#0b121c]/80 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-6 border border-white/10 shadow-xl transition-all duration-700 ease-out transform hover:border-white/30 ${
                  isRevealed
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-16'
                }`}
              >
                {/* SVG Logo */}
                <div>
                  <CardLogoSvg />
                </div>

                {/* Card Title */}
                <h3 className="text-white text-xl md:text-2xl font-semibold tracking-tight font-sans">
                  {item.title}
                </h3>

                {/* Aspect Image */}
                <div className="aspect-video rounded-xl md:rounded-2xl overflow-hidden bg-black/50 w-full relative border border-white/10 shadow-inner group">
                  <img
                    src={item.image}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Description */}
                <p className="text-white/70 font-normal text-sm sm:text-base leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
