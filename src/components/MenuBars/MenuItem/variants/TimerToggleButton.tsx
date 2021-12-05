import {useState} from "react";
import store, {useAppSelector} from "store";
import {ActionFactory} from "store/action";
import Dropdown from "components/Dropdown";
import {DropdownToggleButton} from "components/MenuBars/MenuItem/DropdownToggleButton";
import {ReactComponent as TimerIcon} from "assets/icon-timer.svg";
import "./TimerToggleButton.scss";
import {useTranslation} from "react-i18next";
import {TabIndex} from "constants/tabIndex";

type TimerToggleButtonProps = {
  tabIndex?: number;
};

export const TimerToggleButton = (props: TimerToggleButtonProps) => {
  const {t} = useTranslation();

  const timer = useAppSelector((state) => state.board.data?.timerUTCEndTime);
  const [customTime, setCustomTime] = useState(10);
  const [tabable, setTabable] = useState(false);

  const onClick = (minutes: number) => {
    store.dispatch(ActionFactory.setTimer(new Date(new Date().getTime() + minutes * 60 * 1000)));
  };

  const focusOnTab = (tabIndex: number) => (tabable ? (props.tabIndex ? props.tabIndex + tabIndex : TabIndex.default) : TabIndex.disabled);

  return (
    <DropdownToggleButton tabIndex={props.tabIndex ?? TabIndex.default} setTabable={setTabable} direction="left" label={t("TimerToggleButton.label")} icon={TimerIcon}>
      <Dropdown className="timer__dropdown">
        <Dropdown.Main>
          <Dropdown.ItemButton tabIndex={focusOnTab(1)} className="timer-dropdown__item-button" onClick={() => onClick(1)} onTouchEnd={() => onClick(1)}>
            <label>{t("TimerToggleButton.1min")}</label>
            <div>1</div>
          </Dropdown.ItemButton>
          <Dropdown.ItemButton tabIndex={focusOnTab(2)} className="timer-dropdown__item-button" onClick={() => onClick(3)} onTouchEnd={() => onClick(3)}>
            <label>{t("TimerToggleButton.3min")}</label>
            <div>3</div>
          </Dropdown.ItemButton>
          <Dropdown.ItemButton tabIndex={focusOnTab(3)} className="timer-dropdown__item-button" onClick={() => onClick(5)} onTouchEnd={() => onClick(5)}>
            <label>{t("TimerToggleButton.5min")}</label>
            <div>5</div>
          </Dropdown.ItemButton>
          <Dropdown.ItemButton tabIndex={focusOnTab(4)} className="timer-dropdown__item-button" onClick={() => onClick(customTime)} onTouchEnd={() => onClick(customTime)}>
            <label>{t("TimerToggleButton.customTime")}</label>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCustomTime((prev) => Math.min(++prev, 59));
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCustomTime((prev) => Math.min(++prev, 59));
              }}
              tabIndex={focusOnTab(7)}
              className="timer-dropdown__time-button"
            >
              +
            </button>
            <input tabIndex={focusOnTab(6)} value={customTime} onClick={(e) => e.stopPropagation()} onChange={(e) => setCustomTime(Math.min(parseInt(e.target.value, 10), 59))} />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCustomTime((prev) => Math.max(--prev, 0));
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCustomTime((prev) => Math.max(--prev, 0));
              }}
              tabIndex={focusOnTab(5)}
              className="timer-dropdown__time-button"
            >
              -
            </button>
          </Dropdown.ItemButton>
        </Dropdown.Main>
        {timer != null && (
          <Dropdown.Footer>
            <Dropdown.ItemButton
              tabIndex={focusOnTab(8)}
              className="timer-dropdown__item-button"
              onClick={() => store.dispatch(ActionFactory.cancelTimer())}
              onTouchEnd={() => store.dispatch(ActionFactory.cancelTimer())}
            >
              <label>{t("TimerToggleButton.cancelTimer")}</label>
              <div>x</div>
            </Dropdown.ItemButton>
          </Dropdown.Footer>
        )}
      </Dropdown>
    </DropdownToggleButton>
  );
};
