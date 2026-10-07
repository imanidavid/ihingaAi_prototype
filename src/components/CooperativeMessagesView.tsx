import React from 'react';
import {
  MessageSquare,
  Plus,
  Send,
  Smartphone,
  PhoneCall,
  Bell,
  CheckCircle2,
  Users,
  Search,
} from 'lucide-react';
import { CoopMessage } from '../types';

interface CooperativeMessagesViewProps {
  messages: CoopMessage[];
  onOpenMessageComposer: () => void;
  onSelectMessage: (msg: CoopMessage) => void;
}

export const CooperativeMessagesView: React.FC<CooperativeMessagesViewProps> = ({
  messages,
  onOpenMessageComposer,
  onSelectMessage,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[rgba(31,74,52,0.08)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-semibold text-[#17271D]">Member broadcasts & messages</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[11px] font-semibold">
              {messages.length} sent
            </span>
          </div>
          <p className="text-[13px] text-[#5B665E] mt-1">
            Broadcast advisories, meeting notifications and agro-climatic alerts to cooperative grower groups.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenMessageComposer}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1F4A34] text-white text-[13px] font-semibold hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer active:scale-98 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>New broadcast</span>
        </button>
      </div>

      {/* Messages List */}
      <div className="space-y-3.5">
        {messages.map((msg) => {
          const split = msg.channelSplit || {
            sms: Math.round((msg.deliveredCount || 82) * 0.82),
            voice: Math.round((msg.deliveredCount || 82) * 0.07),
            inApp: Math.round((msg.deliveredCount || 82) * 0.11),
          };

          return (
            <div
              key={msg.id}
              onClick={() => onSelectMessage(msg)}
              className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.04)] hover:border-[rgba(31,74,52,0.22)] transition-all cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-2 flex-1 min-w-0">
                  {/* Top metadata row */}
                  <div className="flex flex-wrap items-center gap-2 text-[12px]">
                    <span className="font-semibold text-[#1F4A34] bg-[#E4ECDB]/60 px-2.5 py-0.5 rounded-full border border-[rgba(31,74,52,0.10)]">
                      {msg.groups.join(', ')}
                    </span>
                    <span className="text-[#5B665E]">·</span>
                    <span className="text-[#5B665E] font-medium">{msg.sentAt}</span>
                    <span className="text-[#5B665E]">·</span>
                    <span className="text-[#17271D] font-semibold">
                      {msg.deliveredCount || msg.recipientCount} delivered
                    </span>
                  </div>

                  {/* Message body */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[13.5px] font-medium text-[#17271D] leading-snug group-hover:text-[#1F4A34] transition-colors">
                      {msg.messageRw}
                    </p>
                    <p className="text-[12px] text-[#5B665E] leading-relaxed">
                      {msg.messageEn}
                    </p>
                  </div>
                </div>

                {/* Right side: Channel split badges */}
                <div className="flex flex-wrap md:flex-col items-end gap-1.5 flex-shrink-0 pt-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F4F6EF] border border-[rgba(31,74,52,0.08)] text-[11.5px] font-medium text-[#17271D]">
                    <span className="flex items-center gap-1" title="SMS delivery">
                      <Smartphone className="w-3 h-3 text-[#1F4A34]" />
                      <span>SMS {split.sms}</span>
                    </span>
                    <span className="text-[#5B665E]/40">·</span>
                    <span className="flex items-center gap-1" title="Voice call delivery">
                      <PhoneCall className="w-3 h-3 text-[#1F4A34]" />
                      <span>Voice {split.voice}</span>
                    </span>
                    <span className="text-[#5B665E]/40">·</span>
                    <span className="flex items-center gap-1" title="In-app notification">
                      <Bell className="w-3 h-3 text-[#1F4A34]" />
                      <span>In-app {split.inApp}</span>
                    </span>
                  </div>
                  <span className="text-[11px] text-[#5B665E] pr-1">
                    Tap to view delivery receipt
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
