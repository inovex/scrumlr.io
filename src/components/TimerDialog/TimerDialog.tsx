import {VFC, useState} from "react";
import {Dialog} from "components/Dialog";
import {useNavigate} from "react-router";
import store, {useAppSelector} from "store";
import {ActionFactory} from "store/action";
import "./TimerDialog.scss";

export const TimerDialog: VFC = () => {
  const navigate = useNavigate();
  const boardId = useAppSelector((state) => state.board.data!.id);
  const [customTime, setCustomTime] = useState(10);

  const startTimer = (minutes: number) => {
    store.dispatch(ActionFactory.setTimer(new Date(new Date().getTime() + minutes * 60 * 1000)));
    navigate(`/board/${boardId}`);
  };

  return (
    <Dialog title="Timer" onClose={() => navigate(`/board/${boardId}`)}>
      <button className="dialog__button" onClick={() => startTimer(1)}>
        <label>1 minute</label>
      </button>
      <button className="dialog__button" onClick={() => startTimer(3)}>
        <label>3 minute</label>
      </button>
      <button className="dialog__button" onClick={() => startTimer(5)}>
        <label>5 minute</label>
      </button>
      <button className="dialog__button" onClick={() => startTimer(customTime)}>
        <label>Custom time</label>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCustomTime((prev) => Math.min(++prev, 99));
          }}
          className="timer-dialog__time-button"
        >
          +
        </button>
        <label className="timer-dialog__time-label">{customTime}</label>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCustomTime((prev) => Math.max(--prev, 1));
          }}
          className="timer-dialog__time-button"
        >
          -
        </button>
      </button>
    </Dialog>
  );
};
