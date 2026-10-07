import React, { useState } from 'react';
import {
  Plus,
  CloudRain,
  AlertTriangle,
  Sprout,
  Bug,
  Clock,
  Check,
  AlertCircle,
  ChevronRight,
  Eye,
  FileText,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { ObservationItem } from '../types';

interface ObservationsViewProps {
  reports: ObservationItem[];
  onOpenReportModal: () => void;
  onSelectObservation: (report: ObservationItem) => void;
  onRetrySend?: (id: string) => void;
}

export const ObservationsView: React.FC<ObservationsViewProps> = ({
  reports,
  onOpenReportModal,
  onSelectObservation,
  onRetrySend,
}) => {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [localToast, setLocalToast] = useState<string | null>(null);

  // Farmer "My reports" = reports where farmer = Jean-Baptiste
  // "Reports near you" = reports in Kinigi
  const myReports = reports.filter((r) => r.farmer.includes('Jean-Baptiste'));
  const kinigiReports = reports.filter((r) => r.sector === 'Kinigi');

  const verifiedCount = myReports.filter((r) => r.status === 'Verified').length;

  const kinigiRainfallCount = kinigiReports.filter((r) => r.type === 'Rainfall').length;
  const kinigiFloodCount = kinigiReports.filter((r) => r.type === 'Flood / damage').length;
  const kinigiCropCount = kinigiReports.filter((r) => r.type === 'Crop condition').length;
  const kinigiPestCount = kinigiReports.filter((r) => r.type === 'Pest / disease').length;
  const totalKinigi = kinigiReports.length || 1;

  const handleRetry = (id: string) => {
    if (onRetrySend) {
      onRetrySend(id);
    } else {
      setLocalToast('Observation sent');
      setTimeout(() => setLocalToast(null), 2500);
    }
  };

  // Report-type icons: forest green icons in tint circles. No amber, orange or red on any icon.
  const getTypeIcon = (type: ObservationItem['type']) => {
    switch (type) {
      case 'Rainfall':
        return <CloudRain className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />;
      case 'Flood / damage':
        return <AlertTriangle className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />;
      case 'Crop condition':
        return <Sprout className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />;
      case 'Pest / disease':
        return <Bug className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />;
      default:
        return <FileText className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />;
    }
  };

  const renderStatusChip = (status: ObservationItem['status']) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E4ECDB] text-[#1F4A34] border border-[rgba(31,74,52,0.12)]">
            <Check className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={2} />
            <span>Verified</span>
          </span>
        );
      case 'Needs more info':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white text-[#17271D] border border-[#17271D]/40">
            <AlertCircle className="w-3.5 h-3.5 text-[#17271D]" strokeWidth={1.5} />
            <span>Needs more info</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white text-[#5B665E] border border-[rgba(31,74,52,0.22)]">
            <X className="w-3.5 h-3.5 text-[#5B665E]" strokeWidth={1.5} />
            <span>Rejected</span>
          </span>
        );
      case 'Not sent':
      case 'Waiting to send':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F4F6EF] text-[#5B665E] border border-[rgba(31,74,52,0.12)]">
            <Clock className="w-3.5 h-3.5 text-[#5B665E]" strokeWidth={1.5} />
            <span>Not sent</span>
          </span>
        );
      case 'Under review':
      case 'Submitted':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white text-[#17271D] border border-[rgba(31,74,52,0.22)]">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Local Toast if needed */}
      {localToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#1F4A34] text-white text-[13px] font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#E4ECDB]" strokeWidth={2} />
          <span>{localToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-[#17271D]">Observations</h1>
          <p className="text-[13px] text-[#5B665E] mt-0.5">
            Your field reports help improve forecasts for Kinigi.
          </p>
        </div>

        {/* Right side primary pill [+ New observation] */}
        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#1F4A34] text-white text-[13px] font-medium hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>New observation</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* BAND 1 — 3 KPI CARDS (Forest green icons in tint circles) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1: Reports this season */}
        <div className="bg-[#FBFCF8] rounded-[16px] p-4 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#E4ECDB] border border-[rgba(31,74,52,0.12)] flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-[#1F4A34]" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-normal text-[#5B665E]">
              Reports this season
            </span>
            <span className="text-[22px] font-semibold text-[#17271D] leading-tight mt-0.5">
              {myReports.length}
            </span>
            <span className="text-[12px] text-[#5B665E] mt-0.5 font-medium">
              Logged for Kinigi Sector
            </span>
          </div>
        </div>

        {/* KPI 2: Verified by an officer */}
        <div className="bg-[#FBFCF8] rounded-[16px] p-4 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#E4ECDB] border border-[rgba(31,74,52,0.12)] flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#1F4A34]" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-normal text-[#5B665E]">
              Verified by an officer
            </span>
            <span className="text-[22px] font-semibold text-[#17271D] leading-tight mt-0.5">
              {verifiedCount}
            </span>
            <span className="text-[12px] text-[#3E8E55] mt-0.5 font-medium">
              Confirmed on-site
            </span>
          </div>
        </div>

        {/* KPI 3: Used in forecasts */}
        <div className="bg-[#FBFCF8] rounded-[16px] p-4 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#E4ECDB] border border-[rgba(31,74,52,0.12)] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-[#1F4A34]" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-normal text-[#5B665E]">
              Used in forecasts
            </span>
            <span className="text-[22px] font-semibold text-[#17271D] leading-tight mt-0.5">
              1
            </span>
            <span className="text-[12px] text-[#5B665E] mt-0.5 font-medium leading-snug">
              Your report confirmed the Kinigi rain warning
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BAND 2 — MY REPORTS (2/3 width) + REPORTS NEAR YOU · LAST 7 DAYS (1/3 width) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: 2/3 width "My reports" list card */}
        <div className="lg:col-span-8 bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(31,74,52,0.06)]">
              <div>
                <h3 className="text-[16px] font-semibold text-[#17271D]">My reports</h3>
                <p className="text-[12px] text-[#5B665E]">
                  Ground observations logged from your farm plots
                </p>
              </div>
              <span className="text-[12px] text-[#5B665E] font-medium">
                {myReports.length} {myReports.length === 1 ? 'report' : 'reports'}
              </span>
            </div>

            {/* Empty state if list is empty */}
            {myReports.length === 0 ? (
              <div className="py-14 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E4ECDB] flex items-center justify-center">
                  <Eye className="w-6 h-6 text-[#1F4A34]" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-[#17271D]">No reports yet</h4>
                  <p className="text-[12px] text-[#5B665E] mt-0.5">
                    Share what you see in your fields to refine local rainfall and pest models.
                  </p>
                </div>
                <button
                  onClick={onOpenReportModal}
                  className="mt-2 px-5 py-2 rounded-full bg-[#1F4A34] text-white text-[12px] font-medium hover:bg-[#2C6343] transition-all cursor-pointer"
                >
                  Report your first observation
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[rgba(31,74,52,0.06)]">
                {myReports.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectObservation(item)}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-[rgba(31,74,52,0.02)] -mx-2 px-2 rounded-xl transition-all cursor-pointer group"
                  >
                    {/* Left: icon → title and meta (left, always aligned) */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-full bg-[#E4ECDB] border border-[rgba(31,74,52,0.12)] flex items-center justify-center flex-shrink-0">
                        {getTypeIcon(item.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-semibold text-[#17271D] truncate group-hover:text-[#1F4A34] transition-colors">
                            {item.title}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#5B665E] mt-0.5">
                          <span>{item.location}</span>
                          <span>·</span>
                          <span>{item.date}</span>
                        </div>
                        {item.statusCaption && (
                          <div className="text-[11px] text-[#5B665E] mt-1 flex flex-wrap items-center gap-1.5">
                            <span>{item.statusCaption}</span>
                            {item.status === 'Not sent' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRetry(item.id);
                                }}
                                className="text-[#1F4A34] font-semibold underline hover:text-[#2C6343] cursor-pointer"
                              >
                                Retry now
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: thumbnail (40px, rounded 8px, only if a photo exists) → status chip → arrow */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {item.photoUrl && !failedImages[item.id] && (
                        <img
                          src={item.photoUrl}
                          alt=""
                          onError={() => setFailedImages((prev) => ({ ...prev, [item.id]: true }))}
                          className="w-10 h-10 rounded-[8px] object-cover border border-[rgba(31,74,52,0.10)] flex-shrink-0"
                        />
                      )}

                      {renderStatusChip(item.status)}

                      <div className="w-7 h-7 rounded-full bg-[#F4F6EF] group-hover:bg-[#E4ECDB] flex items-center justify-center transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 text-[#5B665E] group-hover:text-[#1F4A34]" strokeWidth={1.75} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: 1/3 width "Reports near you · last 7 days" card */}
        <div className="lg:col-span-4 bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between">
          <div>
            <h3 className="text-[16px] font-semibold text-[#17271D]">
              Reports near you · last 7 days
            </h3>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-[22px] font-semibold text-[#17271D]">
                {kinigiReports.length} reports in Kinigi
              </span>
            </div>

            {/* 4 Horizontal progress bars with counts & forest green icons in tint circles */}
            <div className="mt-6 space-y-4">
              {/* 1. Rainfall */}
              <div>
                <div className="flex items-center justify-between text-[12px] mb-1.5">
                  <span className="font-medium text-[#17271D] flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#E4ECDB] flex items-center justify-center flex-shrink-0">
                      <CloudRain className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
                    </div>
                    <span>Rainfall</span>
                  </span>
                  <span className="font-semibold text-[#17271D]">{kinigiRainfallCount}</span>
                </div>
                <div className="h-2 w-full bg-[#F4F6EF] rounded-full overflow-hidden border border-[rgba(31,74,52,0.06)]">
                  <div
                    className="h-full bg-[#3E8E55] rounded-full transition-all duration-500"
                    style={{ width: `${(kinigiRainfallCount / totalKinigi) * 100}%` }}
                  />
                </div>
              </div>

              {/* 2. Flood / damage */}
              <div>
                <div className="flex items-center justify-between text-[12px] mb-1.5">
                  <span className="font-medium text-[#17271D] flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#E4ECDB] flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
                    </div>
                    <span>Flood / damage</span>
                  </span>
                  <span className="font-semibold text-[#17271D]">{kinigiFloodCount}</span>
                </div>
                <div className="h-2 w-full bg-[#F4F6EF] rounded-full overflow-hidden border border-[rgba(31,74,52,0.06)]">
                  <div
                    className="h-full bg-[#3E8E55] rounded-full transition-all duration-500"
                    style={{ width: `${(kinigiFloodCount / totalKinigi) * 100}%` }}
                  />
                </div>
              </div>

              {/* 3. Crop condition */}
              <div>
                <div className="flex items-center justify-between text-[12px] mb-1.5">
                  <span className="font-medium text-[#17271D] flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#E4ECDB] flex items-center justify-center flex-shrink-0">
                      <Sprout className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
                    </div>
                    <span>Crop condition</span>
                  </span>
                  <span className="font-semibold text-[#17271D]">{kinigiCropCount}</span>
                </div>
                <div className="h-2 w-full bg-[#F4F6EF] rounded-full overflow-hidden border border-[rgba(31,74,52,0.06)]">
                  <div
                    className="h-full bg-[#3E8E55] rounded-full transition-all duration-500"
                    style={{ width: `${(kinigiCropCount / totalKinigi) * 100}%` }}
                  />
                </div>
              </div>

              {/* 4. Pest / disease */}
              <div>
                <div className="flex items-center justify-between text-[12px] mb-1.5">
                  <span className="font-medium text-[#17271D] flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#E4ECDB] flex items-center justify-center flex-shrink-0">
                      <Bug className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
                    </div>
                    <span>Pest / disease</span>
                  </span>
                  <span className="font-semibold text-[#17271D]">{kinigiPestCount}</span>
                </div>
                <div className="h-2 w-full bg-[#F4F6EF] rounded-full overflow-hidden border border-[rgba(31,74,52,0.06)]">
                  <div
                    className="h-full bg-[#3E8E55] rounded-full transition-all duration-500"
                    style={{ width: `${(kinigiPestCount / totalKinigi) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Muted caption at bottom */}
          <div className="pt-4 border-t border-[rgba(31,74,52,0.06)] mt-6">
            <p className="text-[12px] text-[#5B665E]">
              From farmers in your sector. Names are hidden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
