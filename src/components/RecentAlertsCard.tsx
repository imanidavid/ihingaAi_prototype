import React from 'react';
import { ChevronRight } from 'lucide-react';
import { AlertItem } from '../types';
import { MUSANZE_RECORD } from '../data/musanzeData';

interface RecentAlertsCardProps {
  alerts?: AlertItem[];
  onSelectAlert: (alert: AlertItem) => void;
  onViewAll?: () => void;
}

export const RecentAlertsCard: React.FC<RecentAlertsCardProps> = ({
  alerts,
  onSelectAlert,
  onViewAll,
}) => {
  const alertList = alerts || [];
  const activeCount = alertList.filter((a) => a.status === 'Active').length;

  const getSeverityDot = (severity: AlertItem['severity'], isExpired: boolean) => {
    if (isExpired) return 'bg-[#5B665E]/40';
    switch (severity) {
      case 'Critical':
        return 'bg-[#C93B3B]';
      case 'High':
        return 'bg-[#D9772F]';
      case 'Watch':
        return 'bg-[#D9A032]';
      case 'Low':
      default:
        return 'bg-[#3E8E55]';
    }
  };

  return (
    <div className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[rgba(31,74,52,0.06)]">
        <div className="flex items-center gap-2">
          <h3 className="text-[16px] font-semibold text-[#17271D]">Recent alerts</h3>
          <span className="px-2 py-0.5 rounded-full bg-[#D9772F]/15 text-[#D9772F] text-[10px] font-semibold">
            {activeCount} active
          </span>
        </div>
        <button
          onClick={onViewAll}
          className="text-[12px] font-medium text-[#1F4A34] hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Alert Rows */}
      <div className="space-y-3 divide-y divide-[rgba(31,74,52,0.05)]">
        {alertList.map((alert) => {
          const isExpired = alert.status === 'Expired';
          return (
            <div
              key={alert.id}
              onClick={() => onSelectAlert(alert)}
              className={`pt-2.5 first:pt-0 flex items-center justify-between gap-3 group cursor-pointer -mx-2 px-2 py-1 rounded-lg transition-colors ${
                isExpired
                  ? 'opacity-65 hover:opacity-90 hover:bg-[rgba(31,74,52,0.02)]'
                  : 'hover:bg-[rgba(31,74,52,0.02)]'
              }`}
            >
              {/* Left: colored dot + title & area (no ellipses) */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getSeverityDot(
                    alert.severity,
                    isExpired
                  )}`}
                />
                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-[13px] font-medium transition-colors ${
                      isExpired
                        ? 'text-[#5B665E]'
                        : 'text-[#17271D] group-hover:text-[#1F4A34]'
                    }`}
                  >
                    {alert.title}
                  </span>
                  <span className="text-[11px] text-[#5B665E] leading-tight">
                    {alert.affectedArea}
                  </span>
                </div>
              </div>

              {/* Right: timestamp + chip */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[11px] text-[#5B665E]">{alert.timestamp}</span>
                {isExpired ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F4F6EF] text-[#5B665E] border border-[rgba(31,74,52,0.08)]">
                    Expired
                  </span>
                ) : (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      alert.severity === 'Critical'
                        ? 'bg-[#C93B3B]/15 text-[#C93B3B]'
                        : alert.severity === 'High'
                        ? 'bg-[#D9772F]/15 text-[#D9772F]'
                        : 'bg-[#D9A032]/15 text-[#9E6905]'
                    }`}
                  >
                    {alert.severity}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom prompt note */}
      <div className="pt-3 border-t border-[rgba(31,74,52,0.06)] mt-2 flex items-center justify-between text-[11px] text-[#5B665E]">
        <span>Select an alert to see what to do</span>
        <span className="font-semibold text-[#D9772F]">{activeCount} require action</span>
      </div>
    </div>
  );
};
