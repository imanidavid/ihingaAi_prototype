import React, { useState } from 'react';
import {
  Eye,
  Check,
  AlertCircle,
  X,
  CloudRain,
  AlertTriangle,
  Sprout,
  Bug,
  FileText,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { DistrictFieldReportItem, ObservationStatus } from '../types';

interface OfficerObservationsViewProps {
  reports: DistrictFieldReportItem[];
  onVerifyReport: (reportId: string, feedbackMessage?: string, checkForecast?: boolean) => void;
  onAskMoreInfo: (reportId: string, message: string) => void;
  onRejectReport: (reportId: string, reason: string) => void;
  onShowToast: (message: string) => void;
}

const QUICK_FEEDBACK_TEMPLATES = [
  'Confirmed. Report matches district forecast.',
  'Please add a photo showing the affected rows.',
  'Duplicate report; conditions already captured in active warning.',
];

export const OfficerObservationsView: React.FC<OfficerObservationsViewProps> = ({
  reports,
  onVerifyReport,
  onAskMoreInfo,
  onRejectReport,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'review' | 'all' | 'insights'>('review');

  // Review Queue state
  const toReviewReports = reports.filter((r) => r.status === 'Under review');
  const [selectedReportId, setSelectedReportId] = useState<string>(
    toReviewReports[0]?.id || ''
  );
  const [feedbackText, setFeedbackText] = useState('');
  const [useForForecastAccuracy, setUseForForecastAccuracy] = useState(true);

  // If selectedReportId is not in queue (e.g. after action), auto-select first available
  React.useEffect(() => {
    if (toReviewReports.length > 0) {
      if (!toReviewReports.some((r) => r.id === selectedReportId)) {
        setSelectedReportId(toReviewReports[0].id);
        setFeedbackText('');
      }
    } else {
      setSelectedReportId('');
      setFeedbackText('');
    }
  }, [toReviewReports, selectedReportId]);

  const activeReviewReport = toReviewReports.find((r) => r.id === selectedReportId) || toReviewReports[0];

  // All Reports state
  const [statusFilter, setStatusFilter] = useState<'All' | ObservationStatus>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredAllReports = reports.filter((r) => {
    if (statusFilter === 'All') return true;
    return r.status === statusFilter;
  });

  const totalPages = Math.ceil(filteredAllReports.length / pageSize) || 1;
  const paginatedReports = filteredAllReports.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getTypeIcon = (type: DistrictFieldReportItem['type']) => {
    switch (type) {
      case 'Rainfall':
        return <CloudRain className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />;
      case 'Flood / damage':
        return <AlertTriangle className="w-4 h-4 text-[#D9A032]" strokeWidth={1.5} />;
      case 'Crop condition':
        return <Sprout className="w-4 h-4 text-[#3E8E55]" strokeWidth={1.5} />;
      case 'Pest / disease':
        return <Bug className="w-4 h-4 text-[#D9772F]" strokeWidth={1.5} />;
      default:
        return <FileText className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />;
    }
  };

  const renderStatusChip = (status: ObservationStatus) => {
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
      case 'Under review':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F4F6EF] text-[#17271D] border border-[rgba(31,74,52,0.22)]">
            <Clock className="w-3.5 h-3.5 text-[#5B665E]" strokeWidth={1.5} />
            <span>Under review</span>
          </span>
        );
    }
  };

  const handleActionVerify = () => {
    if (!activeReviewReport) return;
    const msg = feedbackText.trim() || 'Confirmed. Report verified against ground telemetry.';
    onVerifyReport(activeReviewReport.id, msg, useForForecastAccuracy);
    onShowToast(`Report from ${activeReviewReport.farmer} verified`);
    setFeedbackText('');
  };

  const handleActionAskMoreInfo = () => {
    if (!activeReviewReport) return;
    if (!feedbackText.trim()) {
      onShowToast('Please provide a message explaining what info is needed');
      return;
    }
    onAskMoreInfo(activeReviewReport.id, feedbackText.trim());
    onShowToast(`Requested more info from ${activeReviewReport.farmer}`);
    setFeedbackText('');
  };

  const handleActionReject = () => {
    if (!activeReviewReport) return;
    if (!feedbackText.trim()) {
      onShowToast('Please provide a reason for rejection');
      return;
    }
    onRejectReport(activeReviewReport.id, feedbackText.trim());
    onShowToast(`Report rejected with feedback`);
    setFeedbackText('');
  };

  // Insights computations
  const totalReportsCount = reports.length;
  const typesMap: Record<string, number> = {
    Rainfall: 0,
    'Flood / damage': 0,
    'Crop condition': 0,
    'Pest / disease': 0,
  };
  const sectorsMap: Record<string, number> = {};

  reports.forEach((r) => {
    if (typesMap[r.type] !== undefined) {
      typesMap[r.type]++;
    }
    sectorsMap[r.sector] = (sectorsMap[r.sector] || 0) + 1;
  });

  const sortedSectors = Object.entries(sectorsMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] md:text-[28px] font-semibold text-[#17271D]">
            Observations
          </h1>
          <p className="text-[13px] text-[#5B665E] mt-0.5">
            Field reports from farmers in Musanze
          </p>
        </div>

        {/* Segmented Control */}
        <div className="inline-flex p-1 rounded-full bg-[#E4ECDB]/60 border border-[rgba(31,74,52,0.12)] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('review')}
            className={`px-4 py-1.5 rounded-full text-[12.5px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'review'
                ? 'bg-[#1F4A34] text-white shadow-xs font-semibold'
                : 'text-[#5B665E] hover:text-[#17271D]'
            }`}
          >
            <span>To review</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10.5px] font-semibold ${
                activeTab === 'review'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#1F4A34]/10 text-[#1F4A34]'
              }`}
            >
              {toReviewReports.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-full text-[12.5px] font-medium transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#1F4A34] text-white shadow-xs font-semibold'
                : 'text-[#5B665E] hover:text-[#17271D]'
            }`}
          >
            All reports ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-1.5 rounded-full text-[12.5px] font-medium transition-all cursor-pointer ${
              activeTab === 'insights'
                ? 'bg-[#1F4A34] text-white shadow-xs font-semibold'
                : 'text-[#5B665E] hover:text-[#17271D]'
            }`}
          >
            Insights
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TO REVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'review' && (
        <div>
          {toReviewReports.length === 0 ? (
            <div className="bg-[#FBFCF8] rounded-[16px] p-12 text-center border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#E4ECDB] flex items-center justify-center mx-auto text-[#1F4A34]">
                <Check className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <h3 className="text-[17px] font-semibold text-[#17271D]">
                All caught up — no reports waiting.
              </h3>
              <p className="text-[13px] text-[#5B665E] max-w-md mx-auto">
                All submitted farmer observations have been reviewed. New field reports will appear here as farmers submit them.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 2/3: The waiting reports list */}
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[12.5px] font-semibold text-[#5B665E]">
                    Reports awaiting review ({toReviewReports.length})
                  </span>
                  <span className="text-[11.5px] text-[#5B665E]">
                    Click a report to inspect and verify
                  </span>
                </div>

                <div className="space-y-3">
                  {toReviewReports.map((rep) => {
                    const isSelected = rep.id === (activeReviewReport?.id || '');
                    return (
                      <div
                        key={rep.id}
                        onClick={() => {
                          setSelectedReportId(rep.id);
                          setFeedbackText('');
                        }}
                        className={`p-4 md:p-5 rounded-[16px] border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#E4ECDB]/45 border-[#1F4A34] shadow-xs'
                            : 'bg-[#FBFCF8] border-[rgba(31,74,52,0.10)] hover:border-[rgba(31,74,52,0.25)] hover:bg-[#F4F6EF]/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="p-1 rounded-md bg-[#E4ECDB] flex-shrink-0">
                                {getTypeIcon(rep.type)}
                              </span>
                              <h3 className="text-[15px] font-semibold text-[#17271D] truncate">
                                {rep.title}
                              </h3>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-white text-[#17271D] border border-[rgba(31,74,52,0.15)]">
                                {rep.type}
                              </span>
                            </div>

                            <p className="text-[12.5px] text-[#5B665E] line-clamp-2 leading-relaxed">
                              {rep.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-[#5B665E] pt-1">
                              <span className="font-semibold text-[#17271D]">
                                {rep.farmer}
                              </span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#1F4A34]" />
                                <span>{rep.sector} · {rep.cell}</span>
                              </span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#5B665E]" />
                                <span>{rep.date}</span>
                              </span>
                            </div>
                          </div>

                          <span
                            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${
                              isSelected ? 'bg-[#1F4A34]' : 'bg-[rgba(31,74,52,0.20)]'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right 1/3: Review panel for the selected report with sticky actions (FIX 1) */}
              {activeReviewReport && (
                <div className="lg:col-span-4 bg-[#FBFCF8] rounded-[16px] border border-[rgba(31,74,52,0.12)] shadow-[0_2px_12px_rgba(31,74,52,0.06)] sticky top-24 max-h-[calc(100vh-140px)] flex flex-col overflow-hidden">
                  {/* Scrollable content container */}
                  <div className="p-5 md:p-6 overflow-y-auto space-y-4 flex-1">
                    <div className="pb-3 border-b border-[rgba(31,74,52,0.08)]">
                      <span className="text-[11px] font-semibold text-[#5B665E] block">
                        Reviewing report
                      </span>
                      <h2 className="text-[17px] font-semibold text-[#17271D] mt-0.5 leading-snug">
                        {activeReviewReport.title}
                      </h2>
                    </div>

                    {/* Photo if available */}
                    {activeReviewReport.photoUrl && (
                      <div className="rounded-xl overflow-hidden max-h-48 border border-[rgba(31,74,52,0.10)]">
                        <img
                          src={activeReviewReport.photoUrl}
                          alt={activeReviewReport.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Context Metadata */}
                    <div className="p-3 rounded-xl bg-[#F4F6EF]/80 border border-[rgba(31,74,52,0.06)] text-[12px] space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[#5B665E]">Farmer:</span>
                        <span className="font-semibold text-[#17271D]">
                          {activeReviewReport.farmer}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5B665E]">Location:</span>
                        <span className="font-medium text-[#17271D]">
                          {activeReviewReport.sector} · {activeReviewReport.cell}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5B665E]">Type:</span>
                        <span className="font-medium text-[#17271D]">
                          {activeReviewReport.type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5B665E]">Submitted:</span>
                        <span className="font-medium text-[#17271D]">
                          {activeReviewReport.date}
                        </span>
                      </div>
                    </div>

                    {/* Full Description */}
                    <div className="space-y-1">
                      <label className="text-[11.5px] font-semibold text-[#5B665E] block">
                        Farmer description
                      </label>
                      <p className="text-[12.5px] text-[#17271D] leading-relaxed p-3 rounded-xl bg-white border border-[rgba(31,74,52,0.08)]">
                        {activeReviewReport.description}
                      </p>
                    </div>

                    {/* Forecast check line */}
                    <div className="p-3 rounded-xl bg-[#E4ECDB]/60 border border-[rgba(31,74,52,0.15)] flex items-start gap-2 text-[12px]">
                      <CheckCircle2 className="w-4 h-4 text-[#1F4A34] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#1F4A34] block">
                          Forecast check:
                        </span>
                        <span className="text-[#17271D]">
                          {activeReviewReport.forecastCheck || 'Consistent with localized station telemetry.'}
                        </span>
                      </div>
                    </div>

                    {/* Feedback Message Box with 3 Quick Templates */}
                    <div className="space-y-2">
                      <label className="block text-[11.5px] font-semibold text-[#5B665E]">
                        Feedback message to farmer
                      </label>
                      <textarea
                        rows={3}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Type a message or tap a quick template below..."
                        className="w-full p-2.5 rounded-xl bg-white border border-[rgba(31,74,52,0.18)] text-[12px] text-[#17271D] focus:outline-hidden focus:ring-1 focus:ring-[#1F4A34] resize-none"
                      />

                      {/* 3 Quick Templates */}
                      <div className="space-y-1.5">
                        <span className="text-[10.5px] font-medium text-[#5B665E]">
                          Quick templates:
                        </span>
                        <div className="flex flex-col gap-1">
                          {QUICK_FEEDBACK_TEMPLATES.map((tmpl, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setFeedbackText(tmpl)}
                              className="text-left text-[11px] p-1.5 px-2.5 rounded-lg bg-[#F4F6EF] text-[#17271D] hover:bg-[#E4ECDB] transition-colors border border-[rgba(31,74,52,0.08)] truncate cursor-pointer"
                            >
                              "{tmpl}"
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Checkbox: Use this report to check forecast accuracy */}
                    <label className="flex items-start gap-2 pt-1 text-[12px] text-[#17271D] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useForForecastAccuracy}
                        onChange={(e) => setUseForForecastAccuracy(e.target.checked)}
                        className="rounded-sm text-[#1F4A34] focus:ring-[#1F4A34] mt-0.5"
                      />
                      <span>Use this report to check forecast accuracy</span>
                    </label>
                  </div>

                  {/* Sticky Footer: Action buttons always visible (FIX 1) */}
                  <div className="p-4 md:p-5 bg-[#FBFCF8] border-t border-[rgba(31,74,52,0.10)] space-y-2 flex-shrink-0 shadow-[0_-4px_12px_rgba(31,74,52,0.03)]">
                    <button
                      type="button"
                      onClick={handleActionVerify}
                      className="w-full py-2.5 rounded-full bg-[#1F4A34] text-white text-[12.5px] font-medium hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <Check className="w-4 h-4" />
                      <span>Verify</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleActionAskMoreInfo}
                        className="py-2 px-3 rounded-full bg-white text-[#17271D] border border-[rgba(31,74,52,0.22)] hover:bg-[#F4F6EF] text-[11.5px] font-medium transition-all cursor-pointer flex items-center justify-center gap-1"
                        title={!feedbackText ? 'Enter a feedback message first' : undefined}
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-[#5B665E]" />
                        <span>Ask for more info</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleActionReject}
                        className="py-2 px-3 rounded-full bg-white text-[#C93B3B] border border-[#C93B3B]/30 hover:bg-[#C93B3B]/10 text-[11.5px] font-medium transition-all cursor-pointer flex items-center justify-center gap-1"
                        title={!feedbackText ? 'Enter a reason in the feedback box' : undefined}
                      >
                        <X className="w-3.5 h-3.5 text-[#C93B3B]" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ALL REPORTS (52 Reports from last 7 days) */}
      {/* ========================================================================= */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          {/* Status Filter Segmented Control */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex p-1 rounded-xl bg-[#E4ECDB]/60 border border-[rgba(31,74,52,0.12)]">
              {(['All', 'Verified', 'Needs more info', 'Rejected', 'Under review'] as const).map(
                (filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => {
                      setStatusFilter(filterOption);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                      statusFilter === filterOption
                        ? 'bg-[#1F4A34] text-white font-semibold shadow-xs'
                        : 'text-[#5B665E] hover:text-[#17271D]'
                    }`}
                  >
                    {filterOption}
                  </button>
                )
              )}
            </div>

            <span className="text-[12px] text-[#5B665E] tabular-nums">
              Showing {filteredAllReports.length} of {reports.length} reports
            </span>
          </div>

          {/* Table */}
          <div className="bg-[#FBFCF8] rounded-[16px] border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4F6EF]/80 border-b border-[rgba(31,74,52,0.08)] text-[11.5px] font-semibold text-[#5B665E]">
                    <th className="py-3 px-4">Report</th>
                    <th className="py-3 px-3">Farmer</th>
                    <th className="py-3 px-3">Sector</th>
                    <th className="py-3 px-3">Cell</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(31,74,52,0.06)] text-[13px]">
                  {paginatedReports.map((rep) => (
                    <tr
                      key={rep.id}
                      className="hover:bg-[#F4F6EF]/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-[#17271D]">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-md bg-[#E4ECDB]/60 flex-shrink-0">
                            {getTypeIcon(rep.type)}
                          </span>
                          <span className="font-semibold text-[#17271D]">{rep.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#17271D]">{rep.farmer}</td>
                      <td className="py-3 px-3 text-[#17271D]">{rep.sector}</td>
                      <td className="py-3 px-3 text-[#5B665E]">{rep.cell}</td>
                      <td className="py-3 px-3 text-[#17271D]">{rep.type}</td>
                      <td className="py-3 px-3 text-[#5B665E] tabular-nums">{rep.date}</td>
                      <td className="py-3 px-4 text-right">
                        {renderStatusChip(rep.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3.5 border-t border-[rgba(31,74,52,0.08)] flex items-center justify-between text-[12.5px] text-[#5B665E]">
              <span className="tabular-nums">
                Page {currentPage} of {totalPages} ({filteredAllReports.length} reports)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg bg-[#F4F6EF] text-[#17271D] hover:bg-[#E4ECDB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-[#F4F6EF] text-[#17271D] hover:bg-[#E4ECDB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INSIGHTS */}
      {/* ========================================================================= */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Top Row: Forecast Check KPI Card */}
          <div className="bg-[#FBFCF8] rounded-[16px] p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11.5px] font-semibold text-[#1F4A34]">
                Ground-truth validation
              </span>
              <h3 className="text-[19px] font-semibold text-[#17271D]">
                This season, 38 reports were used to check the forecast. 33 matched (87%).
              </h3>
              <p className="text-[12.5px] text-[#5B665E]">
                Reports are ground-truth data used to validate predictions.
              </p>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-[#E4ECDB] border border-[rgba(31,74,52,0.12)] flex items-center gap-3 flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-[#1F4A34]" />
              <div>
                <span className="text-[26px] font-bold text-[#1F4A34] leading-tight tabular-nums block">
                  87%
                </span>
                <span className="text-[11px] text-[#1F4A34] font-medium">Forecast accuracy</span>
              </div>
            </div>
          </div>

          {/* Grid: 2 Columns for Reports by Type and Reports by Sector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 5 Cols: Reports by Type (Last 7 Days) */}
            <div className="lg:col-span-5 bg-[#FBFCF8] rounded-[16px] p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] space-y-4">
              <div>
                <h3 className="text-[17px] font-semibold text-[#17271D]">
                  Reports by type
                </h3>
                <p className="text-[12px] text-[#5B665E]">
                  Last 7 days · {totalReportsCount} total reports
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                {Object.entries(typesMap).map(([typeName, count]) => {
                  const pct = Math.round((count / totalReportsCount) * 100) || 0;
                  return (
                    <div key={typeName} className="space-y-1">
                      <div className="flex items-center justify-between text-[12.5px]">
                        <span className="font-medium text-[#17271D]">{typeName}</span>
                        <span className="text-[#5B665E] tabular-nums">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[rgba(31,74,52,0.10)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#3E8E55] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 7 Cols: Reports by Sector (Last 7 Days, 15 Sectors Sorted) */}
            <div className="lg:col-span-7 bg-[#FBFCF8] rounded-[16px] p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] space-y-4">
              <div>
                <h3 className="text-[17px] font-semibold text-[#17271D]">
                  Reports by sector
                </h3>
                <p className="text-[12px] text-[#5B665E]">
                  Last 7 days · Sorted by field activity across 15 sectors
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                {sortedSectors.map(([secName, count]) => {
                  const pct = Math.round((count / totalReportsCount) * 100) || 0;
                  const maxBarPct = Math.round((count / 14) * 100); // Relative to Kinigi max (14)
                  return (
                    <div key={secName} className="space-y-1">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="font-semibold text-[#17271D]">{secName}</span>
                        <span className="text-[#5B665E] tabular-nums">
                          {count} {count === 1 ? 'report' : 'reports'} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[rgba(31,74,52,0.10)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#3E8E55] transition-all duration-500"
                          style={{ width: `${maxBarPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
