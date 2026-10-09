import React, { useMemo } from 'react';
import { CheckCircle2, FileText, MessageSquare, Users } from 'lucide-react';
import { CoopGroup, CoopMember, CoopMessage } from '../../types';
import { LOW_RESPONSE_PCT, NOW, computeCoopPerformance } from '../../data/musanzeData';
import { CARD_CLASS, IconCircle, NeutralChip } from './CoopUi';

export const PerformanceTab: React.FC<{
  members: CoopMember[];
  groups: CoopGroup[];
  messages: CoopMessage[];
}> = ({ members, groups, messages }) => {
  const perf = useMemo(() => computeCoopPerformance(members, groups, messages), [members, groups, messages]);
  const reports7d = groups.reduce((sum, g) => sum + g.reports7Days, 0);

  const kpis = [
    {
      icon: Users,
      label: 'Active members, 30 days',
      value: `${perf.active30} of ${perf.totalMembers}`,
      caption: `${perf.active30Pct}% of members`,
    },
    {
      icon: CheckCircle2,
      label: 'Average acknowledgement',
      value: perf.ackPct === null ? '—' : `${perf.ackPct}%`,
      caption:
        perf.ackPct === null ? 'No active warnings' : `${perf.acknowledged} of ${perf.deliveries} warning deliveries`,
    },
    {
      icon: FileText,
      label: 'Member reports this season',
      value: `${perf.reportsThisSeason}`,
      caption: `${reports7d} in the last 7 days · ${NOW.season}`,
    },
    {
      icon: MessageSquare,
      label: 'Messages sent',
      value: `${perf.messagesSent}`,
      caption: 'Broadcasts and direct messages',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className={`${CARD_CLASS} p-5 flex items-start gap-3`}>
            <IconCircle icon={k.icon} />
            <div className="min-w-0">
              <span className="block text-[12px] text-[#5B665E]">{k.label}</span>
              <span className="block text-[22px] font-semibold text-[#17271D] tabular-nums leading-tight mt-0.5">
                {k.value}
              </span>
              <span className="block text-[12px] text-[#5B665E] mt-0.5">{k.caption}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`${CARD_CLASS} p-5 md:p-6 lg:col-span-7`}>
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(31,74,52,0.08)]">
            <div>
              <h3 className="text-[16px] font-semibold text-[#17271D]">Weekly active members</h3>
              <p className="text-[12px] text-[#5B665E]">Members active in each of the last four weeks</p>
            </div>
            {perf.weeklyActive.length > 1 && (
              <NeutralChip>
                +{perf.weeklyActive[perf.weeklyActive.length - 1].count - perf.weeklyActive[0].count} since W1
              </NeutralChip>
            )}
          </div>
          <WeeklyActiveChart data={perf.weeklyActive} />
        </div>

        <div className={`${CARD_CLASS} p-5 md:p-6 lg:col-span-5`}>
          <div className="pb-3 border-b border-[rgba(31,74,52,0.08)]">
            <h3 className="text-[16px] font-semibold text-[#17271D]">Acknowledgement by group</h3>
            <p className="text-[12px] text-[#5B665E]">All active warnings covering each group</p>
          </div>
          <div className="space-y-4 mt-4">
            {perf.byGroup.map((g) => (
              <div key={g.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-[12.5px]">
                  <span className="font-medium text-[#17271D]">{g.name}</span>
                  <span className="flex items-center gap-2">
                    {g.pct !== null && g.pct < LOW_RESPONSE_PCT && <NeutralChip tone="outline">Low response</NeutralChip>}
                    <span className="font-semibold text-[#17271D] tabular-nums">{g.pct === null ? '—' : `${g.pct}%`}</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-[#F4F6EF] rounded-full overflow-hidden border border-[rgba(31,74,52,0.08)]">
                  <div className="h-full bg-[#3E8E55] rounded-full" style={{ width: `${g.pct ?? 0}%` }} />
                </div>
                <span className="block text-[11.5px] text-[#5B665E] tabular-nums">
                  {g.pct === null ? 'No active warning' : `${g.acknowledged} of ${g.deliveries} deliveries`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const WeeklyActiveChart: React.FC<{ data: { label: string; startsOn: string; count: number }[] }> = ({ data }) => {
  const width = 560;
  const height = 220;
  const padL = 40;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const step = 50;
  const maxY = Math.max(step, Math.ceil(Math.max(...data.map((d) => d.count)) / step) * step);
  const ticks = Array.from({ length: maxY / step + 1 }, (_, i) => i * step);
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const points = data.map((d, i) => ({
    x: padL + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW),
    y: padT + chartH - (d.count / maxY) * chartH,
    d,
  }));
  const line = points.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = arr[i - 1];
    const mid = (prev.x + p.x) / 2;
    return `${acc} C ${mid},${prev.y} ${mid},${p.y} ${p.x},${p.y}`;
  }, '');
  const area = `${line} L ${points[points.length - 1].x},${padT + chartH} L ${points[0].x},${padT + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto mt-3" role="img" aria-label="Weekly active members line chart">
      <defs>
        <linearGradient id="weeklyActiveFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3E8E55" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#3E8E55" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => {
        const y = padT + chartH - (t / maxY) * chartH;
        return (
          <g key={t}>
            <line x1={padL} x2={width - padR} y1={y} y2={y} stroke="rgba(31,74,52,0.12)" strokeDasharray="3 4" />
            <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="12" fill="#5B665E" className="tabular-nums">
              {t}
            </text>
          </g>
        );
      })}
      <path d={area} fill="url(#weeklyActiveFill)" />
      <path d={line} fill="none" stroke="#3E8E55" strokeWidth="2.5" strokeLinecap="round" />
      {points.map((p) => (
        <g key={p.d.label}>
          <circle cx={p.x} cy={p.y} r="4" fill="#FBFCF8" stroke="#3E8E55" strokeWidth="2" />
          <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="12" fontWeight="600" fill="#17271D" className="tabular-nums">
            {p.d.count}
          </text>
          <text x={p.x} y={height - 20} textAnchor="middle" fontSize="12" fill="#5B665E">
            {p.d.label}
          </text>
          <text x={p.x} y={height - 6} textAnchor="middle" fontSize="12" fill="#5B665E" className="tabular-nums">
            {p.d.startsOn.slice(0, 5)}
          </text>
        </g>
      ))}
    </svg>
  );
};
