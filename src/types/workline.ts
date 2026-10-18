export type EventCategory =
  | 'kickoff'
  | 'content'
  | 'venue'
  | 'briefing'
  | 'priority'
  | 'rentals'
  | 'weekend'
  | 'nightwrap';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface WorklineEvent {
  id: string;
  title: string;
  time: string; // "14:00"
  displayTime: string; // "2:00 PM"
  endTime?: string; // "18:00"
  displayEnd?: string; // "6:00 PM"
  category: EventCategory;
  desc?: string;
  location?: string;
  isDaily?: boolean;
  dayOfWeek?: string; // "Monday", "Tuesday", etc.
  checklists?: ChecklistItem[];
}

export interface WorklineDay {
  name: string;
  short: string;
  date: Date;
  dateString: string; // "YYYY-MM-DD"
  events: WorklineEvent[];
}

export interface ReminderItem {
  id: string;
  eventId?: string;
  title: string;
  category: EventCategory;
  reminderDateTime: string; // ISO string e.g. "2026-10-09T14:30:00"
  offsetMinutes: number; // 0, 15, 30, 60, etc.
  notes?: string;
  soundEnabled: boolean;
  browserNotify: boolean;
  status: 'pending' | 'triggered' | 'snoozed' | 'completed';
  createdAt: string;
  triggeredAt?: string;
}

export interface CategoryTheme {
  label: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
  dot: string;
}
