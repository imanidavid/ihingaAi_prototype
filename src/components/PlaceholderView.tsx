import React from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { NavView } from '../types';

interface PlaceholderViewProps {
  viewId: NavView;
  title: string;
  onBackToDashboard: () => void;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  title,
  onBackToDashboard,
}) => {
  return (
    <div className="bg-[#FBFCF8] rounded-[16px] p-8 md:p-12 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] min-h-[420px] flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-full bg-[#E4ECDB] border border-[rgba(31,74,52,0.12)] flex items-center justify-center text-[#1F4A34] mb-4">
        <Clock className="w-6 h-6 text-[#1F4A34]" strokeWidth={1.5} />
      </div>

      <h2 className="text-[24px] font-semibold text-[#17271D] mb-2">
        {title}
      </h2>

      <p className="text-[14px] text-[#5B665E] max-w-md mb-6">
        Screen designed in next iteration.
      </p>

      <button
        onClick={onBackToDashboard}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1F4A34] text-white text-[13px] font-medium hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        <span>Back to Dashboard</span>
      </button>
    </div>
  );
};
