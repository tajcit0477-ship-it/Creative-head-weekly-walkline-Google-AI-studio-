import React, { useState } from 'react';
import {
  Bell,
  Clock,
  Calendar,
  CheckCircle2,
  Trash2,
  Volume2,
  X,
  Plus,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { ReminderItem } from '../types/workline';
import { CATEGORY_THEMES } from '../data/defaultSchedule';
import { playClickTone, playReminderChime } from '../utils/audio';

interface RemindersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: ReminderItem[];
  onAddNew: () => void;
  onEdit: (reminder: ReminderItem) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onSnooze: (id: string, minutes: number) => void;
}

export const RemindersDrawer: React.FC<RemindersDrawerProps> = ({
  isOpen,
  onClose,
  reminders,
  onAddNew,
  onEdit,
  onDelete,
  onComplete,
  onSnooze,
}) => {
  const [filter, setFilter] = useState<'active' | 'all' | 'completed'>('active');

  if (!isOpen) return null;

  const now = new Date();

  const filteredReminders = reminders.filter((rem) => {
    if (filter === 'completed') return rem.status === 'completed';
    if (filter === 'active') return rem.status !== 'completed';
    return true;
  });

  // Sort by date/time ascending
  const sortedReminders = [...filteredReminders].sort((a, b) => {
    return new Date(a.reminderDateTime).getTime() - new Date(b.reminderDateTime).getTime();
  });

  const activeCount = reminders.filter((r) => r.status !== 'completed').length;
  const completedCount = reminders.filter((r) => r.status === 'completed').length;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminders-drawer-title"
    >
      <div className="w-full max-w-md h-full bg-[var(--surface)] border-l border-[var(--border)] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--accent-purple)]/15 border border-[var(--accent-purple)]/30 text-[var(--accent-purple)]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 id="reminders-drawer-title" className="text-base font-bold text-white">
                Scheduled Reminders
              </h2>
              <p className="text-xs text-[var(--text-dim)]">
                {activeCount} active · {completedCount} completed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 text-[var(--text-muted)] hover:text-white rounded-lg hover:bg-[var(--surface-3)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Filter buttons & Add New */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 p-1 bg-[var(--surface-2)] rounded-lg border border-[var(--border)]">
            <button
              onClick={() => {
                setFilter('active');
                playClickTone();
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'active'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => {
                setFilter('completed');
                playClickTone();
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'completed'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              Done ({completedCount})
            </button>
            <button
              onClick={() => {
                setFilter('all');
                playClickTone();
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              All
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => playReminderChime()}
              title="Test audio chime"
              className="p-2 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)] hover:text-white transition-colors"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                playClickTone();
                onAddNew();
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--accent-purple)] hover:bg-[var(--accent-purple)]/90 text-white flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>

        {/* List of Reminders */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sortedReminders.length === 0 ? (
            <div className="py-16 text-center text-xs text-[var(--text-dim)] flex flex-col items-center justify-center">
              <Clock className="w-10 h-10 mb-3 text-[var(--text-dim)]/50" />
              <p className="font-medium text-white mb-1">No reminders found</p>
              <p className="text-[11px] max-w-xs text-[var(--text-muted)]">
                {filter === 'completed'
                  ? 'Completed reminders will be archived here.'
                  : 'Set reminders for venue checks, manager syncs, golden hour shoots, or ad audits.'}
              </p>
              {filter !== 'completed' && (
                <button
                  onClick={onAddNew}
                  className="mt-4 px-4 py-2 text-xs font-medium text-black bg-white rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Create First Reminder
                </button>
              )}
            </div>
          ) : (
            sortedReminders.map((rem) => {
              const theme = CATEGORY_THEMES[rem.category] || CATEGORY_THEMES.kickoff;
              const dt = new Date(rem.reminderDateTime);
              const isPast = dt.getTime() < now.getTime() && rem.status !== 'completed';
              const dateFormatted = dt.toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                weekday: 'short',
              });
              const timeFormatted = dt.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={rem.id}
                  className={`rounded-xl border p-3.5 transition-all bg-[var(--surface-2)] ${
                    rem.status === 'completed'
                      ? 'border-[var(--border)] opacity-60'
                      : isPast
                      ? 'border-[#f87171]/40 bg-[#f87171]/5'
                      : 'border-[var(--border)] hover:border-[var(--text-dim)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => {
                          playClickTone();
                          onComplete(rem.id);
                        }}
                        className={`mt-0.5 p-1 rounded-md border transition-colors ${
                          rem.status === 'completed'
                            ? 'bg-emerald-400 text-black border-emerald-400'
                            : 'border-[var(--border)] hover:border-emerald-400 text-transparent hover:text-emerald-400'
                        }`}
                        title={rem.status === 'completed' ? 'Mark uncompleted' : 'Mark completed'}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full border ${theme.bg} ${theme.color} ${theme.border}`}
                          >
                            {theme.label}
                          </span>
                          {isPast && (
                            <span className="text-[9px] font-mono text-[#f87171] bg-[#f87171]/10 px-1.5 py-0.5 rounded border border-[#f87171]/20 flex items-center gap-1">
                              <AlertCircle className="w-2.5 h-2.5" />
                              DUE
                            </span>
                          )}
                        </div>
                        <h4
                          className={`text-xs font-semibold mt-1.5 leading-snug ${
                            rem.status === 'completed' ? 'line-through text-[var(--text-muted)]' : 'text-white'
                          }`}
                        >
                          {rem.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          playClickTone();
                          onDelete(rem.id);
                        }}
                        className="p-1.5 text-[var(--text-dim)] hover:text-red-400 rounded-lg hover:bg-[var(--surface-3)] transition-colors"
                        title="Delete reminder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {rem.notes && (
                    <p className="mt-2 text-[11px] text-[var(--text-muted)] font-mono leading-relaxed bg-[var(--surface)] p-2 rounded border border-[var(--border)]">
                      {rem.notes}
                    </p>
                  )}

                  <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-[11px] font-mono text-[var(--text-dim)]">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[var(--text-dim)]" />
                        {dateFormatted}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-[var(--text-muted)]">
                        <Clock className="w-3 h-3" />
                        {timeFormatted}
                      </span>
                    </div>

                    {rem.status !== 'completed' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            playClickTone();
                            onSnooze(rem.id, 10);
                          }}
                          className="px-2 py-0.5 rounded bg-[var(--surface-3)] hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          +10m
                        </button>
                        <button
                          onClick={() => {
                            playClickTone();
                            onEdit(rem);
                          }}
                          className="px-2 py-0.5 rounded bg-[var(--surface-3)] hover:text-white transition-colors text-[10px]"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
