export function formatEventDate(date: string | Date | null | undefined): string {
  if (!date) {
    return 'Date TBD';
  }
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatEventDateRange(startDate: string | Date, endDate?: string | Date | null): string {
  const start = formatEventDate(startDate);
  
  if (!endDate) {
    return start;
  }
  
  const end = formatEventDate(endDate);
  
  if (start === end) {
    return start;
  }
  
  return `${start} - ${end}`;
}

export function formatShortDate(date: string | Date | null | undefined): string {
  if (!date) {
    return 'Date TBD';
  }
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function isUpcoming(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
}

export function isPast(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
}

export function formatISO(date: Date): string {
  return date.toISOString();
}