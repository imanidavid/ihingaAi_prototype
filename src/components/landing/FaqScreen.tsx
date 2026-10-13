import { useState } from 'react';
import { ChevronDown, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import bgImage from '../../assets/images/dramatic_agro_valley_1786792091015.jpg';

interface FaqItem {
  id: string;
  question: string;
  answerPrefix?: string;
  hasContactLink?: boolean;
  answerSuffix?: string;
  answer?: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'who-for',
    question: 'Who is ihingaAI for?',
    answer:
      'Farmers, cooperatives, agricultural offices, and research or government partners — each with tools sized to how they work.',
  },
  {
    id: 'smartphone-needed',
    question: 'Do I need a smartphone or internet access?',
    answer:
      'No. Risk alerts and guidance reach farmers by SMS and voice call. The dashboard is there for cooperatives, districts, and institutions who want deeper analytics.',
  },
  {
    id: 'languages',
    question: 'What language does it run in?',
    answer:
      'Kinyarwanda and English, across every channel — SMS, voice, and dashboard.',
  },
  {
    id: 'data-sources',
    question: 'Where does the data come from?',
    answer:
      'The model is designed to learn from weather station records, satellite rainfall and vegetation feeds, and agricultural records, cross-validated against farmer-reported observations. In this prototype all data is simulated, and naming a data source does not mean its owner endorses ihingaAI.',
  },
  {
    id: 'accuracy',
    question: 'How accurate are the risk predictions?',
    answer:
      'Every alert carries a confidence score, and the system tracks its own historical accuracy so you can see how reliable each prediction type has been over time.',
  },
  {
    id: 'plans-difference',
    question: "What's the difference between the Community and Cooperative plans?",
    answer:
      'Community is built for an individual farmer or small group — SMS alerts and a basic calendar. Cooperative adds group-level coordination: shared dashboards, broadcast alerts, and performance reporting across your members.',
  },
  {
    id: 'pilot-status',
    question: 'Is ihingaAI live, or still in pilot?',
    hasContactLink: true,
    answerPrefix:
      'Not yet. ihingaAI is a final-year project prototype with simulated data, built to show how the system would work. Want to know more? ',
    answerSuffix: '.',
  },
  {
    id: 'switch-plans',
    question: 'Can I switch plans later?',
    answer:
      'Yes. Start on Community or Cooperative and move up as your reach grows — nothing is lost in the switch.',
  },
  {
    id: 'data-security',
    question: 'Is my data secure?',
    answer:
      'Farmer data is encrypted, access is role-based, and every prediction, alert, and export is logged for audit. District and institution plans include additional compliance and access controls.',
  },
];

interface FaqScreenProps {
  onContactClick: () => void;
}

export function FaqScreen({ onContactClick }: FaqScreenProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq-screen"
      className="relative z-10 w-full py-24 sm:py-32 px-6 sm:px-10 md:px-16 lg:px-20 bg-[#05090f] font-sans selection:bg-white/20 selection:text-white transition-colors overflow-hidden border-t border-white/5 flex flex-col items-center justify-center text-center"
    >
      {/* Background Atmosphere matching Hero with smooth transitions */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-0">
        <img
          src={bgImage}
          alt="FAQ Atmosphere Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-60 scale-105"
        />
        {/* Soft dark overlay and top/bottom gradient transitions */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05090f] via-black/40 to-black/50" />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#05090f] via-[#05090f]/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#05090f] via-[#05090f]/80 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] sm:w-[1100px] h-[360px] bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-full blur-[140px] opacity-70" />
      </div>

      <div className="relative z-10 max-w-4xl w-full mx-auto flex flex-col items-center">
        {/* Pill Tag (Eyebrow): "FAQ" */}
        <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-white/70 font-semibold mb-3 block">
          FAQ
        </span>

        {/* Headline: "Questions, answered" */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-white tracking-tight leading-[1.12] mb-12 sm:mb-14">
          Questions, answered
        </h2>

        {/* Compact Single Unified Accordion Container matching reference */}
        <div className="w-full bg-[#0b121c]/80 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/10 overflow-hidden shadow-2xl text-left divide-y divide-white/5">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <div key={faq.id} className="transition-colors hover:bg-white/[0.02]">
                <button
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left px-5 sm:px-7 py-4.5 sm:py-5 flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <span
                    className={`text-sm sm:text-base font-medium tracking-tight font-sans transition-colors ${
                      isOpen ? 'text-white font-semibold' : 'text-white/85 group-hover:text-white'
                    }`}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform duration-200 group-hover:text-white/70 ${
                      isOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-5 sm:px-7 pb-5 pt-0.5 text-xs sm:text-sm text-white/70 leading-relaxed font-normal font-sans">
                        {faq.hasContactLink ? (
                          <p>
                            {faq.answerPrefix}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onContactClick();
                              }}
                              className="text-white hover:text-white/80 font-semibold underline underline-offset-4 inline-flex items-center gap-0.5 cursor-pointer transition-colors"
                            >
                              reach out
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                            {faq.answerSuffix}
                          </p>
                        ) : (
                          <p>{faq.answer}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
