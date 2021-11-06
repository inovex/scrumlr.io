import {useState} from "react";
import store, {useAppSelector} from "store";
import {ActionFactory} from "store/action";
import Dropdown from "components/Dropdown";
import {DropdownToggleButton} from "components/MenuBars/MenuItem/DropdownToggleButton";
import {ReactComponent as TimerIcon} from "assets/icon-timer.svg";
import "./TimerToggleButton.scss";
import {useTranslation} from "react-i18next";

export const TimerToggleButton = () => {
  const {t} = useTranslation();

  const timer = useAppSelector((state) => state.board.data?.timerUTCEndTime);
  const [customTime, setCustomTime] = useState(10);

  const onClick = (minutes: number) => {
    store.dispatch(ActionFactory.setTimer(new Date(new Date().getTime() + minutes * 60 * 1000)));
  };

  return (
    <DropdownToggleButton direction="left" label={t("TimerToggleButton.label")} icon={TimerIcon}>
      <Dropdown className="timer__dropdown">
        <Dropdown.Main>
          <Dropdown.ItemButton className="timer-dropdown__item-button" onClick={() => onClick(1)}>
            <label>{t("TimerToggleButton.1min")}</label>
            <div>1</div>
          </Dropdown.ItemButton>
          <Dropdown.ItemButton className="timer-dropdown__item-button" onClick={() => onClick(3)}>
            <label>{t("TimerToggleButton.3min")}</label>
            <div>3</div>
          </Dropdown.ItemButton>
          <Dropdown.ItemButton className="timer-dropdown__item-button" onClick={() => onClick(5)}>
            <label>{t("TimerToggleButton.5min")}</label>
            <div>5</div>
          </Dropdown.ItemButton>
          <Dropdown.ItemButton className="timer-dropdown__item-button" onClick={() => onClick(customTime)}>
            <label>{t("TimerToggleButton.customTime")}</label>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCustomTime((prev) => Math.min(++prev, 59));
              }}
            >
              +
            </button>
            <input value={customTime} onClick={(e) => e.stopPropagation()} onChange={(e) => setCustomTime(Math.min(parseInt(e.target.value, 10), 59))} />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCustomTime((prev) => Math.max(--prev, 0));
              }}
            >
              -
            </button>
          </Dropdown.ItemButton>
        </Dropdown.Main>
        {timer != null && (
          <Dropdown.Footer>
            <Dropdown.ItemButton className="timer-dropdown__item-button" onClick={() => store.dispatch(ActionFactory.cancelTimer())}>
              <label>{t("TimerToggleButton.cancelTimer")}</label>
              <div>x</div>
            </Dropdown.ItemButton>
          </Dropdown.Footer>
        )}
      </Dropdown>
    </DropdownToggleButton>
  );
};
