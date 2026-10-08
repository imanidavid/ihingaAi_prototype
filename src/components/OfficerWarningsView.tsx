import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  MapPin,
  ShieldAlert,
  Send,
  Download,
  Plus,
  RotateCcw,
  Check,
  X,
  ChevronRight,
  Sliders,
  History as HistoryIcon,
  MessageSquare,
  PhoneCall,
  Smartphone,
  Eye,
  Edit2,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  OfficerActiveWarning,
  WarningHistoryItem,
  ThresholdRuleItem,
  RiskLevel,
  CropAdvisory,
  SectorRainForecast,
} from '../types';
import { RISK_LEVEL_WEIGHT, computeSectorForecastRisk, FORECAST_RISK_DAYS } from '../data/musanzeData';
import { CropAdviceModal } from './officer/CropAdviceModal';

interface OfficerWarningsViewProps {
  activeWarnings: OfficerActiveWarning[];
  warningHistory: WarningHistoryItem[];
  thresholdRules: ThresholdRuleItem[];
  onIssueWarning: (newWarning: OfficerActiveWarning) => void;
  onEndWarning: (warningId: string) => void;
  onUpdateWarning: (warning: OfficerActiveWarning) => void;
  onSaveRules: (updatedRules: ThresholdRuleItem[]) => void;
  onShowToast: (message: string) => void;
  /** Crop advice written by officers, each linked to a warning. */
  cropAdvisories: CropAdvisory[];
  onSaveAdvice: (advice: CropAdvisory) => void;
  onRemoveAdvice: (adviceId: string) => void;
  authorName: string;
  /** Forecast series, so the thresholds tab can preview which sectors each setting puts at risk. */
  rainForecasts: SectorRainForecast[];
}

const MUSANZE_SECTORS_DATA: { name: string; farmers: number }[] = [
  { name: 'Kinigi', farmers: 620 },
  { name: 'Busogo', farmers: 540 },
  { name: 'Remera', farmers: 480 },
  { name: 'Muhoza', farmers: 410 },
  { name: 'Musanze', farmers: 220 },
  { name: 'Cyuve', farmers: 210 },
  { name: 'Gataraga', farmers: 195 },
  { name: 'Gacaca', farmers: 190 },
  { name: 'Nyange', farmers: 190 },
  { name: 'Muko', farmers: 185 },
  { name: 'Shingiro', farmers: 185 },
  { name: 'Gashaki', farmers: 180 },
  { name: 'Kimonyi', farmers: 175 },
  { name: 'Rwaza', farmers: 175 },
  { name: 'Nkotsi', farmers: 165 },
];

const PREFILL_MESSAGES: Record<string, string> = {
  'Excess rain':
    'Excessive rain forecasted: 48 mm peak expected. Clear drainage furrows, inspect terrace bunds, and postpone spraying until dry.',
  'Dry spell':
    'Dry spell conditions expected for next 7 days. Mulch potato mounds and hold unshaded sowing to preserve soil moisture.',
  Temperature:
    'Temperature anomaly alert: temperatures expected 3°C above seasonal normal. Monitor vulnerable crops for heat stress.',
  'Pest / disease':
    'Late blight threat elevated due to prolonged humidity. Inspect lower leaves for water-soaked dark spots and prepare fungicide.',
};

