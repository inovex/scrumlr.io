import store, {useAppSelector} from "store";
import {ActionFactory} from "store/action";
import Dropdown from "components/MenuBars/MenuDropdown/Dropdown";
import {DropdownButton} from "components/MenuBars/MenuDropdown/DropdownButton";
import {ReactComponent as TimerIcon} from "assets/icon-timer.svg";

export const TimerButton = () => {
  const timer = useAppSelector((state) => state.board.data?.timerUTCEndTime);

  return (
    <DropdownButton direction="left" label="Timer" icon={TimerIcon}>
      <Dropdown>
        <Dropdown.Main>
          <Dropdown.Item>
            <button onClick={() => store.dispatch(ActionFactory.setTimer(new Date(new Date().getTime() + 1 * 60000)))}>1 Minute</button>
          </Dropdown.Item>
          <Dropdown.Item>
            <button onClick={() => store.dispatch(ActionFactory.setTimer(new Date(new Date().getTime() + 3 * 60000)))}>3 Minute</button>
          </Dropdown.Item>
          <Dropdown.Item>
            <button onClick={() => store.dispatch(ActionFactory.setTimer(new Date(new Date().getTime() + 5 * 60000)))}>5 Minute</button>
          </Dropdown.Item>
        </Dropdown.Main>
        {timer != null && (
          <Dropdown.Footer>
            <Dropdown.Item>
              <button onClick={() => store.dispatch(ActionFactory.cancelTimer())}>Cancel Timer</button>
            </Dropdown.Item>
          </Dropdown.Footer>
        )}
      </Dropdown>
    </DropdownButton>
  );
};
