import React, { useEffect, useMemo, useState } from 'react';
import {
  BellRing,
  CalendarClock,
  Check,
  HelpCircle,
  Inbox,
  Info,
  MessageSquare,
  PhoneCall,
  Plus,
  Smartphone,
  UserX,
} from 'lucide-react';
import {
  CoopGroupRecord,
  CoopMeeting,
  CoopMember,
  CoopMessage,
  MessageTemplate,
  UserProfileSettings,
  VoiceSettings,
  WarningItem,
} from '../types';
import {
  NOW,
  SCHEDULED_MESSAGES,
  SEEDED_SMS_OPT_OUTS,
  SMS_MAX_CHARS,
  SMS_REPLIES,
  computeChannelSplit,
  formatDMY,
  formatDayShort,
  meetingAudienceLabel,
  meetingInviteeCount,
  parseDMY,
  NOW_DATE,
} from '../data/musanzeData';
import { maskPhone } from '../data/rwandaAdminData';
import { PillSelect } from './PillSelect';
import {
  CARD_CLASS,
  EmptyState,
  IconCircle,
  NeutralChip,
  PageHeader,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  SegmentedTabs,
  Toggle,
} from './coop/CoopUi';

type NotifTab = 'history' | 'templates' | 'optouts' | 'inbox' | 'scheduled';

interface HistoryRow {
  id: string;
  sortKey: number;
  when: string;
  kind: 'Warning' | 'Cooperative' | 'Meeting invitation';
  title: string;
  audience: string;
  sms: number;
  voice: number;
  inApp: number;
  failed: number;
}

/** 'DD/MM HH:MM' or 'DD/MM' (2026) -> sortable number */
const dmKey = (s?: string) => {
  const m = s?.match(/(\d{2})\/(\d{2})(?:\/\d{4})?(?:\s+(\d{2}):(\d{2}))?/);
  return m ? Number(`${m[2]}${m[1]}${m[3] || '00'}${m[4] || '00'}`) : 0;
};

interface AdminNotificationsViewProps {
  warnings: WarningItem[];
  messages: CoopMessage[];
  meetings: CoopMeeting[];
  members: CoopMember[];
  groupRecords: CoopGroupRecord[];
  userSettings: UserProfileSettings;
  templates: MessageTemplate[];
  voiceSettings: VoiceSettings;
  onSaveTemplate: (t: MessageTemplate) => void;
  onSaveVoiceSettings: (v: VoiceSettings) => void;
  onOpenComposer: () => void;
}

