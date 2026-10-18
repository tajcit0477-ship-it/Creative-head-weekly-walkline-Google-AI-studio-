import { ReminderItem, WorklineEvent } from '../types/workline';

const REMINDERS_KEY = 'nightclub_creative_reminders_v1';
const CHECKLIST_KEY = 'nightclub_checklist_state_v1';
const CUSTOM_EVENTS_KEY = 'nightclub_custom_events_v1';

export function getStoredReminders(): ReminderItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredReminders(reminders: ReminderItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  } catch (err) {
    console.error('Failed to save reminders:', err);
  }
}

export function getChecklistState(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveChecklistState(state: Record<string, boolean>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save checklist state:', err);
  }
}

export function getCustomEvents(): WorklineEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomEvents(events: WorklineEvent[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_EVENTS_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save custom events:', err);
  }
}

const SMART_SORT_KEY = 'nightclub_smart_sort_preference_v1';

export function getSmartSortPreference(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const val = localStorage.getItem(SMART_SORT_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function saveSmartSortPreference(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SMART_SORT_KEY, enabled ? 'true' : 'false');
  } catch (err) {
    console.error('Failed to save smart sort preference:', err);
  }
}

