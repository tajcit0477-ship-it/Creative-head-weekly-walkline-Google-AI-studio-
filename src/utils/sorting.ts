import { WorklineEvent } from '../types/workline';

/**
 * Calculates priority weight for an event.
 * 'priority' category tasks are tier-1.
 * Upcoming events relative to current time get a time-urgency boost.
 */
export function getSmartSortScore(event: WorklineEvent, referenceDate: Date = new Date()): number {
  let score = 0;

  // 1. Category Tier Weight
  if (event.category === 'priority' || event.title.toUpperCase().includes('TOP PRIORITY')) {
    score += 1000;
  } else if (event.category === 'weekend' && event.title.toUpperCase().includes('PRIORITY')) {
    score += 850;
  } else if (event.isDaily && event.title.toLowerCase().includes('status update')) {
    score += 650;
  } else if (event.isDaily && event.title.toLowerCase().includes('golden hour')) {
    score += 600;
  } else if (event.category === 'rentals') {
    score += 450;
  } else if (event.category === 'venue') {
    score += 400;
  } else if (event.category === 'content') {
    score += 350;
  } else if (event.category === 'kickoff') {
    score += 300;
  } else if (event.category === 'nightwrap') {
    score += 100;
  }

  // 2. Upcoming Time factor
  // Parse event time (HH:MM)
  const [hours, minutes] = event.time.split(':').map(Number);
  const eventMinutes = hours === 0 ? 1440 : hours * 60 + minutes;

  const nowHours = referenceDate.getHours();
  const nowMinutes = referenceDate.getMinutes();
  const nowTotalMinutes = nowHours * 60 + nowMinutes;

  // If the event is coming up soon today, give a proximity bonus
  if (eventMinutes >= nowTotalMinutes) {
    const diff = eventMinutes - nowTotalMinutes;
    // The sooner it happens today, the higher the upcoming boost (up to 150 points)
    score += Math.max(0, 150 - Math.floor(diff / 10));
  } else {
    // Event has already passed today
    score -= 50;
  }

  return score;
}

/**
 * Sorts events according to Smart Sort:
 * Top priority category first, then by upcoming urgency and time.
 */
export function sortEventsSmart(events: WorklineEvent[], referenceDate: Date = new Date()): WorklineEvent[] {
  return [...events].sort((a, b) => {
    const scoreA = getSmartSortScore(a, referenceDate);
    const scoreB = getSmartSortScore(b, referenceDate);

    if (scoreA !== scoreB) {
      return scoreB - scoreA; // Descending score
    }

    // Fallback tie-breaker: Earlier time
    if (a.time === '00:00') return 1;
    if (b.time === '00:00') return -1;
    return a.time.localeCompare(b.time);
  });
}

/**
 * Standard chronological sort by start time
 */
export function sortEventsChronological(events: WorklineEvent[]): WorklineEvent[] {
  return [...events].sort((a, b) => {
    if (a.time === '00:00') return 1;
    if (b.time === '00:00') return -1;
    return a.time.localeCompare(b.time);
  });
}
