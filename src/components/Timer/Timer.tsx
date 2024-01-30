import {useEffect, useRef, useState} from "react";
import classNames from "classnames";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {ReactComponent as CancelIcon} from "assets/icon-cancel.svg";
import {ReactComponent as TimerIcon} from "assets/icon-timer.svg";
import {ReactComponent as CheckIcon} from "assets/icon-check.svg";
import {ReactComponent as PlusOneIcon} from "assets/icon-plus-one.svg";
import {ReactComponent as FlagIcon} from "assets/icon-flag.svg";
import {useTranslation} from "react-i18next";
import {Toast} from "utils/Toast";
import useSound from "use-sound";
import {API} from "api";
import {Timer as TimerUtils} from "utils/timer";
import "./Timer.scss";
import {TOAST_TIMER_DEFAULT} from "constants/misc";

type TimerProps = {
  startTime: Date;
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

  const allParticipantsReady = useAppSelector(
    (state) =>
      state.participants!.others.filter((p) => p.connected && p.role === "PARTICIPANT").length &&
      state.participants!.others.filter((p) => p.connected && p.role === "PARTICIPANT").every((participant) => participant.ready)
  );
  const anyReady = useAppSelector((state) => state.participants!.others.filter((p) => p.connected).some((participant) => participant.ready));
  const isModerator = useAppSelector((state) => state.participants?.self.role === "OWNER" || state.participants?.self.role === "MODERATOR");
  const isReady = useAppSelector((state) => state.participants?.self.ready);
  const boardId = useAppSelector((state) => state.board.data!.id);
  const me = useAppSelector((state) => state.participants?.self);

  const [playTimesUpSound, {sound: timesUpSoundObject}] = useSound(`${process.env.PUBLIC_URL}/timer_finished.mp3`, {volume: 0.5, interrupt: true});
  const [timeLeft, setTimeLeft] = useState<{h: number; m: number; s: number}>(TimerUtils.calculateTimeLeft(props.endTime));
  const [elapsedTimePercentage, setElapsedTimePercentage] = useState<number>(TimerUtils.calculateElapsedTimePercentage(props.startTime, props.endTime));
  const [timesUpShouldPlay, setTimesUpShouldPlay] = useState(false);
  const [playTimesUp, setPlayTimesUp] = useState(false);
  const previousPlayTimesUpState = usePrevious(playTimesUp);

  useEffect(() => {
    const timerUpdateTimeout = setTimeout(() => {
      setTimeLeft(TimerUtils.calculateTimeLeft(props.endTime));
      setElapsedTimePercentage(TimerUtils.calculateElapsedTimePercentage(props.startTime, props.endTime));
    }, 250);
    return () => clearTimeout(timerUpdateTimeout);
  });

  useEffect(() => {
    if (!previousPlayTimesUpState && playTimesUp) {
      timesUpSoundObject.on("end", () => setPlayTimesUp(false));
      playTimesUpSound();
      if (!isModerator && !isReady) {
        Toast.info({
          title: t("Toast.ready"),
          buttons: [t("Toast.readyButton")],
          firstButtonOnClick: () => store.dispatch(Actions.setUserReadyStatus(me!.user.id, true)),
        });
      }
      if (isModerator && anyReady) {
        Toast.info({
          title: t("Toast.moderatorResetReadyStates"),
          buttons: [t("Toast.moderatorResetReadyStatesButton")],
          firstButtonOnClick: () => API.updateReadyStates(boardId, false),
          autoClose: false,
        });
      }
    }

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playTimesUp]);

  useEffect(() => {
    if (timeLeft.m === 0 && !playTimesUp) {
      if (timeLeft.s <= 0) {
        if (timesUpShouldPlay) {
          setPlayTimesUp(true);
          setTimesUpShouldPlay(false);
        }
      } else if (!timesUpShouldPlay) {
        setTimesUpShouldPlay(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  useEffect(() => {
    if (isModerator && allParticipantsReady && Object.values(timeLeft).some((time) => time > 0)) {
      Toast.info({title: t("Toast.allParticipantsDone"), autoClose: TOAST_TIMER_DEFAULT});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allParticipantsReady, isModerator]);

  return (
    <div className="timer__container">
      <div id="timer" className={classNames("timer", {"timer--expired": timeLeft.m === 0 && timeLeft.s === 0})}>
        <div className="timer__progress-bar" style={{right: `calc(72px - ${elapsedTimePercentage} * 72px)`}} />
        <span>
          {String(timeLeft!.m).padStart(2, "0")}:{String(timeLeft!.s).padStart(2, "0")}
        </span>
        <div className="timer__short-actions">
          {isModerator && (
            <div className="short-actions__short-action">
              <button aria-label={t("Timer.endTimer")} className="short-action__button" onClick={() => store.dispatch(Actions.cancelTimer())}>
                <FlagIcon />
              </button>
              <span className="short-action__tooltip">{t("Timer.endTimer")}</span>
            </div>
          )}
          <div className="short-actions__short-action">
            <button
              aria-label={isReady ? t("MenuBars.unmarkAsDone") : t("MenuBars.markAsDone")}
              className={classNames("short-action__button", {"short-action__button--ready": isReady}, {"short-action__button--unready": !isReady})}
              onClick={() => store.dispatch(Actions.setUserReadyStatus(me!.user.id, !isReady))}
            >
              <CheckIcon className="short-action__check-icon" />
              <CancelIcon className="short-action__cancel-icon" />
            </button>
            <span className="short-action__tooltip">{isReady ? t("MenuBars.unmarkAsDone") : t("MenuBars.markAsDone")}</span>
          </div>
        </div>
        <TimerIcon />
      </div>
      {isModerator && (
        <div className="timer__increment-button">
          <button aria-label={t("Timer.addOneMinute")} className="increment-button__button" onClick={() => store.dispatch(Actions.incrementTimer())}>
            <PlusOneIcon />
          </button>
          <span className="increment-button__tooltip">{t("Timer.addOneMinute")}</span>
        </div>
      )}
    </div>
  );
};
