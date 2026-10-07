import React, { useState, useEffect } from 'react';
import {
  Leaf,
  Bell,
  Home,
  CloudRain,
  AlertTriangle,
  Sparkles,
  Plus,
  ArrowLeft,
  Share2,
  Bookmark,
  MapPin,
  Clock,
  ShieldCheck,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Check,
  Play,
  Pause,
  Camera,
  X,
  Shield,
  Sprout,
  Tag,
  Wheat,
} from 'lucide-react';
import {
  NOW,
  MUSANZE_RECORD,
  FORECAST_HORIZONS,
  CROP_RISK_MATRIX,
  CROP_ADVISORIES_DATA,
  PLAN_AHEAD_DATA,
  SECTORS_WATCH_LIST,
  SECTORS_LOW_LIST,
  ALL_30_RWANDA_DISTRICTS,
  MUSANZE_SECTORS_CELLS,
} from '../data/musanzeData';
import { CropAdvisory, AlertItem, ObservationItem, RiskLevel, NotificationItem } from '../types';

interface MobileFrameProps {
  alerts?: AlertItem[];
  initialSubView?: 'm1' | 'm2';
  onOpenReportModal?: () => void;
  onOpenAlertDetail?: (alert: AlertItem) => void;
  onNavigateToView?: (
    view: 'dashboard' | 'forecast' | 'warnings' | 'recommendations' | 'calendar' | 'observations' | 'settings'
  ) => void;
  onSubmitObservation?: (report: ObservationItem) => void;
  notifications?: NotificationItem[];
  onNotificationClick?: (item: NotificationItem) => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  alerts,
  initialSubView = 'm1',
  onOpenAlertDetail,
  onSubmitObservation,
  notifications = [],
  onNotificationClick,
}) => {
  const currentAlerts = alerts || [];
  const [mobileView, setMobileView] = useState<'m1' | 'm2'>(initialSubView);
  const [activeTab, setActiveTab] = useState<'home' | 'forecast' | 'warnings' | 'advice'>('home');
  const [previousTab, setPreviousTab] = useState<'home' | 'forecast' | 'warnings' | 'advice'>('home');
  const [activeAdvisory, setActiveAdvisory] = useState<CropAdvisory>(CROP_ADVISORIES_DATA[0]);

  // Forecast state
  const [forecastHorizon, setForecastHorizon] = useState<'10d' | 'month' | 'season'>('10d');
  const [showLowRiskSectors, setShowLowRiskSectors] = useState(false);

  // Warnings state
  const [showExpiredWarnings, setShowExpiredWarnings] = useState(false);

  // Advice state
  const [adviceCropFilter, setAdviceCropFilter] = useState<string>('All');

  // M2 Detail state
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceProgressSec, setVoiceProgressSec] = useState(0);
  const [isWhyAdviceOpen, setIsWhyAdviceOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  // Mobile Bottom Sheet (+) Report state
  const [isReportSheetOpen, setIsReportSheetOpen] = useState(false);
  // Mobile Bottom Sheet for Warning Detail inside phone
  const [selectedWarningForSheet, setSelectedWarningForSheet] = useState<AlertItem | null>(null);
  const [warningAcknowledged, setWarningAcknowledged] = useState(false);
  const [reportType, setReportType] = useState<'Rainfall' | 'Crop condition' | 'Pest / disease' | 'Flood / damage'>('Rainfall');
  const [district, setDistrict] = useState<string>('Musanze');
  const [sector, setSector] = useState<string>('Kinigi');
  const [cell, setCell] = useState<string>('Bisoke');
  const [usedGps, setUsedGps] = useState<boolean>(false);
  const [reportNotes, setReportNotes] = useState('');
  const [reportPhoto, setReportPhoto] = useState<string | null>(null);

  // In-phone toast notification
  const [phoneToast, setPhoneToast] = useState<string | null>(null);
  const [isMobileBellOpen, setIsMobileBellOpen] = useState(false);

  const showPhoneToast = (msg: string) => {
    setPhoneToast(msg);
    setTimeout(() => setPhoneToast(null), 2500);
  };

  // Voice player simulated timer (0 to 20 seconds)
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlayingVoice) {
      timer = setInterval(() => {
        setVoiceProgressSec((prev) => {
          if (prev >= 20) {
            setIsPlayingVoice(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlayingVoice]);

  const toggleVoicePlayback = () => {
    if (isPlayingVoice) {
      setIsPlayingVoice(false);
    } else {
      setIsPlayingVoice(true);
      if (voiceProgressSec >= 20) {
        setVoiceProgressSec(0);
      }
    }
  };

  const handleOpenAdvisory = (adv: CropAdvisory) => {
    setPreviousTab(activeTab);
    setActiveAdvisory(adv);
    setMobileView('m2');
  };

  const handleBackFromM2 = () => {
    setMobileView('m1');
    setActiveTab(previousTab);
  };

  const handleShare = () => {
    showPhoneToast('Link copied to clipboard');
  };

  const handleUseMyLocation = () => {
    setDistrict('Musanze');
    setSector('Kinigi');
    setCell('Bisoke');
    setUsedGps(true);
    showPhoneToast('Location set: Kinigi · Bisoke');
  };

  const handleDistrictChange = (newDist: string) => {
    setDistrict(newDist);
    setSector('');
    setCell('');
    setUsedGps(false);
  };

  const handleSectorChange = (newSec: string) => {
    setSector(newSec);
    const cells = MUSANZE_SECTORS_CELLS[newSec] || [];
    setCell(cells.length > 0 ? cells[0] : '');
    setUsedGps(false);
  };

  const availableCells = sector ? MUSANZE_SECTORS_CELLS[sector] || ['Cell 1', 'Cell 2'] : [];

  // Form submit inside phone sheet
  const handleSubmitReportForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportNotes.trim()) {
      showPhoneToast('Please write a brief note');
      return;
    }

    const newReport: ObservationItem = {
      id: `obs-${Date.now()}`,
      farmer: 'Jean-Baptiste N.',
      type: reportType,
      title: reportNotes.trim().length > 34 ? `${reportNotes.trim().slice(0, 34)}...` : reportNotes.trim(),
      sector: sector || 'Kinigi',
      cell: cell || 'Bisoke',
      location: `${sector || 'Kinigi'} · ${cell || 'Bisoke'}`,
      date: '28/09 14:00',
      status: 'Submitted',
      photoUrl: reportPhoto || undefined,
      description: reportNotes.trim(),
      timeline: [
        { step: 'Saved on your phone · 28/09 14:00', time: '28/09 14:00', status: 'completed' },
        { step: 'Sent', time: '28/09 14:01', status: 'completed' },
        { step: 'Received by officer', time: 'Pending review', status: 'current' },
        { step: 'Verified', status: 'upcoming' },
      ],
    };

    if (onSubmitObservation) {
      onSubmitObservation(newReport);
    }
    setIsReportSheetOpen(false);
    setReportNotes('');
    setReportPhoto(null);
    showPhoneToast('Observation sent');
  };

  // Active Horizon Package
  const currentHorizonPkg = FORECAST_HORIZONS[forecastHorizon];
  const chartPointsData = currentHorizonPkg.chartData;

  // Chart coordinates mapping (0-50mm or scaled to max in series)
  const chartW = 320;
  const chartH = 110;
  const padL = 30;
  const padR = 20;
  const padT = 24;
  const padB = 24;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const maxRainMm = forecastHorizon === 'season' ? 240 : 50;

  const chartPoints = chartPointsData.map((d, i) => {
    const x = padL + (i / (chartPointsData.length - 1)) * innerW;
    const y = padT + innerH - (Math.min(d.rainfallMm, maxRainMm) / maxRainMm) * innerH;
    return { ...d, x, y, index: i };
  });

  const chartLinePath = chartPoints.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[i - 1];
    const midX = (prev.x + pt.x) / 2;
    return `${acc} C ${midX},${prev.y} ${midX},${pt.y} ${pt.x},${pt.y}`;
  }, '');

  const chartAreaPath = `${chartLinePath} L ${chartPoints[chartPoints.length - 1].x},${padT + innerH} L ${chartPoints[0].x},${padT + innerH} Z`;
  const peakChartPt = chartPoints.find((p) => p.isPeak) || (forecastHorizon === '10d' ? chartPoints[1] : null);

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'Watch':
        return { text: '#9E6905', bg: 'rgba(217,160,50,0.20)', dot: '#D9A032' };
      case 'High':
        return { text: '#D9772F', bg: 'rgba(217,119,47,0.15)', dot: '#D9772F' };
      case 'Critical':
        return { text: '#C93B3B', bg: 'rgba(201,59,59,0.15)', dot: '#C93B3B' };
      case 'Low':
      default:
        return { text: '#3E8E55', bg: 'rgba(62,142,85,0.15)', dot: '#3E8E55' };
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-4 w-full">
      {/* Frame selector pill toggle on mobile screen */}
      <div className="flex items-center gap-2 mb-4 bg-[#FBFCF8] p-1.5 rounded-full border border-[rgba(31,74,52,0.12)] shadow-xs">
        <button
          onClick={() => setMobileView('m1')}
          className={`px-4 py-1 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
            mobileView === 'm1'
              ? 'bg-[#1F4A34] text-white shadow-xs'
              : 'text-[#5B665E] hover:text-[#17271D]'
          }`}
        >
          M1: Farmer Dashboard
        </button>
        <button
          onClick={() => setMobileView('m2')}
          className={`px-4 py-1 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
            mobileView === 'm2'
              ? 'bg-[#1F4A34] text-white shadow-xs'
              : 'text-[#5B665E] hover:text-[#17271D]'
          }`}
        >
          M2: Advisory Detail
        </button>
      </div>

      {/* 390 × 844 Simulated Phone Frame */}
      <div className="w-[390px] h-[844px] bg-[#F4F6EF] rounded-[48px] shadow-[0_16px_40px_rgba(31,74,52,0.16)] border-[8px] border-[#1F4A34]/90 overflow-hidden flex flex-col relative select-none">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 pointer-events-none" />

        {/* In-Phone Toast Notification */}
        {phoneToast && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-[#1F4A34] text-white text-[12px] font-medium px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
            <Check className="w-3.5 h-3.5 text-[#E4ECDB]" strokeWidth={2} />
            <span>{phoneToast}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FRAME M1: MOBILE SHELL (VIEWS SWITCH INSIDE PHONE) */}
        {/* ========================================================================= */}
        {mobileView === 'm1' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden pt-7 bg-[#F4F6EF]">
            {/* Top Bar */}
            <div className="px-5 py-2.5 flex items-center justify-between border-b border-[rgba(31,74,52,0.06)] bg-[#F4F6EF]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1F4A34] flex items-center justify-center text-white">
                  <Leaf className="w-4 h-4 text-[#E4ECDB]" strokeWidth={2} />
                </div>
                <span className="text-[14px] font-bold text-[#17271D]">IHINGA AI</span>
              </div>

              <div className="flex items-center gap-3 relative">
                <button
                  type="button"
                  onClick={() => setIsMobileBellOpen(!isMobileBellOpen)}
                  className="relative cursor-pointer"
                  title="View notifications"
                >
                  <Bell className="w-5 h-5 text-[#17271D]" strokeWidth={1.5} />
                  {(() => {
                    const count = notifications && notifications.length > 0
                      ? notifications.filter((n) => !n.isRead).length
                      : MUSANZE_RECORD.activeWarningsCount;
                    return count > 0 ? (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#D9772F] text-white text-[9px] font-bold flex items-center justify-center">
                        {count}
                      </span>
                    ) : null;
                  })()}
                </button>
                {/* Avatar in M1 is NOT a link */}
                <div className="w-7 h-7 rounded-full bg-[#1F4A34] text-white text-[11px] font-semibold flex items-center justify-center select-none">
                  JB
                </div>

                {/* Notification Dropdown inside M1 Frame */}
                {isMobileBellOpen && (
                  <div className="absolute top-9 right-0 w-64 z-50 bg-[#FBFCF8] rounded-2xl shadow-xl border border-[rgba(31,74,52,0.15)] p-3 text-[12px] space-y-2 animate-in fade-in max-h-72 overflow-y-auto">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[rgba(31,74,52,0.08)]">
                      <span className="font-semibold text-[#17271D]">Notifications</span>
                      <button
                        type="button"
                        onClick={() => setIsMobileBellOpen(false)}
                        className="text-[#5B665E] hover:text-[#17271D] text-[11px] cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-[#5B665E] text-center py-2 text-[11px]">
                        No active notifications
                      </p>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setIsMobileBellOpen(false);
                            onNotificationClick?.(item);
                          }}
                          className="p-2 rounded-xl bg-white hover:bg-[#E4ECDB]/40 border border-[rgba(31,74,52,0.08)] cursor-pointer transition-colors space-y-1"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold text-[#17271D] truncate text-[11.5px]">
                              {item.title}
                            </span>
                            {!item.isRead && (
                              <span className="w-2 h-2 rounded-full bg-[#D9772F] flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[10.5px] text-[#5B665E] line-clamp-2 leading-tight">
                            {item.subtitle}
                          </p>
                          <span className="text-[9.5px] text-[#5B665E] block tabular-nums">
                            {item.time}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Offline-friendly Status Line */}
            <div className="px-5 py-1.5 bg-[#E4ECDB]/60 text-[11px] text-[#1F4A34] font-medium flex items-center justify-between border-b border-[rgba(31,74,52,0.06)]">
              <span>{NOW.statusLine}</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#3E8E55]" />
                <span>{MUSANZE_RECORD.districtName}</span>
              </span>
            </div>

            {/* Main Tab Content Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {/* TAB 1: HOME VIEW */}
              {activeTab === 'home' && (
                <>
                  {/* Hero (only [View Forecast] and [Get Recommendations] on one row) */}
                  <div className="bg-gradient-to-r from-[#1F4A34] to-[#2C6343] rounded-[16px] p-4 text-white shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-[#E4ECDB] font-medium">
                        {MUSANZE_RECORD.season}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#D9A032] text-[#17271D] text-[10px] font-semibold">
                        {MUSANZE_RECORD.riskLevel}
                      </span>
                    </div>
                    <h2 className="text-[15px] font-normal leading-snug text-white">
                      {NOW.greeting}
                    </h2>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => setActiveTab('forecast')}
                        className="flex-1 py-1.5 px-3 rounded-full bg-white text-[#17271D] text-[11px] font-medium shadow-xs text-center cursor-pointer hover:bg-[#F4F6EF]"
                      >
                        View Forecast
                      </button>
                      <button
                        onClick={() => setActiveTab('advice')}
                        className="flex-1 py-1.5 px-3 rounded-full border border-white/50 text-white text-[11px] font-medium text-center cursor-pointer hover:bg-white/10"
                      >
                        Get Recommendations
                      </button>
                    </div>
                  </div>

                  {/* 2×2 KPI Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* 1. Risk */}
                    <div
                      onClick={() => setActiveTab('forecast')}
                      className="bg-[#FBFCF8] rounded-[14px] p-3 border border-[rgba(31,74,52,0.10)] shadow-xs cursor-pointer hover:border-[rgba(31,74,52,0.25)] transition-colors"
                    >
                      <span className="text-[11px] text-[#5B665E] block">Risk Level</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[18px] font-semibold text-[#17271D]">
                          {MUSANZE_RECORD.riskLevel}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-[#D9A032]" />
                      </div>
                      <span className="text-[10px] text-[#D9A032] font-medium block mt-0.5">Elevated runoff risk</span>
                    </div>

                    {/* 2. Weather */}
                    <div className="bg-[#FBFCF8] rounded-[14px] p-3 border border-[rgba(31,74,52,0.10)] shadow-xs">
                      <span className="text-[11px] text-[#5B665E] block">Upcoming Weather</span>
                      <span className="text-[18px] font-semibold text-[#17271D] block mt-0.5">
                        {NOW.weatherString}
                      </span>
                      <span className="text-[10px] text-[#5B665E] block mt-0.5 font-medium">Rain Tue</span>
                    </div>

                    {/* 3. Warnings */}
                    <div
                      onClick={() => setActiveTab('warnings')}
                      className="bg-[#FBFCF8] rounded-[14px] p-3 border border-[rgba(31,74,52,0.10)] shadow-xs cursor-pointer hover:border-[rgba(31,74,52,0.25)] transition-colors"
                    >
                      <span className="text-[11px] text-[#5B665E] block">Active Warnings</span>
                      <span className="text-[18px] font-semibold text-[#17271D] block mt-0.5">
                        {MUSANZE_RECORD.activeWarningsCount}
                      </span>
                      <span className="text-[10px] text-[#D9772F] block mt-0.5 font-medium">
                        {MUSANZE_RECORD.actionRequiredCount} require action
                      </span>
                    </div>

                    {/* 4. Affected Sectors (caption "Kinigi +3 more", no ellipsis) */}
                    <div
                      onClick={() => setActiveTab('forecast')}
                      className="bg-[#FBFCF8] rounded-[14px] p-3 border border-[rgba(31,74,52,0.10)] shadow-xs cursor-pointer hover:border-[rgba(31,74,52,0.25)] transition-colors"
                    >
                      <span className="text-[11px] text-[#5B665E] block">Affected Sectors</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-[18px] font-semibold text-[#17271D]">
                          {MUSANZE_RECORD.affectedSectorsCount}
                        </span>
                        <span className="text-[12px] text-[#5B665E]">/ {MUSANZE_RECORD.totalSectorsCount}</span>
                      </div>
                      <span className="text-[10px] text-[#5B665E] block mt-0.5">
                        {MUSANZE_RECORD.affectedSectorsCaption}
                      </span>
                    </div>
                  </div>

                  {/* Rainfall Outlook (identical values to desktop: Mon 28 -> Sun 04 for 7D, peak dot on Tue 29 48 mm, y-axis 0-50) */}
                  <div className="bg-[#FBFCF8] rounded-[16px] p-3.5 border border-[rgba(31,74,52,0.10)] shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-[13px] font-semibold text-[#17271D]">Rainfall Outlook</h4>
                        <span className="text-[10px] text-[#1F4A34] bg-[#E4ECDB] px-1.5 py-0.5 rounded-full font-medium">
                          Peak {MUSANZE_RECORD.rainfallPeakMm} mm
                        </span>
                      </div>
                      <span className="text-[10px] text-[#5B665E]">Mon 28 → Sun 04</span>
                    </div>

                    <div className="h-28 w-full relative">
                      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full overflow-visible">
                        {[0, 10, 20, 30, 40, 50].map((val) => {
                          const y = padT + innerH - (val / 50) * innerH;
                          return (
                            <g key={val}>
                              <line
                                x1={padL}
                                y1={y}
                                x2={chartW - padR}
                                y2={y}
                                stroke="#1F4A34"
                                strokeOpacity={val === 0 ? 0.12 : 0.08}
                                strokeDasharray={val === 0 ? undefined : '3 3'}
                              />
                              <text
                                x={padL - 4}
                                y={y + 3}
                                textAnchor="end"
                                className="text-[8px] fill-[#5B665E]"
                              >
                                {val}
                              </text>
                            </g>
                          );
                        })}

                        <path d={chartAreaPath} fill="#3E8E55" fillOpacity={0.12} />
                        <path d={chartLinePath} fill="none" stroke="#3E8E55" strokeWidth="2.5" />

                        {chartPoints.slice(0, 7).map((pt, i) => {
                          const isPeak = i === 1;
                          return (
                            <g key={i}>
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={isPeak ? 4.5 : 2.5}
                                fill={isPeak ? '#D9772F' : '#3E8E55'}
                                stroke="#FBFCF8"
                                strokeWidth={isPeak ? 2 : 1}
                              />
                              <text
                                x={pt.x}
                                y={chartH - 8}
                                textAnchor="middle"
                                className={`text-[8.5px] ${isPeak ? 'font-bold fill-[#D9772F]' : 'fill-[#5B665E]'}`}
                              >
                                {pt.day} {pt.fullDate.split(' ')[1]}
                              </text>
                            </g>
                          );
                        })}

                        {peakChartPt && (
                          <g transform={`translate(${peakChartPt.x}, ${peakChartPt.y - 12})`}>
                            <rect x="-30" y="-12" width="60" height="13" rx="6.5" fill="#1F4A34" />
                            <text x="0" y="-3" textAnchor="middle" className="text-[7.5px] font-bold fill-white">
                              Tue 48 mm
                            </text>
                          </g>
                        )}
                      </svg>
                    </div>
                  </div>

                  {/* Recent Alerts List */}
                  <div className="bg-[#FBFCF8] rounded-[16px] p-3.5 border border-[rgba(31,74,52,0.10)] shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[13px] font-semibold text-[#17271D]">Recent Alerts</h4>
                      <button
                        onClick={() => setActiveTab('warnings')}
                        className="text-[11px] text-[#D9772F] font-semibold hover:underline"
                      >
                        {MUSANZE_RECORD.activeWarningsCount} active →
                      </button>
                    </div>
                    <div className="space-y-1.5 divide-y divide-[rgba(31,74,52,0.05)]">
                      {currentAlerts.map((alert) => {
                        const isExpired = alert.status === 'Expired';
                        const rColor = getRiskColor(alert.severity);
                        return (
                          <div
                            key={alert.id}
                            onClick={() => {
                              setSelectedWarningForSheet(alert);
                              setWarningAcknowledged(false);
                            }}
                            className={`flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-[#F4F6EF] cursor-pointer pt-1.5 first:pt-0 ${
                              isExpired ? 'opacity-65' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: isExpired ? '#5B665E' : rColor.dot }}
                              />
                              <span className={`text-[12px] font-medium truncate ${isExpired ? 'text-[#5B665E]' : 'text-[#17271D]'}`}>
                                {alert.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="text-[10px] text-[#5B665E]">
                                {alert.timestamp}
                              </span>
                              {isExpired ? (
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-medium bg-[#F4F6EF] text-[#5B665E] border border-[rgba(31,74,52,0.08)]">
                                  Expired
                                </span>
                              ) : (
                                <span
                                  className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold"
                                  style={{ backgroundColor: rColor.bg, color: rColor.text }}
                                >
                                  {alert.severity}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="pt-2 border-t border-[rgba(31,74,52,0.06)] mt-2 flex items-center justify-between text-[10px] text-[#5B665E]">
                      <span>Select an alert to see what to do</span>
                      <span className="font-semibold text-[#D9772F]">
                        {MUSANZE_RECORD.actionRequiredCount} require action
                      </span>
                    </div>
                  </div>

                  {/* Crop Advisories Row */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[13px] font-semibold text-[#17271D]">Crop Advisories</h4>
                      <button
                        onClick={() => setActiveTab('advice')}
                        className="text-[11px] text-[#1F4A34] font-medium hover:underline"
                      >
                        All advice →
                      </button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                      {CROP_ADVISORIES_DATA.map((adv) => (
                        <div
                          key={adv.id}
                          onClick={() => handleOpenAdvisory(adv)}
                          className="w-[220px] flex-shrink-0 bg-[#FBFCF8] rounded-[14px] p-2.5 border border-[rgba(31,74,52,0.10)] shadow-xs cursor-pointer hover:border-[rgba(31,74,52,0.25)] transition-all"
                        >
                          <div className="h-24 w-full rounded-[10px] overflow-hidden relative mb-2">
                            <img src={adv.image} alt={adv.crop} className="w-full h-full object-cover" />
                            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#FBFCF8]/95 text-[9px] font-medium text-[#17271D] shadow-xs">
                              {adv.crop}
                            </span>
                          </div>
                          <h5 className="text-[12px] font-semibold text-[#17271D] leading-tight truncate">
                            {adv.title}
                          </h5>
                          <p className="text-[10px] text-[#5B665E] mt-0.5 line-clamp-2">
                            {adv.oneLineAdvice}
                          </p>
                          <div className="mt-2 flex items-center justify-between text-[9px] text-[#1F4A34] font-medium pt-1.5 border-t border-[rgba(31,74,52,0.06)]">
                            <span>{adv.windowStatusText}</span>
                            <ArrowRight className="w-3 h-3 text-[#1F4A34]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: FORECAST VIEW (SAME 4 CARDS AS DESKTOP: Excess rain, Dry spell, Temperature, Season onset) */}
              {activeTab === 'forecast' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[17px] font-semibold text-[#17271D]">Risk Forecast</h3>
                    <p className="text-[11px] text-[#5B665E]">{MUSANZE_RECORD.districtName} · {MUSANZE_RECORD.season}</p>
                  </div>

                  {/* Horizon Segmented Control */}
                  <div className="flex bg-[#E4ECDB]/60 p-1 rounded-full border border-[rgba(31,74,52,0.10)]">
                    {(
                      [
                        { id: '10d', label: '10 Days' },
                        { id: 'month', label: 'This Month' },
                        { id: 'season', label: 'Season' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setForecastHorizon(t.id)}
                        className={`flex-1 py-1 text-[11px] font-medium rounded-full text-center transition-all cursor-pointer ${
                          forecastHorizon === t.id
                            ? 'bg-[#1F4A34] text-white shadow-xs'
                            : 'text-[#5B665E] hover:text-[#17271D]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* 4 Risk Cards in 2×2 Grid: Excess rain, Dry spell, Temperature, Season onset */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Card 1: Excess rain */}
                    {(() => {
                      const c = currentHorizonPkg.cards.excessRain;
                      const r = getRiskColor(c.badge);
                      return (
                        <div className="bg-[#FBFCF8] rounded-[14px] p-2.5 border border-[rgba(31,74,52,0.10)] shadow-xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-medium text-[#17271D]">{c.label}</span>
                              <span
                                className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
                                style={{ backgroundColor: r.bg, color: r.text }}
                              >
                                {c.badge}
                              </span>
                            </div>
                            <div className="text-[15px] font-semibold text-[#17271D] leading-tight mt-0.5 whitespace-nowrap">
                              {c.value}
                            </div>
                            <div className="text-[8.5px] text-[#5B665E] mt-0.5 whitespace-nowrap leading-tight">
                              {c.subtext}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Card 2: Dry spell */}
                    {(() => {
                      const c = currentHorizonPkg.cards.drySpell;
                      const r = getRiskColor(c.badge);
                      return (
                        <div className="bg-[#FBFCF8] rounded-[14px] p-2.5 border border-[rgba(31,74,52,0.10)] shadow-xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-medium text-[#17271D]">{c.label}</span>
                              <span
                                className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
                                style={{ backgroundColor: r.bg, color: r.text }}
                              >
                                {c.badge}
                              </span>
                            </div>
                            <div className="text-[15px] font-semibold text-[#17271D] leading-tight mt-0.5 whitespace-nowrap">
                              {c.value}
                            </div>
                            <div className="text-[8.5px] text-[#5B665E] mt-0.5 whitespace-nowrap leading-tight">
                              {c.subtext}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Card 3: Temperature */}
                    {(() => {
                      const c = currentHorizonPkg.cards.temperature;
                      const r = getRiskColor(c.badge);
                      return (
                        <div className="bg-[#FBFCF8] rounded-[14px] p-2.5 border border-[rgba(31,74,52,0.10)] shadow-xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-medium text-[#17271D]">{c.label}</span>
                              <span
                                className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
                                style={{ backgroundColor: r.bg, color: r.text }}
                              >
                                {c.badge}
                              </span>
                            </div>
                            <div className="text-[15px] font-semibold text-[#17271D] leading-tight mt-0.5 whitespace-nowrap">
                              {c.value}
                            </div>
                            <div className="text-[8.5px] text-[#5B665E] mt-0.5 whitespace-nowrap leading-tight">
                              {c.subtext}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Card 4: Season onset */}
                    {(() => {
                      const c = currentHorizonPkg.cards.seasonOnset;
                      return (
                        <div className="bg-[#FBFCF8] rounded-[14px] p-2.5 border border-[rgba(31,74,52,0.10)] shadow-xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-medium text-[#17271D]">{c.label}</span>
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-[#E4ECDB] text-[#1F4A34] border border-[rgba(31,74,52,0.10)]">
                                Started
                              </span>
                            </div>
                            <div className="text-[15px] font-semibold text-[#17271D] leading-tight mt-0.5 whitespace-nowrap">
                              {c.value}
                            </div>
                            <div className="text-[8.5px] text-[#5B665E] mt-0.5 whitespace-nowrap leading-tight">
                              {c.subtext}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Full Width Rainfall Chart for current horizon */}
                  <div className="bg-[#FBFCF8] rounded-[16px] p-3.5 border border-[rgba(31,74,52,0.10)] shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-[13px] font-semibold text-[#17271D]">Rainfall forecast</h4>
                      {currentHorizonPkg.peakLabel && (
                        <span className="text-[10px] text-[#1F4A34] bg-[#E4ECDB] px-1.5 py-0.5 rounded-full font-medium">
                          {currentHorizonPkg.peakLabel}
                        </span>
                      )}
                    </div>

                    <div className="h-28 w-full relative">
                      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full overflow-visible">
                        {(forecastHorizon === 'season'
                          ? [0, 50, 100, 150, 200, 250]
                          : [0, 10, 20, 30, 40, 50]
                        ).map((val) => {
                          const y =
                            padT +
                            innerH -
                            (val / maxRainMm) * innerH;
                          return (
                            <g key={val}>
                              <line
                                x1={padL}
                                y1={y}
                                x2={chartW - padR}
                                y2={y}
                                stroke="#1F4A34"
                                strokeOpacity={val === 0 ? 0.12 : 0.08}
                                strokeDasharray={val === 0 ? undefined : '3 3'}
                              />
                              <text
                                x={padL - 4}
                                y={y + 3}
                                textAnchor="end"
                                className="text-[8px] fill-[#5B665E]"
                              >
                                {val}
                              </text>
                            </g>
                          );
                        })}

                        <path d={chartAreaPath} fill="#3E8E55" fillOpacity={0.12} />
                        <path d={chartLinePath} fill="none" stroke="#3E8E55" strokeWidth="2.5" />

                        {chartPoints.map((pt, i) => {
                          const isPeak =
                            pt.isPeak ||
                            (forecastHorizon === '10d' && i === 1);

                          const dateLabels30D: Record<number, string> = {
                            0: '28/09',
                            5: '03/10',
                            10: '08/10',
                            15: '13/10',
                            20: '18/10',
                            25: '23/10',
                          };

                          const shouldShowLabel =
                            forecastHorizon === 'month'
                              ? i in dateLabels30D
                              : true;

                          const labelText =
                            forecastHorizon === 'month'
                              ? dateLabels30D[i]
                              : forecastHorizon === 'season'
                              ? pt.day
                              : pt.day;

                          return (
                            <g key={i}>
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={isPeak ? 4.5 : 2}
                                fill={isPeak ? '#D9772F' : '#3E8E55'}
                                stroke="#FBFCF8"
                                strokeWidth={isPeak ? 2 : 1}
                              />
                              {shouldShowLabel && (
                                <text
                                  x={pt.x}
                                  y={chartH - 8}
                                  textAnchor="middle"
                                  className={`text-[8px] ${
                                    isPeak
                                      ? 'font-bold fill-[#D9772F]'
                                      : 'fill-[#5B665E]'
                                  }`}
                                >
                                  {labelText}
                                </text>
                              )}
                            </g>
                          );
                        })}

                        {peakChartPt && forecastHorizon === '10d' && (
                          <g transform={`translate(${peakChartPt.x}, ${peakChartPt.y - 12})`}>
                            <rect x="-30" y="-12" width="60" height="13" rx="6.5" fill="#1F4A34" />
                            <text x="0" y="-3" textAnchor="middle" className="text-[7.5px] font-bold fill-white">
                              Tue 48 mm
                            </text>
                          </g>
                        )}
                        {peakChartPt && forecastHorizon === 'month' && (
                          <g transform={`translate(${peakChartPt.x}, ${peakChartPt.y - 12})`}>
                            <rect x="-35" y="-12" width="70" height="13" rx="6.5" fill="#1F4A34" />
                            <text x="0" y="-3" textAnchor="middle" className="text-[7.5px] font-bold fill-white">
                              300 mm total
                            </text>
                          </g>
                        )}
                      </svg>
                    </div>
                  </div>

                  {/* 4 Watch Sectors Stacked List + 11 Low Risk [Show] */}
                  <div className="bg-[#FBFCF8] rounded-[16px] p-3.5 border border-[rgba(31,74,52,0.10)] shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[13px] font-semibold text-[#17271D]">Sector Risk ({MUSANZE_RECORD.districtName})</h4>
                      <span className="text-[10px] text-[#D9A032] font-semibold">
                        {SECTORS_WATCH_LIST.length} at Watch
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {SECTORS_WATCH_LIST.map((s) => (
                        <div key={s.name} className="flex items-center justify-between p-2 rounded-xl bg-[#F4F6EF] border border-[rgba(31,74,52,0.06)] text-[11px]">
                          <div>
                            <span className="font-semibold text-[#17271D] block">
                              {s.name} {s.isUserSector ? '(Your Sector)' : ''}
                            </span>
                            <span className="text-[10px] text-[#5B665E]">{s.reason}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#D9A032]/20 text-[#9E6905]">
                            Watch
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-[rgba(31,74,52,0.06)]">
                      <button
                        onClick={() => setShowLowRiskSectors(!showLowRiskSectors)}
                        className="w-full flex items-center justify-between py-1 text-[11px] font-medium text-[#1F4A34] hover:text-[#2C6343] cursor-pointer"
                      >
                        <span>{SECTORS_LOW_LIST.length} sectors at Low risk</span>
                        <span className="flex items-center gap-1 font-semibold underline">
                          {showLowRiskSectors ? 'Hide' : 'Show'}
                          {showLowRiskSectors ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </span>
                      </button>

                      {showLowRiskSectors && (
                        <div className="mt-2 space-y-1 pl-1">
                          {SECTORS_LOW_LIST.map((sec) => (
                            <div key={sec.name} className="flex items-center justify-between text-[10px] text-[#5B665E] py-0.5 border-b border-[rgba(31,74,52,0.04)]">
                              <span>{sec.name}</span>
                              <span className="text-[#3E8E55] font-medium">Low risk</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Crop Matrix: 3 stacked crop cards, each listing its 4 risk chips */}
                  <div className="bg-[#FBFCF8] rounded-[16px] p-3.5 border border-[rgba(31,74,52,0.10)] shadow-xs space-y-3">
                    <h4 className="text-[13px] font-semibold text-[#17271D]">Crop Risk Matrix</h4>

                    {CROP_RISK_MATRIX.map((row) => {
                      const matchedAdvisory = CROP_ADVISORIES_DATA.find((a) => a.id === row.advisoryId) || CROP_ADVISORIES_DATA[0];
                      const rRain = getRiskColor(row.excessRain.level);
                      const rDry = getRiskColor(row.drySpell.level);
                      const rTemp = getRiskColor(row.temperature.level);
                      const rPest = getRiskColor(row.diseasePest.level);

                      return (
                        <div
                          key={row.crop}
                          onClick={() => handleOpenAdvisory(matchedAdvisory)}
                          className="p-3 rounded-xl bg-[#F4F6EF] border border-[rgba(31,74,52,0.08)] cursor-pointer hover:border-[#1F4A34]/30 transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[12px] font-semibold text-[#17271D]">{row.crop}</span>
                            <span className="text-[10px] text-[#1F4A34] font-medium">View advice →</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 text-[9.5px]">
                            <span
                              className="px-2 py-0.5 rounded-full font-semibold"
                              style={{ backgroundColor: rRain.bg, color: rRain.text }}
                            >
                              Rain: {row.excessRain.chipText}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded-full font-semibold"
                              style={{ backgroundColor: rDry.bg, color: rDry.text }}
                            >
                              Dry: {row.drySpell.chipText}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded-full font-semibold"
                              style={{ backgroundColor: rTemp.bg, color: rTemp.text }}
                            >
                              Temp: {row.temperature.chipText}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded-full font-semibold"
                              style={{ backgroundColor: rPest.bg, color: rPest.text }}
                            >
                              Blight/Pest: {row.diseasePest.chipText}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: WARNINGS VIEW (2 ACTIVE STACKED + COLLAPSED HISTORY) */}
              {activeTab === 'warnings' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[17px] font-semibold text-[#17271D]">Early Warnings</h3>
                    <p className="text-[11px] text-[#5B665E]">
                      {MUSANZE_RECORD.activeWarningsCount} active alerts require field precautions
                    </p>
                  </div>

                  {/* 2 Active Warning Cards Stacked */}
                  <div className="space-y-3">
                    {currentAlerts.filter((a) => a.status === 'Active').map((alert) => {
                      const rColor = getRiskColor(alert.severity);
                      return (
                        <div
                          key={alert.id}
                          onClick={() => {
                            setSelectedWarningForSheet(alert);
                            setWarningAcknowledged(false);
                          }}
                          className="bg-[#FBFCF8] rounded-[16px] p-3.5 border border-[rgba(31,74,52,0.12)] shadow-xs cursor-pointer hover:border-[rgba(31,74,52,0.25)] transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                              style={{ backgroundColor: rColor.bg, color: rColor.text }}
                            >
                              {alert.severity}
                            </span>
                            <span className="text-[10px] text-[#5B665E]">{alert.timestamp}</span>
                          </div>
                          <h4 className="text-[13px] font-semibold text-[#17271D] leading-snug">
                            {alert.title}
                          </h4>
                          <div className="mt-2 p-2 rounded-xl bg-[#F4F6EF] text-[10.5px] space-y-1 text-[#5B665E]">
                            <div><strong className="text-[#17271D]">Area:</strong> {alert.affectedArea}</div>
                            <div><strong className="text-[#17271D]">Timing:</strong> {alert.timeframe}</div>
                          </div>
                          <div className="mt-2.5 pt-2 border-t border-[rgba(31,74,52,0.06)] flex items-center justify-between text-[11px] text-[#1F4A34] font-medium">
                            <span>Review field actions</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Warning History collapsed under [Show 2 expired] row */}
                  <div className="bg-[#FBFCF8] rounded-[16px] p-3.5 border border-[rgba(31,74,52,0.10)] shadow-xs">
                    <button
                      onClick={() => setShowExpiredWarnings(!showExpiredWarnings)}
                      className="w-full flex items-center justify-between text-[12px] font-medium text-[#17271D] cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-[#5B665E]" />
                        <span>Warning history</span>
                      </div>
                      <span className="text-[#1F4A34] font-semibold text-[11px] underline flex items-center gap-1">
                        {showExpiredWarnings
                          ? 'Hide expired'
                          : `Show ${currentAlerts.filter((a) => a.status === 'Expired').length} expired`}
                        {showExpiredWarnings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </span>
                    </button>

                    {showExpiredWarnings && (
                      <div className="mt-3 space-y-2 pt-2 border-t border-[rgba(31,74,52,0.06)]">
                        {currentAlerts.filter((a) => a.status === 'Expired').map((exp) => (
                          <div
                            key={exp.id}
                            onClick={() => {
                              setSelectedWarningForSheet(exp);
                              setWarningAcknowledged(false);
                            }}
                            className="p-2 rounded-lg bg-[#F4F6EF] text-[10.5px] opacity-80 cursor-pointer hover:bg-[#E4ECDB]/60 transition-colors"
                          >
                            <div className="flex items-center justify-between font-semibold text-[#17271D]">
                              <span>{exp.title}</span>
                              <span className="text-[#5B665E]">{exp.timestamp}</span>
                            </div>
                            <span className="text-[#5B665E] block mt-0.5">{exp.affectedArea} · Expired</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: ADVICE VIEW (Page Title "Recommendations", tab label stays "Advice") */}
              {activeTab === 'advice' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[17px] font-semibold text-[#17271D]">Recommendations</h3>
                    <p className="text-[11px] text-[#5B665E]">Field guidance customized for Kinigi plots</p>
                  </div>

                  {/* Crop Filter Chips scroll horizontally */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {['All', 'Irish Potato', 'Climbing Beans', 'Maize'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setAdviceCropFilter(c)}
                        className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                          adviceCropFilter === c
                            ? 'bg-[#1F4A34] text-white shadow-xs'
                            : 'bg-white text-[#5B665E] border border-[rgba(31,74,52,0.12)]'
                        }`}
                      >
                        {c === 'All' ? 'All crops' : c}
                      </button>
                    ))}
                  </div>

                  {/* "Act this week" as horizontal-scroll photo cards */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[13px] font-semibold text-[#17271D]">Act this week</h4>
                      <span className="text-[10px] text-[#5B665E]">Swipe →</span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                      {CROP_ADVISORIES_DATA.filter((adv) => {
                        if (adviceCropFilter === 'All') return true;
                        return adv.crop.toLowerCase().includes(adviceCropFilter.toLowerCase());
                      }).map((adv) => (
                        <div
                          key={adv.id}
                          onClick={() => handleOpenAdvisory(adv)}
                          className="w-[230px] flex-shrink-0 bg-[#FBFCF8] rounded-[16px] p-2.5 border border-[rgba(31,74,52,0.10)] shadow-xs cursor-pointer hover:border-[rgba(31,74,52,0.25)] transition-all"
                        >
                          <div className="h-28 w-full rounded-[12px] overflow-hidden relative mb-2">
                            <img src={adv.image} alt={adv.crop} className="w-full h-full object-cover" />
                            <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-[#FBFCF8]/95 text-[9.5px] font-semibold text-[#17271D] shadow-xs">
                              {adv.badgeLabel}
                            </span>
                          </div>
                          <h5 className="text-[13px] font-semibold text-[#17271D] leading-snug">
                            {adv.title}
                          </h5>
                          <p className="text-[10.5px] text-[#5B665E] mt-1 line-clamp-2">
                            {adv.oneLineAdvice}
                          </p>
                          <div className="mt-2.5 pt-2 border-t border-[rgba(31,74,52,0.06)] flex items-center justify-between text-[10px] text-[#1F4A34] font-medium">
                            <span>{adv.windowStatusText}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* "Plan ahead" as a stacked list */}
                  <div className="bg-[#FBFCF8] rounded-[16px] p-3.5 border border-[rgba(31,74,52,0.10)] shadow-xs">
                    <h4 className="text-[13px] font-semibold text-[#17271D] mb-2.5">Plan ahead</h4>
                    <div className="divide-y divide-[rgba(31,74,52,0.06)]">
                      {PLAN_AHEAD_DATA.filter((item) => {
                        if (adviceCropFilter === 'All') return true;
                        if (item.cropTag === 'All crops') return true;
                        return item.cropTag.toLowerCase().includes(adviceCropFilter.toLowerCase());
                      }).map((item) => (
                        <div key={item.id} className="py-2.5 flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#E4ECDB] flex items-center justify-center flex-shrink-0 mt-0.5">
                            {item.iconType === 'shield' && <Shield className="w-3.5 h-3.5 text-[#1F4A34]" />}
                            {item.iconType === 'sprout' && <Sprout className="w-3.5 h-3.5 text-[#1F4A34]" />}
                            {item.iconType === 'calendar' && <Calendar className="w-3.5 h-3.5 text-[#1F4A34]" />}
                            {item.iconType === 'tag' && <Tag className="w-3.5 h-3.5 text-[#1F4A34]" />}
                            {item.iconType === 'wheat' && <Wheat className="w-3.5 h-3.5 text-[#1F4A34]" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[11.5px] font-semibold text-[#17271D] block leading-tight">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-[#5B665E] block mt-0.5">
                              {item.cropTag} · {item.timingChip}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Tab Bar: Home · Forecast · Warnings · Advice · (+) Report */}
            {/* Bottom tabs switch views INSIDE the phone frame. Never switch to desktop. */}
            <div className="h-14 px-3 bg-[#FBFCF8] border-t border-[rgba(31,74,52,0.08)] flex items-center justify-between z-30 flex-shrink-0">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 cursor-pointer transition-colors ${
                  activeTab === 'home' ? 'text-[#1F4A34] font-semibold' : 'text-[#5B665E]'
                }`}
              >
                <Home className="w-4 h-4" strokeWidth={activeTab === 'home' ? 2 : 1.5} />
                <span className="text-[9px]">Home</span>
              </button>

              <button
                onClick={() => setActiveTab('forecast')}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 cursor-pointer transition-colors ${
                  activeTab === 'forecast' ? 'text-[#1F4A34] font-semibold' : 'text-[#5B665E]'
                }`}
              >
                <CloudRain className="w-4 h-4" strokeWidth={activeTab === 'forecast' ? 2 : 1.5} />
                <span className="text-[9px]">Forecast</span>
              </button>

              <button
                onClick={() => setActiveTab('warnings')}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 cursor-pointer transition-colors ${
                  activeTab === 'warnings' ? 'text-[#1F4A34] font-semibold' : 'text-[#5B665E]'
                }`}
              >
                <AlertTriangle className="w-4 h-4" strokeWidth={activeTab === 'warnings' ? 2 : 1.5} />
                <span className="text-[9px]">Warnings</span>
              </button>

              <button
                onClick={() => setActiveTab('advice')}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 cursor-pointer transition-colors ${
                  activeTab === 'advice' ? 'text-[#1F4A34] font-semibold' : 'text-[#5B665E]'
                }`}
              >
                <Sparkles className="w-4 h-4" strokeWidth={activeTab === 'advice' ? 2 : 1.5} />
                <span className="text-[9px]">Advice</span>
              </button>

              {/* (+) Report opens Report Observation as a full-height bottom sheet inside the phone */}
              <button
                onClick={() => setIsReportSheetOpen(true)}
                className="w-9 h-9 rounded-full bg-[#1F4A34] text-white flex items-center justify-center shadow-md hover:bg-[#2C6343] transition-all cursor-pointer flex-shrink-0"
                title="Report observation"
              >
                <Plus className="w-5 h-5" strokeWidth={2.2} />
              </button>
            </div>

            {/* FULL-HEIGHT BOTTOM SHEET FOR REPORT OBSERVATION INSIDE PHONE */}
            {isReportSheetOpen && (
              <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end animate-in fade-in">
                <div className="w-full h-[92%] bg-[#FBFCF8] rounded-t-[24px] shadow-2xl flex flex-col overflow-hidden border-t border-[rgba(31,74,52,0.15)] animate-in slide-in-from-bottom duration-250">
                  {/* Sheet Header with Subtitle "Sent to your agricultural officer" */}
                  <div className="px-5 py-3 border-b border-[rgba(31,74,52,0.08)] bg-[#F4F6EF] flex items-center justify-between">
                    <div>
                      <h3 className="text-[14px] font-semibold text-[#17271D]">Report observation</h3>
                      <p className="text-[10px] text-[#5B665E]">Sent to your agricultural officer</p>
                    </div>
                    <button
                      onClick={() => setIsReportSheetOpen(false)}
                      className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#5B665E] hover:text-[#17271D] border border-[rgba(31,74,52,0.12)] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sheet Body Form */}
                  <form onSubmit={handleSubmitReportForm} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-[12px]">
                    {/* Category */}
                    <div>
                      <label className="block text-[11px] font-medium text-[#17271D] mb-1.5">
                        Observation type
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['Rainfall', 'Flood / damage', 'Crop condition', 'Pest / disease'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setReportType(t)}
                            className={`py-1.5 px-2 rounded-xl text-[11px] font-medium border text-left transition-all cursor-pointer ${
                              reportType === t
                                ? 'bg-[#1F4A34] text-white border-[#1F4A34]'
                                : 'bg-[#F4F6EF] text-[#17271D] border-[rgba(31,74,52,0.10)]'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Location Section: District, Sector, Cell as dropdowns + [Use my location] button */}
                    <div className="bg-[#F4F6EF] p-2.5 rounded-xl border border-[rgba(31,74,52,0.08)] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#17271D] text-[11px]">Field location</span>
                        <div className="flex items-center gap-1.5">
                          {usedGps && (
                            <span className="px-2 py-0.5 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[9.5px] font-medium border border-[rgba(31,74,52,0.12)]">
                              GPS: Kinigi · Bisoke
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={handleUseMyLocation}
                            className="px-2.5 py-0.5 rounded-full bg-white text-[#1F4A34] border border-[rgba(31,74,52,0.20)] text-[10px] font-medium hover:bg-[#E4ECDB] transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <MapPin className="w-3 h-3 text-[#1F4A34]" />
                            <span>Use my location</span>
                          </button>
                        </div>
                      </div>

                      {/* District Dropdown */}
                      <div>
                        <label className="text-[10px] text-[#5B665E] block mb-0.5">District</label>
                        <select
                          value={district}
                          onChange={(e) => handleDistrictChange(e.target.value)}
                          className="w-full bg-white rounded-lg px-2.5 py-1 text-[11px] border border-[rgba(31,74,52,0.15)] font-medium text-[#17271D] appearance-none"
                        >
                          {ALL_30_RWANDA_DISTRICTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      {/* Sector & Cell Dropdowns */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-[#5B665E] block mb-0.5">Sector</label>
                          <select
                            value={sector}
                            onChange={(e) => handleSectorChange(e.target.value)}
                            className="w-full bg-white rounded-lg px-2.5 py-1 text-[11px] border border-[rgba(31,74,52,0.15)] font-medium text-[#17271D] appearance-none"
                          >
                            {MUSANZE_RECORD.allSectors.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-[#5B665E] block mb-0.5">Cell</label>
                          <select
                            value={cell}
                            onChange={(e) => setCell(e.target.value)}
                            className="w-full bg-white rounded-lg px-2.5 py-1 text-[11px] border border-[rgba(31,74,52,0.15)] font-medium text-[#17271D] appearance-none"
                          >
                            {availableCells.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-[11px] font-medium text-[#17271D] mb-1">
                        Date of observation
                      </label>
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[rgba(31,74,52,0.15)] text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-[#1F4A34]" />
                        <span className="font-medium text-[#17271D]">{NOW.dateFormatted} (Today)</span>
                      </div>
                    </div>

                    {/* Photo attachment */}
                    <div>
                      <label className="block text-[11px] font-medium text-[#17271D] mb-1">
                        Photo evidence (optional)
                      </label>
                      <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-[rgba(31,74,52,0.25)] rounded-xl bg-[#F4F6EF] cursor-pointer hover:bg-[#E4ECDB]/40 transition-colors">
                        <Camera className="w-4 h-4 text-[#1F4A34]" />
                        <span className="text-[11px] text-[#1F4A34] font-medium">
                          {reportPhoto ? 'Photo attached ✓' : 'Take or upload photo'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setReportPhoto(URL.createObjectURL(file));
                          }}
                        />
                      </label>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-[11px] font-medium text-[#17271D] mb-1">
                        What did you observe?
                      </label>
                      <textarea
                        rows={3}
                        value={reportNotes}
                        onChange={(e) => setReportNotes(e.target.value)}
                        placeholder="e.g. Heavy puddles forming along potato ridges..."
                        className="w-full bg-white p-2.5 rounded-xl border border-[rgba(31,74,52,0.18)] text-[11px] text-[#17271D] placeholder:text-[#5B665E]/60 focus:outline-none focus:ring-1 focus:ring-[#1F4A34]"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-full bg-[#1F4A34] text-white font-medium text-[12px] shadow-sm hover:bg-[#2C6343] cursor-pointer transition-colors"
                      >
                        Submit observation
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* FULL-HEIGHT BOTTOM SHEET FOR WARNING DETAIL INSIDE PHONE */}
            {selectedWarningForSheet && (
              <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end animate-in fade-in">
                <div className="w-full h-[92%] bg-[#FBFCF8] rounded-t-[24px] shadow-2xl flex flex-col overflow-hidden border-t border-[rgba(31,74,52,0.15)] animate-in slide-in-from-bottom duration-250">
                  {/* Header */}
                  <div className="px-5 py-3 border-b border-[rgba(31,74,52,0.08)] bg-[#F4F6EF] flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#1F4A34]">
                      Early warning detail
                    </span>
                    <button
                      onClick={() => setSelectedWarningForSheet(null)}
                      className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#5B665E] hover:text-[#17271D] border border-[rgba(31,74,52,0.12)] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Scrollable Body - exact same content as desktop drawer */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Severity indicator & timestamp */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: getRiskColor(selectedWarningForSheet.severity).dot }}
                        />
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                          style={{
                            backgroundColor: getRiskColor(selectedWarningForSheet.severity).bg,
                            color: getRiskColor(selectedWarningForSheet.severity).text,
                          }}
                        >
                          {selectedWarningForSheet.severity}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#5B665E]">
                        {selectedWarningForSheet.timestamp}
                      </span>
                    </div>

                    {/* Title & Category */}
                    <div>
                      <h2 className="text-[17px] font-semibold text-[#17271D] leading-snug">
                        {selectedWarningForSheet.title}
                      </h2>
                      <span className="inline-block mt-1 text-[11px] text-[#5B665E]">
                        Category: {selectedWarningForSheet.category}
                      </span>
                    </div>

                    {/* Key metadata grid */}
                    <div className="bg-[#F4F6EF] rounded-xl p-3 space-y-2 border border-[rgba(31,74,52,0.06)] text-[12px]">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#1F4A34] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                        <div>
                          <span className="text-[#5B665E] block text-[10px]">Affected Area</span>
                          <span className="font-medium text-[#17271D]">{selectedWarningForSheet.affectedArea}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 pt-2 border-t border-[rgba(31,74,52,0.06)]">
                        <Clock className="w-3.5 h-3.5 text-[#1F4A34] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                        <div>
                          <span className="text-[#5B665E] block text-[10px]">Timeframe</span>
                          <span className="font-medium text-[#17271D]">{selectedWarningForSheet.timeframe}</span>
                        </div>
                      </div>
                    </div>

                    {/* Recommended Actions List */}
                    <div>
                      <h4 className="text-[13px] font-semibold text-[#17271D] mb-2.5">
                        Recommended actions
                      </h4>
                      <ul className="space-y-2">
                        {selectedWarningForSheet.recommendedActions.map((action, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-[12px] text-[#17271D] bg-[#FBFCF8] p-2.5 rounded-xl border border-[rgba(31,74,52,0.10)]"
                          >
                            <ShieldCheck className="w-4 h-4 text-[#3E8E55] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Sticky Footer: Acknowledge button */}
                  <div className="p-3.5 border-t border-[rgba(31,74,52,0.08)] bg-[#F4F6EF]/70">
                    <button
                      onClick={() => {
                        setWarningAcknowledged(true);
                        setTimeout(() => setSelectedWarningForSheet(null), 800);
                      }}
                      disabled={warningAcknowledged}
                      className="w-full py-2.5 px-4 rounded-full bg-[#1F4A34] text-white text-[12px] font-medium hover:bg-[#2C6343] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      {warningAcknowledged ? (
                        <>
                          <Check className="w-4 h-4 text-[#E4ECDB]" strokeWidth={2} />
                          <span>Warning Acknowledged</span>
                        </>
                      ) : (
                        <span>Acknowledge Warning</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* FRAME M2: ADVISORY DETAIL (PHOTO SCROLLS WITH CONTENT, NO BOTTOM SHARE BUTTON) */}
        {/* ========================================================================= */}
        {mobileView === 'm2' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden relative bg-[#FBFCF8]">
            {/* Unified Scroll Container: Photo scrolls away with content so nothing is hidden behind it */}
            <div className="flex-1 overflow-y-auto pb-20 relative bg-[#FBFCF8]">
              {/* Photo Header */}
              <div className="h-[240px] w-full relative flex-shrink-0">
                <img
                  src={activeAdvisory.image}
                  alt={activeAdvisory.crop}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

                {/* Translucent circular back button left -> returns to tab it came from */}
                <button
                  onClick={handleBackFromM2}
                  className="absolute top-10 left-4 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center text-[#17271D] shadow-md z-30 cursor-pointer hover:bg-white"
                  title="Back"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                </button>

                {/* Share + Bookmark buttons right (top share button is kept) */}
                <div className="absolute top-10 right-4 flex items-center gap-2 z-30">
                  <button
                    onClick={handleShare}
                    className="w-9 h-9 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center text-[#17271D] shadow-md cursor-pointer hover:bg-white"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => {
                      setIsSaved(!isSaved);
                      showPhoneToast(isSaved ? 'Advisory removed' : 'Advisory saved');
                    }}
                    className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center shadow-md transition-colors cursor-pointer ${
                      isSaved ? 'bg-[#3E8E55] text-white' : 'bg-white/85 text-[#17271D] hover:bg-white'
                    }`}
                    title="Save"
                  >
                    <Bookmark className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Chip over photo bottom */}
                <div className="absolute bottom-6 left-5 z-20">
                  <span className="px-3 py-1 rounded-full bg-[#FBFCF8] text-[11px] font-semibold text-[#17271D] shadow-xs">
                    {activeAdvisory.badgeLabel}
                  </span>
                </div>
              </div>

              {/* Overlapping Content Sheet */}
              <div className="px-5 pt-4 space-y-3.5 bg-[#FBFCF8] -mt-4 rounded-t-[20px] relative z-20">
                {/* Title & One line under title */}
                <div>
                  <h2 className="text-[19px] font-semibold text-[#17271D] leading-tight">
                    {activeAdvisory.title}
                  </h2>
                  <p className="text-[12px] text-[#5B665E] mt-1 font-normal">
                    {activeAdvisory.oneLineAdvice}
                  </p>
                </div>

                {/* Pill button [▶ Listen · 0:20] (one play icon only, no "Audio note" label) */}
                <div>
                  <button
                    onClick={toggleVoicePlayback}
                    className="w-full py-2 px-3.5 rounded-full bg-[#E4ECDB] border border-[rgba(31,74,52,0.15)] text-[#1F4A34] text-[12px] font-medium flex items-center gap-2 cursor-pointer hover:bg-[#d8e3ce] transition-colors"
                  >
                    {isPlayingVoice ? (
                      <Pause className="w-3.5 h-3.5 fill-[#1F4A34] flex-shrink-0" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-[#1F4A34] flex-shrink-0" />
                    )}
                    <span>
                      {isPlayingVoice
                        ? `Playing voice message (${voiceProgressSec}s / 20s)`
                        : 'Listen · 0:20 (Kinyarwanda)'}
                    </span>
                  </button>

                  {/* Progress bar when playing */}
                  {isPlayingVoice && (
                    <div className="mt-1.5 w-full h-1 bg-[#E4ECDB] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1F4A34] rounded-full transition-all duration-300"
                        style={{ width: `${(voiceProgressSec / 20) * 100}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Row of 3 stats: 2 days · 48 mm · 82% */}
                <div className="grid grid-cols-3 gap-2 bg-[#F4F6EF] p-2.5 rounded-xl border border-[rgba(31,74,52,0.06)]">
                  <div className="text-center">
                    <div className="text-[13px] font-semibold text-[#17271D]">{activeAdvisory.stat1Value}</div>
                    <div className="text-[10px] text-[#5B665E]">{activeAdvisory.stat1Label}</div>
                  </div>
                  <div className="text-center border-x border-[rgba(31,74,52,0.08)]">
                    <div className="text-[13px] font-semibold text-[#17271D]">{activeAdvisory.stat2Value}</div>
                    <div className="text-[10px] text-[#5B665E]">{activeAdvisory.stat2Label}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[13px] font-semibold text-[#17271D]">82%</div>
                    <div className="text-[10px] text-[#5B665E]">Confidence</div>
                  </div>
                </div>

                {/* Progress Card: "Spray window opens Tue 14:00 · Opens in 24h" */}
                <div className="bg-[#E4ECDB]/60 rounded-xl p-3 border border-[rgba(31,74,52,0.08)]">
                  <div className="flex items-center justify-between text-[11px] font-medium text-[#17271D] mb-1">
                    <span>{activeAdvisory.windowStatusText}</span>
                    <span className="text-[#3E8E55] font-semibold">{activeAdvisory.progressLabel}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#FBFCF8] rounded-full overflow-hidden">
                    <div className="h-full bg-[#3E8E55] rounded-full w-[65%]" />
                  </div>
                </div>

                {/* "What to do" — 3 numbered steps, max 10 words each */}
                <div>
                  <h4 className="text-[13px] font-semibold text-[#17271D] mb-2">What to do</h4>
                  <div className="space-y-2">
                    {activeAdvisory.mitigationSteps.map((stepText, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F4F6EF] border border-[rgba(31,74,52,0.06)]"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#1F4A34] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </div>
                        <span className="text-[11.5px] text-[#17271D] font-medium leading-snug">
                          {stepText}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* "Why this advice" collapsed by default; expanded text max 2 sentences */}
                <div className="bg-[#F4F6EF] rounded-xl border border-[rgba(31,74,52,0.06)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsWhyAdviceOpen(!isWhyAdviceOpen)}
                    className="w-full p-2.5 flex items-center justify-between text-[12px] font-medium text-[#17271D] hover:bg-[rgba(31,74,52,0.04)] cursor-pointer transition-colors"
                  >
                    <span className="font-semibold">Why this advice</span>
                    <div className="flex items-center gap-1 text-[11px] text-[#1F4A34]">
                      <span>{isWhyAdviceOpen ? 'Hide' : 'Show'}</span>
                      {isWhyAdviceOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                  {isWhyAdviceOpen && (
                    <div className="px-3 pb-3 pt-1 border-t border-[rgba(31,74,52,0.06)] text-[11.5px] text-[#5B665E] leading-relaxed">
                      {activeAdvisory.whyAdvice}
                    </div>
                  )}
                </div>

                {/* Info rows: Your plot — Kinigi · Bisoke; Risk — Late blight, High */}
                <div className="space-y-1.5 text-[11.5px] bg-[#F4F6EF] p-2.5 rounded-xl border border-[rgba(31,74,52,0.06)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#5B665E]">Your plot:</span>
                    <span className="font-semibold text-[#17271D]">{activeAdvisory.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#5B665E]">Risk:</span>
                    <span className="font-semibold text-[#D9772F]">{activeAdvisory.riskSummary}</span>
                  </div>
                </div>

                {/* "Was this helpful? Yes / No" row */}
                <div className="pt-2 flex items-center justify-between border-t border-[rgba(31,74,52,0.08)]">
                  <span className="text-[11.5px] text-[#5B665E]">Was this helpful?</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setFeedback('yes');
                        showPhoneToast('Thank you for feedback!');
                      }}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-all ${
                        feedback === 'yes' ? 'bg-[#3E8E55] text-white' : 'bg-[#F4F6EF] text-[#5B665E] hover:text-[#17271D]'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Yes</span>
                    </button>
                    <button
                      onClick={() => {
                        setFeedback('no');
                        showPhoneToast('Thank you for feedback!');
                      }}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-all ${
                        feedback === 'no' ? 'bg-[#C93B3B] text-white' : 'bg-[#F4F6EF] text-[#5B665E] hover:text-[#17271D]'
                      }`}
                    >
                      <ThumbsDown className="w-3 h-3" />
                      <span>No</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky full-width dark pill button "Save advisory" (no bottom share button) */}
            <div className="absolute bottom-0 inset-x-0 bg-[#FBFCF8]/95 backdrop-blur-sm p-4 border-t border-[rgba(31,74,52,0.08)] z-30">
              <button
                onClick={() => {
                  setIsSaved(!isSaved);
                  showPhoneToast(isSaved ? 'Advisory removed' : 'Advisory saved');
                }}
                className={`w-full py-2.5 px-4 rounded-full text-[13px] font-medium transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                  isSaved ? 'bg-[#3E8E55] text-white' : 'bg-[#1F4A34] text-white hover:bg-[#2C6343]'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{isSaved ? 'Advisory Saved' : 'Save advisory'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
