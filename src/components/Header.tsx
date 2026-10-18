import React from 'react';
import { Bell, Calendar, Printer, CheckCircle2 } from 'lucide-react';
import { playClickTone } from '../utils/audio';

interface HeaderProps {
  activeTab: 'calendar' | 'status' | 'breakdown';
  onTabChange: (tab: 'calendar' | 'status' | 'breakdown') => void;
  reminderCount: number;
  dueCount: number;
  onOpenReminders: () => void;
  onOpenNewReminder: () => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  reminderCount,
  dueCount,
  onOpenReminders,
  onOpenNewReminder,
  onPrint,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--bg)]/90 border-b border-[var(--border)]">
      <div className="mx-auto max-w-[1600px] px-5 md:px-8 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-4 w-1 bg-gradient-to-b from-[var(--accent-purple)] to-[var(--accent-pink)] rounded-full" />
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('calendar');
            }}
            className="text-base font-bold tracking-tight text-white whitespace-nowrap hover:opacity-90 transition-opacity"
          >
            Creative Head <span className="text-[var(--text-dim)] font-normal">· Night Club & Dining</span>
          </a>
        </div>

        {/* Zone 2: Navigation Links (single-line, whitespace-nowrap) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[var(--text-muted)]">
          <button
            onClick={() => {
              playClickTone();
              onTabChange('calendar');
            }}
            className={`transition-colors whitespace-nowrap pb-0.5 border-b-2 ${
              activeTab === 'calendar'
                ? 'text-white border-[var(--accent-purple)]'
                : 'border-transparent hover:text-white'
            }`}
          >
            Weekly Workline
          </button>
          <button
            onClick={() => {
              playClickTone();
              onTabChange('status');
            }}
            className={`transition-colors whitespace-nowrap pb-0.5 border-b-2 ${
              activeTab === 'status'
                ? 'text-white border-[var(--accent-purple)]'
                : 'border-transparent hover:text-white'
            }`}
          >
            Manager Sync
          </button>
          <button
            onClick={() => {
              playClickTone();
              onTabChange('breakdown');
            }}
            className={`transition-colors whitespace-nowrap pb-0.5 border-b-2 ${
              activeTab === 'breakdown'
                ? 'text-white border-[var(--accent-purple)]'
                : 'border-transparent hover:text-white'
            }`}
          >
            Flow Breakdown
          </button>
          <button
            onClick={() => {
              playClickTone();
              onPrint();
            }}
            className="border-transparent hover:text-white transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Briefing
          </button>
        </nav>

        {/* Zone 3: Primary Action (Reminders Center + Quick Add) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              playClickTone();
              onOpenReminders();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${
              dueCount > 0
                ? 'bg-[#f87171]/20 text-[#f87171] border-[#f87171]/40 animate-pulse'
                : reminderCount > 0
                ? 'bg-[var(--accent-purple)]/15 text-[#d8b4fe] border-[var(--accent-purple)]/40 hover:bg-[var(--accent-purple)]/25'
                : 'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)] hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">
              {reminderCount} Reminders
            </span>
            {dueCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#f87171] animate-ping" />
            )}
          </button>

          <button
            onClick={() => {
              playClickTone();
              onOpenNewReminder();
            }}
            className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-semibold text-black bg-white hover:bg-slate-100 rounded-xl transition-all shadow-sm items-center gap-1.5 whitespace-nowrap"
          >
            + Set Reminder
          </button>
        </div>
      </div>
    </header>
  );
};
