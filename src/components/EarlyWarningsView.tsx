import React from 'react';
import {
  AlertTriangle,
  Clock,
  MapPin,
  ShieldAlert,
  History,
  ArrowRight,
} from 'lucide-react';
import { AlertItem } from '../types';

interface EarlyWarningsViewProps {
  alerts?: AlertItem[];
  onSelectAlert: (alert: AlertItem) => void;
}

export const EarlyWarningsView: React.FC<EarlyWarningsViewProps> = ({
  alerts,
  onSelectAlert,
}) => {
  const allAlerts = alerts || [];
  const activeWarnings = allAlerts.filter((a) => a.status === 'Active');
  const warningHistory = allAlerts.filter((a) => a.status === 'Expired');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-[24px] font-semibold text-[#17271D]">Early warnings</h1>
          <span className="px-2.5 py-0.5 rounded-full bg-[#D9772F]/15 text-[#D9772F] text-[11px] font-semibold">
            {activeWarnings.length} active
          </span>
        </div>
        <p className="text-[13px] text-[#5B665E] mt-1">
          High-priority agro-climatic hazard notices and rapid mitigation instructions.
        </p>
      </div>

      {/* Active Warnings */}
      <div className="space-y-4">
        <h2 className="text-[16px] font-semibold text-[#17271D] flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#D9772F]" strokeWidth={1.5} />
          <span>Active warnings ({activeWarnings.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {activeWarnings.map((warning) => {
            const isHigh = warning.severity === 'High';
            return (
              <div
                key={warning.id}
                onClick={() => onSelectAlert(warning)}
                className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.12)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between hover:border-[rgba(31,74,52,0.25)] transition-all cursor-pointer group"
              >
                <div>
                  {/* Top line: severity badge + timestamp */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                        isHigh
                          ? 'bg-[#D9772F]/15 text-[#D9772F]'
                          : 'bg-[#D9A032]/20 text-[#9E6905]'
                      }`}
                    >
                      {warning.severity}
                    </span>
                    <span className="text-[12px] text-[#5B665E]">{warning.timestamp}</span>
                  </div>

                  {/* Title & Category */}
                  <h3 className="text-[17px] font-semibold text-[#17271D] group-hover:text-[#1F4A34] transition-colors leading-snug">
                    {warning.title}
                  </h3>
                  <span className="text-[12px] text-[#5B665E] block mt-0.5">
                    Category: {warning.category}
                  </span>

                  {/* Meta details: Area & Timeframe (no ellipsis) */}
                  <div className="mt-3.5 bg-[#F4F6EF] rounded-xl p-3 space-y-2 text-[12px] border border-[rgba(31,74,52,0.06)]">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#1F4A34] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                      <div>
                        <span className="text-[#5B665E]">Affected area: </span>
                        <span className="font-medium text-[#17271D]">{warning.affectedArea}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#1F4A34] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                      <div>
                        <span className="text-[#5B665E]">Timeframe: </span>
                        <span className="font-medium text-[#17271D]">{warning.timeframe}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer action trigger */}
                <div className="mt-4 pt-3 border-t border-[rgba(31,74,52,0.06)] flex items-center justify-between text-[12px]">
                  <span className="text-[#5B665E]">Review field actions</span>
                  <div className="w-8 h-8 rounded-full bg-[#1F4A34] text-white flex items-center justify-center group-hover:bg-[#2C6343] transition-colors shadow-xs">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Warning History Section (Muted styling with "Expired" status chip) */}
      <div className="pt-2">
        <h2 className="text-[16px] font-semibold text-[#5B665E] flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-[#5B665E]" strokeWidth={1.5} />
          <span>Warning history</span>
        </h2>

        <div className="bg-[#FBFCF8] rounded-[16px] p-4 border border-[rgba(31,74,52,0.08)] shadow-xs divide-y divide-[rgba(31,74,52,0.06)]">
          {warningHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectAlert(item)}
              className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-4 cursor-pointer hover:bg-[rgba(31,74,52,0.02)] -mx-2 px-2 rounded-lg transition-colors opacity-75 hover:opacity-100"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5B665E]/40 flex-shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-[14px] font-medium text-[#17271D]">{item.title}</h4>
                  <span className="text-[11px] text-[#5B665E]">
                    {item.affectedArea} · {item.timeframe}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-[11px] text-[#5B665E]">{item.timestamp}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-medium bg-[#F4F6EF] text-[#5B665E] border border-[rgba(31,74,52,0.08)]">
                  Expired
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
