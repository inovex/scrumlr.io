import {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import classNames from "classnames";
import "./Timer.scss";

type TimerProps = {
  endTime: Date;
};

export const Timer = (props: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState<{h: number; m: number; s: number} | null>(null);

  useEffect(() => {
    const timerUpdateTimeout = setTimeout(() => {
      const difference = +props.endTime - +new Date();
      setTimeLeft({
        h: Math.max(Math.floor((difference / 1000 / 60 / 60) % 24), 0),
        m: Math.max(Math.floor((difference / 1000 / 60) % 60), 0),
        s: Math.max(Math.floor((difference / 1000) % 60), 0),
      });
    }, 250);
    return () => clearTimeout(timerUpdateTimeout);
  });

  if (!timeLeft) return null;
  return ReactDOM.createPortal(
    <aside className={classNames("timer", {"timer--expired": timeLeft.m === 0 && timeLeft.s === 0})}>
      {String(timeLeft!.m).padStart(2, "0")}:{String(timeLeft!.s).padStart(2, "0")}
    </aside>,
    document.body
  );
};
