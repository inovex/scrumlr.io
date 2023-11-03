import {VFC, useState, useEffect} from "react";
import {useTranslation} from "react-i18next";
import {Dialog} from "components/Dialog";
import {useNavigate} from "react-router-dom";
import store, {useAppSelector} from "store";
import {ReactComponent as PlusIcon} from "assets/icon-plus.svg";
import {ReactComponent as MinusIcon} from "assets/icon-minus.svg";
import {ReactComponent as OneIcon} from "assets/icon-one.svg";
import {ReactComponent as ThreeIcon} from "assets/icon-three.svg";
import {ReactComponent as FiveIcon} from "assets/icon-five.svg";
import {Actions} from "store/action";
import "./TimerDialog.scss";
import {getNumberFromStorage, saveToStorage} from "utils/storage";
import {CUSTOM_TIMER_STORAGE_KEY} from "constants/storage";

export const TimerDialog: VFC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const isAdmin = useAppSelector((state) => state.participants?.self.role === "OWNER" || state.participants?.self.role === "MODERATOR");
  const [customTime, setCustomTime] = useState(getNumberFromStorage(CUSTOM_TIMER_STORAGE_KEY, 10));

  const startTimer = (minutes: number) => {
    store.dispatch(Actions.setTimer(minutes));
    navigate("..");
  };

  const [startPositionX, setStartPositionX] = useState(0);

  useEffect(() => {
    const onUpdate = (e: MouseEvent) => {
      if (startPositionX) {
        setCustomTime(Math.max(1, Math.min(59, Math.abs(Math.floor((e.clientX - startPositionX) / 10)))));
      }
    };

    const onEnd = () => {
      setStartPositionX(0);
    };

    document.addEventListener("mousemove", onUpdate);
    document.addEventListener("mouseup", onEnd);
    return () => {
      document.removeEventListener("mousemove", onUpdate);
      document.removeEventListener("mouseup", onEnd);
    };
  }, [startPositionX]);

  if (!isAdmin) {
    navigate("..");
  }

  return (
    <Dialog className="timer-dialog accent-color__planning-pink" title={t("TimerToggleButton.label")} onClose={() => navigate("..")}>
      <button className="dialog__button" onClick={() => startTimer(1)} data-testid="timer-dialog__1-minute-button">
        <label>{t("TimerToggleButton.1min")}</label>
        <OneIcon className="timer-dialog__button-icon" />
      </button>
      <button className="dialog__button" onClick={() => startTimer(3)} data-testid="timer-dialog__3-minute-button">
        <label>{t("TimerToggleButton.3min")}</label>
        <ThreeIcon className="timer-dialog__button-icon" />
      </button>
      <button className="dialog__button" onClick={() => startTimer(5)} data-testid="timer-dialog__5-minute-button">
        <label>{t("TimerToggleButton.5min")}</label>
        <FiveIcon className="timer-dialog__button-icon" />
      </button>
      <button
        className="dialog__button"
        onClick={() => {
          startTimer(customTime);
          saveToStorage(CUSTOM_TIMER_STORAGE_KEY, String(customTime));
        }}
        data-testid="timer-dialog__custom-minute-button"
      >
        <label>{t("TimerToggleButton.customTime")}</label>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCustomTime((prev: number) => Math.max(--prev, 1));
          }}
          className="timer-dialog__time-button"
          data-testid="timer-dialog__minus-button"
          aria-label={t("Timer.reduce")}
        >
          <MinusIcon />
        </button>
        <label className="timer-dialog__time-label" onMouseDown={(e) => setStartPositionX(e.clientX)}>
          {customTime}
        </label>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCustomTime((prev: number) => Math.min(++prev, 59));
          }}
          className="timer-dialog__time-button"
          data-testid="timer-dialog__plus-button"
          aria-label={t("Timer.increase")}
        >
          <PlusIcon />
        </button>
      </button>
    </Dialog>
  );
};
