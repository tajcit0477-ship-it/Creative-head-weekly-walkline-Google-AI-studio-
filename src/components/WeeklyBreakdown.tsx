import React from 'react';
import { CATEGORY_THEMES } from '../data/defaultSchedule';

export const WeeklyBreakdown: React.FC = () => {
  const highlights = [
    {
      time: 'Mon 2:00 PM',
      title: 'Manager Kickoff Call',
      desc: 'Check new updates, plan for the day, review weekend club revenue',
      category: 'kickoff' as const,
    },
    {
      time: 'Mon 3:00 PM',
      title: 'Content Labs & Ad Audit',
      desc: 'Running ads overview, verify missed creatives, triage priority inbox',
      category: 'content' as const,
    },
    {
      time: 'Mon 4:30 - 6:00 PM',
      title: 'Venue Checks & Lighting Sync',
      desc: 'Learn lighting and smoke setups during event, create live visual overlays',
      category: 'venue' as const,
    },
    {
      time: 'Wed 2:00 PM',
      title: 'Top Priority Creative Lock',
      desc: 'Finalize next week creatives & upcoming headline DJ promotional assets',
      category: 'priority' as const,
    },
    {
      time: 'Thu 3:00 PM',
      title: 'Equipment & Rentals Booking',
      desc: 'Notify camera rental house for weekend shoots, lenses, wireless audio',
      category: 'rentals' as const,
    },
    {
      time: 'Sat-Sun 7:00 PM',
      title: 'Weekend Priority Live Content',
      desc: 'Instant turnaround social media updates, stories every 30min, VIP table captures',
      category: 'weekend' as const,
    },
  ];

  const nonNegotiables = [
    'Golden hour shoot never skipped — 6:00 PM team sync + rooftop sunset shoot.',
    '9:30 PM status must include live ad spend, CTR & content posted count.',
    'Night wrap checklist: ads recheck → priority discussion → lock gear locker.',
    'Wednesday priority: next week headline creatives 100% approved by GM.',
    'Weekend live: dedicated gimbal operator, guest performer tags in real-time.',
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Weekly Flow Breakdown */}
        <div className="lg:col-span-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Weekly Strategic Flow Breakdown
              </h3>
              <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
                Core operational anchor blocks for Creative Head
              </p>
            </div>
            <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-dim)]">
              CREATIVE HEAD RHYTHM
            </span>
          </div>

          <div className="space-y-4">
            {highlights.map((item) => {
              const theme = CATEGORY_THEMES[item.category];
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-3.5 p-3 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)]"
                >
                  <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ${theme.dot} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">
                        {item.time}
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${theme.bg} ${theme.border} ${theme.color}`}
                      >
                        {theme.label}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white mt-1">
                      {item.title}
                    </h4>
                    <p className="text-xs font-mono text-[var(--text-muted)] mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stats Grid */}
          <div className="pt-4 border-t border-[var(--border)] grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--border)] p-3.5">
              <div className="font-mono text-[10px] text-[var(--text-dim)] uppercase">
                Total Blocks
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1">26</div>
              <div className="font-mono text-[10px] text-[var(--text-muted)]">
                Structured flow
              </div>
            </div>
            <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--border)] p-3.5">
              <div className="font-mono text-[10px] text-[var(--text-dim)] uppercase">
                Daily Rituals
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1">3 / Day</div>
              <div className="font-mono text-[10px] text-[var(--text-muted)]">
                6PM · 9:30PM · 12AM
              </div>
            </div>
            <div className="rounded-xl bg-[var(--accent-purple)]/10 border border-[var(--accent-purple)]/30 p-3.5">
              <div className="font-mono text-[10px] text-[#d8b4fe] uppercase">
                Weekend Rush
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1">Live Mode</div>
              <div className="font-mono text-[10px] text-[#fbcfe8]">
                Sat & Sun priority
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Non-Negotiables & Pro Tips */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f87171]" />
              Nightclub Non-Negotiables
            </h3>
            <ul className="space-y-3">
              {nonNegotiables.map((rule, idx) => (
                <li
                  key={idx}
                  className="flex gap-2.5 font-mono text-xs leading-relaxed text-[var(--text-muted)]"
                >
                  <span className="text-[#a78bfa] shrink-0 font-bold">—</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[#facc15]/30 bg-[#facc15]/5 p-6 space-y-2.5">
            <h4 className="font-mono text-xs font-bold text-[#facc15] tracking-wide uppercase">
              ⚡ Creative Head Field Guide
            </h4>
            <p className="font-mono text-xs leading-relaxed text-[#fef08a]/80">
              During Monday venue checks (4:30 PM), test low haze & dry ice with stage lasers. Record 3 test LUTs on the Sony FX3 and save to "Weekend Presets". When the Friday night rush hits at 11:30 PM, your team can color-grade reels in 4 minutes instead of 40 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
