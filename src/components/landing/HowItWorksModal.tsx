import { X, Satellite, Cpu, ShieldCheck, Smartphone, CheckCircle2 } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  if (!isOpen) return null;

  const steps = [
    {
      step: '01',
      title: 'Multispectral Satellite & IoT Ingestion',
      icon: Satellite,
      desc: 'Synthetic Aperture Radar (SAR) and Sentinel-2 optical data continuously scan Rwandan agricultural terrain down to 10m² resolution, paired with local micro-weather telemetry stations.',
      badge: 'Earth Observation',
    },
    {
      step: '02',
      title: 'Neural Climate & Crop Inference',
      icon: Cpu,
      desc: 'Our proprietary deep neural models predict micro-droughts, excess runoff on steep terraced hills, and pathogen vectors 21 days in advance of visual symptoms.',
      badge: 'Edge AI Analysis',
    },
    {
      step: '03',
      title: 'Automated Parametric Micro-Insurance',
      icon: ShieldCheck,
      desc: 'Smart contracts remove traditional bureaucratic claims. When verified rainfall or temperature thresholds are breached, automatic mobile money payouts trigger immediately.',
      badge: 'Zero-Claim Payouts',
    },
    {
      step: '04',
      title: 'Direct Farmer USSD & Co-op Dispatch',
      icon: Smartphone,
      desc: 'Actionable agronomic advisories are routed via lightweight USSD/SMS in Kinyarwanda to smallholder farmers, and mapped to agricultural cooperative leadership.',
      badge: 'Offline-First Delivery',
    },
  ];

  return (
    <div
      id="how-it-works-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        id="how-it-works-container"
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-neutral-950 border border-white/15 rounded-2xl shadow-2xl text-white p-6 sm:p-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-6 border-b border-white/10">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-white/70">
              System Architecture & Methodology
            </span>
            <h3 className="text-2xl sm:text-3xl font-instrument-serif text-white mt-1">
              How <span className="italic">Ihinga AI</span> Secures Rwandan Agriculture
            </h3>
          </div>
          <button
            id="close-how-it-works-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-white/40">{item.step}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                      {item.badge}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h4 className="font-semibold text-sm text-white">{item.title}</h4>
                  </div>
                  <p className="text-xs text-white/65 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <CheckCircle2 className="w-4 h-4 text-white/80 flex-shrink-0" />
            <span>Tested across 30 Rwandan districts in partnership with agro-cooperatives.</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto text-xs bg-white text-black px-6 py-2.5 rounded-full font-semibold hover:bg-neutral-200 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