export const OfficerWarningsView: React.FC<OfficerWarningsViewProps> = ({
  activeWarnings,
  warningHistory,
  thresholdRules,
  onIssueWarning,
  onEndWarning,
  onUpdateWarning,
  onSaveRules,
  onShowToast,
  cropAdvisories,
  onSaveAdvice,
  onRemoveAdvice,
  authorName,
  rainForecasts,
}) => {
  const [adviceFor, setAdviceFor] = useState<OfficerActiveWarning | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'thresholds'>('active');

  // Modals & Drawers state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [editingWarning, setEditingWarning] = useState<OfficerActiveWarning | null>(null);
  const [warningToEnd, setWarningToEnd] = useState<OfficerActiveWarning | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<WarningHistoryItem | null>(null);

  // Issue Warning Modal State
  const [riskType, setRiskType] = useState<string>('Excess rain');
  const [level, setLevel] = useState<RiskLevel>('Watch');
  const [selectedSectors, setSelectedSectors] = useState<string[]>(['Kinigi']);
  const [warningTitle, setWarningTitle] = useState<string>('Excess rain — Kinigi');
  const [timeframe, setTimeframe] = useState<string>('Mon 28/09 14:00 – Wed 30/09 18:00');
  const [messageEn, setMessageEn] = useState<string>(PREFILL_MESSAGES['Excess rain']);
  const [messageRw, setMessageRw] = useState<string>('');
  // Plain language, max 10 words, no technical terms
  const [action1, setAction1] = useState<string>('Clear drainage channels before Tuesday.');
  const [action2, setAction2] = useState<string>('Strengthen bean stakes today.');
  const [action3, setAction3] = useState<string>('Wait to add fertilizer until the soil drains.');
  const [channels, setChannels] = useState<{ sms: boolean; voice: boolean; inApp: boolean }>({
    sms: true,
    voice: true,
    inApp: true,
  });

  // Duplicate warning detection:
  // If a selected sector already has an active warning of the same risk type
  const duplicateWarning = activeWarnings.find((w) => {
    if (w.status !== 'Active') return false;
    const sameRiskType =
      (w.riskType && w.riskType === riskType) ||
      (!w.riskType &&
        ((riskType === 'Excess rain' && w.title.toLowerCase().includes('rain')) ||
          (riskType === 'Pest / disease' && w.title.toLowerCase().includes('blight')) ||
          (riskType === 'Dry spell' && w.title.toLowerCase().includes('dry')) ||
          (riskType === 'Temperature' && w.title.toLowerCase().includes('temperature'))));
    if (!sameRiskType) return false;
    return selectedSectors.some((sec) => w.sectors.includes(sec));
  });

  const duplicateSector = duplicateWarning
    ? selectedSectors.find((sec) => duplicateWarning.sectors.includes(sec))
    : null;

  // Threshold Rules Local State
  const [rulesState, setRulesState] = useState<ThresholdRuleItem[]>(thresholdRules);

  // Sync rulesState when props change
  React.useEffect(() => {
    setRulesState(thresholdRules);
  }, [thresholdRules]);

  // Compute live farmers reached
  const farmersReachedCount = selectedSectors.reduce((acc, secName) => {
    const found = MUSANZE_SECTORS_DATA.find((s) => s.name === secName);
    return acc + (found ? found.farmers : 0);
  }, 0);

  const handleRiskTypeChange = (newType: string) => {
    setRiskType(newType);
    setMessageEn(PREFILL_MESSAGES[newType] || '');
    setWarningTitle(`${newType} — ${selectedSectors[0] || 'Musanze'}`);
    if (newType === 'Excess rain') {
      setLevel('Watch');
      setAction1('Clear drainage channels before Tuesday.');
      setAction2('Strengthen bean stakes today.');
      setAction3('Wait to add fertilizer until the soil drains.');
    } else if (newType === 'Pest / disease') {
      setLevel('High');
      setAction1('Inspect lower leaves for dark spots.');
      setAction2('Spray fungicide on a dry afternoon.');
      setAction3('Clean spray equipment before and after use.');
    } else if (newType === 'Dry spell') {
      setLevel('Watch');
      setAction1('Mulch soil around plants to retain moisture.');
      setAction2('Water seedbeds during early evening.');
      setAction3('Hold off planting unshaded plots.');
    } else {
      setLevel('Watch');
      setAction1('Provide shade to young vegetable seedlings.');
      setAction2('Check soil moisture levels daily.');
      setAction3('Harvest ripe crops before peak heat.');
    }
  };

  const handleToggleSector = (secName: string) => {
    setSelectedSectors((prev) => {
      const next = prev.includes(secName) ? prev.filter((s) => s !== secName) : [...prev, secName];
      if (next.length > 0 && warningTitle.startsWith(riskType)) {
        setWarningTitle(`${riskType} — ${next[0]}`);
      }
      return next;
    });
  };

  const handleSelectAllSectors = () => {
    if (selectedSectors.length === MUSANZE_SECTORS_DATA.length) {
      setSelectedSectors([]);
    } else {
      setSelectedSectors(MUSANZE_SECTORS_DATA.map((s) => s.name));
    }
  };

  const handleSendWarning = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSectors.length === 0) {
      onShowToast('Please select at least one sector');
      return;
    }
    if (duplicateWarning) {
      onShowToast('Please resolve active duplicate warning first');
      return;
    }

    const title = warningTitle.trim() || `${riskType} — ${selectedSectors[0]}`;
    const actions = [action1, action2, action3].filter((a) => a.trim().length > 0);

    // Channel split for any issued warning = farmers reached, split in the
    // same proportions as Heavy Rain Influx (SMS 82% · Voice 7% · In-app 11%).
    // The three numbers must add up exactly to the farmers reached.
    const smsSent = Math.round(farmersReachedCount * 0.82);
    const voiceSent = Math.round(farmersReachedCount * 0.07);
    const inAppSent = farmersReachedCount - smsSent - voiceSent;

    const activeChannelsList: { channel: 'SMS' | 'Voice' | 'In-app'; sent: number; delivered: number; failed: number }[] = [];
    if (channels.sms) {
      const delivered = Math.round(smsSent * 0.98);
      activeChannelsList.push({
        channel: 'SMS',
        sent: smsSent,
        delivered,
        failed: smsSent - delivered,
      });
    }
    if (channels.voice) {
      const delivered = Math.round(voiceSent * 0.93);
      activeChannelsList.push({
        channel: 'Voice',
        sent: voiceSent,
        delivered,
        failed: voiceSent - delivered,
      });
    }
    if (channels.inApp) {
      activeChannelsList.push({
        channel: 'In-app',
        sent: inAppSent,
        delivered: inAppSent,
        failed: 0,
      });
    }

    const sectorBreakdown = selectedSectors.map((secName) => {
      const secData = MUSANZE_SECTORS_DATA.find((s) => s.name === secName);
      const total = secData ? secData.farmers : 200;
      return {
        sector: secName,
        acknowledgedCount: 0,
        totalCount: total,
        percentage: 0,
      };
    });

    const newWarning: OfficerActiveWarning = {
      id: `alert-${Date.now()}`,
      title,
      severity: level,
      riskType,
      affectedArea:
        selectedSectors.length === MUSANZE_SECTORS_DATA.length
          ? 'All sectors'
          : selectedSectors.join(', '),
      sectors: [...selectedSectors],
      timeframe,
      // Source line: officer-issued -> "Issued by Claudine M. · 28/09 14:00"
      sourceRule: 'Issued by Claudine M. · 28/09 14:00',
      recommendedActions: actions,
      channels: activeChannelsList,
      sectorBreakdown,
      totalSent: farmersReachedCount,
      totalDelivered: Math.round(farmersReachedCount * 0.98),
      totalAcknowledged: 0,
      unacknowledgedCount: farmersReachedCount,
      acknowledgedPct: 0,
      issuedAt: '28/09 14:00',
      status: 'Active',
      messageEn,
      messageRw,
    };

    onIssueWarning(newWarning);
    setIsIssueModalOpen(false);
    onShowToast(`Warning issued to ${farmersReachedCount.toLocaleString()} farmers`);
  };

  const handleConfirmEndWarning = () => {
    if (!warningToEnd) return;
    onEndWarning(warningToEnd.id);
    onShowToast(`Warning "${warningToEnd.title}" ended and moved to History`);
    setWarningToEnd(null);
  };

  /** Numeric thresholds must rise with the level (Watch < High < Critical). */
  const ruleError = (rule: ThresholdRuleItem): string | null => {
    const numeric = rule.thresholdsList
      .filter((t) => typeof t.value === 'number')
      .sort((a, b) => RISK_LEVEL_WEIGHT[a.level] - RISK_LEVEL_WEIGHT[b.level]);
    for (let i = 1; i < numeric.length; i++) {
      if ((numeric[i].value as number) <= (numeric[i - 1].value as number)) {
        return `${numeric[i].level} must be more than ${numeric[i - 1].level} (${numeric[i - 1].value} ${numeric[i - 1].unit || ''}).`;
      }
    }
    if (numeric.some((t) => (t.value as number) <= 0)) return 'Each number must be more than 0.';
    return null;
  };
  const rulesInvalid = rulesState.some((r) => ruleError(r) !== null);

  const handleSaveThresholdRules = () => {
    if (rulesInvalid) return;
    onSaveRules(rulesState);
    onShowToast('Rules saved. Sector forecast risk is updated now.');
  };

  const getLevelChip = (lvl: RiskLevel) => {
    switch (lvl) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D9772F]/20 text-[#B85718] border border-[#D9772F]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D9772F]" />
            <span>High</span>
          </span>
        );
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C93B3B]/15 text-[#C93B3B] border border-[#C93B3B]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C93B3B]" />
            <span>Critical</span>
          </span>
        );
      case 'Watch':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D9A032]/20 text-[#9E6905] border border-[#D9A032]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D9A032]" />
            <span>Watch</span>
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#3E8E55]/15 text-[#2E6B40] border border-[#3E8E55]/25">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3E8E55]" />
            <span>Low</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* ========================================================================= */}
      {/* HEADER */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-[#17271D]">Warnings</h1>
          <p className="text-[13px] text-[#5B665E] mt-0.5">
            Musanze District · issue, track and tune early warnings
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onShowToast('Warning report exported (PDF & CSV)')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white text-[#17271D] border border-[rgba(31,74,52,0.20)] text-[12.5px] font-medium hover:bg-[#F4F6EF] transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Download className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.75} />
            <span>Export report</span>
          </button>

          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1F4A34] text-white text-[12.5px] font-medium hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 text-[#E4ECDB]" strokeWidth={2} />
            <span>Issue warning</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEGMENTED CONTROL: [Active (X)] [History] [Thresholds & rules] */}
      {/* ========================================================================= */}
      <div className="flex items-center bg-[#FBFCF8] p-1 rounded-full border border-[rgba(31,74,52,0.12)] w-fit shadow-xs">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-1.5 text-[12px] font-medium rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'active'
              ? 'bg-[#1F4A34] text-white shadow-xs font-semibold'
              : 'text-[#5B665E] hover:text-[#17271D]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>Active ({activeWarnings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-1.5 text-[12px] font-medium rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-[#1F4A34] text-white shadow-xs font-semibold'
              : 'text-[#5B665E] hover:text-[#17271D]'
          }`}
        >
          <HistoryIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>History</span>
        </button>

        <button
          onClick={() => setActiveTab('thresholds')}
          className={`px-4 py-1.5 text-[12px] font-medium rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'thresholds'
              ? 'bg-[#1F4A34] text-white shadow-xs font-semibold'
              : 'text-[#5B665E] hover:text-[#17271D]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>Thresholds & rules</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB: ACTIVE WARNINGS */}
      {/* ========================================================================= */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          {activeWarnings.length === 0 ? (
            <div className="bg-[#FBFCF8] rounded-[16px] p-8 text-center border border-[rgba(31,74,52,0.10)] text-[#5B665E]">
              <ShieldAlert className="w-10 h-10 text-[#3E8E55] mx-auto mb-2 opacity-60" />
              <h3 className="text-[16px] font-semibold text-[#17271D]">No active warnings</h3>
              <p className="text-[13px] mt-1">
                All early hazard advisories in Musanze District are currently closed.
              </p>
            </div>
          ) : (
            activeWarnings.map((warning) => (
              <div
                key={warning.id}
                className="bg-[#FBFCF8] rounded-[16px] p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] space-y-5"
              >
                {/* Header row */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-4 border-b border-[rgba(31,74,52,0.08)]">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {getLevelChip(warning.severity)}
                      <h2 className="text-[19px] font-semibold text-[#17271D]">
                        {warning.title}
                      </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-[#5B665E]">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#1F4A34]" />
                        <span className="font-medium text-[#17271D]">{warning.affectedArea}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#1F4A34]" />
                        <span>{warning.timeframe}</span>
                      </span>
                    </div>
                    <p className="text-[12px] text-[#5B665E] italic">
                      {warning.sourceRule}
                    </p>
                  </div>

                  {/* Top-right action buttons */}
                  <div className="flex items-center gap-2 pt-1 md:pt-0">
                    <button
                      onClick={() =>
                        onShowToast(
                          `Reminder queued for ${(warning.unacknowledgedCount || 0).toLocaleString()} unacknowledged farmers`
                        )
                      }
                      className="px-3.5 py-1.5 rounded-full bg-[#1F4A34] text-white text-[12px] font-medium hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer active:scale-98"
                    >
                      Resend to non-acknowledged
                    </button>
                    <button
                      onClick={() => setEditingWarning(warning)}
                      className="p-1.5 rounded-full bg-[#F4F6EF] text-[#5B665E] hover:text-[#17271D] hover:bg-[#E4ECDB] transition-colors cursor-pointer"
                      title="Edit warning"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setWarningToEnd(warning)}
                      className="px-3 py-1.5 rounded-full bg-white text-[#C93B3B] border border-[#C93B3B]/30 hover:bg-[#C93B3B]/10 text-[12px] font-medium transition-all cursor-pointer"
                    >
                      End warning
                    </button>
                  </div>
                </div>

                {/* Recommended Actions */}
                <div className="space-y-2">
                  <h3 className="text-[13px] font-semibold text-[#17271D]">
                    Recommended actions sent to farmers
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {warning.recommendedActions.map((action, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#F4F6EF]/70 border border-[rgba(31,74,52,0.06)] text-[12.5px] text-[#17271D] flex items-start gap-2"
                      >
                        <span className="w-4 h-4 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Crop advice linked to this warning (farmers see it while the warning is active) */}
                {(() => {
                  const linked = cropAdvisories.filter((a) => a.linkedWarningId === warning.id);
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-[13px] font-semibold text-[#17271D]">
                          Crop advice for farmers ({linked.length})
                        </h3>
                        <button
                          type="button"
                          onClick={() => setAdviceFor(warning)}
                          className="px-3.5 py-1.5 rounded-full bg-white text-[#1F4A34] border border-[#1F4A34]/40 hover:bg-[#E4ECDB] text-[12px] font-semibold transition-colors cursor-pointer"
                        >
                          Add crop advice
                        </button>
                      </div>
                      {linked.length === 0 ? (
                        <p className="text-[12.5px] text-[#5B665E]">No crop advice yet. Farmers only see the warning.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {linked.map((a) => (
                            <div key={a.id} className="p-3 rounded-xl bg-[#F4F6EF]/70 border border-[rgba(31,74,52,0.06)] text-[12.5px] space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-semibold text-[#17271D]">{a.title}</span>
                                <button
                                  type="button"
                                  onClick={() => onRemoveAdvice(a.id)}
                                  aria-label={`Remove advice ${a.title}`}
                                  title="Remove advice"
                                  className="p-1 rounded-full text-[#5B665E] hover:text-[#17271D] hover:bg-[#E4ECDB] cursor-pointer flex-shrink-0"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <span className="block text-[#5B665E]">
                                {a.crop} · {a.sectors.join(', ')}
                                {a.authorName ? ` · ${a.authorName}` : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Delivery by Channel & Acknowledged by Sector in 2 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                  {/* Left: Delivery by Channel Table (5 cols) */}
                  <div className="lg:col-span-5 space-y-2.5">
                    <h3 className="text-[13px] font-semibold text-[#17271D]">
                      Delivery by channel
                    </h3>
                    <div className="border border-[rgba(31,74,52,0.08)] rounded-xl overflow-hidden bg-white">
                      <table className="w-full text-left border-collapse text-[12px]">
                        <thead>
                          <tr className="bg-[#F4F6EF]/80 text-[#5B665E] border-b border-[rgba(31,74,52,0.08)]">
                            <th className="py-2 px-3 font-semibold">Channel</th>
                            <th className="py-2 px-2 font-semibold">Sent</th>
                            <th className="py-2 px-2 font-semibold">Delivered</th>
                            <th className="py-2 px-3 font-semibold text-right">Failed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgba(31,74,52,0.06)] tabular-nums">
                          {(warning.channels || []).map((ch) => (
                            <tr key={ch.channel} className="text-[#17271D]">
                              <td className="py-2 px-3 font-medium flex items-center gap-1.5">
                                {ch.channel === 'SMS' && <MessageSquare className="w-3.5 h-3.5 text-[#1F4A34]" />}
                                {ch.channel === 'Voice' && <PhoneCall className="w-3.5 h-3.5 text-[#D9A032]" />}
                                {ch.channel === 'In-app' && <Smartphone className="w-3.5 h-3.5 text-[#3E8E55]" />}
                                <span>{ch.channel}</span>
                              </td>
                              <td className="py-2 px-2 tabular-nums">{ch.sent.toLocaleString()}</td>
                              <td className="py-2 px-2 text-[#2E6B40] font-semibold tabular-nums">{ch.delivered.toLocaleString()}</td>
                              <td className="py-2 px-3 text-right text-[#C93B3B] tabular-nums">{ch.failed}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right: Acknowledged by Sector (7 cols) */}
                  <div className="lg:col-span-7 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[13px] font-semibold text-[#17271D]">
                        Acknowledged by sector
                      </h3>
                      <span className="text-[12px] font-semibold text-[#1F4A34] tabular-nums">
                        Total acknowledged: {(warning.totalAcknowledged || 0).toLocaleString()} of {(warning.totalSent || 0).toLocaleString()} ({warning.acknowledgedPct || 0}%)
                      </span>
                    </div>

                    <div className="space-y-3 bg-[#F4F6EF]/50 p-3.5 rounded-xl border border-[rgba(31,74,52,0.06)]">
                      {(warning.sectorBreakdown || []).map((sec) => (
                        <div key={sec.sector} className="space-y-1">
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="font-semibold text-[#17271D]">{sec.sector}</span>
                            <div className="flex items-center gap-2">
                              {/* FIX 5: Sectors below 50% get outline chip 'Low response' with '!' icon */}
                              {sec.percentage < 50 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium border border-[#D9772F] text-[#B85718] bg-[#FBFCF8]">
                                  <AlertTriangle className="w-3 h-3 text-[#B85718]" strokeWidth={1.5} />
                                  <span>Low response</span>
                                </span>
                              )}
                              <span className="tabular-nums text-[#5B665E]">
                                {sec.acknowledgedCount}/{sec.totalCount} ({sec.percentage}%)
                              </span>
                            </div>
                          </div>
                          {/* FIX 5: Acknowledgement bars: always mid green. No red or amber bars. */}
                          <div className="w-full h-2 rounded-full bg-[rgba(31,74,52,0.10)] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#3E8E55] transition-all duration-500"
                              style={{ width: `${sec.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Summary Row */}
          <div className="p-4 rounded-xl bg-[#E4ECDB] border border-[rgba(31,74,52,0.12)] flex items-center gap-2.5 text-[13px] text-[#1F4A34] font-medium shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-[#1F4A34] flex-shrink-0" />
            <span>
              This season: 5 warnings · average acknowledged 62% · 4 of 5 confirmed by field reports
            </span>
          </div>

          {/* History Table */}
          <div className="bg-[#FBFCF8] rounded-[16px] border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-[#F4F6EF]/80 border-b border-[rgba(31,74,52,0.08)] text-[11.5px] font-semibold text-[#5B665E]">
                    <th className="py-3 px-4">Warning</th>
                    <th className="py-3 px-3">Level</th>
                    <th className="py-3 px-3">Area</th>
                    <th className="py-3 px-3">Issued</th>
                    <th className="py-3 px-3">Ended</th>
                    <th className="py-3 px-3 text-right">Farmers reached</th>
                    <th className="py-3 px-3 text-right">Acknowledged</th>
                    <th className="py-3 px-4 text-center">Confirmed by reports</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(31,74,52,0.06)]">
                  {warningHistory.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedHistoryItem(item)}
                      className="hover:bg-[#F4F6EF]/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-semibold text-[#17271D] group-hover:text-[#1F4A34] transition-colors flex items-center justify-between">
                        <span>{item.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#5B665E]/50 group-hover:translate-x-0.5 transition-transform" />
                      </td>
                      <td className="py-3 px-3">{getLevelChip(item.level || item.severity)}</td>
                      <td className="py-3 px-3 text-[#17271D]">{item.area}</td>
                      <td className="py-3 px-3 text-[#5B665E] tabular-nums text-[12px]">{item.issuedDate}</td>
                      <td className="py-3 px-3 text-[#5B665E] tabular-nums text-[12px]">{item.endedDate}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-[12.5px] text-[#17271D]">
                        {(item.farmersReached || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums text-[12.5px] font-semibold text-[#1F4A34]">
                        {item.acknowledgedPct}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.confirmedByReports ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#3E8E55]/15 text-[#2E6B40]">
                            <Check className="w-3 h-3 text-[#2E6B40]" />
                            <span>Yes</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#5B665E]/15 text-[#5B665E]">
                            <X className="w-3 h-3 text-[#5B665E]" />
                            <span>No</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: THRESHOLDS & RULES */}
      {/* ========================================================================= */}
      {activeTab === 'thresholds' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {rulesState.map((rule, idx) => (
              <div
                key={rule.id}
                className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top line: Name + On/Off toggle */}
                  <div className="flex items-center justify-between pb-3 border-b border-[rgba(31,74,52,0.06)]">
                    <h3 className="text-[15.5px] font-semibold text-[#17271D]">{rule.name}</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.isEnabled}
                        onChange={() => {
                          const updated = [...rulesState];
                          updated[idx] = { ...rule, isEnabled: !rule.isEnabled };
                          setRulesState(updated);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#E4ECDB] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[rgba(31,74,52,0.2)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1F4A34]" />
                    </label>
                  </div>

                  <p className="text-[12px] text-[#5B665E] mt-2 leading-relaxed">
                    {rule.description}
                  </p>

                  {/* Threshold trigger chips & editable inputs */}
                  <div className="mt-3.5 space-y-2">
                    <span className="text-[11.5px] font-semibold text-[#5B665E] block">
                      Trigger thresholds
                    </span>
                    <div className="space-y-2">
                      {rule.thresholdsList.map((th, thIdx) => (
                        <div
                          key={thIdx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#F4F6EF]/70 border border-[rgba(31,74,52,0.06)] text-[12.5px]"
                        >
                          {typeof th.value === 'number' ? (
                            <span className="flex items-center gap-2 font-medium text-[#17271D]">
                              <input
                                type="text"
                                inputMode="numeric"
                                aria-label={`${rule.name}: ${th.level} from`}
                                value={String(th.value)}
                                onChange={(e) => {
                                  const n = Number(e.target.value.replace(/[^0-9]/g, '') || 0);
                                  const updated = [...rulesState];
                                  updated[idx] = {
                                    ...rule,
                                    thresholdsList: rule.thresholdsList.map((t, j) =>
                                      j === thIdx ? { ...t, value: n, label: `${n} ${t.unit || ''} → ${t.level}`.replace('  ', ' ') } : t
                                    ),
                                  };
                                  setRulesState(updated);
                                }}
                                className="w-16 h-8 px-3 rounded-full bg-white border border-[rgba(31,74,52,0.18)] text-[12.5px] text-[#17271D] tabular-nums focus:outline-none focus:border-[#1F4A34]"
                              />
                              <span>{th.unit} or more → {th.level}</span>
                            </span>
                          ) : (
                            <span className="font-medium text-[#17271D]">{th.label}</span>
                          )}
                          {getLevelChip(th.level)}
                        </div>
                      ))}
                    </div>
                    {ruleError(rule) && <p className="text-[12px] text-[#17271D] font-medium">{ruleError(rule)}</p>}
                    {rule.id === 'rule-rain' && (
                      <p className="text-[12px] text-[#5B665E]">
                        {(() => {
                          const preview = computeSectorForecastRisk(rulesState, rainForecasts);
                          const atRisk = Object.entries(preview)
                            .filter(([, lvl]) => lvl !== 'Low')
                            .sort((a, b) => RISK_LEVEL_WEIGHT[b[1]] - RISK_LEVEL_WEIGHT[a[1]]);
                          return atRisk.length === 0
                            ? `With these numbers no sector's ${FORECAST_RISK_DAYS}-day forecast reaches Watch.`
                            : `With these numbers the ${FORECAST_RISK_DAYS}-day forecast puts ${atRisk.map(([sec, lvl]) => `${sec} (${lvl})`).join(', ')} at risk.`;
                        })()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer: Last triggered */}
                <div className="pt-3 border-t border-[rgba(31,74,52,0.06)] flex items-center justify-between text-[12px]">
                  <span className="text-[#5B665E]">Last triggered:</span>
                  <span className="font-medium text-[#17271D]">{rule.lastTriggered}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveThresholdRules}
              disabled={rulesInvalid}
              className="px-6 py-2.5 rounded-full bg-[#1F4A34] text-white text-[13px] font-medium hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save rules
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ISSUE WARNING MODAL */}
      {/* ========================================================================= */}
      {isIssueModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-[#FBFCF8] rounded-[20px] max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-[rgba(31,74,52,0.15)] max-h-[90vh] overflow-y-auto space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(31,74,52,0.08)]">
              <div>
                <h2 className="text-[20px] font-semibold text-[#17271D]">Issue early warning</h2>
                <p className="text-[12.5px] text-[#5B665E]">
                  Musanze District dispatch to verified registered farmers
                </p>
              </div>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F4F6EF] flex items-center justify-center text-[#5B665E] hover:text-[#17271D] hover:bg-[#E4ECDB] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendWarning} className="space-y-4">
              {/* Duplicate check inline notice */}
              {duplicateWarning && duplicateSector && (
                <div className="p-3.5 rounded-xl bg-[#F4F6EF] border border-[#D9A032]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12.5px] animate-in fade-in">
                  <div className="flex items-center gap-2 text-[#9E6905]">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>
                      <strong>{duplicateSector}</strong> already has an active {riskType} warning ({duplicateWarning.severity}).
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsIssueModalOpen(false);
                      setEditingWarning(duplicateWarning);
                    }}
                    className="px-3 py-1 rounded-full bg-white text-[#1F4A34] border border-[rgba(31,74,52,0.25)] hover:bg-[#E4ECDB] text-[11.5px] font-semibold transition-all flex-shrink-0 cursor-pointer shadow-2xs self-start sm:self-auto"
                  >
                    Update that warning instead
                  </button>
                </div>
              )}

              {/* Title field (Required, prefilled from risk type + first sector) */}
              <div>
                <label className="block text-[12px] font-semibold text-[#5B665E] mb-1.5">
                  Title <span className="text-[#C93B3B]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={warningTitle}
                  onChange={(e) => setWarningTitle(e.target.value)}
                  placeholder="e.g. Excess rain — Muhoza"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[rgba(31,74,52,0.18)] text-[13px] text-[#17271D] focus:outline-hidden focus:ring-1 focus:ring-[#1F4A34]"
                />
              </div>

              {/* Row 1: Risk Type Custom Pill Selector & Severity Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[#5B665E] mb-1.5">
                    Risk type
                  </label>
                  {/* Custom pill dropdown/selector (no native select) */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#F4F6EF]/80 border border-[rgba(31,74,52,0.12)]">
                    {(['Excess rain', 'Pest / disease', 'Dry spell', 'Temperature'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleRiskTypeChange(t)}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all text-center cursor-pointer ${
                          riskType === t
                            ? 'bg-[#1F4A34] text-white font-semibold shadow-xs'
                            : 'bg-white text-[#17271D] hover:bg-[#E4ECDB] border border-[rgba(31,74,52,0.08)]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#5B665E] mb-1.5">
                    Level
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['Low', 'Watch', 'High', 'Critical'] as RiskLevel[]).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setLevel(lvl)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          level === lvl
                            ? 'bg-[#1F4A34] text-white border-[#1F4A34] shadow-xs'
                            : 'bg-white text-[#5B665E] border-[rgba(31,74,52,0.15)] hover:border-[#1F4A34]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            lvl === 'Critical'
                              ? 'bg-[#C93B3B]'
                              : lvl === 'High'
                              ? 'bg-[#D9772F]'
                              : lvl === 'Watch'
                              ? 'bg-[#D9A032]'
                              : 'bg-[#3E8E55]'
                          }`}
                        />
                        <span>{lvl}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sectors Multi-Select */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-semibold text-[#5B665E]">
                    Affected sectors
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllSectors}
                    className="text-[11.5px] font-medium text-[#1F4A34] hover:underline cursor-pointer"
                  >
                    {selectedSectors.length === MUSANZE_SECTORS_DATA.length
                      ? 'Deselect all'
                      : 'Select all (15)'}
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 p-3 rounded-xl bg-[#F4F6EF]/60 border border-[rgba(31,74,52,0.08)]">
                  {MUSANZE_SECTORS_DATA.map((sec) => {
                    const isSelected = selectedSectors.includes(sec.name);
                    return (
                      <button
                        key={sec.name}
                        type="button"
                        onClick={() => handleToggleSector(sec.name)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#1F4A34] text-white font-semibold shadow-xs'
                            : 'bg-white text-[#17271D] border border-[rgba(31,74,52,0.10)] hover:bg-[#E4ECDB]'
                        }`}
                      >
                        {sec.name} ({sec.farmers})
                      </button>
                    );
                  })}
                </div>

                {/* Live farmers count line */}
                <div className="mt-1.5 flex items-center justify-between text-[12px]">
                  <span className="text-[#1F4A34] font-semibold">
                    Will reach {farmersReachedCount.toLocaleString()} farmers
                  </span>
                  <span className="text-[#5B665E]">
                    {selectedSectors.length} of {MUSANZE_SECTORS_DATA.length} sectors selected
                  </span>
                </div>
              </div>

              {/* Timeframe */}
              <div>
                <label className="block text-[12px] font-semibold text-[#5B665E] mb-1.5">
                  Timeframe
                </label>
                <input
                  type="text"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[rgba(31,74,52,0.18)] text-[13px] text-[#17271D] focus:outline-hidden focus:ring-1 focus:ring-[#1F4A34]"
                  placeholder="e.g. Mon 28/09 14:00 – Wed 30/09 18:00"
                />
              </div>

              {/* Messages: English & Kinyarwanda */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[12px] font-semibold text-[#5B665E]">
                      Message (English)
                    </label>
                    <span
                      className={`text-[11px] ${
                        messageEn.length > 160 ? 'text-[#C93B3B] font-bold' : 'text-[#5B665E]'
                      }`}
                    >
                      {messageEn.length}/160
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={messageEn}
                    onChange={(e) => setMessageEn(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[rgba(31,74,52,0.18)] text-[12.5px] text-[#17271D] focus:outline-hidden focus:ring-1 focus:ring-[#1F4A34] resize-none"
                    placeholder="Enter English SMS message"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[12px] font-semibold text-[#5B665E]">
                      Message (Kinyarwanda)
                    </label>
                    <span
                      className={`text-[11px] ${
                        messageRw.length > 160 ? 'text-[#C93B3B] font-bold' : 'text-[#5B665E]'
                      }`}
                    >
                      {messageRw.length}/160
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={messageRw}
                    onChange={(e) => setMessageRw(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[rgba(31,74,52,0.18)] text-[12.5px] text-[#17271D] focus:outline-hidden focus:ring-1 focus:ring-[#1F4A34] resize-none"
                    placeholder="Write the Kinyarwanda message"
                  />
                </div>
              </div>

              {/* Recommended Actions (up to 3) */}
              <div>
                <label className="block text-[12px] font-semibold text-[#5B665E] mb-1.5">
                  Recommended actions for farmers (up to 3)
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={action1}
                    onChange={(e) => setAction1(e.target.value)}
                    placeholder="Action 1"
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-[rgba(31,74,52,0.18)] text-[12.5px] text-[#17271D]"
                  />
                  <input
                    type="text"
                    value={action2}
                    onChange={(e) => setAction2(e.target.value)}
                    placeholder="Action 2"
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-[rgba(31,74,52,0.18)] text-[12.5px] text-[#17271D]"
                  />
                  <input
                    type="text"
                    value={action3}
                    onChange={(e) => setAction3(e.target.value)}
                    placeholder="Action 3"
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-[rgba(31,74,52,0.18)] text-[12.5px] text-[#17271D]"
                  />
                </div>
              </div>

              {/* Channels checkboxes */}
              <div>
                <label className="block text-[12px] font-semibold text-[#5B665E] mb-1.5">
                  Channels
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-[12.5px] font-medium text-[#17271D] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.sms}
                      onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                      className="rounded-sm text-[#1F4A34] focus:ring-[#1F4A34]"
                    />
                    <span>SMS</span>
                  </label>
                  <label className="flex items-center gap-2 text-[12.5px] font-medium text-[#17271D] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.voice}
                      onChange={(e) => setChannels({ ...channels, voice: e.target.checked })}
                      className="rounded-sm text-[#1F4A34] focus:ring-[#1F4A34]"
                    />
                    <span>Voice</span>
                  </label>
                  <label className="flex items-center gap-2 text-[12.5px] font-medium text-[#17271D] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.inApp}
                      onChange={(e) => setChannels({ ...channels, inApp: e.target.checked })}
                      className="rounded-sm text-[#1F4A34] focus:ring-[#1F4A34]"
                    />
                    <span>In-app</span>
                  </label>
                </div>
              </div>

              {/* SMS Preview Bubble */}
              <div>
                <label className="block text-[12px] font-semibold text-[#5B665E] mb-1">
                  SMS preview bubble
                </label>
                <div className="p-3 rounded-xl bg-[#E4ECDB]/60 border border-[rgba(31,74,52,0.10)] flex items-start gap-2.5">
                  <MessageSquare className="w-4 h-4 text-[#1F4A34] mt-0.5 flex-shrink-0" />
                  <div className="space-y-1 text-[12px]">
                    <span className="font-semibold text-[#1F4A34] block">
                      IHINGA AI · Musanze District notice:
                    </span>
                    <p className="text-[#17271D] bg-white p-2.5 rounded-lg border border-[rgba(31,74,52,0.08)] shadow-2xs">
                      {messageEn || 'No message entered yet.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-[rgba(31,74,52,0.08)] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-[#F4F6EF] text-[#5B665E] hover:text-[#17271D] text-[12.5px] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedSectors.length === 0 || !warningTitle.trim() || !!duplicateWarning}
                  className="px-6 py-2 rounded-full bg-[#1F4A34] text-white text-[12.5px] font-medium hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send to {farmersReachedCount.toLocaleString()} farmers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT WARNING MODAL */}
      {/* ========================================================================= */}
      {editingWarning && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-[#FBFCF8] rounded-[20px] max-w-lg w-full p-6 shadow-2xl border border-[rgba(31,74,52,0.15)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(31,74,52,0.08)]">
              <h3 className="text-[18px] font-semibold text-[#17271D]">
                Edit warning: {editingWarning.title}
              </h3>
              <button
                onClick={() => setEditingWarning(null)}
                className="w-8 h-8 rounded-full bg-[#F4F6EF] flex items-center justify-center text-[#5B665E] hover:text-[#17271D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <div>
                <label className="block text-[12px] font-semibold text-[#5B665E] mb-1">
                  Timeframe
                </label>
                <input
                  type="text"
                  value={editingWarning.timeframe}
                  onChange={(e) =>
                    setEditingWarning({ ...editingWarning, timeframe: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[rgba(31,74,52,0.18)]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#5B665E] mb-1">
                  English advisory text
                </label>
                <textarea
                  rows={3}
                  value={editingWarning.messageEn || ''}
                  onChange={(e) =>
                    setEditingWarning({ ...editingWarning, messageEn: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-white border border-[rgba(31,74,52,0.18)] text-[12.5px]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[rgba(31,74,52,0.08)] flex justify-end gap-2">
              <button
                onClick={() => setEditingWarning(null)}
                className="px-4 py-2 rounded-full bg-[#F4F6EF] text-[#5B665E] text-[12px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateWarning(editingWarning);
                  onShowToast('Warning updated');
                  setEditingWarning(null);
                }}
                className="px-5 py-2 rounded-full bg-[#1F4A34] text-white text-[12px] font-medium hover:bg-[#2C6343]"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* END WARNING CONFIRM DIALOG */}
      {/* ========================================================================= */}
      {warningToEnd && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-[#FBFCF8] rounded-[20px] max-w-md w-full p-6 shadow-2xl border border-[rgba(31,74,52,0.15)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C93B3B]/15 flex items-center justify-center flex-shrink-0 text-[#C93B3B]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-[#17271D]">
                  End warning: {warningToEnd.title}?
                </h3>
                <p className="text-[12px] text-[#5B665E] mt-0.5">
                  This warning will be deactivated and moved to History. Farmers in {warningToEnd.affectedArea} will no longer see it as active.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[rgba(31,74,52,0.08)] flex items-center justify-end gap-2.5">
              <button
                onClick={() => setWarningToEnd(null)}
                className="px-4 py-2 rounded-full bg-[#F4F6EF] text-[#5B665E] hover:text-[#17271D] text-[12.5px] font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEndWarning}
                className="px-4 py-2 rounded-full bg-[#C93B3B] text-white text-[12.5px] font-medium hover:bg-[#B32D2D] transition-colors shadow-xs cursor-pointer"
              >
                End warning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HISTORY DETAIL DRAWER (READ-ONLY) */}
      {/* ========================================================================= */}
      {selectedHistoryItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedHistoryItem(null)}
        >
          <div
            className="w-full max-w-md bg-[#FBFCF8] h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(31,74,52,0.08)]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[19px] font-semibold text-[#17271D]">
                      {selectedHistoryItem.title}
                    </h3>
                    {getLevelChip(selectedHistoryItem.level || selectedHistoryItem.severity)}
                  </div>
                  <p className="text-[12px] text-[#5B665E] mt-0.5">
                    Historical hazard record · Musanze District
                  </p>
                </div>
                <button
                  onClick={() => setSelectedHistoryItem(null)}
                  className="w-8 h-8 rounded-full bg-[#F4F6EF] flex items-center justify-center text-[#5B665E] hover:text-[#17271D]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-[#F4F6EF]/80 border border-[rgba(31,74,52,0.06)]">
                  <span className="text-[11px] text-[#5B665E] block">Area affected</span>
                  <span className="text-[14px] font-semibold text-[#17271D]">
                    {selectedHistoryItem.area}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#F4F6EF]/80 border border-[rgba(31,74,52,0.06)]">
                  <span className="text-[11px] text-[#5B665E] block">Farmers reached</span>
                  <span className="text-[14px] font-semibold text-[#17271D]">
                    {(selectedHistoryItem.farmersReached || 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#F4F6EF]/80 border border-[rgba(31,74,52,0.06)]">
                  <span className="text-[11px] text-[#5B665E] block">Issued – Ended</span>
                  <span className="text-[14px] font-semibold text-[#17271D]">
                    {selectedHistoryItem.issuedDate} – {selectedHistoryItem.endedDate}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#F4F6EF]/80 border border-[rgba(31,74,52,0.06)]">
                  <span className="text-[11px] text-[#5B665E] block">Acknowledged</span>
                  <span className="text-[14px] font-semibold text-[#1F4A34]">
                    {selectedHistoryItem.acknowledgedPct}%
                  </span>
                </div>
              </div>

              {/* Confirmation status */}
              <div className="p-3.5 rounded-xl bg-[#F4F6EF]/70 border border-[rgba(31,74,52,0.06)] space-y-1">
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="text-[#5B665E]">Confirmed by field reports:</span>
                  <span className="font-semibold text-[#17271D]">
                    {selectedHistoryItem.confirmedByReports ? 'Yes' : 'No'}
                  </span>
                </div>
                {selectedHistoryItem.sourceRule && (
                  <div className="text-[12px] text-[#5B665E] pt-1">
                    <span className="font-medium text-[#17271D]">Source rule: </span>
                    <span>{selectedHistoryItem.sourceRule}</span>
                  </div>
                )}
              </div>

              {/* Recommended Actions */}
              {selectedHistoryItem.recommendedActions && selectedHistoryItem.recommendedActions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[13px] font-semibold text-[#17271D]">
                    Recommended actions sent
                  </h4>
                  <div className="space-y-2">
                    {selectedHistoryItem.recommendedActions.map((act, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-white border border-[rgba(31,74,52,0.08)] text-[12.5px] text-[#17271D] flex items-start gap-2"
                      >
                        <span className="w-4 h-4 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-[rgba(31,74,52,0.08)] flex justify-end">
              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="px-5 py-2 rounded-full bg-[#1F4A34] text-white text-[12.5px] font-medium hover:bg-[#2C6343] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <CropAdviceModal
        warning={adviceFor}
        authorName={authorName}
        onClose={() => setAdviceFor(null)}
        onSave={(advice) => {
          onSaveAdvice(advice);
          setAdviceFor(null);
        }}
      />
    </div>
  );
};
