import ReactDOM from "react-dom";
import {useEffect, useRef, useState} from "react";
import Parse from "parse";
import classNames from "classnames";
import store, {useAppSelector} from "store";
import {ActionFactory} from "store/action";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import "./Timer.scss";
import {useTranslation} from "react-i18next";

type TimerProps = {
  endTime: Date;
};

const stopAudio = (audio: HTMLAudioElement) => {
  audio.pause();
  audio.currentTime = 0;
};

const usePrevious = (value: any) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export const Timer = (props: TimerProps) => {
  const {t} = useTranslation();

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
  const countdownAudio = new Audio(`${process.env.PUBLIC_URL}/timer_warning.mp3`);
  const timesUpAudio = new Audio(`${process.env.PUBLIC_URL}/timer_finished.mp3`);
  const [timeLeft, setTimeLeft] = useState<{h: number; m: number; s: number}>(calculateTime());
  const [playCountdown, setPlayCountdown] = useState(false);
  const [playTimesUp, setPlayTimesUp] = useState(false);
  const previousPlayCountdownState = usePrevious(playCountdown);
  const previousPlayTimesUpState = usePrevious(playTimesUp);

  useEffect(() => {
    const timerUpdateTimeout = setTimeout(() => {
      setTimeLeft(calculateTime());
    }, 250);
    return () => clearTimeout(timerUpdateTimeout);
  });

  useEffect(() => {
    if (!previousPlayCountdownState && playCountdown) {
      countdownAudio.play();
      return () => {
        stopAudio(countdownAudio);
      };
    }
    return () => {};
  }, [playCountdown]);

  useEffect(() => {
    if (!previousPlayTimesUpState && playTimesUp) {
      timesUpAudio.play();
      return () => {
        stopAudio(timesUpAudio);
      };
    }
    return () => {};
  }, [playTimesUp]);

  useEffect(() => {
    if (timeLeft.m === 0) {
      if (timeLeft.s <= 30 && !playCountdown) {
        setPlayCountdown(true);
      } else if (timeLeft.s <= 0 && !playTimesUp) {
        setPlayTimesUp(true);
      }
    }
  }, [timeLeft]);

  return ReactDOM.createPortal(
    <aside id="timer" className={classNames("timer", {"timer--expired": timeLeft.m === 0 && timeLeft.s === 0})}>
      <span>
        {String(timeLeft!.m).padStart(2, "0")}:{String(timeLeft!.s).padStart(2, "0")}
      </span>
      {isModerator && (
        <button onClick={() => store.dispatch(ActionFactory.cancelTimer())} title={t("Timer.stopTimer")}>
          <CloseIcon />
        </button>
      )}
    </aside>,
    document.getElementById("root")!
  );
};
