import {useState} from "react";
import {useTranslation} from "react-i18next";
import {Dialog} from "components/Dialog";
import {useNavigate} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "store";
import {getNumberFromStorage, saveToStorage} from "utils/storage";
import {CUSTOM_TIMER_STORAGE_KEY} from "constants/storage";
import {Plus, Minus} from "components/Icon";
import "./TimerDialog.scss";
import {setTimer} from "store/features";

export const TimerDialog = () => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const navigate = useNavigate();
  const isAdmin = useAppSelector((state) => state.participants?.self?.role === "OWNER" || state.participants?.self?.role === "MODERATOR");
  const [customTime, setCustomTime] = useState(getNumberFromStorage(CUSTOM_TIMER_STORAGE_KEY, 10));

  const startTimer = (minutes: number) => {
    dispatch(setTimer(minutes));
    navigate("..");
  };

  if (!isAdmin) {
    navigate("..");
  }

  return (
    <Dialog className="timer-dialog accent-color__planning-pink" title={t("TimerToggleButton.label")} onClose={() => navigate("..")}>
      <button className="dialog__button" onClick={() => startTimer(1)} data-testid="timer-dialog__1-minute-button">
        <label>{t("TimerToggleButton.1min")}</label>
        <span className="timer-dialog__button-icon">1</span>
      </button>
      <button className="dialog__button" onClick={() => startTimer(3)} data-testid="timer-dialog__3-minute-button">
        <label>{t("TimerToggleButton.3min")}</label>
        <span className="timer-dialog__button-icon">3</span>
      </button>
      <button className="dialog__button" onClick={() => startTimer(5)} data-testid="timer-dialog__5-minute-button">
        <label>{t("TimerToggleButton.5min")}</label>
        <span className="timer-dialog__button-icon">5</span>
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
        <div className="timer-dialog__custom-time-controls">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCustomTime((prev: number) => Math.max(--prev, 1));
            }}
            className="timer-dialog__time-button"
            data-testid="timer-dialog__minus-button"
            aria-label={t("Timer.reduce")}
          >
            <Minus />
          </button>
          <label className="timer-dialog__time-label">{customTime}</label>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCustomTime((prev: number) => Math.min(++prev, 59));
            }}
            className="timer-dialog__time-button"
            data-testid="timer-dialog__plus-button"
            aria-label={t("Timer.increase")}
          >
            <Plus />
          </button>
        </div>
      </button>
    </Dialog>
  );
};
