import {useEffect, useRef, useState} from "react";
import classNames from "classnames";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import "./Timer.scss";
import {useTranslation} from "react-i18next";
import useSound from "use-sound";

type TimerProps = {
  endTime: Date;
};

const usePrevious = (value: boolean) => {
  const ref = useRef<boolean>();
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

  const isModerator = useAppSelector((state) => state.participants?.self.role === "OWNER" || state.participants?.self.role === "MODERATOR");

  const [playCountdownAudio, {stop: stopCountdownAudio}] = useSound(`${process.env.PUBLIC_URL}/timer_warning.mp3`, {volume: 0.5});
  const [playTimesUpAudio, {stop: stopTimesUpAudio}] = useSound(`${process.env.PUBLIC_URL}/timer_finished.mp3`, {volume: 0.5});
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
    if (previousPlayCountdownState && !playCountdown) {
      stopCountdownAudio();
    } else if (!previousPlayCountdownState && playCountdown) {
      playCountdownAudio();
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playCountdown]);

  useEffect(() => {
    if (!previousPlayTimesUpState && playTimesUp) {
      playTimesUpAudio();
      return () => {
        stopTimesUpAudio();
        setPlayTimesUp(false);
      };
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playTimesUp]);

  useEffect(() => {
    if (timeLeft.m === 0 && !playTimesUp) {
      if (timeLeft.s <= 0) {
        if (playCountdown) {
          setPlayCountdown(false);
          setPlayTimesUp(true);
        }
      } else if (timeLeft.s <= 5 && !playCountdown) {
        setPlayCountdown(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  return (
    <div id="timer" className={classNames("timer", {"timer--expired": timeLeft.m === 0 && timeLeft.s === 0})}>
      <span>
        {String(timeLeft!.m).padStart(2, "0")}:{String(timeLeft!.s).padStart(2, "0")}
      </span>
      {isModerator && (
        <button onClick={() => store.dispatch(Actions.cancelTimer())} title={t("Timer.stopTimer")}>
          <CloseIcon />
        </button>
      )}
    </div>
  );
};
