const calculateTimeLeft = (endTime: Date): {h: number; m: number; s: number} => {
  const difference = +endTime - +new Date();
  return {
    h: Math.max(Math.floor((difference / 1000 / 60 / 60) % 24), 0),
    m: Math.max(Math.floor((difference / 1000 / 60) % 60), 0),
    s: Math.max(Math.floor((difference / 1000) % 60), 0),
  };
};

// Returns the percentage of the total time that is left
const calculateElapsedTimePercentage = (startTime: Date, endTime: Date): number => {
  const difference = +new Date() - +startTime;
  const total = +endTime - +startTime;
  return 1 - Math.min(difference / total, 1);
};

const addOffsetToDate = (date: Date | undefined, offset: number): Date | undefined => {
  if (!date) return undefined;
  return new Date(new Date(date).getTime() + offset);
};

const removeOffsetFromDate = (date: Date | undefined, offset: number): Date | undefined => {
  if (!date) return undefined;
  return new Date(new Date(date).getTime() - offset);
};

export const Timer = {
  calculateTimeLeft,
  calculateElapsedTimePercentage,
  addOffsetToDate,
  removeOffsetFromDate,
};
