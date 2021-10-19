import {FC} from "react";
import classNames from "classnames";
import "./BoardOptionToggle.scss";

export interface BoardOptionToggleProps {
  active: boolean;
}

export const BoardOptionToggle: FC<BoardOptionToggleProps> = ({active}) => (
  <div className="board-option-toggle">
    <div className={classNames("board-option-toggle__switch", {"board-option-toggle__switch--left": !active}, {"board-option-toggle__switch--right": active})} />
  </div>
);
