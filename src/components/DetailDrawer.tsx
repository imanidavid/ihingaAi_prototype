import React, { useState } from 'react';
import {
  X,
  Share2,
  Bookmark,
  Check,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  Camera,
  AlertCircle,
  Users,
  MessageSquare,
  Send,
  Smartphone,
  PhoneCall,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import {
  AlertItem,
  CropAdvisory,
  ObservationItem,
  CoopGroup,
  CoopMessage,
} from '../types';

export type DrawerContent =
  | { type: 'alert'; data: AlertItem }
  | { type: 'advisory'; data: CropAdvisory }
  | { type: 'observation'; data: ObservationItem }
  | { type: 'coop_group'; data: CoopGroup }
  | { type: 'coop_message'; data: CoopMessage }
  | null;

interface DetailDrawerProps {
  content: DrawerContent;
  onClose: () => void;
  savedItemIds?: string[];
  onToggleSave?: (id: string) => void;
  onRetrySendObservation?: (id: string) => void;
  onRemindGroup?: (group: CoopGroup) => void;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  content,
  onClose,
  savedItemIds,
  onToggleSave,
  onRetrySendObservation,
  onRemindGroup,
}) => {
  const [internalSaved, setInternalSaved] = useState(false);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);
  const [shareToast, setShareToast] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  if (!content) return null;

  const isAlert = content.type === 'alert';
  const isAdvisory = content.type === 'advisory';
  const isObservation = content.type === 'observation';
  const isCoopGroup = content.type === 'coop_group';
  const isCoopMessage = content.type === 'coop_message';
  const alertData = isAlert ? (content.data as AlertItem) : null;
  const advisoryData = isAdvisory ? (content.data as CropAdvisory) : null;
  const observationData = isObservation ? (content.data as ObservationItem) : null;
  const groupData = isCoopGroup ? (content.data as CoopGroup) : null;
  const messageData = isCoopMessage ? (content.data as CoopMessage) : null;

  const isItemSaved = advisoryData
    ? savedItemIds
      ? savedItemIds.includes(advisoryData.id)
      : internalSaved
    : false;

  const handleToggleSave = () => {
    if (advisoryData) {
      if (onToggleSave) {
        onToggleSave(advisoryData.id);
      } else {
        setInternalSaved(!internalSaved);
      }
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2200);
    }
  };

  const handleShare = () => {
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return { bg: 'bg-[#C93B3B]/15', text: 'text-[#C93B3B]', dot: 'bg-[#C93B3B]' };
      case 'High':
        return { bg: 'bg-[#D9772F]/15', text: 'text-[#D9772F]', dot: 'bg-[#D9772F]' };
      case 'Watch':
        return { bg: 'bg-[#D9A032]/20', text: 'text-[#9E6905]', dot: 'bg-[#D9A032]' };
      case 'Low':
      default:
        return { bg: 'bg-[#3E8E55]/15', text: 'text-[#3E8E55]', dot: 'bg-[#3E8E55]' };
    }
  };

  const renderObservationStatusChip = (status: ObservationItem['status']) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#E4ECDB] text-[#1F4A34] border border-[rgba(31,74,52,0.12)]">
            <Check className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={2} />
            <span>Verified</span>
          </span>
        );
      case 'Needs more info':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-white text-[#17271D] border border-[#17271D]/40">
            <AlertCircle className="w-3.5 h-3.5 text-[#17271D]" strokeWidth={1.5} />
            <span>Needs more info</span>
          </span>
        );
      case 'Not sent':
      case 'Waiting to send':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-[#F4F6EF] text-[#5B665E] border border-[rgba(31,74,52,0.12)]">
            <Clock className="w-3.5 h-3.5 text-[#5B665E]" strokeWidth={1.5} />
            <span>{status === 'Not sent' ? 'Not sent' : 'Waiting to send'}</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-white text-[#5B665E] border border-[rgba(31,74,52,0.22)]">
            <X className="w-3.5 h-3.5 text-[#5B665E]" strokeWidth={1.5} />
            <span>Rejected</span>
          </span>
        );
      case 'Under review':
      case 'Submitted':
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-white text-[#17271D] border border-[rgba(31,74,52,0.22)]">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/35 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FBFCF8] shadow-2xl flex flex-col border-l border-[rgba(31,74,52,0.12)]">
          {/* Header (sentence case) */}
          <div className="p-5 border-b border-[rgba(31,74,52,0.08)] bg-[#F4F6EF]/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-[#1F4A34]">
                {isAlert
                  ? 'Early warning detail'
                  : isObservation
                  ? 'Observation report'
                  : isCoopGroup
                  ? 'Group risk & members'
                  : isCoopMessage
                  ? 'Cooperative message'
                  : 'Agronomic advisory'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#FBFCF8] border border-[rgba(31,74,52,0.12)] flex items-center justify-center text-[#5B665E] hover:text-[#17271D] hover:bg-[#E4ECDB] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Share Toast Notification */}
          {shareToast && (
            <div className="bg-[#1F4A34] text-white text-[12px] px-4 py-2 mx-4 mt-3 rounded-lg flex items-center justify-between shadow-md">
              <span>Shared with Musanze Potato & Bean Cooperative!</span>
              <Check className="w-4 h-4 text-[#E4ECDB]" />
            </div>
          )}

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* VARIANT 1: ALERT DRAWER */}
            {isAlert && alertData && (
              <>
                {/* Severity indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        getSeverityStyle(alertData.severity).dot
                      }`}
                    />
                    <span
                      className={`px-3 py-1 rounded-full text-[12px] font-semibold ${
                        getSeverityStyle(alertData.severity).bg
                      } ${getSeverityStyle(alertData.severity).text}`}
                    >
                      {alertData.severity}
                    </span>
                  </div>
                  <span className="text-[12px] text-[#5B665E]">
                    {alertData.timestamp}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h2 className="text-[20px] font-semibold text-[#17271D] leading-snug">
                    {alertData.title}
                  </h2>
                  <span className="inline-block mt-1 text-[12px] text-[#5B665E]">
                    Category: {alertData.category}
                  </span>
                </div>

                {/* Key metadata grid */}
                <div className="bg-[#F4F6EF] rounded-xl p-4 space-y-2.5 border border-[rgba(31,74,52,0.06)]">
                  <div className="flex items-start gap-2.5 text-[13px]">
                    <MapPin className="w-4 h-4 text-[#1F4A34] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                    <div>
                      <span className="text-[#5B665E] block text-[11px]">Affected Area</span>
                      <span className="font-medium text-[#17271D]">{alertData.affectedArea}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-[13px] pt-2 border-t border-[rgba(31,74,52,0.06)]">
                    <Clock className="w-4 h-4 text-[#1F4A34] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                    <div>
                      <span className="text-[#5B665E] block text-[11px]">Timeframe</span>
                      <span className="font-medium text-[#17271D]">{alertData.timeframe}</span>
                    </div>
                  </div>
                </div>

                {/* Recommended Actions List */}
                <div>
                  <h4 className="text-[14px] font-semibold text-[#17271D] mb-3">
                    Recommended actions
                  </h4>
                  <ul className="space-y-2.5">
                    {alertData.recommendedActions.map((action, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-[13px] text-[#17271D] bg-[#FBFCF8] p-3 rounded-xl border border-[rgba(31,74,52,0.10)]"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#3E8E55] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* VARIANT 2: ADVISORY DRAWER */}
            {!isAlert && advisoryData && (
              <>
                {/* Photo Header */}
                <div className="relative w-full h-[180px] rounded-[16px] overflow-hidden bg-[#E4ECDB]/40">
                  <img
                    src={advisoryData.image}
                    alt={advisoryData.crop}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-[#FBFCF8] text-[11px] font-semibold text-[#17271D] shadow-xs">
                    {advisoryData.badgeLabel}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h2 className="text-[20px] font-semibold text-[#17271D] leading-snug">
                    {advisoryData.title}
                  </h2>
                  <p className="text-[13px] text-[#5B665E] mt-1">
                    {advisoryData.oneLineAdvice}
                  </p>
                </div>

                {/* Stats & Progress Strip */}
                <div className="bg-[#E4ECDB]/60 rounded-xl p-3.5 border border-[rgba(31,74,52,0.08)]">
                  <div className="grid grid-cols-2 gap-3 mb-2.5">
                    <div>
                      <span className="text-[14px] font-semibold text-[#17271D] block">
                        {advisoryData.stat1Value}
                      </span>
                      <span className="text-[11px] text-[#5B665E]">
                        {advisoryData.stat1Label}
                      </span>
                    </div>
                    <div>
                      <span className="text-[14px] font-semibold text-[#17271D] block">
                        {advisoryData.stat2Value}
                      </span>
                      <span className="text-[11px] text-[#5B665E]">
                        {advisoryData.stat2Label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-medium text-[#17271D] mb-1">
                    <span>{advisoryData.windowStatusText}</span>
                    <span className="text-[#3E8E55] font-semibold">
                      {advisoryData.progressLabel || `${advisoryData.progressPercent}%`}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#FBFCF8] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3E8E55] rounded-full"
                      style={{ width: `${advisoryData.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Why this advice */}
                <div className="space-y-1.5">
                  <h4 className="text-[14px] font-semibold text-[#17271D]">
                    Why this advice
                  </h4>
                  <p className="text-[13px] text-[#5B665E] leading-relaxed">
                    {advisoryData.whyAdvice}
                  </p>
                </div>

                {/* Context Details */}
                <div className="bg-[#F4F6EF] rounded-xl p-3.5 space-y-2 border border-[rgba(31,74,52,0.06)] text-[12px]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
                    <span className="text-[#5B665E]">Location:</span>
                    <span className="font-medium text-[#17271D]">{advisoryData.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
                    <span className="text-[#5B665E]">Timing:</span>
                    <span className="font-medium text-[#17271D]">{advisoryData.timing}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#D9A032]" strokeWidth={1.5} />
                    <span className="text-[#5B665E]">Risk:</span>
                    <span className="font-medium text-[#17271D]">{advisoryData.riskSummary}</span>
                  </div>
                </div>

                {/* Risk mitigation steps */}
                <div>
                  <h4 className="text-[14px] font-semibold text-[#17271D] mb-2.5">
                    Risk mitigation steps
                  </h4>
                  <ul className="space-y-2">
                    {advisoryData.mitigationSteps.map((step, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-[12px] text-[#17271D] bg-[#FBFCF8] p-2.5 rounded-lg border border-[rgba(31,74,52,0.08)]"
                      >
                        <span className="w-4 h-4 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Was this helpful? Yes / No row */}
                <div className="pt-2 border-t border-[rgba(31,74,52,0.08)] flex items-center justify-between">
                  <span className="text-[12px] font-medium text-[#5B665E]">
                    Was this helpful?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFeedback('yes')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                        feedback === 'yes'
                          ? 'bg-[#3E8E55] text-white'
                          : 'bg-[#F4F6EF] text-[#5B665E] hover:text-[#17271D]'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" strokeWidth={1.5} />
                      <span>Yes</span>
                    </button>
                    <button
                      onClick={() => setFeedback('no')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                        feedback === 'no'
                          ? 'bg-[#C93B3B] text-white'
                          : 'bg-[#F4F6EF] text-[#5B665E] hover:text-[#17271D]'
                      }`}
                    >
                      <ThumbsDown className="w-3 h-3" strokeWidth={1.5} />
                      <span>No</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* VARIANT 3: OBSERVATION DRAWER */}
            {isObservation && observationData && (
              <>
                {/* Photo if any */}
                {observationData.photoUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-[rgba(31,74,52,0.12)]">
                    <img
                      src={observationData.photoUrl}
                      alt={observationData.title}
                      onError={(e) => {
                        e.currentTarget.parentElement?.classList.add('hidden');
                      }}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                {/* Type & Status Chips */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-[#F4F6EF] text-[#17271D] border border-[rgba(31,74,52,0.12)]">
                    {observationData.type}
                  </span>
                  {renderObservationStatusChip(observationData.status)}
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-[18px] font-semibold text-[#17271D]">
                    {observationData.title}
                  </h3>
                  {observationData.statusCaption && (
                    <p className="text-[12px] text-[#5B665E] mt-1">
                      {observationData.statusCaption}
                    </p>
                  )}
                </div>

                {/* Context Details */}
                <div className="bg-[#F4F6EF] rounded-xl p-3.5 space-y-2 border border-[rgba(31,74,52,0.06)] text-[12px]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
                    <span className="text-[#5B665E]">Location:</span>
                    <span className="font-medium text-[#17271D]">{observationData.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
                    <span className="text-[#5B665E]">Observed:</span>
                    <span className="font-medium text-[#17271D]">{observationData.date}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <h4 className="text-[14px] font-semibold text-[#17271D]">
                    Field description
                  </h4>
                  <p className="text-[13px] text-[#5B665E] leading-relaxed bg-[#FBFCF8] p-3.5 rounded-xl border border-[rgba(31,74,52,0.08)]">
                    {observationData.description}
                  </p>
                </div>

                {/* Vertical status timeline: Saved on your phone -> Sent -> Received by officer -> Verified */}
                <div>
                  <h4 className="text-[14px] font-semibold text-[#17271D] mb-3">
                    Observation timeline
                  </h4>
                  <div className="space-y-4 relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-[rgba(31,74,52,0.15)]">
                    {(observationData.timeline || []).map((step, idx) => {
                      const isCompleted = step.status === 'completed';
                      const isCurrent = step.status === 'current';
                      const isSentStep = step.step === 'Sent';
                      return (
                        <div key={idx} className="relative flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center -ml-6 border ${
                              isCompleted
                                ? 'bg-[#1F4A34] text-white border-[#1F4A34]'
                                : isCurrent
                                ? 'bg-[#E4ECDB] text-[#1F4A34] border-[#1F4A34]'
                                : 'bg-white text-[#5B665E] border-[rgba(31,74,52,0.20)]'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1F4A34]" />
                            )}
                          </div>
                          <div>
                            <div className="text-[13px] font-medium text-[#17271D] flex items-center gap-2">
                              <span>{step.step}</span>
                              {isSentStep && observationData.status === 'Not sent' && onRetrySendObservation && (
                                <button
                                  type="button"
                                  onClick={() => onRetrySendObservation(observationData.id)}
                                  className="text-[11px] font-semibold text-[#1F4A34] underline hover:text-[#2C6343] cursor-pointer"
                                >
                                  Retry now
                                </button>
                              )}
                            </div>
                            {step.time && (
                              <div className="text-[11.5px] text-[#5B665E]">{step.time}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Officer feedback message box when present */}
                {observationData.officerFeedback && (
                  <div className="bg-[#E4ECDB]/45 rounded-xl p-4 border border-[rgba(31,74,52,0.16)] space-y-2">
                    <div className="flex items-center gap-2 text-[#1F4A34] font-semibold text-[13px]">
                      <ShieldCheck className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />
                      <span>Officer feedback</span>
                    </div>
                    <p className="text-[13px] text-[#17271D] leading-snug">
                      "{observationData.officerFeedback.message}"
                    </p>
                    {observationData.officerFeedback.officer && (
                      <div className="text-[11.5px] text-[#5B665E]">
                        — {observationData.officerFeedback.officer}
                      </div>
                    )}
                    {observationData.officerFeedback.hasAddPhotoButton && (
                      <button
                        type="button"
                        onClick={handleShare}
                        className="mt-2 px-4 py-2 rounded-full bg-[#1F4A34] text-white text-[12px] font-medium hover:bg-[#2C6343] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Add photo</span>
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* VARIANT 4: COOPERATIVE GROUP DETAIL */}
            {isCoopGroup && groupData && (
              <div className="space-y-6">
                {/* Group header */}
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[11px] font-semibold">
                    <Users className="w-3.5 h-3.5" />
                    <span>{groupData.sector} sector</span>
                  </div>
                  <h2 className="text-[22px] font-bold text-[#17271D] tracking-tight">
                    {groupData.name}
                  </h2>
                  <p className="text-[12.5px] text-[#5B665E]">
                    {groupData.membersCount} registered cooperative members
                  </p>
                </div>

                {/* Active Warnings for this group */}
                <div className="space-y-2.5">
                  <h3 className="text-[13.5px] font-semibold text-[#17271D]">
                    Active warnings covering this group
                  </h3>
                  <div className="space-y-2">
                    {groupData.warnings.map((w) => (
                      <div
                        key={w.id}
                        className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[13px] text-[#17271D]">
                              {w.title}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-200 text-amber-900">
                              {w.level}
                            </span>
                          </div>
                          <p className="text-[11.5px] text-[#5B665E] mt-0.5">
                            High-risk hazard threshold triggered across {groupData.sector} plots.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Acknowledgement Status */}
                <div className="space-y-2.5">
                  <h3 className="text-[13.5px] font-semibold text-[#17271D]">
                    Acknowledgement by warning
                  </h3>
                  <div className="space-y-2">
                    {groupData.acknowledgement.map((ack, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#F4F6EF] border border-[rgba(31,74,52,0.08)] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 text-[12px]">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: ack.dotColor }}
                          />
                          <span className="font-medium text-[#17271D]">{ack.warningTitle}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[13px] font-bold text-[#1F4A34]">
                            {ack.pct}%
                          </span>
                          <span className="text-[11px] text-[#5B665E] block">
                            {ack.acknowledgedCount} of {ack.totalCount} members
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Unacknowledged Members List */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[13.5px] font-semibold text-[#17271D]">
                      Members pending acknowledgement
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold text-[11px]">
                      {groupData.unacknowledgedCount} members
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-[rgba(31,74,52,0.10)] divide-y divide-[rgba(31,74,52,0.06)] max-h-48 overflow-y-auto">
                    {groupData.unacknowledgedMembers.map((m, idx) => (
                      <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between text-[12px]">
                        <span className="font-medium text-[#17271D]">{m}</span>
                        <span className="text-[10.5px] text-[#9E6905] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                          Not acknowledged
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VARIANT 5: COOPERATIVE MESSAGE DETAIL */}
            {isCoopMessage && messageData && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[11px] font-semibold">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Broadcast message</span>
                  </div>
                  <h2 className="text-[20px] font-bold text-[#17271D] tracking-tight">
                    {messageData.senderCoop}
                  </h2>
                  <p className="text-[12px] text-[#5B665E]">
                    Sent by {messageData.senderName} · {messageData.sentAt}
                  </p>
                </div>

                {/* Delivery stats card */}
                <div className="p-4 rounded-xl bg-[#F4F6EF] border border-[rgba(31,74,52,0.08)] space-y-2 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-[#5B665E]">Target groups:</span>
                    <span className="font-semibold text-[#17271D]">{messageData.groups.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B665E]">Delivered count:</span>
                    <span className="font-semibold text-[#1F4A34]">
                      {messageData.deliveredCount || messageData.recipientCount} members
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[rgba(31,74,52,0.06)] flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-[#1F4A34]" />
                      <span>SMS {messageData.channelSplit?.sms ?? Math.round((messageData.recipientCount || 82) * 0.82)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <PhoneCall className="w-3.5 h-3.5 text-[#1F4A34]" />
                      <span>Voice {messageData.channelSplit?.voice ?? Math.round((messageData.recipientCount || 82) * 0.07)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 text-[#1F4A34]" />
                      <span>In-app {messageData.channelSplit?.inApp ?? Math.round((messageData.recipientCount || 82) * 0.11)}</span>
                    </span>
                  </div>
                </div>

                {/* Message in Kinyarwanda */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#17271D]">
                    Message (Kinyarwanda)
                  </label>
                  <div className="p-3.5 rounded-xl bg-white border border-[rgba(31,74,52,0.12)] text-[12.5px] leading-relaxed text-[#17271D] whitespace-pre-wrap">
                    {messageData.messageRw}
                  </div>
                </div>

                {/* Message in English */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#17271D]">
                    Message (English)
                  </label>
                  <div className="p-3.5 rounded-xl bg-white border border-[rgba(31,74,52,0.12)] text-[12.5px] leading-relaxed text-[#17271D] whitespace-pre-wrap">
                    {messageData.messageEn}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Sticky Footer Action Buttons */}
          <div className="p-4 border-t border-[rgba(31,74,52,0.08)] bg-[#F4F6EF]/70 flex items-center gap-2.5">
            {isCoopGroup ? (
              <div className="flex items-center gap-2.5 w-full">
                <button
                  type="button"
                  onClick={() => {
                    if (groupData && onRemindGroup) {
                      onRemindGroup(groupData);
                      onClose();
                    }
                  }}
                  className="flex-1 py-2.5 px-4 rounded-full bg-[#1F4A34] text-white text-[13px] font-semibold hover:bg-[#2C6343] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Remind them</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-full border border-[rgba(31,74,52,0.20)] text-[#5B665E] hover:text-[#17271D] text-[12.5px] font-medium transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : isCoopMessage ? (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-full bg-[#1F4A34] text-white text-[13px] font-medium hover:bg-[#2C6343] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Close</span>
              </button>
            ) : isAlert ? (
              <button
                onClick={() => {
                  setIsAcknowledged(true);
                  setTimeout(() => onClose(), 800);
                }}
                disabled={isAcknowledged}
                className="w-full py-2.5 px-4 rounded-full bg-[#1F4A34] text-white text-[13px] font-medium hover:bg-[#2C6343] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {isAcknowledged ? (
                  <>
                    <Check className="w-4 h-4 text-[#E4ECDB]" strokeWidth={2} />
                    <span>Warning acknowledged</span>
                  </>
                ) : (
                  <span>Acknowledge warning</span>
                )}
              </button>
            ) : isObservation ? (
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-full bg-[#1F4A34] text-white text-[13px] font-medium hover:bg-[#2C6343] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Close</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleToggleSave}
                  className={`flex-1 py-2.5 px-4 rounded-full text-[13px] font-medium transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                    isItemSaved
                      ? 'bg-[#3E8E55] text-white'
                      : 'bg-[#1F4A34] text-white hover:bg-[#2C6343]'
                  }`}
                >
                  <Bookmark className="w-4 h-4" strokeWidth={1.5} />
                  <span>{isItemSaved ? 'Advisory saved' : 'Save advisory'}</span>
                </button>
                <button
                  onClick={handleShare}
                  title="Share with cooperative"
                  className="py-2.5 px-4 rounded-full bg-[#FBFCF8] text-[#1F4A34] border border-[rgba(31,74,52,0.20)] text-[12px] font-medium hover:bg-[#E4ECDB] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" strokeWidth={1.5} />
                  <span>Share</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
