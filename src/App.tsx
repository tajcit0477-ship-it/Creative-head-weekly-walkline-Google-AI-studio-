import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { WeeklyGrid } from './components/WeeklyGrid';
import { ReminderModal } from './components/ReminderModal';
import { RemindersDrawer } from './components/RemindersDrawer';
import { ActiveNotificationBanner } from './components/ActiveNotificationBanner';
import { EventDetailModal } from './components/EventDetailModal';
import { DailyStatusGenerator } from './components/DailyStatusGenerator';
import { WeeklyBreakdown } from './components/WeeklyBreakdown';

import { ReminderItem, WorklineDay, WorklineEvent } from './types/workline';
import { RAW_SCHEDULE_ITEMS } from './data/defaultSchedule';
import {
  getStoredReminders,
  saveStoredReminders,
  getChecklistState,
  saveChecklistState,
  getSmartSortPreference,
  saveSmartSortPreference,
} from './utils/storage';
import { playReminderChime } from './utils/audio';

// Helper to get Monday of the specified date's week
function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'status' | 'breakdown'>('calendar');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [smartSortEnabled, setSmartSortEnabled] = useState<boolean>(true);

  // Reminders state
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<ReminderItem[]>([]);


  // Modals state
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderTargetEvent, setReminderTargetEvent] = useState<WorklineEvent | null>(null);
  const [reminderTargetDate, setReminderTargetDate] = useState<Date>(new Date());
  const [editingReminder, setEditingReminder] = useState<ReminderItem | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<WorklineEvent | null>(null);
  const [selectedEventDate, setSelectedEventDate] = useState<Date>(new Date());

  // Checklists state (stored by item ID)
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});

  // Initialize stored data
  useEffect(() => {
    const loadedReminders = getStoredReminders();
    setReminders(loadedReminders);

    const loadedChecklists = getChecklistState();
    setChecklistState(loadedChecklists);

    const sortPref = getSmartSortPreference();
    setSmartSortEnabled(sortPref);
  }, []);

  const handleToggleSmartSort = (enabled: boolean) => {
    setSmartSortEnabled(enabled);
    saveSmartSortPreference(enabled);
  };


  // Sync reminders to local storage
  const updateReminders = useCallback((newReminders: ReminderItem[]) => {
    setReminders(newReminders);
    saveStoredReminders(newReminders);
  }, []);

  // Heartbeat Reminder Checker (Checks every second)
  useEffect(() => {
    const interval = setInterval(() => {
      const nowMs = Date.now();

      setReminders((prevReminders) => {
        let hasChanges = false;
        const updated = prevReminders.map((rem) => {
          if (rem.status === 'completed' || rem.status === 'triggered') {
            return rem;
          }

          const targetMs = new Date(rem.reminderDateTime).getTime();
          // If reminder target time has arrived (within 1 minute window or overdue)
          if (targetMs <= nowMs) {
            hasChanges = true;

            // Trigger notification
            if (rem.soundEnabled) {
              playReminderChime();
            }

            if (rem.browserNotify && typeof window !== 'undefined' && 'Notification' in window) {
              if (Notification.permission === 'granted') {
                try {
                  new Notification(`Alert: ${rem.title}`, {
                    body: rem.notes || `Scheduled for ${new Date(rem.reminderDateTime).toLocaleTimeString()}`,
                    icon: '/favicon.ico',
                  });
                } catch (err) {
                  console.warn('Desktop notification error:', err);
                }
              }
            }

            // Push to active alerts if not already present
            setActiveAlerts((prevAlerts) => {
              if (prevAlerts.some((a) => a.id === rem.id)) return prevAlerts;
              return [...prevAlerts, { ...rem, status: 'triggered' }];
            });

            return {
              ...rem,
              status: 'triggered' as const,
              triggeredAt: new Date().toISOString(),
            };
          }

          return rem;
        });

        if (hasChanges) {
          saveStoredReminders(updated);
          return updated;
        }
        return prevReminders;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Build the 7-day operational schedule for current week
  const days: WorklineDay[] = useMemo(() => {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return dayNames.map((name, index) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + index);

      const y = dayDate.getFullYear();
      const m = String(dayDate.getMonth() + 1).padStart(2, '0');
      const d = String(dayDate.getDate()).padStart(2, '0');
      const dateString = `${y}-${m}-${d}`;

      // Filter events belonging to this day
      const dayEvents: WorklineEvent[] = [];

      RAW_SCHEDULE_ITEMS.forEach((raw, idx) => {
        let matches = false;
        if (raw.isDaily) {
          matches = true;
        } else if (raw.dayOfWeek === name) {
          matches = true;
        }

        if (matches) {
          dayEvents.push({
            ...raw,
            id: `${name}-${idx}-${raw.time}`,
            dayOfWeek: name,
          });
        }
      });

      // Sort by time (night wrap at 00:00 stays at the bottom of the workline)
      dayEvents.sort((a, b) => {
        if (a.time === '00:00') return 1;
        if (b.time === '00:00') return -1;
        return a.time.localeCompare(b.time);
      });

      return {
        name,
        short: name.slice(0, 3).toUpperCase(),
        date: dayDate,
        dateString,
        events: dayEvents,
      };
    });
  }, [weekStart]);

  // Reminder Actions
  const handleSaveReminder = (savedReminder: ReminderItem) => {
    const existingIndex = reminders.findIndex((r) => r.id === savedReminder.id);
    let updated: ReminderItem[];
    if (existingIndex >= 0) {
      updated = [...reminders];
      updated[existingIndex] = savedReminder;
    } else {
      updated = [savedReminder, ...reminders];
    }
    updateReminders(updated);

    // If it was in active alerts, update it
    setActiveAlerts((prev) =>
      prev.filter((a) => a.id !== savedReminder.id)
    );
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    updateReminders(updated);
    setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleCompleteReminder = (id: string) => {
    const updated = reminders.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status: (r.status === 'completed' ? 'pending' : 'completed') as ReminderItem['status'],
        };
      }
      return r;
    });
    updateReminders(updated);
    setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSnoozeReminder = (id: string, minutes: number) => {
    const newTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    const updated = reminders.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          reminderDateTime: newTime,
          status: 'snoozed' as const,
        };
      }
      return r;
    });
    updateReminders(updated);
    setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDismissAlert = (id: string) => {
    setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Checklist Actions
  const handleToggleChecklist = (checklistId: string) => {
    setChecklistState((prev) => {
      const next = { ...prev, [checklistId]: !prev[checklistId] };
      saveChecklistState(next);
      return next;
    });
  };

  // Week Navigation
  const handlePrevWeek = () => {
    setWeekStart((prev) => new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const handleNextWeek = () => {
    setWeekStart((prev) => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  const handleResetWeek = () => {
    setWeekStart(getMonday(new Date()));
  };

  const handleOpenNewReminder = () => {
    setReminderTargetEvent(null);
    setReminderTargetDate(new Date());
    setEditingReminder(null);
    setIsReminderModalOpen(true);
  };

  const handleSetEventReminder = (evt: WorklineEvent, date: Date) => {
    const existing = reminders.find(
      (r) => r.eventId === evt.id && r.status !== 'completed'
    );
    setReminderTargetEvent(evt);
    setReminderTargetDate(date);
    setEditingReminder(existing || null);
    setIsReminderModalOpen(true);
  };

  const handleSelectEvent = (evt: WorklineEvent, date: Date) => {
    setSelectedEvent(evt);
    setSelectedEventDate(date);
  };

  const activeRemindersCount = reminders.filter((r) => r.status !== 'completed').length;
  const dueRemindersCount = reminders.filter(
    (r) => r.status !== 'completed' && new Date(r.reminderDateTime).getTime() <= Date.now()
  ).length;

  return (
    <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--text)] relative overflow-x-hidden">
      {/* Background radial glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden print-hidden">
        <div className="absolute -top-[200px] left-[10%] w-[60%] max-w-[600px] h-[400px] rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.14),transparent_70%)] blur-[50px]" />
        <div className="absolute -top-[100px] right-[5%] w-[50%] max-w-[500px] h-[350px] rounded-full bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.12),transparent_70%)] blur-[50px]" />
        <div className="absolute top-[40%] left-[-5%] w-[40%] max-w-[400px] h-[250px] rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.06),transparent_70%)] blur-[50px]" />
      </div>

      {/* Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        reminderCount={activeRemindersCount}
        dueCount={dueRemindersCount}
        onOpenReminders={() => setIsDrawerOpen(true)}
        onOpenNewReminder={handleOpenNewReminder}
        onPrint={() => window.print()}
      />

      {/* Main View Area */}
      <main className="mx-auto max-w-[1600px] px-4 md:px-8 py-6 relative z-10">
        {activeTab === 'calendar' && (
          <WeeklyGrid
            days={days}
            categoryFilter={categoryFilter}
            onFilterChange={setCategoryFilter}
            selectedEventId={selectedEvent?.id || null}
            onSelectEvent={handleSelectEvent}
            onQuickReminder={handleSetEventReminder}
            reminders={reminders}
            checklistState={checklistState}
            weekStartDate={weekStart}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
            onResetWeek={handleResetWeek}
            smartSortEnabled={smartSortEnabled}
            onToggleSmartSort={handleToggleSmartSort}
          />
        )}


        {activeTab === 'status' && <DailyStatusGenerator />}

        {activeTab === 'breakdown' && <WeeklyBreakdown />}
      </main>

      {/* Floating Active Alerts Banner */}
      <ActiveNotificationBanner
        reminders={activeAlerts}
        onDismiss={handleDismissAlert}
        onComplete={handleCompleteReminder}
        onSnooze={handleSnoozeReminder}
      />

      {/* Modals & Drawers */}
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setEditingReminder(null);
        }}
        event={reminderTargetEvent}
        targetDate={reminderTargetDate}
        onSaveReminder={handleSaveReminder}
        existingReminder={editingReminder}
      />

      <RemindersDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        reminders={reminders}
        onAddNew={handleOpenNewReminder}
        onEdit={(rem) => {
          setEditingReminder(rem);
          setReminderTargetEvent(null);
          setIsDrawerOpen(false);
          setIsReminderModalOpen(true);
        }}
        onDelete={handleDeleteReminder}
        onComplete={handleCompleteReminder}
        onSnooze={handleSnoozeReminder}
      />

      <EventDetailModal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
        targetDate={selectedEventDate}
        reminders={reminders}
        checklistState={checklistState}
        onToggleChecklist={handleToggleChecklist}
        onSetReminder={(evt, date) => {
          setSelectedEvent(null);
          handleSetEventReminder(evt, date);
        }}
      />

      {/* Print Footer */}
      <footer className="mt-16 border-t border-[var(--border)] py-6 text-center text-xs font-mono text-[var(--text-dim)] print-hidden">
        Creative Head Operational Workline · Night Club & Dining · Dark-hours schedule IST · Real-time event reminders
      </footer>
    </div>
  );
}
