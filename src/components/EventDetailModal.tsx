import React from 'react';
import {
  Bell,
  Clock,
  MapPin,
  CheckCircle2,
  X,
  Check,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { ReminderItem, WorklineEvent } from '../types/workline';
import { CATEGORY_THEMES } from '../data/defaultSchedule';
import { playClickTone } from '../utils/audio';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: WorklineEvent | null;
  targetDate: Date;
  reminders: ReminderItem[];
  checklistState: Record<string, boolean>;
  onToggleChecklist: (checklistId: string) => void;
  onSetReminder: (event: WorklineEvent, targetDate: Date) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  event,
  targetDate,
  reminders,
  checklistState,
  onToggleChecklist,
  onSetReminder,
}) => {
  if (!isOpen || !event) return null;

  const theme = CATEGORY_THEMES[event.category] || CATEGORY_THEMES.kickoff;
  const existingReminder = reminders.find(
    (r) => r.eventId === event.id && r.status !== 'completed'
  );

  const dateFormatted = targetDate.toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const totalChecklists = event.checklists?.length || 0;
  const completedChecklists =
    event.checklists?.filter((c) => checklistState[c.id]).length || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full border ${theme.bg} ${theme.color} ${theme.border}`}
                >
                  {theme.label}
                </span>
                {event.isDaily && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/10">
                    Daily Ritual
                  </span>
                )}
              </div>
              <h2 id="event-detail-title" className="text-xl font-bold text-white tracking-tight">
                {event.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 text-[var(--text-muted)] hover:text-white rounded-lg hover:bg-[var(--surface-3)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Meta strip */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--text-dim)]">
            <span className="flex items-center gap-1.5 text-white">
              <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              {event.displayTime} {event.displayEnd ? `→ ${event.displayEnd}` : ''}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              {dateFormatted}
            </span>
            {event.location && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                  <MapPin className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                  {event.location}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Description */}
          {event.desc && (
            <div>
              <h4 className="text-xs font-medium uppercase font-mono text-[var(--text-dim)] mb-1.5">
                Overview & Instructions
              </h4>
              <p className="text-xs text-[var(--text-muted)] font-mono leading-relaxed bg-[var(--surface-2)] p-3.5 rounded-xl border border-[var(--border)]">
                {event.desc}
              </p>
            </div>
          )}

          {/* Active Reminder Banner */}
          {existingReminder && (
            <div className="p-3.5 rounded-xl bg-[var(--accent-purple)]/10 border border-[var(--accent-purple)]/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-[#d8b4fe] animate-pulse" />
                <div>
                  <div className="text-xs font-semibold text-white">
                    Reminder Scheduled
                  </div>
                  <div className="text-[11px] font-mono text-[#d8b4fe]/80">
                    Set for{' '}
                    {new Date(existingReminder.reminderDateTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  playClickTone();
                  onSetReminder(event, targetDate);
                }}
                className="px-2.5 py-1 text-[11px] rounded bg-[var(--surface-3)] text-white hover:bg-[var(--surface)] border border-[var(--border)]"
              >
                Modify
              </button>
            </div>
          )}

          {/* Checklist Tasks */}
          {event.checklists && event.checklists.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium uppercase font-mono text-[var(--text-dim)]">
                  Shift Checkpoints
                </h4>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  {completedChecklists} / {totalChecklists} completed
                </span>
              </div>

              <div className="space-y-2">
                {event.checklists.map((checkItem) => {
                  const isChecked = !!checklistState[checkItem.id];
                  return (
                    <button
                      key={checkItem.id}
                      type="button"
                      onClick={() => {
                        playClickTone();
                        onToggleChecklist(checkItem.id);
                      }}
                      className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                        isChecked
                          ? 'bg-[var(--surface-2)]/50 border-[var(--border)] opacity-60'
                          : 'bg-[var(--surface-2)] border-[var(--border)] hover:border-[var(--text-dim)]'
                      }`}
                    >
                      <div
                        className={`mt-0.5 w-4 h-4 rounded border grid place-items-center shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-emerald-400 border-emerald-400 text-black'
                            : 'border-[var(--border)] text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span
                        className={`text-xs font-mono leading-relaxed ${
                          isChecked ? 'line-through text-[var(--text-dim)]' : 'text-white'
                        }`}
                      >
                        {checkItem.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between">
          <button
            onClick={() => {
              playClickTone();
              onSetReminder(event, targetDate);
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--surface-3)] border border-[var(--border)] text-white hover:bg-[var(--surface)] transition-colors flex items-center gap-2"
          >
            <Bell className="w-3.5 h-3.5 text-[var(--accent-purple)]" />
            {existingReminder ? 'Change Reminder' : 'Set Event Reminder'}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
