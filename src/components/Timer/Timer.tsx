import ReactDOM from "react-dom";
import {useEffect, useState} from "react";
import Parse from "parse";
import classNames from "classnames";
import store, {useAppSelector} from "store";
import {ActionFactory} from "store/action";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import "./Timer.scss";

type TimerProps = {
  endTime: Date;
};

export const Timer = (props: TimerProps) => {
  const isModerator = useAppSelector((state) => state.users.admins.some((user) => user.id === Parse.User.current()?.id));
  const [timeLeft, setTimeLeft] = useState<{h: number; m: number; s: number} | null>(null);

  useEffect(() => {
    const timerUpdateTimeout = setTimeout(() => {
      const difference = +props.endTime - +new Date();
      setTimeLeft({
        h: Math.max(Math.floor((difference / 1000 / 60 / 60) % 24), 0),
        m: Math.max(Math.floor((difference / 1000 / 60) % 60), 0),
        s: Math.max(Math.floor((difference / 1000) % 60), 0),
      });
    }, 250);
    return () => clearTimeout(timerUpdateTimeout);
  });

  if (!timeLeft) return null;
  return ReactDOM.createPortal(
    <aside
      className={classNames(
        "timer",
        {"timer--expired": timeLeft.m === 0 && timeLeft.s === 0},
        {"timer--top": document.getElementById("menu-bars")?.classList.contains("menu-bars--bottom")}
      )}
    >
      <span>
        {String(timeLeft!.m).padStart(2, "0")}:{String(timeLeft!.s).padStart(2, "0")}
      </span>
      {isModerator && (
        <button onClick={() => store.dispatch(ActionFactory.cancelTimer())} title="Stop timer">
          <CloseIcon />
        </button>
      )}
    </aside>,
    document.getElementById("root")!
  );
};
