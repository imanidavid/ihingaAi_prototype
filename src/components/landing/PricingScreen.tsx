import { useState, useEffect, useRef } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import bgImage from '../../assets/images/misty_plantation_dawn_1786792077064.jpg';

interface PricingTier {
  id: string;
  name: string;
  badge?: string;
  highlighted?: boolean;
  description: string;
  monthlyPrice: string;
  seasonalPrice: string;
  periodLabel: string;
  features: string[];
  ctaLabel: string;
  ctaAction: 'join' | 'portal' | 'contact';
}

const TIERS: PricingTier[] = [
  {
    id: 'community',
    name: 'Community',
    description: 'For individual farmers and small farmer groups',
    monthlyPrice: 'Free',
    seasonalPrice: 'Free',
    periodLabel: 'forever',
    features: [
      'Up to 5 hectares monitored',
      'SMS risk alerts (Kinyarwanda/English)',
      'Basic crop calendar',
      'Community observation reporting',
    ],
    ctaLabel: 'Get Started Free',
    ctaAction: 'join',
  },
  {
    id: 'cooperative',
    name: 'Cooperative',
    badge: 'Most Popular',
    highlighted: true,
    description: 'For cooperatives coordinating multiple farmers',
    monthlyPrice: '$29',
    seasonalPrice: '$69',
    periodLabel: 'per season (pilot)',
    features: [
      'Up to 500 hectares monitored',
      'Everything in Community',
      'Group dashboard & broadcast alerts',
      'Shared crop calendar',
      'Cooperative performance reporting',
    ],
    ctaLabel: 'Start Free Trial',
    ctaAction: 'join',
  },
  {
    id: 'district',
    name: 'District',
    description: 'For agricultural offices managing multi-sector operations',
    monthlyPrice: '$99',
    seasonalPrice: '$239',
    periodLabel: 'per season (pilot)',
    features: [
      'Up to 5,000 hectares monitored',
      'Everything in Cooperative',
      'District risk map & analytics',
      'Custom report builder',
      'Warning threshold configuration',
      'Priority support',
    ],
    ctaLabel: 'Start Free Trial',
    ctaAction: 'join',
  },
  {
    id: 'institution',
    name: 'Institution',
    badge: 'Custom Scale',
    description: 'For government, NGOs, and research partners',
    monthlyPrice: 'Custom',
    seasonalPrice: 'Custom',
    periodLabel: 'tailored pilot',
    features: [
      'Unlimited hectares monitored',
      'Full platform + data API access',
      'Custom integrations',
      'Dedicated implementation support',
      'On-prem or private cloud option',
    ],
    ctaLabel: 'Contact Us',
    ctaAction: 'contact',
  },
];

interface PricingScreenProps {
  onSelectTier: (action: 'join' | 'portal' | 'contact') => void;
}

export function PricingScreen({ onSelectTier }: PricingScreenProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'seasonal'>('seasonal');
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    // Initial position tracking
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollYRef.current;
      lastScrollYRef.current = currentScrollY;

      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // When the user has scrolled back up above the pricing section, reset so it can replay on next scroll down
      if (rect.top > windowHeight * 0.95) {
        setIsVisible(false);
      }
      // When scrolling DOWN into the pricing section, trigger the 1-by-1 entrance animation
      else if (isScrollingDown && rect.top < windowHeight * 0.85 && rect.bottom > 0) {
        setIsVisible(true);
      }
      // If scrolling up from below, keep cards visible (do not hide or reset in reverse)
      else if (!isScrollingDown && rect.bottom > 0 && rect.top < windowHeight) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section
      id="pricing-screen"
      ref={sectionRef}
      className="relative z-10 w-full py-24 sm:py-32 px-6 sm:px-10 md:px-16 lg:px-20 bg-[#05090f] font-sans selection:bg-white/20 selection:text-white transition-colors overflow-hidden border-t border-white/5"
    >
      {/* Background Atmosphere matching Hero with smooth transitions */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-0">
        <img
          src={bgImage}
          alt="Pricing Atmosphere Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-60 scale-105"
        />
        {/* Overlays for high contrast & seamless blending */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05090f] via-black/40 to-black/50" />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#05090f] via-[#05090f]/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#05090f] via-[#05090f]/80 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] sm:w-[1100px] h-[450px] bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-full blur-[140px] opacity-70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col justify-between h-full">
        {/* Header Block */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-white/70 font-semibold mb-3 block">
            PRICING
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-white tracking-tight leading-[1.12] mb-4">
            Simple plans that scale with your reach
          </h2>
          <p className="text-base sm:text-lg text-white/80 font-light leading-relaxed font-sans">
            Illustrative pricing for the project report. The prototype is free and not for sale. Every plan includes core risk prediction and SMS alerts.
          </p>
        </div>

        {/* Billing Toggle (Monthly / Seasonal) */}
        <div className="flex items-center gap-4 mb-12">
          <div className="p-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1 backdrop-blur-md">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white text-black shadow-md font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('seasonal')}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'seasonal'
                  ? 'bg-white text-black shadow-md font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span>Seasonal</span>
              <span
                className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full font-bold ${
                  billingCycle === 'seasonal'
                    ? 'bg-black/10 text-black'
                    : 'bg-white/10 text-white'
                }`}
              >
                Save 20%
              </span>
            </button>
          </div>
          <span className="text-xs text-white/40 hidden sm:inline font-mono">
            *Illustrative prices only
          </span>
        </div>

        {/* 4-Tier Cards Grid with Sequential 1-by-1 Bottom Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {TIERS.map((tier, idx) => {
            const isHigh = tier.highlighted;
            const price = billingCycle === 'seasonal' ? tier.seasonalPrice : tier.monthlyPrice;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 60 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
                transition={{
                  duration: 0.55,
                  delay: isVisible ? idx * 0.25 : 0,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`relative rounded-2xl md:rounded-3xl p-7 sm:p-8 backdrop-blur-md transition-all duration-300 flex flex-col justify-between ${
                  isHigh
                    ? 'bg-gradient-to-b from-white/[0.08] via-[#0b121c] to-[#0b121c] border-2 border-white/40 shadow-2xl shadow-white/5 hover:border-white/60'
                    : 'bg-[#0b121c]/80 border border-white/10 hover:border-white/30 hover:bg-[#0f1826]/90 shadow-xl'
                }`}
              >
                {/* Most Popular Badge */}
                {tier.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white text-black shadow-md">
                      <Sparkles className="w-3 h-3" />
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div>
                  {/* Tier Title & Description */}
                  <h3 className="text-xl font-semibold text-white mb-2 tracking-tight font-sans">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed mb-6 min-h-[36px] font-sans">
                    {tier.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-t border-b border-white/10">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-sans">
                        {price}
                      </span>
                      {price !== 'Free' && price !== 'Custom' && (
                        <span className="text-xs text-white/50 font-mono">
                          /{billingCycle === 'seasonal' ? 'season' : 'mo'}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-white/70 font-mono block mt-1">
                      {tier.periodLabel}
                    </span>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs text-white/80 leading-relaxed font-sans">
                        <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button matching Hero buttons */}
                <button
                  onClick={() => onSelectTier(tier.ctaAction)}
                  className={`w-full py-3.5 px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm ${
                    isHigh
                      ? 'bg-white hover:bg-neutral-200 text-black shadow-lg shadow-white/5 hover:scale-[1.02] active:scale-[0.98]'
                      : 'border border-white/40 backdrop-blur-sm hover:bg-white/10 text-white active:scale-[0.98]'
                  }`}
                >
                  {tier.ctaLabel}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
