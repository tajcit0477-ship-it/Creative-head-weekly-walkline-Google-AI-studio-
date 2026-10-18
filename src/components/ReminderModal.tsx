import React, { useState, useEffect } from 'react';
import { Bell, Clock, Calendar, Volume2, VolumeX, AlertCircle, X, Check } from 'lucide-react';
import { EventCategory, ReminderItem, WorklineEvent } from '../types/workline';
import { CATEGORY_THEMES } from '../data/defaultSchedule';
import { playClickTone, playReminderChime } from '../utils/audio';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: WorklineEvent | null;
  targetDate?: Date;
  onSaveReminder: (reminder: ReminderItem) => void;
  existingReminder?: ReminderItem | null;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  event,
  targetDate,
  onSaveReminder,
  existingReminder,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('kickoff');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('14:00');
  const [offsetMinutes, setOffsetMinutes] = useState(0);
  const [notes, setNotes] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [browserNotify, setBrowserNotify] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
      if (Notification.permission === 'granted') {
        setBrowserNotify(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (existingReminder) {
      setTitle(existingReminder.title);
      setCategory(existingReminder.category);
      const dt = new Date(existingReminder.reminderDateTime);
      setDateStr(dt.toISOString().split('T')[0]);
      setTimeStr(`${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`);
      setOffsetMinutes(existingReminder.offsetMinutes);
      setNotes(existingReminder.notes || '');
      setSoundEnabled(existingReminder.soundEnabled);
      setBrowserNotify(existingReminder.browserNotify);
      return;
    }

    if (event) {
      setTitle(event.title);
      setCategory(event.category);
      setNotes(event.desc || '');
      setTimeStr(event.time);
    } else {
      setTitle('');
      setCategory('kickoff');
      setNotes('');
      const now = new Date();
      setTimeStr(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    }

    const d = targetDate || new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setDateStr(`${year}-${month}-${day}`);
    setOffsetMinutes(0);
  }, [isOpen, event, targetDate, existingReminder]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setPermissionStatus(perm);
      if (perm === 'granted') {
        setBrowserNotify(true);
      } else {
        setBrowserNotify(false);
      }
    }
  };

  const applyOffset = (mins: number) => {
    setOffsetMinutes(mins);
    playClickTone();
    if (!event) return;

    // Calculate time based on event time minus offset
    const [h, m] = event.time.split(':').map(Number);
    const dateObj = new Date(dateStr);
    dateObj.setHours(h, m - mins, 0, 0);

    const adjustedH = String(dateObj.getHours()).padStart(2, '0');
    const adjustedM = String(dateObj.getMinutes()).padStart(2, '0');
    setTimeStr(`${adjustedH}:${adjustedM}`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dateStr || !timeStr) return;

    // Build ISO timestamp
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const reminderDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

    const reminder: ReminderItem = {
      id: existingReminder ? existingReminder.id : `rem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      eventId: event?.id,
      title: title.trim(),
      category,
      reminderDateTime: reminderDate.toISOString(),
      offsetMinutes,
      notes: notes.trim(),
      soundEnabled,
      browserNotify: browserNotify && permissionStatus === 'granted',
      status: 'pending',
      createdAt: existingReminder ? existingReminder.createdAt : new Date().toISOString(),
    };

    onSaveReminder(reminder);
    playClickTone();
    onClose();
  };

  const currentTheme = CATEGORY_THEMES[category] || CATEGORY_THEMES.kickoff;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${currentTheme.bg} border ${currentTheme.border}`}>
              <Bell className={`w-4 h-4 ${currentTheme.color}`} />
            </div>
            <div>
              <h2 id="reminder-modal-title" className="text-base font-semibold text-white">
                {existingReminder ? 'Edit Event Reminder' : 'Set Event Reminder'}
              </h2>
              <p className="text-xs text-[var(--text-dim)]">
                Notify before night club & dining operations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-[var(--text-muted)] hover:text-white rounded-lg hover:bg-[var(--surface-3)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Event / Task Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Venue Checks: Low haze machine testing"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-white placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-purple)] transition-colors"
            />
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Workline Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(CATEGORY_THEMES) as EventCategory[]).map((cat) => {
                const theme = CATEGORY_THEMES[cat];
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      playClickTone();
                    }}
                    className={`px-2.5 py-2 rounded-xl text-xs font-medium border text-left truncate transition-all ${
                      isSelected
                        ? `${theme.bg} ${theme.border} ${theme.color} ring-1 ring-current`
                        : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text-muted)]'
                    }`}
                  >
                    {theme.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Picker */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                Reminder Date
              </label>
              <input
                type="date"
                required
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-white font-mono focus:outline-none focus:border-[var(--accent-purple)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                Alert Time
              </label>
              <input
                type="time"
                required
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-white font-mono focus:outline-none focus:border-[var(--accent-purple)] transition-colors"
              />
            </div>
          </div>

          {/* Quick Offset Shortcuts (if linked to an event) */}
          {event && (
            <div>
              <span className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                Quick Trigger Presets (Event at {event.displayTime})
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'At event start', mins: 0 },
                  { label: '10 min before', mins: 10 },
                  { label: '15 min before', mins: 15 },
                  { label: '30 min before', mins: 30 },
                  { label: '1 hr before', mins: 60 },
                ].map((preset) => (
                  <button
                    key={preset.mins}
                    type="button"
                    onClick={() => applyOffset(preset.mins)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
                      offsetMinutes === preset.mins
                        ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)]'
                        : 'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)] hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Alert Notes & Action Checklist
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Check laser sync, prep golden hour gear, review ad CTR"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-white placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-purple)] transition-colors resize-none"
            />
          </div>

          {/* Notification Options: Sound & Browser Push */}
          <div className="pt-2 border-t border-[var(--border)] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-[var(--text-dim)]" />
                )}
                <div>
                  <div className="text-xs font-medium text-white">Chime Audio Alert</div>
                  <div className="text-[11px] text-[var(--text-dim)]">Play nightclub chime on trigger</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => playReminderChime()}
                  className="px-2 py-1 text-[10px] rounded bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-white border border-[var(--border)]"
                >
                  Test Sound
                </button>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent-purple)] focus:ring-[var(--accent-purple)]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#38bdf8]" />
                <div>
                  <div className="text-xs font-medium text-white">Desktop Notification</div>
                  <div className="text-[11px] text-[var(--text-dim)]">
                    {permissionStatus === 'granted'
                      ? 'Browser notifications enabled'
                      : permissionStatus === 'denied'
                      ? 'Blocked by browser permissions'
                      : 'Requires browser permission'}
                  </div>
                </div>
              </div>
              {permissionStatus === 'granted' ? (
                <input
                  type="checkbox"
                  checked={browserNotify}
                  onChange={(e) => setBrowserNotify(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent-purple)] focus:ring-[var(--accent-purple)]"
                />
              ) : (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="px-2.5 py-1 text-xs rounded-lg bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-white border border-[var(--border)]"
                >
                  Enable
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-black bg-white hover:bg-slate-100 rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Check className="w-3.5 h-3.5" />
              {existingReminder ? 'Update Reminder' : 'Set Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
