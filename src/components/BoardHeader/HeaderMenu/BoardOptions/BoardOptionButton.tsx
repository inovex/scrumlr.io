import {FC, ReactNode} from "react";
import "./BoardOptionButton.scss";

export interface BoardOptionButtonProps {
  onClick: (...args: any) => any;
  children: ReactNode;
}

export const BoardOptionButton: FC<BoardOptionButtonProps> = ({onClick, children}) => (
  <button className="board-option-button" onClick={onClick}>
    {children}
  </button>
);
