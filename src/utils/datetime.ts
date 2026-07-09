/**
 * represents duration components of a date or timespan.
 * this is not to be understood as the sum of the components are equal to a date, but rather each component represents the timespan in its unit.
 * @example
 * // 1 day is represented as
 * {
 *   milliseconds: 86_400_000;
 *   seconds: 86_400;
 *   minutes: 1440;
 *   hours: 24;
 *   days: 1;
 * }
 */
export interface TimeUnitComponents {
  milliseconds: number;
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
}

/**
 * decomposes a given time span in milliseconds into its equivalent components
 * including days, hours, minutes, seconds, and the original milliseconds.
 *
 * @param {number} timeSpanMs - The time span in milliseconds to be decomposed.
 * @returns {TimeUnitComponents} An object containing the time span broken into
 * its respective components: milliseconds, seconds, minutes, hours, and days.
 */
export const decomposeTimeUnitComponents = (timeSpanMs: number): TimeUnitComponents => {
  const seconds = Math.floor(timeSpanMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  return {
    milliseconds: timeSpanMs,
    seconds,
    minutes,
    hours,
    days,
  };
};

/**
 * returns the absolute time difference between two dates in milliseconds.
 */
export const getTimeDifference = (date1: Date, date2: Date): number =>
  // calculate the raw difference and take absolute value just in case they're flipped
  Math.abs(date1.getTime() - date2.getTime());

// check yesterday by calendar (i.e., not by relative time difference)
export const isDateYesterday = (date: Date, now = new Date()) => {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  return date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
};
