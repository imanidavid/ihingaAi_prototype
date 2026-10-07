import React, { useState } from 'react';
import {
  Download,
  ArrowRight,
  Shield,
  Sprout,
  Calendar,
  Tag,
  Wheat,
  Bookmark,
  Leaf,
  Check,
} from 'lucide-react';
import { CropAdvisory, UserProfileSettings } from '../types';
import { CROP_ADVISORIES_DATA as CROP_ADVISORIES, PLAN_AHEAD_DATA as PLAN_AHEAD_ITEMS } from '../data/musanzeData';

interface RecommendationsViewProps {
  settings: UserProfileSettings;
  onOpenSettingsNotifications: () => void;
  onSelectAdvisory: (advisory: CropAdvisory) => void;
  savedItemIds: string[];
  onToggleSaveItem: (id: string) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  settings,
  onOpenSettingsNotifications,
  onSelectAdvisory,
  savedItemIds,
  onToggleSaveItem,
}) => {
  const [selectedCrop, setSelectedCrop] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'for_you' | 'saved'>('for_you');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDownloadPdf = () => {
    setToastMessage('PDF downloaded');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveToggle = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onToggleSaveItem(id);
    const isNowSaved = !savedItemIds.includes(id);
    setToastMessage(isNowSaved ? 'Saved' : 'Removed from saved');
    setTimeout(() => setToastMessage(null), 2200);
  };

  // Crop options from settings
  const cropFilterOptions = ['All', ...settings.cropsGrown];

  // Act this week cards filtered by selectedCrop
  const filteredActThisWeek = CROP_ADVISORIES.filter((adv) => {
    if (selectedCrop === 'All') return true;
    return adv.crop.toLowerCase().includes(selectedCrop.toLowerCase());
  });

  // Plan ahead items filtered by selectedCrop
  const filteredPlanAhead = PLAN_AHEAD_ITEMS.filter((item) => {
    if (selectedCrop === 'All') return true;
    if (item.cropTag === 'All crops') return true;
    return item.cropTag.toLowerCase().includes(selectedCrop.toLowerCase());
  });

  // Saved items list
  const allPossibleItems: {
    id: string;
    type: 'card' | 'row';
    cardData?: CropAdvisory;
    rowData?: (typeof PLAN_AHEAD_ITEMS)[0];
  }[] = [
    ...CROP_ADVISORIES.map((adv) => ({
      id: adv.id,
      type: 'card' as const,
      cardData: adv,
    })),
    ...PLAN_AHEAD_ITEMS.map((item) => ({
      id: item.id,
      type: 'row' as const,
      rowData: item,
    })),
  ];

  const savedItems = allPossibleItems.filter((item) =>
    savedItemIds.includes(item.id)
  );

  const getPlanIcon = (type: string) => {
    switch (type) {
      case 'shield':
        return <Shield className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />;
      case 'sprout':
        return <Sprout className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />;
      case 'calendar':
        return <Calendar className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />;
      case 'tag':
        return <Tag className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />;
      case 'wheat':
      default:
        return <Wheat className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1F4A34] text-white text-[13px] font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#E4ECDB]" strokeWidth={2} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-[#17271D]">Recommendations</h1>
          <p className="text-[13px] text-[#5B665E] mt-0.5">
            For your farm in Kinigi, Musanze · based on this week's forecast
          </p>
        </div>
        <button
          onClick={handleDownloadPdf}
          className="px-4 py-2 rounded-full bg-white text-[#1F4A34] border border-[rgba(31,74,52,0.20)] text-[12.5px] font-medium hover:bg-[#E4ECDB] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />
          <span>Download all (PDF)</span>
        </button>
      </div>

      {/* Delivery Card (Thin, full width) */}
      <div className="bg-[#FBFCF8] rounded-[14px] px-4 py-3 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-[13px]">
          <span className="text-[#5B665E]">You receive advice by:</span>
          {settings.isSmsStopped || settings.alertChannel === 'In-app only' ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#17271D]">
              <span className="w-2 h-2 rounded-full bg-[#D9A032]" />
              <span>In-app only</span>
            </span>
          ) : (
            <span className="font-semibold text-[#17271D]">
              {settings.alertChannel} · {settings.messageLanguage}
            </span>
          )}
        </div>
        <button
          onClick={onOpenSettingsNotifications}
          className="text-[12px] font-medium text-[#1F4A34] hover:underline cursor-pointer"
        >
          Change
        </button>
      </div>

      {/* Controls Row: Crop filter chips + Segmented control [For you] [Saved] */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Crop Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {cropFilterOptions.map((crop) => {
            const isSelected = selectedCrop === crop;
            return (
              <button
                key={crop}
                onClick={() => setSelectedCrop(crop)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1F4A34] text-white shadow-xs'
                    : 'bg-white text-[#5B665E] hover:text-[#17271D] border border-[rgba(31,74,52,0.12)]'
                }`}
              >
                {crop}
              </button>
            );
          })}
        </div>

        {/* Segmented Control [For you] [Saved] */}
        <div className="inline-flex bg-[#F4F6EF] p-1 rounded-full border border-[rgba(31,74,52,0.08)]">
          <button
            onClick={() => setActiveTab('for_you')}
            className={`px-4 py-1.5 text-[12px] font-medium rounded-full transition-all cursor-pointer ${
              activeTab === 'for_you'
                ? 'bg-[#3E8E55] text-white shadow-xs'
                : 'text-[#5B665E] hover:text-[#17271D]'
            }`}
          >
            For you
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-1.5 text-[12px] font-medium rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-[#3E8E55] text-white shadow-xs'
                : 'text-[#5B665E] hover:text-[#17271D]'
            }`}
          >
            <span>Saved</span>
            <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] font-semibold flex items-center justify-center">
              {savedItemIds.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB: FOR YOU */}
      {/* ========================================================================= */}
      {activeTab === 'for_you' && (
        <div className="space-y-8">
          {/* SECTION 1 — "Act this week": SAME 3 photo cards as dashboard */}
          <section className="space-y-4">
            <div>
              <h2 className="text-[17px] font-semibold text-[#17271D]">Act this week</h2>
              <p className="text-[12px] text-[#5B665E]">
                Urgent agronomic interventions keyed to Tuesday’s 48 mm rainfall influx
              </p>
            </div>

            {filteredActThisWeek.length === 0 ? (
              <div className="p-6 bg-[#FBFCF8] rounded-[16px] border border-[rgba(31,74,52,0.08)] text-center text-[12.5px] text-[#5B665E]">
                No {selectedCrop} items in this section this week.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {filteredActThisWeek.map((advisory) => {
                  const isSaved = savedItemIds.includes(advisory.id);
                  return (
                    <div
                      key={advisory.id}
                      onClick={() => onSelectAdvisory(advisory)}
                      className="bg-[#FBFCF8] rounded-[16px] p-3.5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between hover:border-[rgba(31,74,52,0.22)] transition-all group cursor-pointer"
                    >
                      <div>
                        {/* Photo Inset Top with 12px radius */}
                        <div className="relative w-full h-[150px] rounded-[12px] overflow-hidden mb-3.5 bg-[#E4ECDB]/40">
                          <img
                            src={advisory.image}
                            alt={advisory.crop}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                          {/* Cream chip over photo bottom-left */}
                          <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-[#FBFCF8]/95 backdrop-blur-xs text-[11px] font-medium text-[#17271D] border border-[rgba(31,74,52,0.12)] shadow-xs">
                            {advisory.badgeLabel}
                          </div>

                          {/* Bookmark Save icon top-right */}
                          <button
                            type="button"
                            onClick={(e) => handleSaveToggle(advisory.id, e)}
                            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md shadow-xs transition-colors cursor-pointer ${
                              isSaved
                                ? 'bg-[#3E8E55] text-white'
                                : 'bg-white/80 text-[#17271D] hover:bg-white'
                            }`}
                            title={isSaved ? 'Remove bookmark' : 'Save advisory'}
                          >
                            <Bookmark className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                        </div>

                        {/* Title row with circular 32px dark green arrow button */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <h3 className="text-[15px] font-semibold text-[#17271D] group-hover:text-[#1F4A34] transition-colors leading-snug">
                            {advisory.title}
                          </h3>
                          <button
                            type="button"
                            aria-label="Open detail"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectAdvisory(advisory);
                            }}
                            className="w-8 h-8 rounded-full bg-[#1F4A34] text-white flex items-center justify-center hover:bg-[#2C6343] transition-colors flex-shrink-0 shadow-xs group-hover:scale-105 cursor-pointer"
                          >
                            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                        </div>

                        {/* One line advice */}
                        <p className="text-[12px] text-[#5B665E] leading-relaxed mb-3">
                          {advisory.oneLineAdvice}
                        </p>

                        {/* Two Stats */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[rgba(31,74,52,0.06)] mb-3">
                          <div>
                            <span className="text-[14px] font-semibold text-[#17271D] block">
                              {advisory.stat1Value}
                            </span>
                            <span className="text-[11px] text-[#5B665E]">
                              {advisory.stat1Label}
                            </span>
                          </div>
                          <div>
                            <span className="text-[14px] font-semibold text-[#17271D] block">
                              {advisory.stat2Value}
                            </span>
                            <span className="text-[11px] text-[#5B665E]">
                              {advisory.stat2Label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tinted footer strip with Spray window opens Tue 14:00 and progress bar */}
                      <div className="bg-[#E4ECDB]/60 rounded-xl p-2.5 border border-[rgba(31,74,52,0.08)]">
                        <div className="flex items-center justify-between text-[11px] font-medium text-[#17271D] mb-1.5">
                          <span>{advisory.windowStatusText}</span>
                          <span className="text-[#3E8E55] font-semibold">
                            {advisory.progressLabel || `${advisory.progressPercent}%`}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#FBFCF8] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#3E8E55] rounded-full transition-all duration-500"
                            style={{ width: `${advisory.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* SECTION 2 — "Plan ahead": one List card, one row per category */}
          <section className="space-y-4">
            <div>
              <h2 className="text-[17px] font-semibold text-[#17271D]">Plan ahead</h2>
              <p className="text-[12px] text-[#5B665E]">
                Seasonal milestones, input applications, and variety selections for Season 2026/27 A & B
              </p>
            </div>

            {filteredPlanAhead.length === 0 ? (
              <div className="p-6 bg-[#FBFCF8] rounded-[16px] border border-[rgba(31,74,52,0.08)] text-center text-[12.5px] text-[#5B665E]">
                No {selectedCrop} items in this section this week.
              </div>
            ) : (
              <div className="bg-[#FBFCF8] rounded-[16px] border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] divide-y divide-[rgba(31,74,52,0.06)] overflow-hidden">
                {filteredPlanAhead.map((item) => {
                  const isSaved = savedItemIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectAdvisory(item.advisoryEquivalent)}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-[rgba(31,74,52,0.02)] transition-colors cursor-pointer group"
                    >
                      {/* Left: category icon + title + one-line rationale */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-full bg-[#E4ECDB] border border-[rgba(31,74,52,0.12)] flex items-center justify-center flex-shrink-0 mt-0.5">
                          {getPlanIcon(item.iconType)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <span className="text-[11px] font-semibold text-[#1F4A34]">
                              {item.category}
                            </span>
                            <span className="text-[11px] text-[#5B665E]">·</span>
                            <span className="text-[11px] text-[#5B665E] font-medium">
                              {item.cropTag}
                            </span>
                          </div>
                          <h4 className="text-[14px] font-semibold text-[#17271D] group-hover:text-[#1F4A34] transition-colors leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-[12px] text-[#5B665E] mt-0.5 leading-relaxed">
                            {item.oneLineRationale}
                          </p>
                        </div>
                      </div>

                      {/* Right: timing chip + save bookmark + arrow button */}
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#F4F6EF] text-[#17271D] border border-[rgba(31,74,52,0.10)]">
                          {item.timingChip}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleSaveToggle(item.id, e)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                            isSaved
                              ? 'bg-[#3E8E55] text-white'
                              : 'bg-white text-[#5B665E] hover:text-[#17271D] border border-[rgba(31,74,52,0.15)]'
                          }`}
                          title={isSaved ? 'Saved' : 'Save'}
                        >
                          <Bookmark className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>

                        <div className="w-8 h-8 rounded-full bg-[#1F4A34] text-white flex items-center justify-center group-hover:bg-[#2C6343] transition-colors shadow-xs">
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: SAVED */}
      {/* ========================================================================= */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[rgba(31,74,52,0.06)]">
            <h2 className="text-[17px] font-semibold text-[#17271D]">Saved advice</h2>
            <span className="text-[12px] text-[#5B665E] font-medium">
              {savedItems.length} item{savedItems.length === 1 ? '' : 's'} bookmarked
            </span>
          </div>

          {savedItems.length === 0 ? (
            /* Empty state: leaf icon + "No saved advice yet" */
            <div className="bg-[#FBFCF8] rounded-[20px] p-12 text-center border border-[rgba(31,74,52,0.10)] shadow-xs flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#E4ECDB] flex items-center justify-center text-[#1F4A34]">
                <Leaf className="w-6 h-6 text-[#1F4A34]" strokeWidth={1.5} />
              </div>
              <h3 className="text-[16px] font-semibold text-[#17271D]">No saved advice yet</h3>
              <p className="text-[13px] text-[#5B665E] max-w-sm">
                Tap the bookmark icon on any advisory card or planning row to keep it here for quick offline access.
              </p>
            </div>
          ) : (
            <div className="bg-[#FBFCF8] rounded-[16px] border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] divide-y divide-[rgba(31,74,52,0.06)] overflow-hidden">
              {savedItems.map((item) => {
                if (item.type === 'card' && item.cardData) {
                  const card = item.cardData;
                  return (
                    <div
                      key={card.id}
                      onClick={() => onSelectAdvisory(card)}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-[rgba(31,74,52,0.02)] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={card.image}
                          alt={card.crop}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[11px] font-medium text-[#1F4A34]">
                            {card.badgeLabel}
                          </span>
                          <h4 className="text-[14px] font-semibold text-[#17271D] group-hover:text-[#1F4A34] transition-colors leading-snug">
                            {card.title}
                          </h4>
                          <p className="text-[12px] text-[#5B665E] leading-normal line-clamp-1">
                            {card.oneLineAdvice}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-[11px] font-medium text-[#1F4A34] bg-[#E4ECDB] px-2.5 py-1 rounded-full">
                          {card.windowStatusText}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleSaveToggle(card.id, e)}
                          className="px-3 py-1 rounded-full text-[11px] font-medium text-[#C93B3B] hover:bg-[#C93B3B]/10 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                        <div className="w-8 h-8 rounded-full bg-[#1F4A34] text-white flex items-center justify-center group-hover:bg-[#2C6343] transition-colors shadow-xs">
                          <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </div>
                      </div>
                    </div>
                  );
                } else if (item.type === 'row' && item.rowData) {
                  const row = item.rowData;
                  return (
                    <div
                      key={row.id}
                      onClick={() => onSelectAdvisory(row.advisoryEquivalent)}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-[rgba(31,74,52,0.02)] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-full bg-[#E4ECDB] border border-[rgba(31,74,52,0.12)] flex items-center justify-center flex-shrink-0 mt-0.5">
                          {getPlanIcon(row.iconType)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[11px] font-semibold text-[#1F4A34]">
                              {row.category}
                            </span>
                            <span className="text-[11px] text-[#5B665E]">·</span>
                            <span className="text-[11px] text-[#5B665E] font-medium">
                              {row.cropTag}
                            </span>
                          </div>
                          <h4 className="text-[14px] font-semibold text-[#17271D] group-hover:text-[#1F4A34] transition-colors leading-snug">
                            {row.title}
                          </h4>
                          <p className="text-[12px] text-[#5B665E] mt-0.5 leading-relaxed">
                            {row.oneLineRationale}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#F4F6EF] text-[#17271D] border border-[rgba(31,74,52,0.10)]">
                          {row.timingChip}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleSaveToggle(row.id, e)}
                          className="px-3 py-1 rounded-full text-[11px] font-medium text-[#C93B3B] hover:bg-[#C93B3B]/10 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                        <div className="w-8 h-8 rounded-full bg-[#1F4A34] text-white flex items-center justify-center group-hover:bg-[#2C6343] transition-colors shadow-xs">
                          <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