export const AdminNotificationsView: React.FC<AdminNotificationsViewProps> = (props) => {
  const [tab, setTab] = useState<NotifTab>('history');

  // Every message in the store: warnings, cooperative messages and meeting invitations
  const history = useMemo<HistoryRow[]>(() => {
    const fromWarnings = props.warnings.map((w) => {
      const ch = (name: string) => w.channels?.find((c) => c.channel === name);
      const fallback = computeChannelSplit(w.farmersReached || 0);
      return {
        id: w.id,
        sortKey: dmKey(w.issuedAt || w.issuedDate),
        when: w.issuedAt || w.issuedDate || '',
        kind: 'Warning' as const,
        title: `${w.title} · ${w.severity}`,
        audience: w.affectedArea,
        sms: ch('SMS')?.delivered ?? fallback.sms,
        voice: ch('Voice')?.delivered ?? fallback.voice,
        inApp: ch('In-app')?.delivered ?? fallback.inApp,
        failed: (w.channels || []).reduce((s, c) => s + c.failed, 0),
      };
    });
    const fromMessages = props.messages.map((m) => ({
      id: m.id,
      sortKey: dmKey(m.sentAt),
      when: m.sentAt,
      kind: 'Cooperative' as const,
      title: m.messageEn,
      audience: m.groups.join(', '),
      sms: m.channelSplit.sms,
      voice: m.channelSplit.voice,
      inApp: m.channelSplit.inApp,
      failed: 0,
    }));
    const fromMeetings = props.meetings
      .filter((m) => m.smsInvite)
      .map((m) => {
        const split = computeChannelSplit(meetingInviteeCount(m, props.members));
        return {
          id: m.id,
          sortKey: dmKey(m.date),
          when: `For ${formatDayShort(m.date)}`,
          kind: 'Meeting invitation' as const,
          title: m.title,
          audience: meetingAudienceLabel(m, props.groupRecords),
          sms: split.sms,
          voice: split.voice,
          inApp: split.inApp,
          failed: 0,
        };
      });
    return [...fromWarnings, ...fromMessages, ...fromMeetings].sort((a, b) => b.sortKey - a.sortKey);
  }, [props.warnings, props.messages, props.meetings, props.members, props.groupRecords]);

  // Opt-outs: seeded + Jean-Baptiste when he stops SMS in Settings (cross-role)
  const optOuts = useMemo(() => {
    const list = [...SEEDED_SMS_OPT_OUTS];
    if (props.userSettings.isSmsStopped) {
      list.unshift({
        id: 'opt-current-farmer',
        name: props.userSettings.fullName,
        phone: props.userSettings.phone,
        sector: props.userSettings.sector,
        since: NOW.dateFormatted,
        via: 'Stopped SMS in Settings',
      });
    }
    return list;
  }, [props.userSettings]);

  // Scheduled: seeded + a reminder at 18:00 the day before each upcoming meeting with an SMS invitation
  const scheduled = useMemo(() => {
    const reminders = props.meetings
      .filter((m) => m.smsInvite && parseDMY(m.date, m.time).getTime() > NOW_DATE.getTime())
      .map((m) => {
        const dayBefore = parseDMY(m.date);
        dayBefore.setDate(dayBefore.getDate() - 1);
        return {
          id: `rem-${m.id}`,
          at: `${formatDMY(dayBefore)} 18:00`,
          title: `Meeting reminder: ${m.title}`,
          audience: `${meetingAudienceLabel(m, props.groupRecords)} · ${meetingInviteeCount(m, props.members)} members`,
          channel: 'SMS',
        };
      });
    return [...SCHEDULED_MESSAGES, ...reminders].sort((a, b) => dmKey(a.at) - dmKey(b.at));
  }, [props.meetings, props.members, props.groupRecords]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="SMS, voice and in-app messages · delivery is simulated in the prototype"
        actions={
          <button type="button" onClick={props.onOpenComposer} className={PRIMARY_BUTTON}>
            <Plus className="w-3.5 h-3.5" />
            <span>New broadcast</span>
          </button>
        }
      />
      <SegmentedTabs<NotifTab>
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'history', label: 'Message history', count: history.length },
          { id: 'templates', label: 'Templates', count: props.templates.length },
          { id: 'optouts', label: 'Opt-outs', count: optOuts.length },
          { id: 'inbox', label: 'SMS inbox', count: SMS_REPLIES.length },
          { id: 'scheduled', label: 'Scheduled', count: scheduled.length },
        ]}
      />
      {tab === 'history' && <HistoryTab rows={history} />}
      {tab === 'templates' && (
        <TemplatesTab
          templates={props.templates}
          voiceSettings={props.voiceSettings}
          onSaveTemplate={props.onSaveTemplate}
          onSaveVoiceSettings={props.onSaveVoiceSettings}
        />
      )}
      {tab === 'optouts' && <OptOutsTab optOuts={optOuts} />}
      {tab === 'inbox' && <InboxTab />}
      {tab === 'scheduled' && <ScheduledTab items={scheduled} />}
    </div>
  );
};

