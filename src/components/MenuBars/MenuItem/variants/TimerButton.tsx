import {useState} from "react";
import store, {useAppSelector} from "store";
import {ActionFactory} from "store/action";
import Dropdown from "components/Dropdown";
import {DropdownButton} from "components/MenuBars/MenuItem/DropdownButton";
import {ReactComponent as TimerIcon} from "assets/icon-timer.svg";

export const TimerButton = () => {
  const timer = useAppSelector((state) => state.board.data?.timerUTCEndTime);
  const [customTime, setCustomTime] = useState(0);

  return (
    <DropdownButton direction="left" label="Timer" icon={TimerIcon}>
      <Dropdown>
        <Dropdown.Main>
          <Dropdown.ItemButton onClick={() => store.dispatch(ActionFactory.setTimer(new Date(new Date().getTime() + 3 * 60000)))}>1 Minute</Dropdown.ItemButton>
          <Dropdown.ItemButton onClick={() => store.dispatch(ActionFactory.setTimer(new Date(new Date().getTime() + 3 * 60000)))}>3 Minute</Dropdown.ItemButton>
          <Dropdown.ItemButton onClick={() => store.dispatch(ActionFactory.setTimer(new Date(new Date().getTime() + 5 * 60000)))}>5 Minute</Dropdown.ItemButton>
          <Dropdown.ItemButton onClick={() => store.dispatch(ActionFactory.setTimer(new Date(new Date().getTime() + customTime * 60000)))}>
            <span>Custom time</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCustomTime((prev) => Math.max(--prev, 0));
              }}
            >
              -
            </button>
            <input
              type="number"
              min={0}
              max={59}
              value={customTime}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setCustomTime(Math.min(parseInt(e.target.value, 10), 59))}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCustomTime((prev) => Math.min(++prev, 59));
              }}
            >
              +
            </button>
          </Dropdown.ItemButton>
        </Dropdown.Main>
        {timer != null && (
          <Dropdown.Footer>
            <Dropdown.ItemButton onClick={() => store.dispatch(ActionFactory.cancelTimer())}>Cancel Timer</Dropdown.ItemButton>
          </Dropdown.Footer>
        )}
      </Dropdown>
    </DropdownButton>
  );
};
