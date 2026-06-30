export interface DurationComponents {
  milliseconds: number;
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
}

export const getDurationComponents = (date: Date): DurationComponents => {
  const absoluteMs = date.getTime();

  const seconds = Math.floor(absoluteMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  return {
    milliseconds: absoluteMs,
    seconds,
    minutes,
    hours,
    days,
  };
};

/**
 * compares two dates and returns duration components alongside calendar-specific context.
 */
export const getTimeDifference = (date1: Date, date2: Date): DurationComponents => {
  // calculate the raw difference and take absolute value just in case they're flipped
  const diffMs = Math.abs(date1.getTime() - date2.getTime());

  return getDurationComponents(new Date(diffMs));
};

// check yesterday by calendar (i.e., not by relative time difference)
export const isDateYesterday = (date: Date, now = new Date()) => {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  return date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
};