// ---------------------------------------------------------------------------
const HistoryTab: React.FC<{ rows: HistoryRow[] }> = ({ rows }) => {
  const [kind, setKind] = useState('all');
  const shown = rows.filter((r) => kind === 'all' || r.kind === kind);
  const totals = shown.reduce(
    (t, r) => ({ sms: t.sms + r.sms, voice: t.voice + r.voice, inApp: t.inApp + r.inApp, failed: t.failed + r.failed }),
    { sms: 0, voice: 0, inApp: 0, failed: 0 }
  );
  const delivered = totals.sms + totals.voice + totals.inApp;
  const channels = [
    { label: 'SMS', value: totals.sms, icon: Smartphone },
    { label: 'Voice', value: totals.voice, icon: PhoneCall },
    { label: 'In-app', value: totals.inApp, icon: BellRing },
  ];
  const max = Math.max(1, ...channels.map((c) => c.value));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className={`${CARD_CLASS} p-5 md:p-6 lg:col-span-8 space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[16px] font-semibold text-[#17271D]">All messages</h3>
          <PillSelect
            className="w-[220px]"
            value={kind}
            onChange={setKind}
            options={[
              { value: 'all', label: 'All types' },
              { value: 'Warning', label: 'Warnings' },
              { value: 'Cooperative', label: 'Cooperative messages' },
              { value: 'Meeting invitation', label: 'Meeting invitations' },
            ]}
          />
        </div>
        {shown.length === 0 ? (
          <EmptyState icon={MessageSquare} text="No messages of this type." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px] border-collapse tabular-nums">
              <thead>
                <tr className="border-b border-[rgba(31,74,52,0.08)] text-[12px] text-[#5B665E]">
                  <th className="py-2.5 pr-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Message</th>
                  <th className="py-2.5 px-3 font-semibold text-right">SMS</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Voice</th>
                  <th className="py-2.5 px-3 font-semibold text-right">In-app</th>
                  <th className="py-2.5 pl-3 font-semibold text-right">Failed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(31,74,52,0.06)]">
                {shown.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 pr-3 text-[#5B665E] whitespace-nowrap align-top">{r.when}</td>
                    <td className="py-2.5 px-3">
                      <NeutralChip tone="outline">{r.kind}</NeutralChip>
                      <span className="block text-[#17271D] font-medium mt-1">{r.title}</span>
                      <span className="block text-[11.5px] text-[#5B665E]">{r.audience}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#17271D] align-top">{r.sms}</td>
                    <td className="py-2.5 px-3 text-right text-[#17271D] align-top">{r.voice}</td>
                    <td className="py-2.5 px-3 text-right text-[#17271D] align-top">{r.inApp}</td>
                    <td className="py-2.5 pl-3 text-right text-[#5B665E] align-top">{r.failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={`${CARD_CLASS} p-5 lg:col-span-4 space-y-4`}>
        <div className="pb-3 border-b border-[rgba(31,74,52,0.08)]">
          <h3 className="text-[16px] font-semibold text-[#17271D]">Delivery by channel</h3>
          <p className="text-[12px] text-[#5B665E] tabular-nums">
            {delivered.toLocaleString('en-US')} delivered · {totals.failed} failed
          </p>
        </div>
        {channels.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="space-y-1">
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="flex items-center gap-1.5 text-[#17271D]">
                  <Icon className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
                  {c.label}
                </span>
                <span className="font-semibold text-[#17271D] tabular-nums">
                  {c.value.toLocaleString('en-US')} · {delivered > 0 ? Math.round((c.value / delivered) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#F4F6EF] rounded-full overflow-hidden border border-[rgba(31,74,52,0.08)]">
                <div className="h-full bg-[#3E8E55] rounded-full" style={{ width: `${(c.value / max) * 100}%` }} />
              </div>
            </div>
          );
        })}
        <p className="flex items-start gap-1.5 text-[12px] text-[#5B665E]">
          <Info className="w-3.5 h-3.5 text-[#1F4A34] mt-0.5" strokeWidth={1.5} />
          Totals follow the type filter. Warning counts come from each warning's delivery report.
        </p>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
const CharCounter: React.FC<{ text: string }> = ({ text }) => {
  const over = text.length > SMS_MAX_CHARS;
  return (
    <span className={`text-[11.5px] tabular-nums ${over ? 'text-[#17271D] font-semibold' : 'text-[#5B665E]'}`}>
      {text.length}/{SMS_MAX_CHARS}
      {over ? ' · sent as 2 SMS' : ''}
    </span>
  );
};

const TemplateCard: React.FC<{ template: MessageTemplate; onSave: (t: MessageTemplate) => void }> = ({
  template,
  onSave,
}) => {
  const [draft, setDraft] = useState(template);
  useEffect(() => setDraft(template), [template]);
  const changed = draft.en !== template.en || draft.rw !== template.rw;
  const field = (lang: 'en' | 'rw', label: string) => (
    <label className="block">
      <span className="flex items-center justify-between mb-1">
        <span className="text-[12px] font-semibold text-[#17271D]">{label}</span>
        <CharCounter text={draft[lang]} />
      </span>
      <textarea
        value={draft[lang]}
        onChange={(e) => setDraft((d) => ({ ...d, [lang]: e.target.value }))}
        rows={3}
        className="w-full p-3 rounded-[16px] bg-white border border-[rgba(31,74,52,0.18)] text-[12.5px] text-[#17271D] focus:outline-none focus:border-[#1F4A34] resize-none"
      />
    </label>
  );
  return (
    <div className={`${CARD_CLASS} p-5 space-y-3`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-[#17271D]">{template.name}</h3>
          <NeutralChip tone="outline">{template.kind}</NeutralChip>
        </div>
        <div className="flex gap-2">
          <button type="button" disabled={!changed} onClick={() => setDraft(template)} className={SECONDARY_BUTTON}>
            Discard
          </button>
          <button type="button" disabled={!changed} onClick={() => onSave(draft)} className={PRIMARY_BUTTON}>
            Save
          </button>
        </div>
      </div>
      {field('rw', 'Kinyarwanda')}
      {field('en', 'English')}
      <p className="text-[12px] text-[#5B665E]">Words in {'{braces}'} are filled in when the message is sent.</p>
    </div>
  );
};

const TemplatesTab: React.FC<{
  templates: MessageTemplate[];
  voiceSettings: VoiceSettings;
  onSaveTemplate: (t: MessageTemplate) => void;
  onSaveVoiceSettings: (v: VoiceSettings) => void;
}> = ({ templates, voiceSettings, onSaveTemplate, onSaveVoiceSettings }) => {
  const [voice, setVoice] = useState(voiceSettings);
  useEffect(() => setVoice(voiceSettings), [voiceSettings]);
  const voiceChanged = JSON.stringify(voice) !== JSON.stringify(voiceSettings);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
        {templates.map((t) => (
          <TemplateCard key={t.id} template={t} onSave={onSaveTemplate} />
        ))}
      </div>
      <div className={`${CARD_CLASS} p-5 lg:col-span-4 space-y-4`}>
        <div className="flex items-center gap-2 pb-3 border-b border-[rgba(31,74,52,0.08)]">
          <PhoneCall className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />
          <h3 className="text-[16px] font-semibold text-[#17271D]">Voice messages</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="block text-[13px] font-medium text-[#17271D]">Call farmers who choose voice</span>
            <span className="block text-[12px] text-[#5B665E]">The message is read in Kinyarwanda.</span>
          </div>
          <Toggle checked={voice.enabled} onChange={(v) => setVoice((s) => ({ ...s, enabled: v }))} label="Voice calls" />
        </div>
        <PillSelect label="Voice" value={voice.voice} onChange={(v) => setVoice((s) => ({ ...s, voice: v as VoiceSettings['voice'] }))} options={['Female voice', 'Male voice'].map((v) => ({ value: v, label: v }))} />
        <PillSelect label="Call again if no answer" value={String(voice.retries)} onChange={(v) => setVoice((s) => ({ ...s, retries: Number(v) }))} options={[0, 1, 2, 3].map((n) => ({ value: String(n), label: n === 0 ? 'Do not call again' : `${n} more ${n === 1 ? 'time' : 'times'}` }))} />
        <PillSelect label="Call hours" value={voice.callWindow} onChange={(v) => setVoice((s) => ({ ...s, callWindow: v }))} options={['06:00–20:00', '07:00–19:00', '08:00–18:00'].map((v) => ({ value: v, label: v, hint: 'Warnings of High or Critical level call at any hour' }))} />
        <div className="flex justify-end gap-2">
          <button type="button" disabled={!voiceChanged} onClick={() => setVoice(voiceSettings)} className={SECONDARY_BUTTON}>
            Discard
          </button>
          <button type="button" disabled={!voiceChanged} onClick={() => onSaveVoiceSettings(voice)} className={PRIMARY_BUTTON}>
            Save voice settings
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
const OptOutsTab: React.FC<{ optOuts: typeof SEEDED_SMS_OPT_OUTS }> = ({ optOuts }) => (
  <div className={`${CARD_CLASS} p-5 md:p-6 space-y-3`}>
    <div className="pb-3 border-b border-[rgba(31,74,52,0.08)]">
      <h3 className="text-[16px] font-semibold text-[#17271D]">Farmers who stopped SMS</h3>
      <p className="text-[12px] text-[#5B665E]">They still see warnings in the app. Reply START or switch SMS on in Settings to rejoin.</p>
    </div>
    {optOuts.length === 0 ? (
      <EmptyState icon={UserX} text="Nobody has stopped SMS." />
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px] border-collapse tabular-nums">
          <thead>
            <tr className="border-b border-[rgba(31,74,52,0.08)] text-[12px] text-[#5B665E]">
              <th className="py-2.5 pr-3 font-semibold">Farmer</th>
              <th className="py-2.5 px-3 font-semibold">Sector</th>
              <th className="py-2.5 px-3 font-semibold">Since</th>
              <th className="py-2.5 pl-3 font-semibold">How</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(31,74,52,0.06)]">
            {optOuts.map((o) => (
              <tr key={o.id}>
                <td className="py-2.5 pr-3">
                  <span className="block font-semibold text-[#17271D]">{o.name}</span>
                  <span className="block text-[11.5px] text-[#5B665E]">{maskPhone(o.phone)}</span>
                </td>
                <td className="py-2.5 px-3 text-[#17271D]">{o.sector}</td>
                <td className="py-2.5 px-3 text-[#17271D]">{o.since}</td>
                <td className="py-2.5 pl-3 text-[#5B665E]">{o.via}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

// ---------------------------------------------------------------------------
const MEANING_ICON = { Acknowledged: Check, Question: HelpCircle, 'Stop SMS': UserX };

const InboxTab: React.FC = () => {
  const counts = (['Acknowledged', 'Question', 'Stop SMS'] as const).map((m) => ({
    m,
    n: SMS_REPLIES.filter((r) => r.meaning === m).length,
  }));
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className={`${CARD_CLASS} p-5 md:p-6 lg:col-span-8 space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[rgba(31,74,52,0.08)]">
          <h3 className="text-[16px] font-semibold text-[#17271D]">Replies today</h3>
          <div className="flex flex-wrap gap-1.5">
            {counts.map((c) => (
              <NeutralChip key={c.m} tone="outline">
                {c.m} {c.n}
              </NeutralChip>
            ))}
          </div>
        </div>
        <div className="divide-y divide-[rgba(31,74,52,0.06)]">
          {[...SMS_REPLIES].sort((a, b) => dmKey(b.at) - dmKey(a.at)).map((r) => {
            const Icon = MEANING_ICON[r.meaning];
            return (
              <div key={r.id} className="py-3 flex items-start gap-3">
                <IconCircle icon={Icon} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-[#17271D]">{r.fromName}</span>
                    <span className="text-[12px] text-[#5B665E] tabular-nums">{r.at}</span>
                  </div>
                  <span className="block text-[13px] text-[#17271D]">“{r.text}”</span>
                  <span className="block text-[12px] text-[#5B665E]">
                    {maskPhone(r.phone)} · {r.meaning} · {r.relatedTo}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className={`${CARD_CLASS} p-5 lg:col-span-4 space-y-3`}>
        <div className="flex items-center gap-2">
          <Inbox className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />
          <h3 className="text-[16px] font-semibold text-[#17271D]">How replies are recorded</h3>
        </div>
        {[
          ['1', 'Counts as "acknowledged" for the latest warning sent to that phone. Officers and cooperative leaders see it in the acknowledgement counts.'],
          ['STOP', 'Stops SMS for that farmer. They move to the opt-out list and still see warnings in the app.'],
          ['Any other text', 'Goes to the officer for the farmer\'s sector as a question.'],
        ].map(([k, v]) => (
          <div key={k} className="p-3 rounded-xl bg-[#F4F6EF]/60 border border-[rgba(31,74,52,0.06)]">
            <span className="block text-[13px] font-semibold text-[#17271D]">{k}</span>
            <span className="block text-[12px] text-[#5B665E]">{v}</span>
          </div>
        ))}
        <p className="text-[12px] text-[#5B665E]">Replies are simulated in the prototype.</p>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
const ScheduledTab: React.FC<{ items: { id: string; at: string; title: string; audience: string; channel: string }[] }> = ({
  items,
}) => (
  <div className={`${CARD_CLASS} p-5 md:p-6 space-y-3`}>
    <div className="pb-3 border-b border-[rgba(31,74,52,0.08)]">
      <h3 className="text-[16px] font-semibold text-[#17271D]">Waiting to be sent</h3>
      <p className="text-[12px] text-[#5B665E]">Meeting reminders go out at 18:00 the day before.</p>
    </div>
    {items.length === 0 ? (
      <EmptyState icon={CalendarClock} text="Nothing is scheduled." />
    ) : (
      <div className="divide-y divide-[rgba(31,74,52,0.06)]">
        {items.map((s) => (
          <div key={s.id} className="py-3 flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <IconCircle icon={CalendarClock} />
              <div>
                <span className="block text-[13px] font-semibold text-[#17271D]">{s.title}</span>
                <span className="block text-[12px] text-[#5B665E]">{s.audience}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-[13px] text-[#17271D] tabular-nums">{s.at}</span>
              <NeutralChip tone="outline">{s.channel}</NeutralChip>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
