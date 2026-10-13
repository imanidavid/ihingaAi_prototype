import { Quote } from 'lucide-react';
import { motion } from 'motion/react';
import bgImage from '../../assets/images/misty_plantation_dawn_1786792077064.jpg';

interface TestimonialItem {
  id: string;
  quote: string;
  role: string;
  organization: string;
  district: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: '1',
    quote:
      'We went from guessing at rainfall to knowing our sector’s risk level before we planted.',
    role: 'Cooperative Leader',
    organization: 'Agricultural Cooperative',
    district: 'Nyagatare District',
  },
  {
    id: '2',
    quote:
      'The SMS alerts cut our response time from days to hours. Farmers act before the damage is done.',
    role: 'Agricultural Officer',
    organization: 'Sector Agronomy Office',
    district: 'Musanze District',
  },
  {
    id: '3',
    quote:
      'District risk reporting that used to take our team a week now updates itself.',
    role: 'Program Coordinator',
    organization: 'Agricultural Development NGO',
    district: 'Eastern Province',
  },
  {
    id: '4',
    quote:
      'Having seasonal risk forecasts delivered directly in Kinyarwanda transformed how our member farmers schedule sowing.',
    role: 'Agronomy Manager',
    organization: 'Coffee Growers Union',
    district: 'Southern Province',
  },
];

export function TestimonialsScreen() {
  // Quadruple items to ensure seamless infinite looping without any visual gaps
  const marqueeItems = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section
      id="testimonials-screen"
      className="relative z-10 w-full py-24 sm:py-32 bg-[#05090f] font-sans selection:bg-white/20 selection:text-white transition-colors overflow-hidden border-t border-white/5"
    >
      {/* Background Atmosphere matching Hero with smooth transitions */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-0">
        <img
          src={bgImage}
          alt="Testimonials Atmosphere Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-60 scale-105"
        />
        {/* Soft dark overlay and top/bottom gradient transitions */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05090f] via-black/40 to-black/50" />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#05090f] via-[#05090f]/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#05090f] via-[#05090f]/80 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] sm:w-[1100px] h-[400px] bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-full blur-[140px] opacity-70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 mb-14 sm:mb-16">
        {/* Header */}
        <div className="max-w-3xl">
          <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-white/70 font-semibold mb-3 block">
            ILLUSTRATIVE · EXAMPLE FEEDBACK, NOT REAL USERS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-white tracking-tight leading-[1.12]">
            What we hope leaders will say
          </h2>
        </div>
      </div>

      {/* Infinite Looping Track (Moving Left to Right Uninterrupted) */}
      <div className="relative w-full overflow-hidden py-4 pointer-events-auto">
        {/* Left and Right Gradient Fade Overlays for seamless edge blending */}
        <div className="absolute top-0 left-0 bottom-0 w-16 sm:w-32 md:w-48 bg-gradient-to-r from-[#05090f] via-[#05090f]/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-16 sm:w-32 md:w-48 bg-gradient-to-l from-[#05090f] via-[#05090f]/80 to-transparent z-20 pointer-events-none" />

        <motion.div
          className="flex items-stretch gap-6 sm:gap-8 w-max"
          animate={{
            x: ['-50%', '0%'],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 40,
              ease: 'linear',
            },
          }}
          style={{ willChange: 'transform' }}
        >
          {marqueeItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="w-[340px] sm:w-[400px] md:w-[440px] flex-shrink-0 group relative bg-[#0b121c]/80 backdrop-blur-md rounded-2xl md:rounded-3xl p-8 sm:p-9 border border-white/10 shadow-xl hover:border-white/30 hover:bg-[#0f1826]/90 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Top Quote Icon Badge */}
              <div className="mb-6">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:scale-105 group-hover:bg-white/20 transition-all">
                  <Quote className="w-5 h-5 fill-white/20" />
                </div>
              </div>

              {/* Quote Body */}
              <p className="text-base sm:text-lg text-white/90 font-light leading-relaxed mb-8 flex-1 italic font-sans">
                &ldquo;{item.quote}&rdquo;
              </p>

              {/* Attribution Footer */}
              <div className="pt-5 border-t border-white/10 flex flex-col space-y-1.5">
                <span className="text-sm font-semibold text-white group-hover:text-white/90 transition-colors font-sans">
                  {item.role}
                </span>
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/50 font-mono">
                  <span>{item.organization}</span>
                  <span>•</span>
                  <span>{item.district}</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
