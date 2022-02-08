import {VFC, useState, useEffect} from "react";
import {Dialog} from "components/Dialog";
import {useNavigate} from "react-router";
import store, {useAppSelector} from "store";
import {ActionFactory} from "store/action";
import "./TimerDialog.scss";
import {ReactComponent as PlusIcon} from "assets/icon-plus.svg";
import {ReactComponent as MinusIcon} from "assets/icon-minus.svg";
import {ReactComponent as OneIcon} from "assets/icon-one.svg";
import {ReactComponent as ThreeIcon} from "assets/icon-three.svg";
import {ReactComponent as FiveIcon} from "assets/icon-five.svg";

export const TimerDialog: VFC = () => {
  const navigate = useNavigate();
  const boardId = useAppSelector((state) => state.board.data!.id);
  const [customTime, setCustomTime] = useState(10);

  const startTimer = (minutes: number) => {
    store.dispatch(ActionFactory.setTimer(new Date(new Date().getTime() + minutes * 60 * 1000)));
    navigate(`/board/${boardId}`);
  };

  const [startPositionX, setStartPositionX] = useState(0);

  useEffect(() => {
    const onUpdate = (e: MouseEvent) => {
      if (startPositionX) {
        setCustomTime(Math.max(1, Math.abs(Math.floor((e.clientX - startPositionX) / 10))));
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

  return (
    <Dialog title="Timer" onClose={() => navigate(`/board/${boardId}`)}>
      <button className="dialog__button" onClick={() => startTimer(1)}>
        <label>1 minute</label>
        <OneIcon className="timer-dialog__button-icon" />
      </button>
      <button className="dialog__button" onClick={() => startTimer(3)}>
        <label>3 minute</label>
        <ThreeIcon className="timer-dialog__button-icon" />
      </button>
      <button className="dialog__button" onClick={() => startTimer(5)}>
        <label>5 minute</label>
        <FiveIcon className="timer-dialog__button-icon" />
      </button>
      <button className="dialog__button" onClick={() => startTimer(customTime)}>
        <label>Custom time</label>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCustomTime((prev) => Math.max(--prev, 1));
          }}
          className="timer-dialog__time-button"
        >
          <MinusIcon />
        </button>
        <label className="timer-dialog__time-label" onMouseDown={(e) => setStartPositionX(e.clientX)}>
          {customTime}
        </label>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCustomTime((prev) => Math.min(++prev, 99));
          }}
          className="timer-dialog__time-button"
        >
          <PlusIcon />
        </button>
      </button>
    </Dialog>
  );
};
