import React, { useState, useMemo } from 'react';
import {
  Bell,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  ArrowUpDown,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { EventCategory, ReminderItem, WorklineDay, WorklineEvent } from '../types/workline';
import { CATEGORY_THEMES } from '../data/defaultSchedule';
import { playClickTone } from '../utils/audio';
import { sortEventsSmart, sortEventsChronological } from '../utils/sorting';

interface WeeklyGridProps {
  days: WorklineDay[];
  categoryFilter: string;
  onFilterChange: (category: string) => void;
  selectedEventId: string | null;
  onSelectEvent: (event: WorklineEvent, date: Date) => void;
  onQuickReminder: (event: WorklineEvent, date: Date) => void;
  reminders: ReminderItem[];
  checklistState: Record<string, boolean>;
  weekStartDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onResetWeek: () => void;
  smartSortEnabled?: boolean;
  onToggleSmartSort?: (enabled: boolean) => void;
}

export const WeeklyGrid: React.FC<WeeklyGridProps> = ({
  days,
  categoryFilter,
  onFilterChange,
  selectedEventId,
  onSelectEvent,
  onQuickReminder,
  reminders,
  checklistState,
  weekStartDate,
  onPrevWeek,
  onNextWeek,
  onResetWeek,
  smartSortEnabled: controlledSmartSort,
  onToggleSmartSort,
}) => {
  // Local state if not controlled externally
  const [internalSmartSort, setInternalSmartSort] = useState(true);
  const isSmartSort = controlledSmartSort !== undefined ? controlledSmartSort : internalSmartSort;

  const handleToggleSort = (val: boolean) => {
    playClickTone();
    if (onToggleSmartSort) {
      onToggleSmartSort(val);
    } else {
      setInternalSmartSort(val);
    }
  };

  const weekEndDate = new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000);
  const todayStr = new Date().toDateString();

  const formatWeekRange = (start: Date, end: Date) => {
    const s = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const e = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${s} — ${e}`;
  };

  // Find all Top-Tier Priority tasks across all days of the week regardless of day
  const topTierTasksAcrossWeek = useMemo(() => {
    const list: Array<{ event: WorklineEvent; day: WorklineDay }> = [];
    days.forEach((day) => {
      day.events.forEach((evt) => {
        if (
          evt.category === 'priority' ||
          evt.title.toUpperCase().includes('TOP PRIORITY') ||
          (evt.category === 'weekend' && evt.title.toUpperCase().includes('PRIORITY'))
        ) {
          list.push({ event: evt, day });
        }
      });
    });
    return list;
  }, [days]);

  return (
    <div className="space-y-6">
      {/* Week Header & Subtitle & Filter Bar */}
      <div className="flex flex-col gap-4">
        {/* Top Controls: Week Navigator + Reset to Today */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-dim)]">
              <span>Operational Schedule</span>
              <span>·</span>
              <span className="text-white font-medium">Dark-Hours Workline (IST)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
              Weekly Operational Flow
            </h1>
            <p className="text-xs font-mono text-[var(--text-muted)] mt-1">
              Week of {formatWeekRange(weekStartDate, weekEndDate)} · Mandatory daily golden hour & night wrap
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Smart Sort Toggle */}
            <div className="flex items-center bg-[var(--surface-2)] rounded-xl border border-[var(--border)] p-1">
              <button
                type="button"
                onClick={() => handleToggleSort(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isSmartSort
                    ? 'bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] text-white shadow-md'
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
                title="Smart Sort: Prioritize Priority tasks and upcoming shift times first"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Smart Sort</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleSort(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  !isSmartSort
                    ? 'bg-white text-black shadow-md'
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
                title="Chronological: Sort strictly by time of day"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>By Time</span>
              </button>
            </div>

            {/* Week Navigator */}
            <div className="flex items-center bg-[var(--surface-2)] rounded-xl border border-[var(--border)] p-1">
              <button
                onClick={() => {
                  playClickTone();
                  onPrevWeek();
                }}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface-3)] transition-colors"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  playClickTone();
                  onResetWeek();
                }}
                className="px-2.5 py-1 text-xs font-mono text-[var(--text-muted)] hover:text-white transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => {
                  playClickTone();
                  onNextWeek();
                }}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface-3)] transition-colors"
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border)]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                playClickTone();
                onFilterChange('all');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-white text-black border-white'
                  : 'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)] hover:text-white'
              }`}
            >
              All Blocks
            </button>
            {(Object.keys(CATEGORY_THEMES) as EventCategory[]).map((cat) => {
              const theme = CATEGORY_THEMES[cat];
              const isActive = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    playClickTone();
                    onFilterChange(isActive ? 'all' : cat);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border flex items-center gap-2 transition-all ${
                    isActive
                      ? `${theme.bg} ${theme.border} ${theme.color} ring-1 ring-current`
                      : 'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)] hover:text-white'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                  {theme.label}
                </button>
              );
            })}
          </div>

          {/* Smart Sort Status Message */}
          {isSmartSort && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#d8b4fe] bg-[var(--accent-purple)]/10 px-2.5 py-1 rounded-full border border-[var(--accent-purple)]/25">
              <Zap className="w-3 h-3 text-[#d8b4fe]" />
              <span>Smart Sort: Top-Tier Tasks Placed First</span>
            </div>
          )}
        </div>
      </div>

      {/* Top-Tier Tasks Spotlight Strip (Visible when Smart Sort is active) */}
      {isSmartSort && topTierTasksAcrossWeek.length > 0 && (
        <section aria-label="Top-tier priority tasks" className="rounded-2xl border border-[#f87171]/30 bg-gradient-to-r from-[#f87171]/10 via-[#ec4899]/5 to-transparent p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-[#f87171]/20 border border-[#f87171]/40 text-[#f87171]">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Top-Tier Tasks Horizon · High-Impact Deliverables
                </h2>
                <p className="text-[11px] font-mono text-[var(--text-muted)]">
                  Critical creatives & live priorities promoted first regardless of day
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f87171]/20 text-[#f87171] border border-[#f87171]/30">
              {topTierTasksAcrossWeek.length} TOP-TIER DELIVERABLES
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {topTierTasksAcrossWeek.map(({ event: evt, day }) => {
              const theme = CATEGORY_THEMES[evt.category] || CATEGORY_THEMES.priority;
              const activeReminder = reminders.find(
                (r) => r.eventId === evt.id && r.status !== 'completed'
              );
              const totalChecks = evt.checklists?.length || 0;
              const completedChecks =
                evt.checklists?.filter((c) => checklistState[c.id]).length || 0;

              return (
                <div
                  key={`top-tier-${day.name}-${evt.id}`}
                  onClick={() => onSelectEvent(evt, day.date)}
                  className="rounded-xl bg-[var(--surface-2)]/90 border border-[#f87171]/30 p-3.5 cursor-pointer hover:border-[#f87171] hover:bg-[var(--surface-3)] transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-white bg-[#f87171] px-2 py-0.5 rounded text-black">
                          {day.name.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">
                          {evt.displayTime}
                        </span>
                      </div>

                      {activeReminder ? (
                        <span
                          className="p-1 rounded bg-[var(--accent-purple)]/20 text-[#d8b4fe] border border-[var(--accent-purple)]/30 text-[10px]"
                          title="Reminder scheduled"
                        >
                          <Bell className="w-3 h-3 animate-pulse" />
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playClickTone();
                            onQuickReminder(evt, day.date);
                          }}
                          className="p-1 rounded bg-[var(--surface)] text-[var(--text-muted)] hover:text-white border border-[var(--border)] transition-colors"
                          title="Set reminder"
                        >
                          <Bell className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug group-hover:text-[#fbcfe8] transition-colors">
                      {evt.title}
                    </h4>
                    {evt.desc && (
                      <p className="text-[11px] font-mono text-[var(--text-muted)] mt-1 line-clamp-2">
                        {evt.desc}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10px] font-mono text-[var(--text-dim)]">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      {completedChecks}/{totalChecks} done
                    </span>
                    <span className="text-white/60 group-hover:text-white">
                      Inspect →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 7-Day Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3.5">
        {days.map((day) => {
          const isToday = day.date.toDateString() === todayStr;
          const isWeekend = day.name === 'Saturday' || day.name === 'Sunday';

          // Filter by category first
          const rawEvents =
            categoryFilter === 'all'
              ? day.events
              : day.events.filter((e) => e.category === categoryFilter);

          // Apply Smart Sort vs Chronological Sort
          const filteredEvents = isSmartSort
            ? sortEventsSmart(rawEvents, new Date())
            : sortEventsChronological(rawEvents);

          return (
            <div
              key={day.name}
              className={`rounded-2xl border bg-[var(--surface)] flex flex-col min-h-[380px] overflow-hidden transition-all ${
                isToday
                  ? 'border-[var(--accent-purple)]/60 shadow-[0_0_24px_rgba(168,85,247,0.12)]'
                  : 'border-[var(--border)]'
              } ${isWeekend ? 'bg-gradient-to-b from-[var(--surface)] to-[var(--surface-2)]' : ''}`}
            >
              {/* Day Header */}
              <div
                className={`px-4 py-3.5 border-b flex items-center justify-between ${
                  isToday
                    ? 'bg-[#1e1630] border-[#3a2a5e]'
                    : 'bg-[var(--surface-2)]/90 border-[var(--border)]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h2
                      className={`text-sm font-bold tracking-tight ${
                        isToday ? 'text-white' : 'text-[var(--text)]'
                      }`}
                    >
                      {day.name}
                    </h2>
                    {isToday && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[var(--accent-purple)] text-white tracking-widest">
                        TODAY
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-[var(--text-dim)] mt-0.5">
                    {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ·{' '}
                    {filteredEvents.length} blocks
                  </div>
                </div>

                <div
                  className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold border ${
                    isWeekend
                      ? 'bg-[#f472b6]/15 text-[#f472b6] border-[#f472b6]/30'
                      : 'bg-[var(--surface-3)] text-[var(--text-muted)] border-[var(--border)]'
                  }`}
                >
                  {day.short[0]}
                </div>
              </div>

              {/* Event Cards inside Day */}
              <div className="p-3 flex flex-col gap-2.5 flex-1">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12 text-[11px] font-mono text-[var(--text-dim)] border border-dashed border-[var(--border)] rounded-xl">
                    No blocks
                  </div>
                ) : (
                  filteredEvents.map((evt) => {
                    const theme = CATEGORY_THEMES[evt.category] || CATEGORY_THEMES.kickoff;
                    const isSelected = selectedEventId === evt.id;
                    const activeReminder = reminders.find(
                      (r) => r.eventId === evt.id && r.status !== 'completed'
                    );

                    const isTopPriority =
                      evt.category === 'priority' ||
                      evt.title.toUpperCase().includes('TOP PRIORITY') ||
                      (evt.category === 'weekend' && evt.title.toUpperCase().includes('PRIORITY'));

                    // Check completed checklist count
                    const totalChecks = evt.checklists?.length || 0;
                    const completedChecks =
                      evt.checklists?.filter((c) => checklistState[c.id]).length || 0;

                    return (
                      <div
                        key={evt.id}
                        onClick={() => onSelectEvent(evt, day.date)}
                        className={`text-left w-full rounded-xl border p-3 cursor-pointer transition-all relative overflow-hidden group ${
                          theme.bg
                        } ${
                          isTopPriority && isSmartSort
                            ? 'border-[#f87171]/50 shadow-[0_0_16px_rgba(248,113,113,0.15)] ring-1 ring-[#f87171]/40'
                            : theme.border
                        } ${
                          isSelected
                            ? `${theme.glow} ring-1 ring-current`
                            : 'hover:brightness-110 hover:border-opacity-80'
                        }`}
                      >
                        {/* Left edge bar */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                            isTopPriority && isSmartSort ? 'bg-[#f87171]' : theme.dot
                          }`}
                        />

                        {/* Top row: Time + Priority Tag + Reminder status */}
                        <div className="flex items-center justify-between gap-1.5 mb-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {isTopPriority && isSmartSort && (
                              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-[#f87171] text-black font-bold uppercase tracking-wider">
                                P1
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 border ${theme.border} ${theme.color} tabular-nums`}
                            >
                              {evt.displayTime}
                            </span>
                            {evt.isDaily && (
                              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/10">
                                DAILY
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {activeReminder ? (
                              <span
                                className="p-1 rounded-md bg-[var(--accent-purple)]/20 text-[#d8b4fe] border border-[var(--accent-purple)]/30 text-[10px] flex items-center gap-1"
                                title={`Reminder set for ${new Date(activeReminder.reminderDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                              >
                                <Bell className="w-3 h-3 animate-pulse" />
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playClickTone();
                                  onQuickReminder(evt, day.date);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-black/40 text-[var(--text-muted)] hover:text-white border border-[var(--border)] transition-opacity"
                                title="Set reminder for this block"
                              >
                                <Bell className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-xs font-semibold text-white leading-snug tracking-tight">
                          {evt.title}
                        </h3>

                        {/* Desc snippet */}
                        {evt.desc && (
                          <p className="text-[11px] font-mono text-[var(--text-muted)] mt-1.5 line-clamp-2 leading-relaxed">
                            {evt.desc}
                          </p>
                        )}

                        {/* Checklists status */}
                        {totalChecks > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[var(--text-dim)]">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              {completedChecks}/{totalChecks} tasks
                            </span>
                            <span className="text-[10px] text-white/50 group-hover:text-white transition-colors">
                              Details →
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
