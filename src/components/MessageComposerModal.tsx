import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Smartphone,
  PhoneCall,
  Bell,
  Check,
  Users,
  Info,
} from 'lucide-react';
import { CoopGroup, CoopMember, CoopMessage } from '../types';
import { computeChannelSplit } from '../data/musanzeData';

interface MessageComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: CoopMessage) => void;
  prefillTargetGroup?: string;
  prefillEn?: string;
  prefillRw?: string;
  /** Cooperative groups computed from the store (names and member counts). */
  groups: CoopGroup[];
  /** Direct message to one member instead of groups. */
  prefillMember?: CoopMember | null;
}

export const MessageComposerModal: React.FC<MessageComposerModalProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  prefillTargetGroup = 'All groups',
  prefillEn = '',
  prefillRw = '',
  groups,
  prefillMember = null,
}) => {
  const COOP_GROUPS = groups.map((g) => ({ id: g.id, name: g.name, count: g.membersCount }));
  const TOTAL_MEMBERS = COOP_GROUPS.reduce((sum, g) => sum + g.count, 0);
  const GROUPS_LIST = [{ id: 'all', name: 'All groups', count: TOTAL_MEMBERS }, ...COOP_GROUPS];

  const [selectedGroups, setSelectedGroups] = useState<string[]>(['All groups']);
  const [messageEn, setMessageEn] = useState('');
  const [messageRw, setMessageRw] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<('SMS' | 'Voice' | 'In-app')[]>([
    'SMS',
    'Voice',
    'In-app',
  ]);
  const [previewTab, setPreviewTab] = useState<'rw' | 'en'>('rw');

  // Sync prefills when opening or props change
  useEffect(() => {
    if (isOpen) {
      if (prefillTargetGroup) {
        if (prefillTargetGroup === 'All groups' || prefillTargetGroup.toLowerCase().includes('all')) {
          setSelectedGroups(['All groups']);
        } else {
          setSelectedGroups([prefillTargetGroup]);
        }
      } else {
        setSelectedGroups(['All groups']);
      }
      setMessageEn(prefillEn || '');
      setMessageRw(prefillRw || '');
      setSelectedChannels(['SMS', 'Voice', 'In-app']);
    }
  }, [isOpen, prefillTargetGroup, prefillEn, prefillRw]);

  // Compute total reached members
  const reachedCount = useMemo(() => {
    if (prefillMember) return 1;
    if (selectedGroups.includes('All groups')) {
      return TOTAL_MEMBERS;
    }
    return COOP_GROUPS.filter((g) => selectedGroups.includes(g.name)).reduce(
      (sum, g) => sum + g.count,
      0
    );
  }, [selectedGroups, prefillMember, TOTAL_MEMBERS, COOP_GROUPS]);

  const sharePct = (n: number) => (reachedCount > 0 ? Math.round((n / reachedCount) * 100) : 0);

  // Compute live channel delivery split
  const channelSplit = useMemo(() => {
    return computeChannelSplit(reachedCount);
  }, [reachedCount]);

  if (!isOpen) return null;

  const handleToggleGroup = (groupName: string) => {
    if (groupName === 'All groups') {
      setSelectedGroups(['All groups']);
      return;
    }

    let next = selectedGroups.filter((g) => g !== 'All groups');
    if (next.includes(groupName)) {
      next = next.filter((g) => g !== groupName);
      if (next.length === 0) {
        next = ['All groups'];
      }
    } else {
      next.push(groupName);
      // If every individual group is selected, collapse into All groups
      if (next.length >= COOP_GROUPS.length) {
        next = ['All groups'];
      }
    }
    setSelectedGroups(next);
  };

  const handleToggleChannel = (channel: 'SMS' | 'Voice' | 'In-app') => {
    if (selectedChannels.includes(channel)) {
      if (selectedChannels.length === 1) return; // Keep at least one
      setSelectedChannels(selectedChannels.filter((c) => c !== channel));
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const handleSend = () => {
    const finalEn = messageEn.trim() || 'Cooperative advisory from Musanze Potato Growers Cooperative.';
    const finalRw = messageRw.trim() || "Ubutumwa bwa koperative y'abahinzi b'ibirayi ya Musanze.";

    const newMessage: CoopMessage = {
      id: `msg-coop-demo-${Date.now()}`,
      senderName: 'Aline Uwimana',
      senderCoop: 'Musanze Potato Growers Cooperative',
      groups: prefillMember ? [prefillMember.fullName] : selectedGroups,
      ...(prefillMember ? { recipientMemberIds: [prefillMember.id] } : {}),
      recipientCount: reachedCount,
      deliveredCount: reachedCount,
      channelSplit,
      channels: selectedChannels,
      sentAt: '28/09 14:02',
      messageEn: finalEn,
      messageRw: finalRw,
      isDemo: true,
    };

    onSendMessage(newMessage);
    onClose();
  };

  const isSendDisabled = !messageEn.trim() && !messageRw.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FBFCF8] rounded-[24px] max-w-[620px] w-full border border-[rgba(31,74,52,0.15)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 md:p-6 pb-4 border-b border-[rgba(31,74,52,0.10)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#E4ECDB] flex items-center justify-center text-[#1F4A34]">
              <MessageSquare className="w-4 h-4 text-[#1F4A34]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#17271D] leading-tight">
                {prefillMember ? 'Message a member' : 'Send member broadcast'}
              </h2>
              <p className="text-[11.5px] text-[#5B665E]">
                Musanze Potato Growers Cooperative · Aline Uwimana
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F4F6EF] flex items-center justify-center text-[#5B665E] hover:text-[#17271D] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-5 flex-1 text-[12.5px]">
          {/* 1. To: Group chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-[#17271D] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#1F4A34]" />
                <span>To</span>
              </label>
              <span className="text-[11.5px] font-semibold text-[#1F4A34] bg-[#E4ECDB]/70 px-2.5 py-0.5 rounded-full">
                Will reach {reachedCount} {reachedCount === 1 ? 'member' : 'members'}
              </span>
            </div>

            {prefillMember ? (
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-full text-[12px] font-medium border bg-[#1F4A34] text-white border-[#1F4A34] flex items-center gap-1.5">
                  {prefillMember.fullName}
                </span>
              </div>
            ) : (
            <div className="flex flex-wrap gap-2">
              {GROUPS_LIST.map((g) => {
                const isSelected = selectedGroups.includes(g.name);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleToggleGroup(g.name)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#1F4A34] text-white border-[#1F4A34] shadow-xs'
                        : 'bg-white text-[#5B665E] border-[rgba(31,74,52,0.15)] hover:bg-[#F4F6EF]'
                    }`}
                  >
                    <span>{g.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-[#F4F6EF] text-[#5B665E]'
                      }`}
                    >
                      {g.count}
                    </span>
                  </button>
                );
              })}
            </div>
            )}
          </div>

          {/* 2. Message: English & Kinyarwanda fields */}
          <div className="space-y-4">
            {/* English Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11.5px]">
                <label className="font-semibold text-[#17271D]">Message (English)</label>
                <span
                  className={`tabular-nums ${
                    messageEn.length > 160 ? 'text-[#D9772F] font-semibold' : 'text-[#5B665E]'
                  }`}
                >
                  {messageEn.length}/160 characters
                </span>
              </div>
              <textarea
                value={messageEn}
                onChange={(e) => setMessageEn(e.target.value)}
                placeholder="Write the English message to cooperative members..."
                rows={3}
                className="w-full p-3 rounded-xl bg-white border border-[rgba(31,74,52,0.18)] focus:border-[#1F4A34] focus:ring-1 focus:ring-[#1F4A34] text-[12.5px] text-[#17271D] placeholder:text-[#5B665E]/60 transition-colors resize-none"
              />
            </div>

            {/* Kinyarwanda Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11.5px]">
                <label className="font-semibold text-[#17271D]">
                  Message (Kinyarwanda)
                </label>
                <span
                  className={`tabular-nums ${
                    messageRw.length > 160 ? 'text-[#D9772F] font-semibold' : 'text-[#5B665E]'
                  }`}
                >
                  {messageRw.length}/160 characters
                </span>
              </div>
              <textarea
                value={messageRw}
                onChange={(e) => setMessageRw(e.target.value)}
                placeholder="Write the Kinyarwanda message"
                rows={3}
                className="w-full p-3 rounded-xl bg-white border border-[rgba(31,74,52,0.18)] focus:border-[#1F4A34] focus:ring-1 focus:ring-[#1F4A34] text-[12.5px] text-[#17271D] placeholder:text-[#5B665E]/60 transition-colors resize-none"
              />
            </div>
          </div>

          {/* 3. Channels & Delivery Split */}
          <div className="space-y-2 pt-1 border-t border-[rgba(31,74,52,0.08)]">
            <label className="font-semibold text-[#17271D] block">Channels</label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* SMS */}
              <button
                type="button"
                onClick={() => handleToggleChannel('SMS')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedChannels.includes('SMS')
                    ? 'bg-[#1F4A34]/8 border-[#1F4A34] text-[#1F4A34]'
                    : 'bg-white border-[rgba(31,74,52,0.12)] text-[#5B665E] opacity-70'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 font-semibold text-[12px]">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>SMS</span>
                  </div>
                  {selectedChannels.includes('SMS') && (
                    <Check className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={2.5} />
                  )}
                </div>
                <div className="text-[11px] font-medium mt-1 tabular-nums">
                  {channelSplit.sms} members ({sharePct(channelSplit.sms)}%)
                </div>
              </button>

              {/* Voice */}
              <button
                type="button"
                onClick={() => handleToggleChannel('Voice')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedChannels.includes('Voice')
                    ? 'bg-[#1F4A34]/8 border-[#1F4A34] text-[#1F4A34]'
                    : 'bg-white border-[rgba(31,74,52,0.12)] text-[#5B665E] opacity-70'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 font-semibold text-[12px]">
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Voice</span>
                  </div>
                  {selectedChannels.includes('Voice') && (
                    <Check className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={2.5} />
                  )}
                </div>
                <div className="text-[11px] font-medium mt-1 tabular-nums">
                  {channelSplit.voice} members ({sharePct(channelSplit.voice)}%)
                </div>
              </button>

              {/* In-app */}
              <button
                type="button"
                onClick={() => handleToggleChannel('In-app')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedChannels.includes('In-app')
                    ? 'bg-[#1F4A34]/8 border-[#1F4A34] text-[#1F4A34]'
                    : 'bg-white border-[rgba(31,74,52,0.12)] text-[#5B665E] opacity-70'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 font-semibold text-[12px]">
                    <Bell className="w-3.5 h-3.5" />
                    <span>In-app</span>
                  </div>
                  {selectedChannels.includes('In-app') && (
                    <Check className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={2.5} />
                  )}
                </div>
                <div className="text-[11px] font-medium mt-1 tabular-nums">
                  {channelSplit.inApp} members ({sharePct(channelSplit.inApp)}%)
                </div>
              </button>
            </div>
          </div>

          {/* 4. SMS Preview Bubble */}
          <div className="space-y-1.5 pt-1 border-t border-[rgba(31,74,52,0.08)]">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-[#17271D]">Farmer SMS preview</label>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPreviewTab('rw')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    previewTab === 'rw'
                      ? 'bg-[#1F4A34] text-white font-semibold'
                      : 'text-[#5B665E] hover:text-[#17271D]'
                  }`}
                >
                  Kinyarwanda
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('en')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    previewTab === 'en'
                      ? 'bg-[#1F4A34] text-white font-semibold'
                      : 'text-[#5B665E] hover:text-[#17271D]'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <div className="bg-[#EAEFE6] rounded-2xl p-3.5 border border-[rgba(31,74,52,0.12)] flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#1F4A34] text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                MPGC
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-[#1F4A34] flex items-center justify-between">
                  <span>IHINGA AI · Musanze Potato Growers</span>
                  <span className="text-[10px] text-[#5B665E] font-normal">Now</span>
                </div>
                <p className="text-[12px] text-[#17271D] mt-1 leading-snug whitespace-pre-wrap">
                  {previewTab === 'rw'
                    ? messageRw.trim() ||
                      "Ubutumwa bwa koperative y'abahinzi b'ibirayi ya Musanze: Nimugana mu biro bya koperative cyangwa mu matsinda yanyu."
                    : messageEn.trim() ||
                      'Notice from Musanze Potato Growers Cooperative: Please check group schedules and field recommendations.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 md:p-5 border-t border-[rgba(31,74,52,0.10)] bg-[#F4F6EF]/50 flex items-center justify-between">
          <div className="text-[11px] text-[#5B665E] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#1F4A34]" />
            <span>
              Delivery breakdown: SMS {channelSplit.sms} · Voice {channelSplit.voice} · In-app {channelSplit.inApp}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[rgba(31,74,52,0.20)] text-[#5B665E] hover:text-[#17271D] hover:bg-white text-[12.5px] font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={isSendDisabled}
              className={`px-5 py-2 rounded-full text-white text-[12.5px] font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-98 ${
                isSendDisabled
                  ? 'bg-[#1F4A34]/50 cursor-not-allowed opacity-60'
                  : 'bg-[#1F4A34] hover:bg-[#2C6343]'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send message</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
