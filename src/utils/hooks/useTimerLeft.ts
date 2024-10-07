import {useEffect, useState} from "react";
import {Timer as TimerUtils} from "../timer";

/**
 * A hook which calculates the time left based on a provided end Date.
 * Intended for: https://github.com/inovex/scrumlr.io/issues/4217
 * @param timerEnd contains the timestamp for when the timer expires
 * @returns The time which is left according to the provided timerEnd
 */
export const useTimer = (timerEnd?: Date) => {
  const [timerExpired, setTimerExpired] = useState(false);
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timerEnd === undefined) {
      return undefined;
    }
    const updateTimer = () => {
      const newTimeLeft = TimerUtils.calculateTimeLeft(timerEnd);

      if (newTimeLeft.h === 0 && newTimeLeft.m === 0 && newTimeLeft.s === 0) {
        setTimerExpired(true);
      } else {
        timer = setTimeout(updateTimer, 250);
        setTimerExpired(false);
      }
    };
    updateTimer();
    return () => clearTimeout(timer);
  }, [timerEnd]);

  return timerExpired;
};
