import ReactDOM from "react-dom";
import {useEffect, useState} from "react";
import Parse from "parse";
import classNames from "classnames";
import store, {useAppSelector} from "store";
import {ActionFactory} from "store/action";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import "./Timer.scss";

type TimerProps = {
  endTime: Date;
};

export const Timer = (props: TimerProps) => {
  const calculateTime = () => {
    const difference = +props.endTime - +new Date();
    // In this object the remaining time is calculated
    // If the ending date of the timer is past the current date, it will show zero
    return {
      h: Math.max(Math.floor((difference / 1000 / 60 / 60) % 24), 0),
      m: Math.max(Math.floor((difference / 1000 / 60) % 60), 0),
      s: Math.max(Math.floor((difference / 1000) % 60), 0),
    };
  };

  const isModerator = useAppSelector((state) => state.users.admins.some((user) => user.id === Parse.User.current()?.id));
  const warningSound = new Audio(process.env.PUBLIC_URL + '/timer_warning.mp3');
  const finishedSound = new Audio(process.env.PUBLIC_URL + '/timer_finished.mp3');
  const [timeLeft, setTimeLeft] = useState<{h: number; m: number; s: number}>(calculateTime());
  const [hasPlayedWarningSound, setHasPlayedWarningSound] = useState(false);
  const [hasPlayedFinishedSound, setHasPlayedFinishedSound] = useState(false);

  useEffect(() => {
    const timerUpdateTimeout = setTimeout(() => {
      setTimeLeft(calculateTime());
    }, 250);
    return () => clearTimeout(timerUpdateTimeout);
  });

  useEffect(() => {
    if (timeLeft.m === 0 && timeLeft.s <= 30 && !hasPlayedWarningSound) {
      setHasPlayedWarningSound(true);
      warningSound.play()
    }

    if (timeLeft.m === 0 && timeLeft.s <= 0 && !hasPlayedFinishedSound) {
      setHasPlayedFinishedSound(true);
      finishedSound.play()
    }
  })

  return ReactDOM.createPortal(
    <aside id="timer" className={classNames("timer", {"timer--expired": timeLeft.m === 0 && timeLeft.s === 0})}>
      <span>
        {String(timeLeft!.m).padStart(2, "0")}:{String(timeLeft!.s).padStart(2, "0")}
      </span>
      {isModerator && (
        <button onClick={() => store.dispatch(ActionFactory.cancelTimer())} title="Stop timer">
          <CloseIcon />
        </button>
      )}
    </aside>,
    document.getElementById("root")!
  );
};
