import {useState} from "react";
import store, {useAppSelector} from "store";
import {ActionFactory} from "store/action";
import Dropdown from "components/Dropdown";
import {DropdownButton} from "components/MenuBars/MenuItem/DropdownButton";
import {ReactComponent as TimerIcon} from "assets/icon-timer.svg";
import "./TimerButton.scss";

export const TimerButton = () => {
  const timer = useAppSelector((state) => state.board.data?.timerUTCEndTime);
  const [customTime, setCustomTime] = useState(10);

  return (
    <DropdownButton direction="left" label="Timer" icon={TimerIcon}>
      <Dropdown className="timer__dropdown">
        <Dropdown.Main>
          <Dropdown.ItemButton className="timer-dropdown__item-button" onClick={() => store.dispatch(ActionFactory.setTimer(new Date(new Date().getTime() + 1 * 60000)))}>
            <label>1 minute</label>
            <div>1</div>
          </Dropdown.ItemButton>
          <Dropdown.ItemButton className="timer-dropdown__item-button" onClick={() => store.dispatch(ActionFactory.setTimer(new Date(new Date().getTime() + 3 * 60000)))}>
            <label>3 minute</label>
            <div>3</div>
          </Dropdown.ItemButton>
          <Dropdown.ItemButton className="timer-dropdown__item-button" onClick={() => store.dispatch(ActionFactory.setTimer(new Date(new Date().getTime() + 5 * 60000)))}>
            <label>5 minute</label>
            <div>5</div>
          </Dropdown.ItemButton>
          <Dropdown.ItemButton className="timer-dropdown__item-button" onClick={() => store.dispatch(ActionFactory.setTimer(new Date(new Date().getTime() + customTime * 60000)))}>
            <label>Custom time</label>
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
              <label>Cancel Timer</label>
              <div>x</div>
            </Dropdown.ItemButton>
          </Dropdown.Footer>
        )}
      </Dropdown>
    </DropdownButton>
  );
};
