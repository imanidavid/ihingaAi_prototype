import React, { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bell,
  ChevronDown,
  CloudRain,
  Cpu,
  Leaf,
  MessageSquareText,
  ShieldCheck,
  Sprout,
  Users,
  UserCog,
} from 'lucide-react';
import { heroImg, MUSANZE_RECORD } from '../data/musanzeData';
import { CARD_CLASS, IconCircle, PRIMARY_BUTTON, SECONDARY_BUTTON } from './coop/CoopUi';

interface LandingViewProps {
  /** Both go to our sign-in screen ("Create account" opens it on sign-up). */
  onSignIn: () => void;
  onCreateAccount: () => void;
}

const STEPS = [
  {
    icon: CloudRain,
    title: 'Data comes in',
    text: 'Weather station readings, satellite rain and crop greenness, and crop calendars. Simulated in this prototype.',
  },
  {
    icon: Cpu,
    title: 'The model finds the risk',
    text: `It forecasts rain and temperature for each of Musanze's ${MUSANZE_RECORD.allSectors.length} sectors and checks them against the warning rules.`,
  },
  {
    icon: Bell,
    title: 'The officer warns',
    text: 'The agricultural officer issues a warning with the level, the sectors and plain crop advice.',
  },
  {
    icon: MessageSquareText,
    title: 'Farmers are told',
    text: 'By SMS, voice call or the app, in Kinyarwanda or English. No smartphone needed.',
  },
  {
    icon: Leaf,
    title: 'Farmers report back',
    text: 'What farmers see in their fields is checked against the forecast to make it better.',
  },
];

const ROLES = [
  { icon: Sprout, title: 'Farmers', text: 'Your sector’s risk, warnings and crop advice, on any phone.' },
  { icon: Users, title: 'Cooperative leaders', text: 'See which members need a reminder and pass on the officer’s advice.' },
  { icon: ShieldCheck, title: 'Agricultural officers', text: 'Set the warning rules, issue warnings and check farmers’ reports.' },
  { icon: BarChart3, title: 'Researchers', text: 'See how often the forecast and warnings were right, and download the data.' },
  { icon: UserCog, title: 'Administrators', text: 'Approve accounts, manage access and keep the data coming in.' },
];

const FAQ = [
  {
    q: 'Who is IHINGA AI for?',
    a: 'Smallholder farmers in Musanze District, their cooperatives, agricultural officers, researchers and the people who run the system.',
  },
  {
    q: 'Do I need a smartphone or internet?',
    a: 'No. Warnings and advice reach farmers by SMS and voice call. The app is there for those who want more detail.',
  },
  { q: 'Which languages?', a: 'Kinyarwanda and English, in the app and in every message.' },
  {
    q: 'Where does the data come from?',
    a: 'The forecast model is designed to learn from weather station records, satellite rain and crop greenness, and crop calendars. In this prototype all data is simulated. Naming a data source does not mean its owner endorses IHINGA AI.',
  },
  {
    q: 'Is IHINGA AI live?',
    a: 'Not yet. This is a final-year project prototype with simulated data, built to show how the system would work.',
  },
];

