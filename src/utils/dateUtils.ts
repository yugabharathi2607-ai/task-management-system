/**
 * Formats an optional YYYY-MM-DD date string into a readable label.
 */
export function formatDueDate(dueDate: string): string {
  if (!dueDate) {
    return 'No due date';
  }

  const parts = dueDate.split('-');
  if (parts.length !== 3) {
    return dueDate;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const date = new Date(year, month, day);

  if (Number.isNaN(date.getTime())) {
    return dueDate;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Returns today's local date in YYYY-MM-DD format.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks whether a YYYY-MM-DD date is strictly before today.
 */
export function isOverdueDate(dueDate: string, status: 'Pending' | 'Completed'): boolean {
  if (!dueDate || status === 'Completed') {
    return false;
  }
  return dueDate < getTodayDateString();
}

/**
 * Checks whether a YYYY-MM-DD date is due today or within the next 2 days.
 */
export function isDueSoon(dueDate: string, status: 'Pending' | 'Completed'): boolean {
  if (!dueDate || status === 'Completed') {
    return false;
  }
  const today = getTodayDateString();
  if (dueDate < today) {
    return false;
  }
  const [y, m, d] = today.split('-').map(Number);
  const threshold = new Date(y, m - 1, d + 2);
  const thresholdStr = [
    threshold.getFullYear(),
    String(threshold.getMonth() + 1).padStart(2, '0'),
    String(threshold.getDate()).padStart(2, '0'),
  ].join('-');
  return dueDate <= thresholdStr;
}

/**
 * Formats an ISO timestamp into a compact human-readable date.
 */
export function formatCreatedDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
