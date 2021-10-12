import {FC, ReactNode} from "react";
import "./BoardOption.scss";
import classNames from "classnames";

export interface BoardOptionProps {
  children: ReactNode;
  className?: string;
  [key: string]: any;
}

export const BoardOption: FC<BoardOptionProps> = ({className, children, ...other}) => (
  <li className={classNames("board-option", className)} {...other}>
    {children}
  </li>
);