/** First screen before sign-in: what IHINGA AI does, who it is for, and the way in. */
export const LandingView: React.FC<LandingViewProps> = ({ onSignIn, onCreateAccount }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#F4F6EF] text-[#17271D]">
      {/* Top bar */}
      <header className="max-w-[1180px] mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-full bg-[#1F4A34] flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" strokeWidth={1.75} />
          </span>
          <span className="text-[16px] font-semibold">IHINGA AI</span>
        </div>
        <nav className="flex items-center gap-2">
          <a href="#how-it-works" className="hidden md:inline px-3 py-2 text-[13px] text-[#5B665E] hover:text-[#17271D]">
            How it works
          </a>
          <a href="#who-its-for" className="hidden md:inline px-3 py-2 text-[13px] text-[#5B665E] hover:text-[#17271D]">
            Who it’s for
          </a>
          <a href="#questions" className="hidden md:inline px-3 py-2 text-[13px] text-[#5B665E] hover:text-[#17271D]">
            Questions
          </a>
          <button type="button" onClick={onSignIn} className={SECONDARY_BUTTON}>
            Sign in
          </button>
          <button type="button" onClick={onCreateAccount} className={`${PRIMARY_BUTTON} hidden sm:inline-flex`}>
            Create account
          </button>
        </nav>
      </header>

      <main className="max-w-[1180px] mx-auto px-4 md:px-6 pb-16 space-y-16">
        {/* Hero — the one dark element on this screen */}
        <section className="relative w-full rounded-[16px] overflow-hidden bg-gradient-to-r from-[#1F4A34] to-[#2C6343] shadow-[0_2px_12px_rgba(31,74,52,0.08)]">
          {/* Photo fades into the green from its left edge (mask, so no seam) */}
          <div
            className="absolute right-0 top-0 bottom-0 w-full md:w-[50%] pointer-events-none select-none opacity-40 md:opacity-100"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 55%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 55%)',
            }}
          >
            <img src={heroImg} alt="Terraced fields in Musanze" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 p-6 md:p-10 max-w-2xl text-white">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[12px] font-medium">
              <Sprout className="w-3.5 h-3.5 text-[#E4ECDB]" strokeWidth={1.5} />
              Musanze District · prototype with simulated data
            </span>
            <h1 className="mt-4 text-[28px] font-normal leading-tight">
              Know the weather risk before it reaches your farm.
            </h1>
            <p className="mt-3 text-[14px] text-[#E4ECDB] leading-relaxed max-w-xl">
              IHINGA AI forecasts heavy rain, dry spells and crop disease risk for each sector, and warns farmers by SMS
              and voice in Kinyarwanda, with simple advice on what to do.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={onSignIn}
                className="px-5 h-11 rounded-full bg-white text-[#17271D] text-[13px] font-semibold hover:bg-[#F4F6EF] cursor-pointer flex items-center gap-1.5"
              >
                Sign in
                <ArrowRight className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={onCreateAccount}
                className="px-5 h-11 rounded-full border border-white/50 text-white text-[13px] font-medium hover:bg-white/10 cursor-pointer"
              >
                Create account
              </button>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="space-y-5 scroll-mt-6">
          <div>
            <h2 className="text-[22px] font-semibold">From risk found to farmer protected</h2>
            <p className="text-[13px] text-[#5B665E] mt-1">Five steps, every time the forecast updates.</p>
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className={`${CARD_CLASS} p-5 space-y-3`}>
                <div className="flex items-center justify-between">
                  <IconCircle icon={s.icon} />
                  <span className="text-[12px] text-[#5B665E] tabular-nums">Step {i + 1}</span>
                </div>
                <h3 className="text-[14px] font-semibold">{s.title}</h3>
                <p className="text-[12.5px] text-[#5B665E] leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Who it's for */}
        <section id="who-its-for" className="space-y-5 scroll-mt-6">
          <div>
            <h2 className="text-[22px] font-semibold">One system, one place for everyone</h2>
            <p className="text-[13px] text-[#5B665E] mt-1">Each person signs in and sees what they need.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {ROLES.map((r) => (
              <div key={r.title} className={`${CARD_CLASS} p-5 space-y-3`}>
                <IconCircle icon={r.icon} />
                <h3 className="text-[14px] font-semibold">{r.title}</h3>
                <p className="text-[12.5px] text-[#5B665E] leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Questions */}
        <section id="questions" className="space-y-5 scroll-mt-6">
          <h2 className="text-[22px] font-semibold">Questions</h2>
          <div className={`${CARD_CLASS} divide-y divide-[rgba(31,74,52,0.06)]`}>
            {FAQ.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left cursor-pointer"
                  >
                    <span className="text-[14px] font-semibold">{f.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#1F4A34] transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={1.75} />
                  </button>
                  {open && <p className="px-5 pb-4 -mt-1 text-[13px] text-[#5B665E] leading-relaxed">{f.a}</p>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Final call to action */}
        <section className={`${CARD_CLASS} p-6 md:p-8 flex flex-wrap items-center justify-between gap-4`}>
          <div>
            <h2 className="text-[20px] font-semibold">See the risk before the season turns</h2>
            <p className="text-[13px] text-[#5B665E] mt-1">Sign in with your phone number or email, or create an account.</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button type="button" onClick={onCreateAccount} className={SECONDARY_BUTTON}>
              Create account
            </button>
            <button type="button" onClick={onSignIn} className={PRIMARY_BUTTON}>
              Sign in
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-[rgba(31,74,52,0.10)]">
        <div className="max-w-[1180px] mx-auto px-4 md:px-6 py-6 flex flex-wrap items-center justify-between gap-3 text-[12px] text-[#5B665E]">
          <span>IHINGA AI · climate risk prediction for smallholder farmers in Musanze District</span>
          <span>Final-year project prototype · all data simulated · not affiliated with any government body</span>
        </div>
      </footer>
    </div>
  );
};
