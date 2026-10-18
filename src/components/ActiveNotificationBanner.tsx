import React from 'react';
import { BellRing, CheckCircle2, Clock, X, RotateCcw } from 'lucide-react';
import { ReminderItem } from '../types/workline';
import { CATEGORY_THEMES } from '../data/defaultSchedule';
import { playClickTone } from '../utils/audio';

interface ActiveNotificationBannerProps {
  reminders: ReminderItem[];
  onDismiss: (id: string) => void;
  onComplete: (id: string) => void;
  onSnooze: (id: string, minutes: number) => void;
}

export const ActiveNotificationBanner: React.FC<ActiveNotificationBannerProps> = ({
  reminders,
  onDismiss,
  onComplete,
  onSnooze,
}) => {
  if (reminders.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none"
      role="region"
      aria-label="Active Reminders"
    >
      {reminders.map((reminder) => {
        const theme = CATEGORY_THEMES[reminder.category] || CATEGORY_THEMES.kickoff;
        const timeFormatted = new Date(reminder.reminderDateTime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div
            key={reminder.id}
            className={`pointer-events-auto rounded-2xl bg-[var(--surface-2)]/95 backdrop-blur-xl border border-[var(--border)] p-4 shadow-2xl transition-all animate-in slide-in-from-bottom-5 duration-300 ${theme.glow}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${theme.bg} ${theme.border} border animate-pulse`}>
                  <BellRing className={`w-4 h-4 ${theme.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full ${theme.bg} ${theme.color} border ${theme.border}`}>
                      {theme.label}
                    </span>
                    <span className="text-xs font-mono text-[var(--text-dim)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeFormatted}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                    {reminder.title}
                  </h4>
                </div>
              </div>
              <button
                onClick={() => {
                  playClickTone();
                  onDismiss(reminder.id);
                }}
                className="text-[var(--text-dim)] hover:text-white p-1 rounded-lg hover:bg-[var(--surface-3)] transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notes if available */}
            {reminder.notes && (
              <p className="mt-2.5 text-xs text-[var(--text-muted)] font-mono leading-relaxed bg-[var(--surface)] p-2.5 rounded-lg border border-[var(--border)]">
                {reminder.notes}
              </p>
            )}

            {/* Action Bar */}
            <div className="mt-3.5 pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    playClickTone();
                    onSnooze(reminder.id, 5);
                  }}
                  className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-white border border-[var(--border)] flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  +5m
                </button>
                <button
                  onClick={() => {
                    playClickTone();
                    onSnooze(reminder.id, 15);
                  }}
                  className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-white border border-[var(--border)] flex items-center gap-1 transition-colors"
                >
                  +15m
                </button>
              </div>

              <button
                onClick={() => {
                  playClickTone();
                  onComplete(reminder.id);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-black bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark Completed
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
