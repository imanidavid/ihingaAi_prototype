import { X, Sparkles, ShieldCheck, Users, LineChart, ArrowRight } from 'lucide-react';

interface InfoModalProps {
  section: string | null;
  onClose: () => void;
  onOpenPortal: () => void;
}

export function InfoModal({ section, onClose, onOpenPortal }: InfoModalProps) {
  if (!section) return null;

  const contentMap: Record<
    string,
    {
      title: string;
      subtitle: string;
      icon: typeof Sparkles;
      stats: { label: string; value: string }[];
      body: string[];
      highlights: string[];
    }
  > = {
    Intelligence: {
      title: 'Multimodal Agro-Intelligence',
      subtitle: 'Hyperlocal micro-climate predictions tailored for Rwanda’s steep terrain topography',
      icon: Sparkles,
      stats: [
        { label: 'Forecast Accuracy', value: '94.8%' },
        { label: 'Spatial Resolution', value: '10m²' },
        { label: 'Sensor Ingest Rate', value: '4.2M/day' },
      ],
      body: [
        'Our algorithms combine synthetic aperture radar (SAR), optical Sentinel imagery, and thousands of ground-level LoRaWAN soil moisture probes across Rwandan valleys and volcanic terraces.',
        'We identify early signs of nutrient depletion, excess rainfall runoff, and armyworm migration 3 weeks before visible crop damage occurs.',
      ],
      highlights: [
        'NDVI & NDWI Chlorophyll and Hydration tracking',
        'Terraced slope erosion predictive modeling',
        'Localized rainfall anomaly alerts via SMS/USSD',
      ],
    },
    'Micro-Insurance': {
      title: 'Automated Parametric Insurance',
      subtitle: 'Guaranteed climate security without paperwork, delays, or physical field adjusters',
      icon: ShieldCheck,
      stats: [
        { label: 'Avg Payout Speed', value: '< 2 hours' },
        { label: 'Protected Harvest Value', value: '$18.4M' },
        { label: 'Smallholders Covered', value: '85,000+' },
      ],
      body: [
        'Traditional agricultural insurance fails smallholder farmers due to excessive administrative costs and slow claim settlements.',
        'Ihinga AI deploys smart-contract parametric triggers. When satellite and IoT sensor feeds confirm a drought or excessive rainfall event in a specific cell, mobile money disbursements to farmers occur within 120 minutes.',
      ],
      highlights: [
        'Automated Mobile Money (MoMo) disbursement',
        'Index-based rainfall & temperature triggers',
        'Zero paperwork for smallholder farmers',
      ],
    },
    'Co-operatives': {
      title: 'Empowering Rwandan Co-operatives',
      subtitle: 'Consolidated yield forecasting, supply-chain aggregation, and collective bargaining',
      icon: Users,
      stats: [
        { label: 'Partner Co-ops', value: '312' },
        { label: 'Districts Reached', value: '30 of 30' },
        { label: 'Yield Increase', value: '+32%' },
      ],
      body: [
        'Agricultural co-operatives form the backbone of Rwanda’s food sovereignty. Ihinga AI provides co-op managers with real-time aggregate dashboards.',
        'Track member parcel health, coordinate mechanized planting windows, and pre-sell standardized yield volume directly to international and regional off-takers.',
      ],
      highlights: [
        'District-level yield forecasting dashboard',
        'Bulk input purchasing optimization',
        'Direct exporter and grain-reserve contract linkages',
      ],
    },
    Methodology: {
      title: 'Scientific Foundation & Research',
      subtitle: 'Built upon peer-reviewed agronomic models tailored to East African soil chemistry',
      icon: LineChart,
      stats: [
        { label: 'Soil Data Points', value: '120,000+' },
        { label: 'Academic Partners', value: '6 Inst.' },
        { label: 'Carbon Offset Verified', value: '45,000 t' },
      ],
      body: [
        'Calibrated specifically for the acidic volcanic soils of the Northern Province and the semi-arid lowlands of Eastern Rwanda.',
        'Every prediction is validated with continuous ground-truth soil sensor telemetry and historical meteorological records.',
      ],
      highlights: [
        'Continuous calibration with agricultural extension staff',
        'Zero-trust cryptographic verification of sensor integrity',
        'Open API access for institutional research partners',
      ],
    },
  };

  const current = contentMap[section] || contentMap['Intelligence'];
  const Icon = current.icon;

  return (
    <div
      id="info-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        id="info-modal-container"
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-950 border border-white/15 rounded-2xl shadow-2xl text-white p-6 sm:p-8"
      >
        <div className="flex items-start justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/70">
                Ihinga AI Platform
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold text-white">{current.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-white/70 mt-4 leading-relaxed">{current.subtitle}</p>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 my-5">
          {current.stats.map((s, i) => (
            <div key={i} className="p-3 rounded-lg bg-white/[0.04] border border-white/10 text-center" title="Illustrative figure">
              <div className="text-lg sm:text-xl font-bold font-mono text-white">{s.value}</div>
              <div className="text-[11px] text-white/50 mt-0.5">{s.label} · illustrative</div>
            </div>
          ))}
        </div>

        {/* Body Paragraphs */}
        <div className="space-y-3 text-xs sm:text-sm text-white/80 leading-relaxed">
          {current.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Highlights */}
        <div className="mt-5 p-4 rounded-xl bg-neutral-900 border border-white/10">
          <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
            Core Capabilities
          </div>
          <ul className="space-y-2">
            {current.highlights.map((h, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-white/90">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            Back to Overview
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenPortal();
            }}
            className="text-xs bg-white text-black px-5 py-2.5 rounded-full font-semibold flex items-center gap-1.5 hover:bg-neutral-200 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
          >
            Access in Portal
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
